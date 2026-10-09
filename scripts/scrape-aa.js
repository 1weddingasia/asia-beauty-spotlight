import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const url = 'https://aaclinic.vn/';
  console.log(`Scraping ${url}...`);
  const html = await fetch(url).then(r => r.text());
  const $ = cheerio.load(html);

  const images = [];
  $('img').each((i, el) => {
    let src = $(el).attr('data-src') || $(el).attr('data-lazy-src') || $(el).attr('src');
    if (src && src.startsWith('http') && !src.includes('base64')) {
      images.push(src);
    }
  });

  const validImages = [...new Set(images.filter(src => src.includes('wp-content/uploads')))];
  console.log("Found images:", validImages);

  const logoUrl = validImages.find(src => src.toLowerCase().includes('logo')) || 'https://aaclinic.vn/wp-content/uploads/2023/04/aa-logo-1.png';
  const gallery = validImages.filter(src => !src.toLowerCase().includes('logo') && !src.toLowerCase().includes('icon')).slice(0, 10);

  const slug = "vien-tham-my-quoc-te-aa";

  const { data: existingBiz } = await supabase.from('businesses').select('*').eq('slug', slug).maybeSingle();

  if (existingBiz) {
    const page_content = existingBiz.page_content;
    page_content.logo_url = logoUrl;
    
    // Pick banners
    if (gallery.length > 0) page_content.banners = [gallery[0]];
    if (gallery.length > 1) page_content.gallery = gallery.slice(1, 5);

    // Update service images
    if (page_content.services) {
      page_content.services.forEach((svc, i) => {
        svc.image = gallery[i + 2] || gallery[0] || "";
      });
    }

    console.log("Updating existing business with images...");
    const { error } = await supabase.from('businesses').update({
      page_content
    }).eq('id', existingBiz.id);
    if (error) console.error("Update error:", error);
    else console.log("Success updated images!");
  }
}

run();
