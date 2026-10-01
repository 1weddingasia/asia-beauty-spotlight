const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function scrapeWebsite(targetUrl) {
  console.log(`[Scraper] Fetching homepage: ${targetUrl}`);
  const res = await fetch(targetUrl);
  const html = await res.text();
  const $ = cheerio.load(html);

  const data = {
    website: targetUrl,
    name: $('meta[property="og:title"]').attr('content') || $('title').text(),
    description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content'),
    logo_url: null,
    hero_image: $('meta[property="og:image"]').attr('content') || null,
    banners: [],
    phone: null,
    email: null,
    facebook: null,
    instagram: null,
    address: null,
    gallery: [],
    services: [],
    offers: [] // specifically left empty unless proven otherwise
  };

  if (data.hero_image) {
    data.banners.push(data.hero_image);
  }

  // Attempt to find logo
  const logoImg = $('img[src*="logo"], img[class*="logo"]').first();
  if (logoImg.length > 0) {
    data.logo_url = new URL(logoImg.attr('src'), targetUrl).href;
  }

  // Attempt to find phone & email
  $('a[href^="tel:"]').each((i, el) => {
    if (!data.phone) data.phone = $(el).attr('href').replace('tel:', '').trim();
  });
  $('a[href^="mailto:"]').each((i, el) => {
    if (!data.email) data.email = $(el).attr('href').replace('mailto:', '').trim();
  });

  // Attempt to find socials
  $('a[href*="facebook.com"]').each((i, el) => {
    if (!data.facebook) data.facebook = $(el).attr('href');
  });
  $('a[href*="instagram.com"]').each((i, el) => {
    if (!data.instagram) data.instagram = $(el).attr('href');
  });

  // Try to find a gallery link
  let galleryLink = null;
  $('a').each((i, el) => {
    const text = $(el).text().toLowerCase();
    const href = $(el).attr('href');
    if ((text.includes('gallery') || (href && href.includes('gallery'))) && !galleryLink) {
      if (href.startsWith('http')) galleryLink = href;
      else galleryLink = new URL(href, targetUrl).href;
    }
  });

  // Try to find a services link
  let servicesLink = null;
  $('a').each((i, el) => {
    const text = $(el).text().toLowerCase();
    const href = $(el).attr('href');
    if ((text.includes('service') || (href && href.includes('service'))) && !servicesLink) {
      if (href.startsWith('http')) servicesLink = href;
      else servicesLink = new URL(href, targetUrl).href;
    }
  });

  if (galleryLink) {
    console.log(`[Scraper] Found gallery link: ${galleryLink}. Fetching...`);
    try {
      const gRes = await fetch(galleryLink);
      const gHtml = await gRes.text();
      const $g = cheerio.load(gHtml);
      // Try to find large images
      $g('img').each((i, el) => {
        let src = $g(el).attr('src') || $g(el).attr('data-src');
        if (src && !src.includes('logo') && !src.includes('icon') && src.match(/\.(jpeg|jpg|png|webp)/i)) {
          // try to exclude small thumbnails if possible by checking attributes, but for now just collect
          let fullUrl = new URL(src, targetUrl).href;
          if (!data.gallery.includes(fullUrl) && data.gallery.length < 15) {
            data.gallery.push(fullUrl);
          }
        }
      });
      console.log(`[Scraper] Extracted ${data.gallery.length} images from gallery.`);
    } catch (e) {
      console.error(`[Scraper] Failed to scrape gallery:`, e);
    }
  }

  // Find address by looking for keywords or just assume manual input is needed if complex
  // ... omitting complex address parsing for now to keep it reliable

  return data;
}

async function runPipeline(slug, targetUrl) {
  console.log(`\n=== Starting Pipeline for [${slug}] ===`);
  const scrapedData = await scrapeWebsite(targetUrl);
  
  console.log(`[Database] Fetching existing record...`);
  const { data: dbRecord, error: fetchErr } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .single();

  if (fetchErr) {
    console.error(`[Database] Error fetching record:`, fetchErr);
    return;
  }

  let pageContent = dbRecord.page_content || {};

  // Merge Scraped Data
  pageContent.logo_url = scrapedData.logo_url || pageContent.logo_url;
  if (scrapedData.banners.length > 0) pageContent.banners = scrapedData.banners;
  if (scrapedData.hero_image) pageContent.hero_image = scrapedData.hero_image;
  if (scrapedData.gallery.length > 0) pageContent.gallery = scrapedData.gallery;
  
  pageContent.website = scrapedData.website || pageContent.website;
  pageContent.facebook = scrapedData.facebook || pageContent.facebook;
  pageContent.instagram = scrapedData.instagram || pageContent.instagram;
  pageContent.phone = scrapedData.phone || pageContent.phone || pageContent.zalo;
  pageContent.email = scrapedData.email || pageContent.email;
  pageContent.offers = []; // User requested: Ưu đãi đặc quyền nên để trống nếu không thực tế
  
  // Wipe out fake services
  if (pageContent.services && pageContent.services.length > 0) {
    const hasFakeService = pageContent.services.some(s => s.image && s.image.includes('pexels'));
    if (hasFakeService) {
      pageContent.services = [];
    }
  }

  const shortDesc = scrapedData.description ? scrapedData.description.substring(0, 200) + (scrapedData.description.length > 200 ? '...' : '') : null;

  const updatePayload = {
    page_content: pageContent,
    description: scrapedData.description || dbRecord.description,
    short_description: shortDesc || dbRecord.short_description,
    phone: pageContent.phone || dbRecord.phone,
    email: pageContent.email || dbRecord.email,
    website: pageContent.website || dbRecord.website
  };

  // We don't overwrite address if the scraper didn't confidently find one, to avoid losing it.
  
  console.log(`[Database] Updating record...`);
  const { error: updateErr } = await supabase
    .from('businesses')
    .update(updatePayload)
    .eq('slug', slug);

  if (updateErr) {
    console.error(`[Database] Update failed:`, updateErr);
  } else {
    console.log(`[Database] Update successful! 🎉`);
  }
}

// Run the pipeline for Prive Spa
runPipeline('the-prive-spa-ben-thanh', 'https://theprivespa.com');
