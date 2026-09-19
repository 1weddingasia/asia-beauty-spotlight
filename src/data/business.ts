import { createClient, createAdminClient } from '../utils/supabase/server';
import { Business } from '../types/business';

export async function getBusinessBySlug(slug: string): Promise<Business | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    console.error('Error fetching business:', error);
    return null;
  }

  return data as Business;
}

export async function getPublishedBusinesses(limit = 20): Promise<Business[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('status', 'published')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching businesses:', error);
    return [];
  }

  return data as Business[];
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
