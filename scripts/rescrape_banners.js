/**
 * rescrape_banners.js — Re-scrape logo & banners cho 50 doanh nghiệp đêm qua
 * Chỉ cập nhật logo_url, banners, gallery nếu đang rỗng/thiếu
 * Chạy: node scripts/rescrape_banners.js
 */

const puppeteer = require('puppeteer');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const eqIdx = line.indexOf('=');
    if (eqIdx > 0) {
      const key = line.substring(0, eqIdx).trim();
      let val = line.substring(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (key) process.env[key] = val;
    }
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const PEXELS_KEY = process.env.PEXELS_API_KEY;

function upgradeImageUrl(src) {
  if (!src || !src.includes('googleusercontent.com')) return src;
  return src.replace(/=w\d+-h\d+(-[a-zA-Z0-9\-]+)?/, '=s2048').replace(/=s\d+/, '=s2048').split('?')[0] + '=s2048';
}

async function fetchPexelsFallback(category) {
  if (!PEXELS_KEY) return [];
  const queries = {
    'spa-massage': 'luxury spa interior vietnam',
    'nail-lash': 'nail salon interior modern',
    'hair-salon': 'hair salon interior elegant',
    'tham-my-vien': 'beauty clinic aesthetic',
    'makeup-bridal': 'makeup artist bridal salon',
  };
  const q = queries[category] || 'beauty salon interior';
  try {
    const res = await axios.get(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=4&orientation=landscape`,
      { headers: { Authorization: PEXELS_KEY }, timeout: 10000 }
    );
    return res.data.photos.map(p => p.src.large2x || p.src.large);
  } catch { return []; }
}

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function scrapeImages(page, bizName) {
  try {
    await page.goto(
      `https://www.google.com/maps/search/${encodeURIComponent(bizName + ' Ho Chi Minh City')}`,
      { waitUntil: 'networkidle2', timeout: 40000 }
    );
    await delay(2500);

    const firstResult = await page.$('a[href*="/maps/place/"]');
    if (firstResult) {
      await firstResult.click();
      await delay(2500);
    }

    // Try clicking Photos tab
    try {
      const tabs = await page.$$('[role="tab"]');
      for (const tab of tabs) {
        const txt = await tab.evaluate(el => el.innerText || '');
        if (txt.includes('Photo') || txt.includes('Ảnh') || txt.includes('ảnh')) {
          await tab.click();
          await delay(2500);
          break;
        }
      }
      // scroll gallery
      await page.evaluate(async () => {
        const el = document.querySelector('[role="main"]') || document.body;
        for (let i = 0; i < 4; i++) { el.scrollTop += 500; await new Promise(r => setTimeout(r, 500)); }
      });
    } catch (_) {}

    const data = await page.evaluate(() => {
      const logoEl = document.querySelector('button[aria-label*="Photo"] img');
      const logo = logoEl?.src || null;

      const imgs = [...new Set(
        Array.from(document.querySelectorAll('img'))
          .map(i => i.src)
          .filter(s => s && s.includes('googleusercontent.com') && !s.includes('=s40') && !s.includes('=s24'))
      )];
      return { logo, imgs };
    });

    const hqImages = data.imgs.map(upgradeImageUrl).filter(Boolean);
    const logo = data.logo ? upgradeImageUrl(data.logo) : null;
    return { logo, banners: hqImages.slice(0, 3), gallery: hqImages.slice(3, 8).map(url => ({ url })) };
  } catch (e) {
    console.error(`  ❌ Scrape failed: ${e.message}`);
    return null;
  }
}

async function run() {
  console.log('=== RE-SCRAPE BANNERS & LOGOS ===');
  
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name, category_slug, page_content')
    .eq('status', 'published');

  if (!businesses?.length) { console.log('Không tìm thấy doanh nghiệp nào.'); return; }

  console.log(`📋 Tìm thấy ${businesses.length} doanh nghiệp cần kiểm tra`);

  const needsUpdate = businesses.filter(b => {
    const pc = (typeof b.page_content === 'string' ? JSON.parse(b.page_content) : b.page_content) || {};
    const banners = pc.banners?.filter(Boolean) || [];
    return !pc.logo_url || banners.length < 3;
  });

  console.log(`🎯 ${needsUpdate.length} doanh nghiệp cần cập nhật logo/banner\n`);
  if (!needsUpdate.length) { console.log('✅ Tất cả đã có đủ logo và banner!'); return; }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=vi-VN,en-US'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

  for (const biz of needsUpdate) {
    console.log(`🔍 ${biz.name}`);
    const pc = (typeof biz.page_content === 'string' ? JSON.parse(biz.page_content) : biz.page_content) || {};
    const existingBanners = pc.banners?.filter(Boolean) || [];
    const hasLogo = !!pc.logo_url;

    const scraped = await scrapeImages(page, biz.name);

    let newBanners = existingBanners;
    let newLogo = pc.logo_url;

    if (scraped) {
      if (!hasLogo && scraped.logo) newLogo = scraped.logo;
      if (existingBanners.length < 3 && scraped.banners.length > 0) {
        newBanners = [...existingBanners, ...scraped.banners].filter(Boolean).slice(0, 3);
      }
    }

    // Pexels fallback if still short
    if (newBanners.length < 3) {
      const fallback = await fetchPexelsFallback(biz.category_slug || 'spa-massage');
      newBanners = [...newBanners, ...fallback].filter(Boolean).slice(0, 3);
      console.log(`  ⚠️  Dùng Pexels fallback`);
    }

    const updatedPc = {
      ...pc,
      logo_url: newLogo,
      hero_image: pc.hero_image || newBanners[0] || null,
      banners: newBanners,
      gallery: (pc.gallery?.length > 0) ? pc.gallery : (scraped?.gallery || []),
    };

    const { error } = await supabase.from('businesses').update({ page_content: updatedPc }).eq('id', biz.id);
    if (error) console.log(`  ❌ DB error: ${error.message}`);
    else console.log(`  ✅ Cập nhật xong: Logo=${!!newLogo}, Banners=${newBanners.length}`);

    await delay(5000);
  }

  await browser.close();
  console.log('\n=== HOÀN TẤT RE-SCRAPE ===');
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
