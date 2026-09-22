"use server";

import { createStaticClient } from "@/utils/supabase/server";

export async function getCategoriesAction() {
  const supabase = createStaticClient();
  const { data } = await supabase.from('directory_categories').select('*').order('name').limit(500);
  return data || [];
}

export async function getLocationsAction() {
  const supabase = createStaticClient();
  const { data } = await supabase.from('directory_locations').select('*').order('name').limit(500);
  return data || [];
}

export async function searchBusinessesAction(q: string, category: string, location: string) {
  const supabase = createStaticClient();

  const filterCat = category && category !== 'all';
  const filterLoc = location && location !== 'all';

  let query = supabase
    .from('businesses')
    .select(`
      *,
      business_categories${filterCat ? '!inner' : ''} ( directory_categories${filterCat ? '!inner' : ''} (id, name, slug) ),
      business_locations${filterLoc ? '!inner' : ''} ( directory_locations${filterLoc ? '!inner' : ''} (id, name, slug) )
    `)
    .eq('status', 'published')
    .order('is_featured', { ascending: false })
    .limit(50);

  if (q) {
    const safeQ = q.replace(/[%_]/g, '\\$&');
    query = query.ilike('name', `%${safeQ}%`);
  }

  if (filterCat) {
    query = query.eq('business_categories.directory_categories.slug', category);
  }

  if (filterLoc) {
    query = query.eq('business_locations.directory_locations.slug', location);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Search error:", error);
    return [];
  }

  const results = (data || []).map((b: any) => ({
    ...b,
    categories_list: b.business_categories?.map((bc: any) => bc.directory_categories).filter(Boolean) || [],
    locations_list: b.business_locations?.map((bl: any) => bl.directory_locations).filter(Boolean) || [],
  }));

  return results;
}
