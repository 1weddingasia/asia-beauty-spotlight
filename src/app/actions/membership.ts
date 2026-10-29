"use server";

import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { DEFAULT_PARTY_PROFILE_VALUES } from "@/types/party";

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
 * Hỗ trợ 2 dòng sản phẩm độc lập: Trang Ưu Đãi (deal) và Trang Đặt Tiệc (party)
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

    // Giới hạn thời hạn từ 1 đến 5 năm
    const validDurationYears = Math.min(5, Math.max(1, Math.round(Number(durationYears) || 1)));
    const supabaseAdmin = getSupabaseAdmin();

    // 1. Kiểm tra plan
    const { data: plan, error: planError } = await supabaseAdmin
      .from("plans")
      .select("id, code, name, plan_type, tier, price_yearly")
      .eq("id", planId)
      .maybeSingle();

    if (planError || !plan) {
      return { success: false, error: "Gói thành viên không tồn tại trong hệ thống." };
    }

    // 2. Lấy thông tin business
    const { data: business, error: bizError } = await supabaseAdmin
      .from("businesses")
      .select("id, slug, name, plan_tier, status, category_slug")
      .eq("id", businessId)
      .maybeSingle();

    if (bizError || !business) {
      return { success: false, error: "Không tìm thấy thông tin doanh nghiệp." };
    }

    const effectiveAmount = amount > 0 ? Number(amount) : Number(plan.price_yearly) || 0;

    // 3. Tìm membership hiện tại của dòng sản phẩm này (deal hoặc party)
    const { data: existingMems } = await supabaseAdmin
      .from("memberships")
      .select("id, plan_id, status, starts_at, expires_at, plans!inner(plan_type)")
      .eq("business_id", businessId)
      .eq("plans.plan_type", plan.plan_type)
      .order("expires_at", { ascending: false })
      .limit(1);

    const currentMem = existingMems?.[0];

    const now = new Date();
    let baseTime = now.getTime();
    let startsAt = now;
    if (currentMem?.expires_at) {
      const curExp = new Date(currentMem.expires_at).getTime();
      if (curExp > now.getTime()) {
        baseTime = curExp; // Cộng nối tiếp vào thời hạn hiện tại
        startsAt = currentMem.starts_at ? new Date(currentMem.starts_at) : now;
      }
    }

    const durationMs = validDurationYears * 365 * 24 * 60 * 60 * 1000;
    const newExpiresAt = new Date(baseTime + durationMs);

    // 4. Cập nhật hoặc thêm mới membership theo đúng dòng sản phẩm
    let membershipId: string;
    if (currentMem) {
      const { data: updatedMem, error: memUpdateErr } = await supabaseAdmin
        .from("memberships")
        .update({
          plan_id: plan.id,
          status: "active",
          starts_at: startsAt.toISOString(),
          expires_at: newExpiresAt.toISOString(),
        })
        .eq("id", currentMem.id)
        .select("id")
        .single();

      if (memUpdateErr || !updatedMem) {
        throw new Error("Lỗi cập nhật membership: " + memUpdateErr?.message);
      }
      membershipId = updatedMem.id;
    } else {
      const { data: newMem, error: memInsertErr } = await supabaseAdmin
        .from("memberships")
        .insert({
          business_id: business.id,
          plan_id: plan.id,
          status: "active",
          starts_at: startsAt.toISOString(),
          expires_at: newExpiresAt.toISOString(),
        })
        .select("id")
        .single();

      if (memInsertErr || !newMem) {
        throw new Error("Lỗi khởi tạo membership: " + memInsertErr?.message);
      }
      membershipId = newMem.id;
    }

    // 5. Nếu kích hoạt gói tiệc VIP Neon (700k): Bật hiệu ứng đèn Neon sáng logo trên bản đồ tiệc
    if (plan.plan_type === 'party') {
      const isVipParty = plan.code === 'tiec_vip' || plan.tier === 'vip';
      try {
        const { data: existingParty } = await supabaseAdmin
          .from("business_party_profiles")
          .select("business_id, min_guests, max_guests, num_vip_rooms, price_min, price_max, party_deal_highlight, is_vip")
          .eq("business_id", business.id)
          .maybeSingle();

        await supabaseAdmin.from("business_party_profiles").upsert({
          business_id: business.id,
          min_guests: existingParty?.min_guests ?? DEFAULT_PARTY_PROFILE_VALUES.min_guests,
          max_guests: existingParty?.max_guests ?? DEFAULT_PARTY_PROFILE_VALUES.max_guests,
          num_vip_rooms: existingParty?.num_vip_rooms ?? DEFAULT_PARTY_PROFILE_VALUES.num_vip_rooms,
          price_min: existingParty?.price_min ?? DEFAULT_PARTY_PROFILE_VALUES.price_min,
          price_max: existingParty?.price_max ?? DEFAULT_PARTY_PROFILE_VALUES.price_max,
          is_vip: Boolean(isVipParty || existingParty?.is_vip),
          is_active: true,
          party_deal_highlight: existingParty?.party_deal_highlight || (isVipParty ? DEFAULT_PARTY_PROFILE_VALUES.party_deal_vip_highlight : DEFAULT_PARTY_PROFILE_VALUES.party_deal_highlight),
          updated_at: new Date().toISOString(),
        }, { onConflict: "business_id" });
      } catch (partyErr) {
        console.warn("Lỗi cấu hình party profile:", partyErr);
      }
    }

    // 6. Cập nhật Business sang trạng thái hoạt động chính thức
    await supabaseAdmin
      .from("businesses")
      .update({
        status: "published",
        is_featured: true,
        plan_tier: plan.tier === 'vip' ? 'vip' : 'premium',
        updated_at: new Date().toISOString(),
      })
      .eq("id", business.id);

    // 7. Ghi nhận lịch sử thanh toán vào bảng payments
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
      console.warn("Ghi log payment không thành công:", payErr);
    }

    // 8. Xóa cache Next.js
    revalidatePath("/admin/businesses");
    revalidatePath("/dashboard");
    revalidatePath("/tat-nien");
    if (business.slug) {
      revalidatePath(`/${business.slug}/dashboard`);
      revalidatePath(`/${business.slug}/upgrade`);
      revalidatePath(`/${business.slug}/tiec`);
      revalidatePath(`/${business.slug}`);
    }

    return {
      success: true,
      expiresAt: newExpiresAt.toISOString(),
      planName: plan.name,
      planType: plan.plan_type,
      slug: business.slug,
    };
  } catch (err: any) {
    console.error("activateMembershipAction error:", err);
    return { success: false, error: err.message || "Lỗi hệ thống khi kích hoạt gói." };
  }
}

/**
 * SuperAdmin quản trị: Kích hoạt hoặc gia hạn gói thành viên độc lập theo loại trang
 */
export async function adminManageMembershipAction(payload: {
  businessId: string;
  action: 
    | "activate_udai_standard" 
    | "activate_udai_vip" 
    | "activate_tiec_standard" 
    | "activate_tiec_vip" 
    | "extend_trial_30" 
    | "suspend" 
    | "activate";
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

    const { data: plans } = await supabaseAdmin
      .from("plans")
      .select("id, code, name, plan_type, tier")
      .eq("is_active", true);

    const udaiStandard = plans?.find((p) => p.code === "udai_standard") || plans?.find((p) => p.plan_type === "deal");
    const udaiVip = plans?.find((p) => p.code === "udai_vip");
    const tiecStandard = plans?.find((p) => p.code === "tiec_standard") || plans?.find((p) => p.plan_type === "party");
    const tiecVip = plans?.find((p) => p.code === "tiec_vip");

    const now = new Date();

    // Helper kích hoạt gói theo plan_type độc lập
    const applyPlan = async (targetPlan: any) => {
      if (!targetPlan) throw new Error("Không tìm thấy gói dịch vụ tương ứng.");

      // Tìm membership hiện tại cùng plan_type
      const { data: existingMems } = await supabaseAdmin
        .from("memberships")
        .select("id, plan_id, status, starts_at, expires_at, plans!inner(plan_type)")
        .eq("business_id", business.id)
        .eq("plans.plan_type", targetPlan.plan_type)
        .order("expires_at", { ascending: false })
        .limit(1);

      const currentMem = existingMems?.[0];

      let baseTime = now.getTime();
      let startsAt = now;
      if (currentMem?.expires_at) {
        const curExp = new Date(currentMem.expires_at).getTime();
        if (curExp > now.getTime()) {
          baseTime = curExp;
          startsAt = currentMem.starts_at ? new Date(currentMem.starts_at) : now;
        }
      }
      const newExpiry = new Date(baseTime + 365 * 24 * 60 * 60 * 1000);

      if (currentMem) {
        const { error: memErr } = await supabaseAdmin.from("memberships").update({
          plan_id: targetPlan.id,
          status: "active",
          starts_at: startsAt.toISOString(),
          expires_at: newExpiry.toISOString(),
        }).eq("id", currentMem.id);
        if (memErr) throw new Error("Lỗi cập nhật membership: " + memErr.message);
      } else {
        const { error: memErr } = await supabaseAdmin.from("memberships").insert({
          business_id: business.id,
          plan_id: targetPlan.id,
          status: "active",
          starts_at: startsAt.toISOString(),
          expires_at: newExpiry.toISOString(),
        });
        if (memErr) throw new Error("Lỗi tạo membership: " + memErr.message);
      }

      // Nếu là gói tiệc VIP Neon (700k): Bật hiệu ứng Neon trên bản đồ
      if (targetPlan.plan_type === 'party') {
        const isVipParty = targetPlan.code === 'tiec_vip' || targetPlan.tier === 'vip';
        const { data: existingParty } = await supabaseAdmin
          .from("business_party_profiles")
          .select("min_guests, max_guests, num_vip_rooms, price_min, price_max, party_deal_highlight, is_vip")
          .eq("business_id", business.id)
          .maybeSingle();

        await supabaseAdmin.from("business_party_profiles").upsert({
          business_id: business.id,
          min_guests: existingParty?.min_guests ?? DEFAULT_PARTY_PROFILE_VALUES.min_guests,
          max_guests: existingParty?.max_guests ?? DEFAULT_PARTY_PROFILE_VALUES.max_guests,
          num_vip_rooms: existingParty?.num_vip_rooms ?? DEFAULT_PARTY_PROFILE_VALUES.num_vip_rooms,
          price_min: existingParty?.price_min ?? DEFAULT_PARTY_PROFILE_VALUES.price_min,
          price_max: existingParty?.price_max ?? DEFAULT_PARTY_PROFILE_VALUES.price_max,
          is_vip: Boolean(existingParty?.is_vip || isVipParty),
          is_active: true,
          party_deal_highlight: existingParty?.party_deal_highlight || (isVipParty ? DEFAULT_PARTY_PROFILE_VALUES.party_deal_vip_highlight : DEFAULT_PARTY_PROFILE_VALUES.party_deal_highlight),
          updated_at: new Date().toISOString(),
        }, { onConflict: "business_id" });
      }

      // Cập nhật businesses
      await supabaseAdmin.from("businesses").update({
        status: "published",
        is_featured: true,
        plan_tier: targetPlan.tier === 'vip' ? 'vip' : 'premium',
      }).eq("id", business.id);
    };

    if (action === "activate_udai_standard") {
      await applyPlan(udaiStandard);
    } else if (action === "activate_udai_vip") {
      await applyPlan(udaiVip);
    } else if (action === "activate_tiec_standard") {
      await applyPlan(tiecStandard);
    } else if (action === "activate_tiec_vip") {
      await applyPlan(tiecVip);
    } else if (action === "extend_trial_30") {
      // Tặng thêm 30 ngày dùng thử cho các gói hiện có
      const { data: mems } = await supabaseAdmin
        .from("memberships")
        .select("id, status, expires_at")
        .eq("business_id", business.id);

      if (mems && mems.length > 0) {
        for (const m of mems) {
          let baseTime = now.getTime();
          if (m.expires_at && new Date(m.expires_at).getTime() > now.getTime()) {
            baseTime = new Date(m.expires_at).getTime();
          }
          const newExp = new Date(baseTime + 30 * 24 * 60 * 60 * 1000);
          await supabaseAdmin.from("memberships").update({
            expires_at: newExp.toISOString(),
          }).eq("id", m.id);
        }
      } else {
        const newExp = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        await supabaseAdmin.from("memberships").insert({
          business_id: business.id,
          plan_id: udaiStandard?.id,
          status: "trial",
          starts_at: now.toISOString(),
          expires_at: newExp.toISOString(),
        });
      }

      await supabaseAdmin.from("businesses").update({
        status: "published",
      }).eq("id", business.id);

    } else if (action === "suspend") {
      await supabaseAdmin.from("businesses").update({
        status: "suspended",
      }).eq("id", business.id);

      await supabaseAdmin.from("memberships").update({
        status: "suspended",
      }).eq("business_id", business.id);

    } else if (action === "activate") {
      await supabaseAdmin.from("businesses").update({
        status: "published",
      }).eq("id", business.id);

      const { data: mems } = await supabaseAdmin.from("memberships").select("id, expires_at, status").eq("business_id", business.id);
      if (mems) {
        for (const m of mems) {
          if (m.status === "suspended") {
            const isStillValid = m.expires_at ? new Date(m.expires_at) > now : false;
            await supabaseAdmin.from("memberships").update({
              status: isStillValid ? "active" : "expired",
            }).eq("id", m.id);
          }
        }
      }
    } else {
      return { success: false, error: "Hành động không hợp lệ." };
    }

    revalidatePath("/admin/businesses");
    revalidatePath("/tat-nien");
    if (business.slug) {
      revalidatePath(`/${business.slug}/dashboard`);
      revalidatePath(`/${business.slug}/upgrade`);
      revalidatePath(`/${business.slug}/tiec`);
      revalidatePath(`/${business.slug}`);
    }

    return { success: true };
  } catch (err: any) {
    console.error("adminManageMembershipAction error:", err);
    return { success: false, error: err.message || "Lỗi thao tác quản trị." };
  }
}
