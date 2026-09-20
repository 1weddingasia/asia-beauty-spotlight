import { createClient, createAdminClient } from '../utils/supabase/server';
import { Business } from '../types/business';

export async function getBusinessBySlug(slug: string): Promise<any | null> {
  const supabase = await createClient();
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
  const supabase = await createClient();
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
  const supabase = await createClient();
  let query = supabase.from('businesses').select('*').eq('status', 'published');
  
  if (category && category !== 'all') {
    query = query.eq('category', category);
  }
  
  if (location && location !== 'all') {
    query = query.eq('location', location);
  }

  if (q) {
    query = query.ilike('name', `%${q}%`);
  }

  const { data, error } = await query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching businesses:', error);
    return [];
  }
  return data as Business[];
}
