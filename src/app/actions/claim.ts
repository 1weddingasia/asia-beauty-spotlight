"use server";

import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

function getSupabaseAdmin() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Thiếu SUPABASE_SERVICE_ROLE_KEY trong biến môi trường.");
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/**
 * Đăng ký tài khoản mới và tiếp quản doanh nghiệp trong 1 bước (Khuyên dùng cho luồng bàn giao)
 */
export async function registerAndClaimAction(token: string, payload: {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}) {
  try {
    const { fullName, email, password, phone } = payload;
    if (!token) return { success: false, error: "Thiếu mã liên kết bàn giao." };
    if (!email || !email.includes("@")) return { success: false, error: "Email không hợp lệ." };
    if (!password || password.length < 6) return { success: false, error: "Mật khẩu phải từ 6 ký tự trở lên." };

    const supabaseAdmin = getSupabaseAdmin();

    // 1. Kiểm tra tính hợp lệ của token và cơ sở
    const { data: business, error: bizError } = await supabaseAdmin
      .from("businesses")
      .select("id, slug, name, category_slug, plan_id, owner_id")
      .eq("claim_token", token)
      .maybeSingle();

    if (bizError || !business) {
      return { success: false, error: "Link bàn giao không tồn tại hoặc đã hết hạn." };
    }

    if (business.owner_id) {
      return { success: false, error: "Gian hàng này đã được bàn giao cho một tài khoản khác." };
    }

    // 2. Tìm hoặc Tạo tài khoản người dùng với email_confirm = true
    let userId: string | null = null;

    // Kiểm tra xem email đã tồn tại trong Auth chưa
    const { data: userList } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const existingUser = userList?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (existingUser) {
      // User đã có tài khoản: xác thực hoặc cập nhật mật khẩu mới nếu cần
      userId = existingUser.id;
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        password,
        user_metadata: { role: 'owner', name: fullName || existingUser.user_metadata?.name }
      });
    } else {
      // Tạo user mới hoàn toàn, kích hoạt sẵn email_confirm để đăng nhập tức thì
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email.toLowerCase().trim(),
        password,
        email_confirm: true,
        user_metadata: {
          role: 'owner',
          name: fullName || "Chủ cơ sở"
        }
      });

      if (createError || !newUser?.user) {
        return { success: false, error: "Lỗi tạo tài khoản: " + (createError?.message || "Không thể tạo tài khoản") };
      }

      userId = newUser.user.id;
    }

    // 3. Cập nhật hồ sơ profile
    await supabaseAdmin
      .from("profiles")
      .upsert({
        id: userId,
        email: email.toLowerCase().trim(),
        full_name: fullName || "Chủ cơ sở",
        role: "owner"
      });

    // 4. Gắn quyền chủ sở hữu cho doanh nghiệp & hủy token bàn giao (Single-use)
    const updateData: any = {
      owner_id: userId,
      claim_token: null,
      status: 'published',
      plan_tier: 'trial',
      updated_at: new Date().toISOString()
    };
    if (phone) updateData.phone = phone;

    const { error: updateBizError } = await supabaseAdmin
      .from("businesses")
      .update(updateData)
      .eq("id", business.id)
      .is("owner_id", null);

    if (updateBizError) {
      return { success: false, error: "Lỗi kết nối cơ sở dữ liệu khi gắn quyền chủ sở hữu." };
    }

    // 5. Đảm bảo bản ghi Dùng thử 30 ngày trong bảng memberships
    const now = new Date();
    const trialExpiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const { data: existingMembership } = await supabaseAdmin
      .from("memberships")
      .select("id, status, expires_at")
      .eq("business_id", business.id)
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingMembership) {
      // Cập nhật lại thời hạn nếu hạn cũ ngắn hơn 30 ngày từ hôm nay
      const currentExp = new Date(existingMembership.expires_at || 0);
      if (currentExp < trialExpiry) {
        await supabaseAdmin
          .from("memberships")
          .update({
            status: 'trial',
            starts_at: now.toISOString(),
            expires_at: trialExpiry.toISOString()
          })
          .eq("id", existingMembership.id);
      }
    } else {
      await supabaseAdmin
        .from("memberships")
        .insert({
          business_id: business.id,
          plan_id: business.plan_id,
          status: 'trial',
          starts_at: now.toISOString(),
          expires_at: trialExpiry.toISOString()
        });
    }

    // 6. Xóa cache Next.js
    revalidatePath("/admin/businesses");
    revalidatePath("/dashboard");
    if (business.slug) {
      revalidatePath(`/${business.slug}/dashboard`);
      revalidatePath(`/${business.slug}`);
    }

    return {
      success: true,
      email: email.toLowerCase().trim(),
      slug: business.slug
    };

  } catch (err: any) {
    console.error("registerAndClaimAction error:", err);
    return { success: false, error: err.message || "Lỗi hệ thống khi tiếp quản doanh nghiệp." };
  }
}

/**
 * Tiếp quản doanh nghiệp khi người dùng đã đăng nhập sẵn
 */
export async function claimBusinessAction(token: string) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Bạn cần đăng nhập tài khoản trước khi tiếp quản." };

    const supabaseAdmin = getSupabaseAdmin();
    
    // 1. Kiểm tra token
    const { data: business, error: fetchError } = await supabaseAdmin
      .from("businesses")
      .select("id, slug, plan_id, owner_id")
      .eq("claim_token", token)
      .maybeSingle();
      
    if (fetchError || !business) {
      return { success: false, error: "Link bàn giao không hợp lệ hoặc đã hết hạn." };
    }
    
    if (business.owner_id) {
      return { success: false, error: "Doanh nghiệp này đã được đăng ký quản lý." };
    }
    
    // 2. Cập nhật quyền sở hữu
    const { error: updateError } = await supabaseAdmin
      .from("businesses")
      .update({
        owner_id: user.id,
        claim_token: null,
        status: 'published',
        plan_tier: 'trial',
        updated_at: new Date().toISOString()
      })
      .eq("id", business.id)
      .is("owner_id", null);
      
    if (updateError) {
      return { success: false, error: "Lỗi hệ thống khi cập nhật quyền quản lý." };
    }

    // 3. Đảm bảo bản ghi Dùng thử 30 ngày
    const now = new Date();
    const trialExpiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const { data: existingMembership } = await supabaseAdmin
      .from("memberships")
      .select("id, status, expires_at")
      .eq("business_id", business.id)
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingMembership) {
      const currentExp = new Date(existingMembership.expires_at || 0);
      if (currentExp < trialExpiry) {
        await supabaseAdmin
          .from("memberships")
          .update({
            status: 'trial',
            starts_at: now.toISOString(),
            expires_at: trialExpiry.toISOString()
          })
          .eq("id", existingMembership.id);
      }
    } else {
      await supabaseAdmin
        .from("memberships")
        .insert({
          business_id: business.id,
          plan_id: business.plan_id,
          status: 'trial',
          starts_at: now.toISOString(),
          expires_at: trialExpiry.toISOString()
        });
    }
    
    // 4. Cập nhật profile
    await supabaseAdmin
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email,
        role: "owner"
      });

    // 5. Clear cache
    revalidatePath("/admin/businesses");
    revalidatePath("/dashboard");
    if (business.slug) {
      revalidatePath(`/${business.slug}/dashboard`);
      revalidatePath(`/${business.slug}`);
    }
    
    return { success: true, slug: business.slug };
  } catch (error: any) {
    console.error("claimBusinessAction error:", error);
    return { success: false, error: "Lỗi không xác định: " + (error.message || error) };
  }
}
