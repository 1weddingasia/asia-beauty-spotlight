const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const eqIdx = line.indexOf('=');
    if (eqIdx > 0 && !line.trim().startsWith('#')) {
      const key = line.substring(0, eqIdx).trim();
      let val = line.substring(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (key) process.env[key] = val;
    }
  }
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function fixUrl(src) {
  if (!src || typeof src !== 'string' || !src.includes('googleusercontent.com')) return src;
  // Remove all =s... or =w...-h... and append exactly one =s2048
  let base = src.split('=s')[0];
  base = base.split('=w')[0];
  base = base.split('?')[0];
  return base + '=s1024'; // Using s1024 to speed up loading instead of massive s2048
}

async function run() {
  console.log('Fetching all businesses...');
  const { data, error } = await supabase.from('businesses').select('id, page_content');
  
  if (error) {
    console.error('Error fetching businesses:', error);
    return;
  }

  let updatedCount = 0;

  for (const biz of data) {
    let pc = biz.page_content;
    if (typeof pc === 'string') {
      try { pc = JSON.parse(pc); } catch (e) { continue; }
    }
    if (!pc) continue;

    let modified = false;

    // 1. Fix logo
    if (pc.logo_url && typeof pc.logo_url === 'string' && pc.logo_url.includes('=s2048=s2048')) {
      pc.logo_url = fixUrl(pc.logo_url);
      modified = true;
    }

    // 2. Fix hero image
    if (pc.hero_image && typeof pc.hero_image === 'string' && pc.hero_image.includes('=s2048=s2048')) {
      pc.hero_image = fixUrl(pc.hero_image);
      modified = true;
    }

    // 3. Fix banners
    if (pc.banners && Array.isArray(pc.banners)) {
      const newBanners = pc.banners.map(url => {
        if (typeof url === 'string' && url.includes('=s2048=s2048')) {
          modified = true;
          return fixUrl(url);
        }
        return url;
      });
      pc.banners = newBanners;
    }

    // 4. Fix gallery objects to strings
    if (pc.gallery && Array.isArray(pc.gallery)) {
      const newGallery = pc.gallery.map(item => {
        if (item && typeof item === 'object' && item.url) {
          modified = true;
          return fixUrl(item.url);
        } else if (typeof item === 'string') {
          // just in case it has the double suffix
          if (item.includes('=s2048=s2048')) {
            modified = true;
            return fixUrl(item);
          }
          return item;
        }
        return item;
      }).filter(Boolean); // remove nulls
      
      // Also ensure it is exactly an array of strings
      if (JSON.stringify(newGallery) !== JSON.stringify(pc.gallery)) {
        pc.gallery = newGallery;
        modified = true;
      }
    }

    if (modified) {
      console.log(`Fixing business ID: ${biz.id}`);
      await supabase.from('businesses').update({ page_content: pc }).eq('id', biz.id);
      updatedCount++;
    }
  }

  console.log(`✅ Fixed ${updatedCount} businesses.`);
}

run();
