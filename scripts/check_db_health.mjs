import { createClient } from '@supabase/supabase-js';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('businesses').select('slug, name, phone, page_content, description, short_description');
  if (error) { console.error(error); process.exitCode = 1; return; }
  if (!data) { console.error('No data returned'); process.exitCode = 1; return; }
  
  let perfect = 0;
  let missingPhone = 0;
  let fakePhone = 0;
  let htmlDescription = 0;
  let noImages = 0;
  let noServices = 0;
  let stringDeals = 0;

  console.log(`Analyzing ${data.length} businesses...`);

  data.forEach(b => {
    let pc = {};
    try {
      pc = (typeof b.page_content === 'string' ? JSON.parse(b.page_content) : b.page_content) || {};
    } catch (e) {
      // Ignored for now, will log as empty pc
    }
    const issues = [];

    // Check Phone
    const p = pc.phone || b.phone || '';
    if (!p || p === '(Chưa công khai)') {
       missingPhone++;
       issues.push('Missing phone');
    } else if (p.replace(/\D/g, '').length < 8 || p.includes('12345') || p.includes('09090909')) {
       fakePhone++;
       issues.push('Fake phone: ' + p);
    }

    // Check Description HTML
    const desc = String(pc.description || pc.short_description || b.description || b.short_description || '');
    if (/<[a-z][^>]*>/i.test(desc)) {
       htmlDescription++;
       issues.push('HTML in description');
    }

    // Check Images
    const hasGallery = Array.isArray(pc.gallery) && pc.gallery.length > 0;
    const hasBanners = Array.isArray(pc.banners) && pc.banners.length > 0;
    const hasLogo = !!pc.logo_url;
    if (!hasGallery && !hasBanners && !hasLogo) {
       noImages++;
       issues.push('No images at all');
    }

    // Check Services
    if (!Array.isArray(pc.services) || pc.services.length === 0) {
       noServices++;
       issues.push('No services');
    }

    // Check Deals
    if (Array.isArray(pc.deals) && pc.deals.length > 0 && typeof pc.deals[0] === 'string') {
       stringDeals++;
       issues.push('Deals are strings, not objects');
    }

    if (issues.length === 0) {
      perfect++;
    } else {
      console.log(`- [${b.slug}] ${b.name}: ${issues.join(' | ')}`);
    }
  });

  console.log('\n=== SUMMARY ===');
  console.log(`Total records: ${data.length}`);
  console.log(`✅ Perfect (fully populated & clean): ${perfect}`);
  console.log(`❌ Missing Phone: ${missingPhone}`);
  console.log(`❌ Fake Phone: ${fakePhone}`);
  console.log(`❌ HTML in Description: ${htmlDescription}`);
  console.log(`❌ Missing all Images: ${noImages}`);
  console.log(`❌ Missing Services: ${noServices}`);
  console.log(`❌ Deals are Strings (Old Format): ${stringDeals}`);
}
run().catch(e => { console.error('FATAL:', e); process.exit(1); });
