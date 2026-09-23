"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export async function claimBusinessAction(token: string, userId: string) {
  try {
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
    
    // 2. Update the business with the new owner_id and clear the token
    const { error: updateError } = await supabaseAdmin
      .from("businesses")
      .update({
        owner_id: userId,
        claim_token: null, // Single-use link
      })
      .eq("id", business.id);
      
    if (updateError) {
      return { success: false, error: "Lỗi hệ thống khi cập nhật chủ sở hữu." };
    }
    
    // 3. Clear cache
    revalidatePath("/admin/businesses");
    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi không xác định." };
  }
}
