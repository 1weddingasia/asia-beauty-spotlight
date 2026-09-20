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

  // Fetch business with junction tables — properly formatted for editor
  const { data: rawBusiness } = await supabase
    .from("businesses")
    .select(`
      *,
      business_categories ( category_id, directory_categories (id, name) ),
      business_locations ( location_id, directory_locations (id, name) )
    `)
    .eq("id", id)
    .single();

  if (!rawBusiness) {
    notFound();
  }

  // Format so BusinessEditorClient can read categories_list and locations_list
  const business = {
    ...rawBusiness,
    categories_list: rawBusiness.business_categories?.map((bc: any) => bc.directory_categories).filter(Boolean) || [],
    locations_list: rawBusiness.business_locations?.map((bl: any) => bl.directory_locations).filter(Boolean) || [],
  };

  return <BusinessEditorClient business={business} categories={categories || []} locations={locations || []} />;
}
