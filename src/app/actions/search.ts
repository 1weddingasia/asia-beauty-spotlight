"use server";

import { createClient } from "@/utils/supabase/server";

export async function getCategoriesAction() {
  const supabase = await createClient();
  const { data } = await supabase.from('directory_categories').select('*').order('name');
  return data || [];
}

export async function getLocationsAction() {
  const supabase = await createClient();
  const { data } = await supabase.from('directory_locations').select('*').order('name');
  return data || [];
}

export async function searchBusinessesAction(q: string, category: string, location: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('search_businesses', {
    p_q: q || '',
    p_category_slug: category || 'all',
    p_location_slug: location || 'all'
  }).select('*, business_categories ( directory_categories (id, name, slug) ), business_locations ( directory_locations (id, name, slug) )');

  if (error) {
    console.error("RPC search error:", error);
    return [];
  }

  // Format array for frontend (flattening many-to-many structures)
  return data.map((b: any) => ({
    ...b,
    categories_list: b.business_categories?.map((bc: any) => bc.directory_categories) || [],
    locations_list: b.business_locations?.map((bl: any) => bl.directory_locations) || []
  }));
}
