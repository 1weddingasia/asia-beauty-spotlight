import { createClient } from "@/utils/supabase/server";
import BlogsClient from "./BlogsClient";

export default async function AdminBlogsPage() {
  const supabase = await createClient();
  const { data: blogs } = await supabase.from("blogs").select("*").order("created_at", { ascending: false }).limit(500);

  return <BlogsClient initialBlogs={blogs || []} />;
}
