import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Increment page_views using RPC or just get the current, add 1, and update
    // But since we don't have an rpc function for incrementing, we will fetch and update
    // Using service role to bypass RLS
    const { data: business, error: fetchError } = await supabase
      .from('businesses')
      .select('id, page_views, random_views')
      .eq('slug', slug)
      .single();

    if (fetchError || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const newPageViews = (business.page_views || 0) + 1;
    
    // Note: To avoid race conditions in highly concurrent environments we'd use RPC
    // But for a directory this is fine for now
    const { error: updateError } = await supabase
      .from('businesses')
      .update({ page_views: newPageViews })
      .eq('id', business.id);

    if (updateError) {
      console.error("Failed to update views:", updateError);
    }

    return NextResponse.json({
      page_views: newPageViews,
      random_views: business.random_views || 0,
      total_views: newPageViews + (business.random_views || 0)
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
