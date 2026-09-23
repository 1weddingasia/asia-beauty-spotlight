"use server";

import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function claimBusinessAction(token: string) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Bạn cần đăng nhập." };

    // Create an admin client bypassing RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // 1. Verify token exists and is not claimed
    const { data: business, error: fetchError } = await supabaseAdmin
      .from("businesses")
      .select("id, owner_id")
      .eq("claim_token", token)
      .single();
      
    if (fetchError || !business) {
      return { success: false, error: "Link bàn giao không hợp lệ hoặc đã hết hạn." };
    }
    
    if (business.owner_id) {
      return { success: false, error: "Doanh nghiệp này đã được đăng ký quản lý." };
    }
    
    // 2. Update the business atomically
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("businesses")
      .update({
        owner_id: user.id,
        claim_token: null, // Single-use link
      })
      .eq("id", business.id)
      .is("owner_id", null)
      .select()
      .single();
      
    if (updateError || !updated) {
      console.error(updateError);
      return { success: false, error: "Lỗi hệ thống khi cập nhật chủ sở hữu hoặc cơ sở đã được nhận." };
    }
    
    // 3. Clear cache
    revalidatePath("/admin/businesses");
    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: "Lỗi không xác định." };
  }
}
