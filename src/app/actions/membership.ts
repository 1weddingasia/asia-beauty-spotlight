"use server";

import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

function getSupabaseAdmin() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Thiếu biến môi trường SUPABASE_SERVICE_ROLE_KEY.");
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/**
 * Kích hoạt hoặc gia hạn gói thành viên cho doanh nghiệp (Thanh toán qua SePay / VietQR)
 */
export async function activateMembershipAction(payload: {
  businessId: string;
  planId: string;
  durationYears?: number;
  amount?: number;
  provider?: string;
  transactionRef?: string;
}) {
  try {
    const { businessId, planId, durationYears = 1, amount = 0, provider = "VietQR-SePay", transactionRef } = payload;
    if (!businessId) return { success: false, error: "Thiếu mã định danh doanh nghiệp." };

    // Validate bounds on duration
    const validDurationYears = Math.min(5, Math.max(1, Math.round(Number(durationYears) || 1)));

    const supabaseAdmin = getSupabaseAdmin();

    // 1. Kiểm tra plan
    const { data: plan, error: planError } = await supabaseAdmin
      .from("plans")
      .select("id, name, price_yearly")
      .eq("id", planId)
      .maybeSingle();

    if (planError || !plan) {
      return { success: false, error: "Gói thành viên không tồn tại." };
    }

    // 2. Lấy thông tin business
    const { data: business, error: bizError } = await supabaseAdmin
      .from("businesses")
      .select("id, slug, name, plan_tier, status")
      .eq("id", businessId)
      .maybeSingle();

    if (bizError || !business) {
      return { success: false, error: "Không tìm thấy doanh nghiệp." };
    }

    // Derive effective financial amount from plan unless specifically overridden
    const effectiveAmount = amount > 0 ? Number(amount) : Number(plan.price_yearly) || 0;

    // 3. Tính toán thời hạn gói mới (Cộng dồn nếu gói hiện tại chưa hết hạn)
    const { data: currentMem } = await supabaseAdmin
      .from("memberships")
      .select("id, status, expires_at")
      .eq("business_id", businessId)
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const now = new Date();
    let baseTime = now.getTime();
    if (currentMem?.expires_at) {
      const curExp = new Date(currentMem.expires_at).getTime();
      if (curExp > now.getTime()) {
        baseTime = curExp; // Cộng nối tiếp vào thời hạn hiện tại
      }
    }

    const durationMs = validDurationYears * 365 * 24 * 60 * 60 * 1000;
    const newExpiresAt = new Date(baseTime + durationMs);

    // 4. Cập nhật hoặc thêm mới membership
    let membershipId: string;
    if (currentMem) {
      const { data: updatedMem, error: memUpdateErr } = await supabaseAdmin
        .from("memberships")
        .update({
          plan_id: plan.id,
          status: "active",
          starts_at: now.toISOString(),
          expires_at: newExpiresAt.toISOString(),
        })
        .eq("id", currentMem.id)
        .select("id")
        .single();

      if (memUpdateErr || !updatedMem) {
        throw new Error("Lỗi khi cập nhật thời hạn gói: " + memUpdateErr?.message);
      }
      membershipId = updatedMem.id;
    } else {
      const { data: newMem, error: memInsertErr } = await supabaseAdmin
        .from("memberships")
        .insert({
          business_id: business.id,
          plan_id: plan.id,
          status: "active",
          starts_at: now.toISOString(),
          expires_at: newExpiresAt.toISOString(),
        })
        .select("id")
        .single();

      if (memInsertErr || !newMem) {
        throw new Error("Lỗi khi tạo gói thành viên: " + memInsertErr?.message);
      }
      membershipId = newMem.id;
    }

    // 5. Cập nhật Business sang trạng thái hoạt động chính thức (published & premium)
    await supabaseAdmin
      .from("businesses")
      .update({
        plan_id: plan.id,
        plan_tier: "premium",
        status: "published",
        is_featured: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", business.id);

    // 6. Ghi nhận lịch sử thanh toán vào bảng payments
    try {
      await supabaseAdmin.from("payments").insert({
        business_id: business.id,
        membership_id: membershipId,
        amount: effectiveAmount,
        provider,
        transaction_id: transactionRef || `TXN-${Date.now()}`,
        status: "completed",
        paid_at: now.toISOString(),
      });
    } catch (payErr) {
      console.warn("Ghi log payment không thành công (không ảnh hưởng kích hoạt):", payErr);
    }

    // 7. Xóa cache trang
    revalidatePath("/admin/businesses");
    revalidatePath("/dashboard");
    if (business.slug) {
      revalidatePath(`/${business.slug}/dashboard`);
      revalidatePath(`/${business.slug}/upgrade`);
      revalidatePath(`/${business.slug}`);
    }

    return {
      success: true,
      expiresAt: newExpiresAt.toISOString(),
      planName: plan.name,
      slug: business.slug,
    };
  } catch (err: any) {
    console.error("activateMembershipAction error:", err);
    return { success: false, error: err.message || "Lỗi hệ thống khi kích hoạt gói." };
  }
}

/**
 * SuperAdmin quản trị, kích hoạt hoặc gia hạn gói thành viên thủ công
 */
export async function adminManageMembershipAction(payload: {
  businessId: string;
  action: "extend_trial_30" | "activate_udai_1year" | "activate_tiec_1year" | "suspend" | "activate";
}) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const role = user?.user_metadata?.role;
    if (!user || (role !== "admin" && role !== "superadmin")) {
      return { success: false, error: "Bạn không có quyền quản trị viên." };
    }

    const { businessId, action } = payload;
    const supabaseAdmin = getSupabaseAdmin();

    const { data: business } = await supabaseAdmin
      .from("businesses")
      .select("id, slug, name, plan_id, plan_tier, status")
      .eq("id", businessId)
      .maybeSingle();

    if (!business) return { success: false, error: "Không tìm thấy doanh nghiệp." };

    const { data: plans } = await supabaseAdmin.from("plans").select("id, name").eq("is_active", true);
    const udaiPlan = plans?.find((p) => p.name.includes("Ưu Đãi")) || plans?.[0];
    const tiecPlan = plans?.find((p) => p.name.includes("Tiệc")) || plans?.[0];

    const now = new Date();

    // Tìm membership hiện tại của quán
    const { data: currentMem } = await supabaseAdmin
      .from("memberships")
      .select("id, status, starts_at, expires_at, plan_id")
      .eq("business_id", business.id)
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const applyMembershipChange = async (planId: string, status: "trial" | "active", daysToAdd: number, planTier: "trial" | "premium") => {
      let baseTime = now.getTime();
      let startsAt = now;
      if (currentMem?.expires_at) {
        const curExp = new Date(currentMem.expires_at).getTime();
        if (curExp > now.getTime()) {
          baseTime = curExp;
          startsAt = currentMem.starts_at ? new Date(currentMem.starts_at) : now;
        }
      }
      const newExpiry = new Date(baseTime + daysToAdd * 24 * 60 * 60 * 1000);

      if (currentMem) {
        const { error: memErr } = await supabaseAdmin.from("memberships").update({
          plan_id: planId,
          status,
          starts_at: startsAt.toISOString(),
          expires_at: newExpiry.toISOString(),
        }).eq("id", currentMem.id);
        if (memErr) throw new Error("Lỗi cập nhật membership: " + memErr.message);
      } else {
        const { error: memErr } = await supabaseAdmin.from("memberships").insert({
          business_id: business.id,
          plan_id: planId,
          status,
          starts_at: startsAt.toISOString(),
          expires_at: newExpiry.toISOString(),
        });
        if (memErr) throw new Error("Lỗi tạo membership: " + memErr.message);
      }

      const { error: bizErr } = await supabaseAdmin.from("businesses").update({
        plan_id: planId,
        plan_tier: planTier,
        status: "published",
        is_featured: planTier === "premium",
      }).eq("id", business.id);
      if (bizErr) throw new Error("Lỗi cập nhật business: " + bizErr.message);
    };

    if (action === "extend_trial_30") {
      const targetPlanId = currentMem?.plan_id || business.plan_id || udaiPlan?.id;
      // Nếu đang active chính thức, giữ nguyên active và chỉ cộng thêm 30 ngày, không hạ cấp về trial
      const targetStatus = currentMem?.status === "active" ? "active" : "trial";
      const targetTier = currentMem?.status === "active" ? "premium" : "trial";
      await applyMembershipChange(targetPlanId, targetStatus, 30, targetTier);

    } else if (action === "activate_udai_1year") {
      if (!udaiPlan) return { success: false, error: "Không tìm thấy cấu hình Gói Trang Ưu Đãi trong hệ thống." };
      await applyMembershipChange(udaiPlan.id, "active", 365, "premium");

    } else if (action === "activate_tiec_1year") {
      if (!tiecPlan) return { success: false, error: "Không tìm thấy cấu hình Gói Trang Đặt Tiệc trong hệ thống." };
      await applyMembershipChange(tiecPlan.id, "active", 365, "premium");

    } else if (action === "suspend") {
      const { error: bizErr } = await supabaseAdmin.from("businesses").update({
        status: "suspended",
      }).eq("id", business.id);
      if (bizErr) throw new Error("Lỗi tạm ngưng: " + bizErr.message);

      if (currentMem) {
        const { error: memErr } = await supabaseAdmin.from("memberships").update({
          status: "suspended",
        }).eq("id", currentMem.id);
        if (memErr) throw new Error("Lỗi tạm ngưng membership: " + memErr.message);
      }

    } else if (action === "activate") {
      const { error: bizErr } = await supabaseAdmin.from("businesses").update({
        status: "published",
      }).eq("id", business.id);
      if (bizErr) throw new Error("Lỗi kích hoạt: " + bizErr.message);

      if (currentMem && currentMem.status === "suspended") {
        const isStillValid = currentMem.expires_at ? new Date(currentMem.expires_at) > now : false;
        const { error: memErr } = await supabaseAdmin.from("memberships").update({
          status: isStillValid ? (business.plan_tier === "premium" ? "active" : "trial") : "expired",
        }).eq("id", currentMem.id);
        if (memErr) throw new Error("Lỗi khôi phục membership: " + memErr.message);
      }
    } else {
      return { success: false, error: "Hành động không hợp lệ." };
    }

    revalidatePath("/admin/businesses");
    if (business.slug) {
      revalidatePath(`/${business.slug}/dashboard`);
      revalidatePath(`/${business.slug}`);
    }

    return { success: true };
  } catch (err: any) {
    console.error("adminManageMembershipAction error:", err);
    return { success: false, error: err.message || "Lỗi thao tác quản trị." };
  }
}
