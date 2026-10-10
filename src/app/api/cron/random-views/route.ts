import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    // Basic auth check to prevent abuse (you can pass ?key=YOUR_SECRET)
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    // Require CRON_SECRET to be configured and matched
    if (!process.env.CRON_SECRET || key !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all businesses (or we could execute a direct SQL RPC if we had one)
    // Since we don't have RPC, we'll fetch IDs and update them in batches or individually
    const { data: businesses, error: fetchError } = await supabase
      .from('businesses')
      .select('id, random_views, created_at');

    if (fetchError || !businesses) {
      return NextResponse.json({ error: 'Failed to fetch businesses' }, { status: 500 });
    }

    let updatedCount = 0;
    const now = new Date();
    
    // Process in smaller batches if there are many businesses
    for (const business of businesses) {
      // Skip businesses created in the last 24 hours
      if (business.created_at) {
        const createdAt = new Date(business.created_at);
        const diffMs = now.getTime() - createdAt.getTime();
        if (diffMs < 24 * 60 * 60 * 1000) {
          continue; // skip recently created businesses
        }
      }
      const increment = Math.floor(Math.random() * 16) + 5; // Random number between 5 and 20
      const newRandomViews = (business.random_views || 0) + increment;

      const { error: updateError } = await supabase
        .from('businesses')
        .update({ random_views: newRandomViews })
        .eq('id', business.id);

      if (!updateError) {
        updatedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Updated random views for ${updatedCount} businesses.` 
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
