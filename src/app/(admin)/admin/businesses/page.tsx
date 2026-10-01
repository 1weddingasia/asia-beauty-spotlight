import BusinessesClient from "./BusinessesClient";

export default async function AdminBusinessesPage() {
  const { createAdminClient } = await import("@/utils/supabase/server");
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("businesses")
    .select(`
      id, slug, name, status, is_featured, created_at, claim_token, owner_id,
      business_categories(directory_categories(name)),
      business_locations(directory_locations(name))
    `)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("Lỗi tải danh sách doanh nghiệp:", error);
    // Optionally return an error UI, but for now we'll pass empty and log the critical error
    // so it doesn't fail silently.
  }

  return <BusinessesClient initialBusinesses={data || []} />;
}
