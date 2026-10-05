const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: existing } = await supabase.from('businesses').select('page_content').eq('slug', 'luxury-spa-demo').single();
  if (!existing) return;

  const content = existing.page_content || {};
  content.logo_url = "/images/luxury_spa_logo.png";
  content.banners = [
    "/images/luxury_spa_slider_1.png",
    "/images/luxury_spa_slider_2.png",
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2070&auto=format&fit=crop"
  ];
  content.gallery = [
    "/images/luxury_spa_slider_1.png",
    "/images/luxury_spa_slider_2.png",
    "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1000&auto=format&fit=crop"
  ];

  const payload = {
    name: "LUXURY CLINIC & SPA",
    page_content: content
  };

  const { error } = await supabase.from('businesses').update(payload).eq('slug', 'luxury-spa-demo');
  if (error) console.error(error);
  else console.log("Updated luxury-spa-demo logo and slides successfully!");
}

run();
