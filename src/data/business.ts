import { createClient, createAdminClient, createStaticClient } from '../utils/supabase/server';
import { Business } from '../types/business';

export async function getBusinessBySlug(slug: string): Promise<any | null> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from('businesses')
    .select(`
      *,
      business_categories ( directory_categories (id, name, slug) ),
      business_locations ( directory_locations (id, name, slug) )
    `)
    .eq('slug', slug)
    .single();

  if (error || !data) {
    console.error('Error fetching business:', error);
    return null;
  }

  // Format array for easier frontend access
  const formattedData = {
    ...data,
    categories_list: data.business_categories?.map((bc: any) => bc.directory_categories) || [],
    locations_list: data.business_locations?.map((bl: any) => bl.directory_locations) || []
  };

  return formattedData;
}

export async function getPublishedBusinesses(limit = 20): Promise<Business[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from('businesses')
    .select(`
      *,
      business_categories ( directory_categories (id, name, slug) ),
      business_locations ( directory_locations (id, name, slug) )
    `)
    .eq('status', 'published')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching businesses:', error);
    return [];
  }

  return (data || []).map((b: any) => ({
    ...b,
    categories_list: b.business_categories?.map((bc: any) => bc.directory_categories).filter(Boolean) || [],
    locations_list: b.business_locations?.map((bl: any) => bl.directory_locations).filter(Boolean) || [],
  })) as Business[];
}

export async function searchBusinessesDB({ q, category, location }: { q: string, category: string, location: string }): Promise<Business[]> {
  const supabase = createStaticClient();
  
  // Base select with outer joins for fetching all categories/locations of the resulting businesses
  let selectStr = `
    *,
    business_categories ( directory_categories (id, name, slug) ),
    business_locations ( directory_locations (id, name, slug) )
  `;

  // If we need to filter, we must use !inner join to restrict the businesses returned.
  // Unfortunately, Supabase JS client doesn't allow dynamic !inner joins in the select string easily without duplicating the relation.
  // A cleaner approach for multiple many-to-many filters is to fetch all matching IDs first, or use a database function.
  // Alternatively, we can construct the select string dynamically:
  let catJoin = category && category !== 'all' 
    ? `business_categories!inner ( directory_categories!inner (id, name, slug) )`
    : `business_categories ( directory_categories (id, name, slug) )`;
    
  let locJoin = location && location !== 'all'
    ? `business_locations!inner ( directory_locations!inner (id, name, slug) )`
    : `business_locations ( directory_locations (id, name, slug) )`;

  let query = supabase.from('businesses').select(`*, ${catJoin}, ${locJoin}`).eq('status', 'published');
  
  if (category && category !== 'all') {
    query = query.eq('business_categories.directory_categories.slug', category);
  }
  
  if (location && location !== 'all') {
    query = query.eq('business_locations.directory_locations.slug', location);
  }

  if (q) {
    query = query.ilike('name', `%${q}%`);
  }

  const { data, error } = await query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching businesses:', error);
    return [];
  }
  
  return (data || []).map((b: any) => ({
    ...b,
    categories_list: b.business_categories?.map((bc: any) => bc.directory_categories).filter(Boolean) || [],
    locations_list: b.business_locations?.map((bl: any) => bl.directory_locations).filter(Boolean) || [],
  })) as Business[];
}
