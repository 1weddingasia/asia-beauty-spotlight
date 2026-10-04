const axios = require('axios');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n');
const processEnv = {};
env.forEach(l => { 
  const i = l.indexOf('='); 
  if(i>0) processEnv[l.slice(0,i).trim()] = l.slice(i+1).trim(); 
});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(processEnv.NEXT_PUBLIC_SUPABASE_URL, processEnv.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  try {
    const { data: html } = await axios.get('https://thammyvienngocdung.com/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    
    // Extract image URLs
    const imgUrls = [...html.matchAll(/<img[^>]+src="([^">]+)"/g)].map(m => m[1]);
    
    let validUrls = imgUrls
      .filter(url => url.includes('http') && !url.includes('.svg') && !url.includes('data:image'))
      .map(url => url.trim());
      
    validUrls = [...new Set(validUrls)]; // Deduplicate
    
    console.log('Found images:', validUrls.length);
    if(validUrls.length > 0) {
      const logo = validUrls.find(u => u.toLowerCase().includes('logo')) || validUrls[0];
      const others = validUrls.filter(u => u !== logo);
      
      const hero = others[0] || logo;
      const banners = others.slice(1, 4);
      while (banners.length < 3 && banners.length > 0) { banners.push(banners[banners.length - 1]); }
      if (banners.length === 0) banners.push(hero, hero, hero);
      
      const gallery = others.slice(4, 10);
      while (gallery.length < 6 && gallery.length > 0) { gallery.push(gallery[gallery.length - 1]); }
      if (gallery.length === 0) gallery.push(...banners, ...banners);
      
      const { data } = await supabase.from('businesses').select('*').eq('slug', 'tham-my-vien-ngoc-dung').single();
      const pc = data.page_content || {};
      pc.logo_url = logo;
      pc.hero_image = hero;
      pc.banners = banners;
      pc.gallery = gallery;
      
      await supabase.from('businesses').update({ page_content: pc }).eq('slug', 'tham-my-vien-ngoc-dung');
      console.log('Successfully updated images in DB!');
    } else {
      console.log('No valid images found on homepage.');
    }
  } catch (e) {
    console.error('Error fetching:', e.message);
  }
})();
