const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const PEXELS_KEY = process.env.PEXELS_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const businesses = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/batch1.json'), 'utf-8'));

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

async function fetchPexelsFallback(query) {
  try {
    const res = await axios.get(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape`, {
      headers: { Authorization: PEXELS_KEY }
    });
    return res.data.photos.map(p => p.src.large2x || p.src.large);
  } catch (e) {
    console.error("Pexels error:", e.message);
    return [];
  }
}

async function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function scrapeGoogleMaps(page, businessName) {
  console.log(`\n🔍 Đang tìm kiếm: ${businessName}`);
  try {
    await page.goto(`https://www.google.com/maps/search/${encodeURIComponent(businessName + " Ho Chi Minh")}`, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for either the search results list or a direct business page
    await page.waitForSelector('h1', { timeout: 10000 }).catch(() => {});
    
    await delay(3000);

    const data = await page.evaluate(() => {
      const getEl = (selector) => document.querySelector(selector);
      const getArr = (selector) => Array.from(document.querySelectorAll(selector));

      const title = getEl('h1')?.innerText || null;
      let rating = null;
      let reviews = null;
      let address = null;
      let phone = null;
      let website = null;
      
      const textContents = getArr('*').map(e => e.innerText || '');
      
      // Extract rating and reviews from elements containing "★" or digits and "reviews"
      const ratingEl = document.querySelector('div.F7nice');
      if (ratingEl) {
        rating = ratingEl.querySelector('span[aria-hidden="true"]')?.innerText;
        reviews = ratingEl.querySelector('span[aria-label*="review"]')?.innerText || ratingEl.querySelector('span[aria-label*="đánh giá"]')?.innerText;
      }

      const buttons = getArr('button');
      for (let b of buttons) {
        let label = b.getAttribute('aria-label') || '';
        if (label.includes('Address:') || label.includes('Địa chỉ:')) address = label.split(':')[1].trim();
        if (label.includes('Phone:') || label.includes('Điện thoại:')) phone = label.split(':')[1].trim();
        if (label.includes('Website:')) website = label.split(':')[1].trim();
      }

      // Extract images (Photos)
      // Look for buttons that open the gallery
      let imgs = getArr('button[aria-label*="Photo"] img, button[aria-label*="Ảnh"] img').map(img => img.src);
      if (imgs.length === 0) {
        imgs = getArr('img').map(i => i.src).filter(s => s && s.includes('lh5.googleusercontent.com'));
      }
      return { title, rating, reviews, address, phone, website, imgs };
    });

    console.log(`[Kết quả] ${data.title} | ${data.rating}⭐ | ${data.reviews} reviews`);
    
    // Filter and upgrade image URLs to HD
    let hqImages = [];
    if (data.imgs) {
      hqImages = [...new Set(data.imgs)]
        .filter(src => src.includes('googleusercontent.com'))
        .map(src => src.replace(/=w\d+-h\d+-[a-zA-Z0-9\-]+/, '=s1024')) // Force 1024px
        .filter(Boolean);
    }

    return { ...data, hqImages };
  } catch (e) {
    console.error(`❌ Lỗi scrape ${businessName}:`, e.message);
    return null;
  }
}

async function runNightShift() {
  console.log("=== BẮT ĐẦU TRẠM BƠM DỮ LIỆU ĐÊM (NIGHT SHIFT) ===");
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=vi-VN']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

  for (let i = 0; i < businesses.length; i++) {
    const biz = businesses[i];
    const slug = slugify(biz.name);
    
    // Check if exists
    const { data: existing } = await supabase.from('businesses').select('id').eq('slug', slug).single();
    if (existing) {
      console.log(`⏭️  Bỏ qua ${biz.name} (đã tồn tại)`);
      continue;
    }

    const scraped = await scrapeGoogleMaps(page, biz.name);
    
    // Smart Quality Fallback
    let banners = scraped && scraped.hqImages ? scraped.hqImages.slice(0, 3) : [];
    let gallery = scraped && scraped.hqImages ? scraped.hqImages.slice(3, 8).map(url => ({ id: Math.random().toString(), url })) : [];
    
    if (banners.length < 3) {
      console.log(`⚠️ Thiếu ảnh đẹp, dùng Pexels Fallback cho ${biz.category}...`);
      const searchTerms = biz.category === 'hair-salon' ? 'hair salon interior luxury' : 
                          biz.category === 'nail-lash' ? 'nail salon interior' : 'luxury spa interior';
      const fallbackImgs = await fetchPexelsFallback(searchTerms);
      banners = [...banners, ...fallbackImgs].slice(0, 3);
    }

    // Build Payload
    let numericRating = 5.0;
    if (scraped?.rating) numericRating = parseFloat(scraped.rating.replace(',', '.')) || 5.0;
    
    let numericReviews = 0;
    if (scraped?.reviews) {
      let r = scraped.reviews.replace(/[^\d]/g, '');
      numericReviews = parseInt(r) || 0;
    }

    const page_content = {
      hero_image: banners[0] || null,
      banners: banners,
      gallery: gallery,
      tagline: `Trải nghiệm dịch vụ ${biz.category} đẳng cấp tại ${biz.location === 'ho-chi-minh' ? 'TP.HCM' : biz.location}`,
      rating: numericRating,
      reviews: numericReviews
    };

    const payload = {
      name: scraped?.title || biz.name,
      slug: slug,
      category_slug: biz.category,
      location_slug: biz.location,
      address: scraped?.address || "Đang cập nhật",
      phone: scraped?.phone || null,
      website: scraped?.website || null,
      status: 'published',
      is_featured: biz.priority === 'A',
      page_content: page_content
    };

    const { error } = await supabase.from('businesses').insert(payload);
    if (error) {
      console.error(`❌ Lỗi Insert Supabase (${biz.name}):`, error.message);
    } else {
      console.log(`✅ Nạp thành công: ${biz.name}`);
    }

    await delay(5000); // Wait 5s before next search to avoid Google blocking
  }

  await browser.close();
  console.log("=== KẾT THÚC TRẠM BƠM DỮ LIỆU ===");
}

runNightShift();
