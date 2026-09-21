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

  // Determine if we need inner joins for filtering
  const filterCat = category && category !== 'all';
  const filterLoc = location && location !== 'all';

  // Build query with joins to get categories & locations
  // Using !inner forces an INNER JOIN, allowing us to filter parent rows based on children
  let query = supabase
    .from('businesses')
    .select(`
      *,
      business_categories${filterCat ? '!inner' : ''} ( directory_categories${filterCat ? '!inner' : ''} (id, name, slug) ),
      business_locations${filterLoc ? '!inner' : ''} ( directory_locations${filterLoc ? '!inner' : ''} (id, name, slug) )
    `)
    .eq('status', 'published')
    .order('is_featured', { ascending: false });

  // Filter by keyword (searches name)
  if (q) {
    query = query.ilike('name', `%${q}%`);
  }

  // Filter by category slug via inner join
  if (filterCat) {
    query = query.eq('business_categories.directory_categories.slug', category);
  }

  // Filter by location slug via inner join
  if (filterLoc) {
    query = query.eq('business_locations.directory_locations.slug', location);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Search error:", error);
    return [];
  }

  // Format results for the frontend (extract nested categories/locations)
  const results = (data || []).map((b: any) => ({
    ...b,
    categories_list: b.business_categories?.map((bc: any) => bc.directory_categories).filter(Boolean) || [],
    locations_list: b.business_locations?.map((bl: any) => bl.directory_locations).filter(Boolean) || [],
  }));

  return results;
}
