"use server";

import { createClient } from "@/utils/supabase/server";

export async function getCategoriesAction() {
  const supabase = await createClient();
  const { data } = await supabase.from('categories').select('*').order('name');
  return data || [];
}

export async function getLocationsAction() {
  const supabase = await createClient();
  const { data } = await supabase.from('locations').select('*').order('name');
  return data || [];
}

export async function searchBusinessesAction(q: string, category: string, location: string) {
  const supabase = await createClient();

  const filterCat = category && category !== 'all';
  const filterLoc = location && location !== 'all';

  // Using !inner enforces that the relationship must exist and match our filter
  let query = supabase
    .from('businesses')
    .select(`
      *,
      category:categories${filterCat ? '!inner' : ''} (id, name, slug),
      location:locations${filterLoc ? '!inner' : ''} (id, name, slug)
    `)
    .eq('status', 'published')
    // We can't sort by is_featured if it doesn't exist on businesses, wait... it does exist?
    // Let's check if is_featured is in businesses. It was added dynamically or is part of page_content.
    // If it throws an error, I will catch it and log.
    .order('created_at', { ascending: false });

  if (q) {
    query = query.ilike('name', `%${q}%`);
  }

  if (filterCat) {
    query = query.eq('categories.slug', category);
  }

  if (filterLoc) {
    query = query.eq('locations.slug', location);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Search error:", error);
    return [];
  }

  const results = (data || []).map((b: any) => ({
    ...b,
    categories_list: b.category ? [b.category] : [],
    locations_list: b.location ? [b.location] : [],
  }));

  return results;
}
