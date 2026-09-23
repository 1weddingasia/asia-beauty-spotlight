import BusinessesClient from "./BusinessesClient";

export default async function AdminBusinessesPage() {
  const { createClient } = await import("@/utils/supabase/server");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("businesses")
    .select("id, slug, name, status, is_featured, created_at, category, location, claim_token, owner_id")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("Lỗi tải danh sách doanh nghiệp:", error);
    // Optionally return an error UI, but for now we'll pass empty and log the critical error
    // so it doesn't fail silently.
  }

  return <BusinessesClient initialBusinesses={data || []} />;
}
