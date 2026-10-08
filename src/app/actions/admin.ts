"use server";

import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/utils/supabase/server";

// Lazy load to prevent module-level crashes on Vercel if env is missing
function getSupabaseAdmin() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY in environment variables. Please add it to Vercel.");
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function createOrUpdateOwner(email: string, password?: string, businessId?: string) {
  if (!email) return { error: "Email is required" };
  
  try {
    // SECURITY FIX: Verify the caller is an authenticated user (admin)
    const supabase = await createServerClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    const role = currentUser?.user_metadata?.role;
    if (!currentUser || (role !== 'admin' && role !== 'superadmin')) {
      return { error: "Bạn cần đăng nhập với quyền quản trị để thực hiện hành động này." };
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Check if user exists
    let { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (listError) throw listError;
    
    let user = users?.users?.find(u => u.email === email);
    
    if (user) {
      if (user.user_metadata?.role && user.user_metadata.role !== 'owner') {
        return { error: "Email này đang được dùng cho tài khoản có quyền khác, không thể cấp quyền chủ tiệm!" };
      }
      // User exists, update password if provided
      if (password) {
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, { password });
        if (updateError) throw updateError;
      }
    } else {
      // Create new user
      if (!password) {
        return { error: "Password is required for new accounts" };
      }
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: 'owner' },
      });
      if (createError) throw createError;
      user = newUser.user;
    }
    
    if (businessId) {
      const { error: updateError } = await supabaseAdmin
        .from('businesses')
        .update({ owner_id: user.id })
        .eq('id', businessId);
      if (updateError) throw updateError;
    }
    
    return { success: true, userId: user.id };
  } catch (error: any) {
    console.error("Owner creation error:", error);
    return { error: error.message || "Failed to create/update owner" };
  }
}
