'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createBusinessAction(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Bạn chưa đăng nhập" };
  }

  const name = formData.get("name") as string;
  const rawSlug = formData.get("slug") as string;
  const address = formData.get("address") as string;
  const phone = formData.get("phone") as string;
  const category_slug = formData.get("category_slug") as string;

  if (!name || !rawSlug || !category_slug) {
    return { error: "Vui lòng nhập tên, đường dẫn và chọn ngành nghề gian hàng" };
  }

  // clean slug
  let slug = rawSlug.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  // check if slug exists
  const { data: existing } = await supabase.from("businesses").select("id, owner_id").eq("slug", slug).maybeSingle();

  if (existing) {
    // If it exists but has NO owner, we can let them claim it (or we overwrite if it's our placeholder).
    if (existing.owner_id) {
       return { error: "Đường dẫn này đã được sử dụng. Vui lòng chọn đường dẫn khác." };
    } else {
       // Take over
       const { error } = await supabase.from("businesses").update({
         name,
         address,
         phone,
         category_slug,
         owner_id: user.id,
         status: 'active'
       }).eq("id", existing.id);

       if (error) return { error: error.message };
    }
  } else {
    // Insert new
    const { error } = await supabase.from("businesses").insert({
      name,
      slug,
      address,
      phone,
      category_slug,
      owner_id: user.id,
      status: 'active',
      page_content: {}
    });

    if (error) return { error: error.message };
  }

  revalidatePath("/dashboard");
  redirect(`/${slug}/dashboard`);
}
