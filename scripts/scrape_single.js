/**
 * scrape_single.js — Engine cào dữ liệu nâng cấp v2
 * Chạy: node scripts/scrape_single.js --url="..." --mode="bulk|supplement" --businessId="..." --category="spa-massage" --location="ho-chi-minh"
 * 
 * Cải tiến so với night_shift.js:
 * 1. Dùng Puppeteer-compatible tab iteration (không dùng :has-text Playwright-only)
 * 2. Click tab Ảnh để load full gallery, scroll để load lazy images
 * 3. Ép URL ảnh lên =s2048 (4K)
 * 4. Lấy logo từ Knowledge Panel
 * 5. Chế độ "supplement" chỉ ghi đè trường rỗng, không xóa dữ liệu cũ
 * 6. Output JSON chuẩn ra stdout để API parse
 */

const puppeteer = require('puppeteer');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env
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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PEXELS_KEY = process.env.PEXELS_API_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Parse CLI args
const args = {};
for (const arg of process.argv.slice(2)) {
  const m = arg.match(/^--([^=]+)=(.*)$/);
  if (m) args[m[1]] = m[2];
}
const { url, mode = 'bulk', businessId, category = 'spa-massage', location = 'ho-chi-minh' } = args;

function slugify(text) {
  return text.toString().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function upgradeImageUrl(src) {
  if (!src || !src.includes('googleusercontent.com')) return src;
  let base = src.split('=s')[0];
  base = base.split('=w')[0];
  base = base.split('?')[0];
  return base + '=s1024';
}

async function fetchPexelsFallback(category) {
  if (!PEXELS_KEY) return [];
  const queries = {
    'spa-massage': 'luxury spa interior vietnam',
    'nail-lash': 'nail salon interior modern',
    'hair-salon': 'hair salon interior elegant',
    'tham-my-vien': 'beauty clinic aesthetic',
    'makeup-bridal': 'makeup artist bridal salon',
    'barber-mens': 'barber shop modern',
  };
  const q = queries[category] || 'beauty salon interior';
  try {
    const res = await axios.get(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=5&orientation=landscape`,
      { headers: { Authorization: PEXELS_KEY }, timeout: 10000 }
    );
    return res.data.photos.map(p => p.src.large2x || p.src.large);
  } catch { return []; }
}

async function generateContentWithAI(name, category, address, reviews) {
  if (!process.env.DEEPSEEK_API_KEY) return null;
  try {
    const prompt = `Tôi đang tạo hồ sơ cho doanh nghiệp làm đẹp:
Tên: ${name}
Địa chỉ: ${address || 'Đang cập nhật'}
Ngành nghề: ${category}
Số đánh giá: ${reviews || 0}

Yêu cầu viết bằng tiếng Việt:
1. short_description: 1 câu mô tả ngắn gọn, hấp dẫn, chuẩn SEO (khoảng 15-20 chữ).
2. description: Câu chuyện thương hiệu và giới thiệu dịch vụ (khoảng 3 đoạn văn). Văn phong chuyên nghiệp, sang trọng, thu hút khách hàng làm đẹp. Sử dụng thẻ HTML cơ bản (<p>, <b>, <ul>, <br>) để trình bày. KHÔNG dùng markdown hay \`\`\`.
3. tagline: Slogan ngắn gọn (3-6 chữ).

Trả về ĐÚNG MỘT JSON thuần túy (không bọc trong \`\`\`json), với cấu trúc:
{"short_description": "...", "description": "...", "tagline": "..."}`;
    
    const res = await axios.post('https://api.deepseek.com/chat/completions', {
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    const txt = res.data.choices[0].message.content;
    return JSON.parse(txt.replace(/```json/g, '').replace(/```/g, '').trim());
  } catch (e) {
    return null;
  }
}

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function scrapeGoogleMaps(page, searchQuery) {
  try {
    const isDirectUrl = searchQuery.startsWith('http');
    const targetUrl = isDirectUrl
      ? searchQuery
      : `https://www.google.com/maps/search/${encodeURIComponent(searchQuery + ' Ho Chi Minh City')}`;

    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 45000 });
    await delay(3000);

    // If it's a search results page (not a direct business page), click the first result
    const firstResult = await page.$('a[href*="/maps/place/"]');
    if (firstResult) {
      await firstResult.click();
      await page.waitForSelector('h1', { timeout: 10000 }).catch(() => {});
      await delay(2500);
    }

    // ── EXTRACT BASIC INFO ──────────────────────────────────
    const basicInfoData = await page.evaluate(() => {
      const title = document.querySelector('h1')?.innerText || null;

      let rating = null, reviews = null;
      const ratingEl = document.querySelector('div.F7nice');
      if (ratingEl) {
        rating = ratingEl.querySelector('span[aria-hidden="true"]')?.innerText;
        const rvEl = ratingEl.querySelector('span[aria-label*="review"], span[aria-label*="đánh giá"]');
        reviews = rvEl?.innerText;
      }

      // ── EXTRACT ROBUST CONTACT INFO ──
      let address = null, phone = null, website = null;
      
      const addrEl = document.querySelector('[data-item-id="address"]');
      if (addrEl) address = (addrEl.getAttribute('aria-label') || '').replace(/^[^:]+:\s*/, '').trim();
      
      const phoneEl = document.querySelector('[data-item-id^="phone:tel:"]');
      if (phoneEl) {
        phone = (phoneEl.getAttribute('aria-label') || '').replace(/^[^:]+:\s*/, '').trim();
        if (!phone && phoneEl.innerText) phone = phoneEl.innerText.split('\n').pop().trim();
      }
      
      const webEl = document.querySelector('[data-item-id="authority"]');
      if (webEl) {
        website = webEl.getAttribute('href');
        if (!website) website = (webEl.getAttribute('aria-label') || '').replace(/^[^:]+:\s*/, '').trim();
        if (!website && webEl.innerText) website = webEl.innerText.split('\n').pop().trim();
      }


      let working_hours = "Đang cập nhật";
      const ohEl = document.querySelector('[data-item-id="oh"]');
      if (ohEl) {
        let ariaOh = ohEl.getAttribute('aria-label') || '';
        ariaOh = ariaOh.replace(/Ẩn giờ hoạt động trong tuần\.?|Hide hours for the week\.?/gi, '').trim();
        if (ariaOh) {
          working_hours = ariaOh.split('. ').map(s => s.trim()).filter(Boolean).join('\n');
        }
      }
      
      return { title, rating, reviews, address, phone, website, working_hours };
    });

    // Grab visible photos (shallow)
    const imgs = await page.evaluate(() => {
      const allImgs = Array.from(document.querySelectorAll('img'));
      return [...new Set(
        allImgs
          .map(i => i.src)
          .filter(s => s && s.includes('googleusercontent.com') && !s.includes('/a/') && !s.includes('/a-/') && !s.includes('=w36') && !s.includes('default'))
      )];
    });

    let logo = null;
    if (imgs.length > 0) logo = imgs[0]; // first image is usually the main/logo
    const basicInfo = { ...basicInfoData, logo, imgs };

    // Try to scroll sidebar to lazy load more images
    try {
      await page.evaluate(async () => {
        const scrollable = document.querySelector('div[role="main"], div.m6QErb');
        if (scrollable) {
          for (let i = 0; i < 5; i++) {
            scrollable.scrollTop += 800;
            await new Promise(r => setTimeout(r, 500));
          }
        }
      });
      
      const moreImgs = await page.evaluate(() => {
        const allImgs = Array.from(document.querySelectorAll('img'));
        return [...new Set(
          allImgs
            .map(i => i.src)
            .filter(s => s && s.includes('googleusercontent.com') && !s.includes('/a/') && !s.includes('/a-/') && !s.includes('=w36') && !s.includes('default'))
        )];
      });
      basicInfo.imgs = [...new Set([...basicInfo.imgs, ...moreImgs])];
    } catch (_) {}

    // UPGRADE ALL IMAGES TO 4K
    const hqImages = basicInfo.imgs
      .map(upgradeImageUrl)
      .filter(Boolean)
      .slice(0, 15); // max 15 images

    const logoHq = basicInfo.logo ? upgradeImageUrl(basicInfo.logo) : null;
    const banners = hqImages.slice(0, 3);
    const gallery = hqImages.slice(3);

    return {
      ...basicInfo,
      logo: logoHq,
      banners,
      gallery,
      hqImages,
    };
  } catch (e) {
    process.stderr.write(`[scrape error] ${e.message}\n`);
    return null;
  }
}

async function run() {
  if (!url) {
    process.stdout.write(JSON.stringify({ error: 'Missing --url argument' }) + '\n');
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=vi-VN,en-US', '--disable-blink-features=AutomationControlled'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
  // Hide webdriver flag
  await page.evaluateOnNewDocument(() => { Object.defineProperty(navigator, 'webdriver', { get: () => false }); });

  const scraped = await scrapeGoogleMaps(page, url);
  await browser.close();

  // ── SUPPLEMENT MODE ────────────────────────────────────────
  if (mode === 'supplement' && businessId) {
    if (!scraped) {
      process.stdout.write(JSON.stringify({ error: 'Không thể cào dữ liệu từ link này' }) + '\n');
      process.exit(0);
    }
    // Load existing business
    const { data: existing } = await supabase.from('businesses').select('*').eq('id', businessId).single();
    if (!existing) {
      process.stdout.write(JSON.stringify({ error: 'Không tìm thấy doanh nghiệp' }) + '\n');
      process.exit(0);
    }
    const pc = (typeof existing.page_content === 'string' ? JSON.parse(existing.page_content) : existing.page_content) || {};

    // Only overwrite empty fields
    const updatedPc = {
      ...pc,
      logo_url: pc.logo_url || scraped.logo || pc.logo_url,
      hero_image: pc.hero_image || scraped.banners?.[0] || pc.hero_image,
      banners: [...new Set([...(pc.banners || []), ...(scraped.banners || [])])].filter(Boolean).slice(0, 3),
      gallery: [...new Set([...(pc.gallery || []), ...(scraped.gallery || [])])].filter(Boolean),
      rating: pc.rating || (scraped.rating ? parseFloat(scraped.rating.replace(',', '.')) : undefined),
      reviews: pc.reviews || (scraped.reviews ? parseInt(scraped.reviews.replace(/[^\d]/g, '')) : undefined),
      working_hours: scraped.working_hours && scraped.working_hours !== 'Đang cập nhật' ? scraped.working_hours : (pc.working_hours || []),
    };
    let aiContent = null;
    if (!existing.description || !existing.short_description || !pc.tagline) {
      try {
        aiContent = await generateContentWithAI(existing.name, existing.category_slug, scraped.address || existing.address, updatedPc.reviews);
      } catch (e) {}
    }

    if (aiContent) {
      if (!pc.tagline) updatedPc.tagline = aiContent.tagline;
    }

    const updates = {
      address: existing.address || scraped.address,
      phone: existing.phone || scraped.phone,
      website: existing.website || scraped.website,
      short_description: existing.short_description || aiContent?.short_description || null,
      description: existing.description || aiContent?.description || null,
      page_content: updatedPc,
    };
    await supabase.from('businesses').update(updates).eq('id', businessId);
    process.stdout.write(JSON.stringify({ success: true, name: existing.name }) + '\n');
    process.exit(0);
  }

  // ── BULK MODE ──────────────────────────────────────────────
  const bizName = scraped?.title || url;
  const slug = slugify(bizName);

  // Check existing
  const { data: existing } = await supabase.from('businesses').select('id').eq('slug', slug).single();
  if (existing) {
    process.stdout.write(JSON.stringify({ skipped: true, name: bizName }) + '\n');
    process.exit(0);
  }

  // Build banners from scraped
  let banners = scraped?.banners || [];

  // Type-guard rating and reviews before string operations
  let numericRating = 5.0;
  if (scraped?.rating) {
    const ratingStr = String(scraped.rating).replace(',', '.');
    numericRating = parseFloat(ratingStr) || 5.0;
  }
  let numericReviews = 0;
  if (scraped?.reviews) {
    numericReviews = parseInt(String(scraped.reviews).replace(/[^\d]/g, '')) || 0;
  }

  let aiContent = null;
  try {
    aiContent = await generateContentWithAI(bizName, category, scraped?.address, numericReviews);
  } catch (e) {}

  const page_content = {
    logo_url: scraped?.logo || null,
    hero_image: banners[0] || null,
    banners: banners.filter(Boolean),
    gallery: scraped?.gallery || [],
    rating: numericRating,
    reviews: numericReviews,
    tagline: aiContent?.tagline || `Dịch vụ làm đẹp chuyên nghiệp tại TP.HCM`,
    working_hours: scraped?.working_hours || [],
  };

  const payload = {
    name: bizName,
    slug,
    category_slug: category,
    location_slug: location,
    address: scraped?.address || null,
    phone: scraped?.phone || null,
    website: scraped?.website || null,
    short_description: aiContent?.short_description || null,
    description: aiContent?.description || null,
    status: 'published',
    is_featured: false,
    page_content,
  };

  const { error } = await supabase.from('businesses').insert(payload);
  if (error) {
    process.stdout.write(JSON.stringify({ error: error.message }) + '\n');
    process.exit(0);
  }
  process.stdout.write(JSON.stringify({ success: true, name: bizName }) + '\n');
  process.exit(0);
}

run().catch(e => {
  process.stdout.write(JSON.stringify({ error: e.message }) + '\n');
  process.exit(1);
});
