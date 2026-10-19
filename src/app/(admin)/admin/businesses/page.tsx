import BusinessesClient from "./BusinessesClient";

export default async function AdminBusinessesPage() {
  const { createAdminClient } = await import("@/utils/supabase/server");
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("businesses")
    .select(`
      id, slug, name, status, is_featured, created_at, claim_token, owner_id, website, plan_tier, plan_id, category_slug,
      business_categories(directory_categories(name)),
      business_locations(directory_locations(name)),
      profiles:owner_id(email, full_name),
      memberships(id, status, starts_at, expires_at, plan_id, plans(name, price_yearly))
    `)
    .order("created_at", { ascending: false })
    .order("expires_at", { ascending: false, referencedTable: "memberships" })
    .limit(250);

  if (error) {
    console.error("Lỗi tải danh sách doanh nghiệp:", error);
  }

  return <BusinessesClient initialBusinesses={data || []} />;
}
