import BusinessEditorClient from "./BusinessEditorClient";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function EditBusinessPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const supabase = await createClient();
  
  // Fetch available categories and locations
  const { data: categories } = await supabase.from('directory_categories').select('id, name');
  const { data: locations } = await supabase.from('directory_locations').select('id, name');

  if (id === "new") {
    return <BusinessEditorClient business={null} categories={categories || []} locations={locations || []} />;
  }

  // Fetch business with junction tables
  const { data: business } = await supabase
    .from("businesses")
    .select(`
      *,
      business_categories ( category_id ),
      business_locations ( location_id )
    `)
    .eq("id", id)
    .single();

  if (!business) {
    notFound();
  }

  return <BusinessEditorClient business={business} categories={categories || []} locations={locations || []} />;
}
