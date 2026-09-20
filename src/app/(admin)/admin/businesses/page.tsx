import BusinessesClient from "./BusinessesClient";

export default async function AdminBusinessesPage() {
  const { createClient } = await import("@/utils/supabase/server");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("businesses")
    .select("id, slug, name, status, is_featured, created_at, category, location")
    .order("created_at", { ascending: false });

  return <BusinessesClient initialBusinesses={data || []} />;
}
