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

  // Build query with joins to get categories & locations
  let query = supabase
    .from('businesses')
    .select(`
      *,
      business_categories ( directory_categories (id, name, slug) ),
      business_locations ( directory_locations (id, name, slug) )
    `)
    .eq('status', 'published')
    .order('is_featured', { ascending: false });

  // Filter by keyword
  if (q) {
    query = query.ilike('name', `%${q}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Search error:", error);
    return [];
  }

  // Format and filter client-side by category/location slug
  let results = (data || []).map((b: any) => ({
    ...b,
    categories_list: b.business_categories?.map((bc: any) => bc.directory_categories).filter(Boolean) || [],
    locations_list: b.business_locations?.map((bl: any) => bl.directory_locations).filter(Boolean) || [],
  }));

  if (category && category !== 'all') {
    results = results.filter((b: any) =>
      b.categories_list.some((c: any) => c?.slug === category)
    );
  }

  if (location && location !== 'all') {
    results = results.filter((b: any) =>
      b.locations_list.some((l: any) => l?.slug === location)
    );
  }

  return results;
}
