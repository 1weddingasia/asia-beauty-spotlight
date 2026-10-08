import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { OpenAI } from 'openai';
import puppeteer from 'puppeteer';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: process.env.DEEPSEEK_API_KEY
});

async function run() {
  const backlogPath = path.resolve(process.cwd(), 'data/onboarding/backlog.json');
  let backlog = [];
  try {
    backlog = JSON.parse(fs.readFileSync(backlogPath, 'utf8'));
  } catch(e) {
    console.error("No backlog found.");
    return;
  }

  let processedCount = 0;
  while(true) {
    const itemIndex = backlog.findIndex(i => !i.processed);
    if (itemIndex === -1) {
      console.log("All items in backlog processed!");
      break;
    }
    
    const item = backlog[itemIndex];
    console.log(`\n========================================`);
    console.log(`Processing item ${itemIndex + 1}/${backlog.length}: ${item.name}`);

    // 1. Scrape Info
    let pageText = "";
    let images = [];
    
    if (item.website || item.facebook) {
      let targetUrl = item.website || item.facebook;
      if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;
      
      console.log("Scraping " + targetUrl);
      try {
        const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(e => console.log('Timeout, proceeding with current dom'));
        
        pageText = await page.evaluate(() => {
          return document.body ? document.body.innerText.substring(0, 5000) : '';
        });
        
        images = await page.evaluate(() => {
          const ogImage = document.querySelector('meta[property="og:image"]')?.content;
          const ogLogo = document.querySelector('meta[property="og:logo"]')?.content;
          const icon = document.querySelector('link[rel="icon"]')?.href || document.querySelector('link[rel="shortcut icon"]')?.href;
          
          let result = [];
          if (ogImage && ogImage.startsWith('http')) result.push({ type: 'banner', url: ogImage });
          if (ogLogo && ogLogo.startsWith('http')) result.push({ type: 'logo', url: ogLogo });
          else if (icon && icon.startsWith('http')) result.push({ type: 'logo', url: icon });
          
          const imgs = Array.from(document.querySelectorAll('img'));
          for (let img of imgs) {
            if (img.src && img.src.startsWith('http') && !img.src.includes('data:image')) {
              // try to filter tiny icons by checking attributes if available
              const w = img.getAttribute('width');
              const h = img.getAttribute('height');
              if ((w && parseInt(w) < 100) || (h && parseInt(h) < 100)) continue;
              result.push({ type: 'gallery', url: img.src });
            }
          }
          
          return result.slice(0, 15); // limit to 15 images to avoid token bloat
        });
        
        await browser.close();
      } catch(e) {
        console.log("Scrape failed: ", e.message);
      }
    }

    // 2. AI Generation
    console.log("Generating AI content...");
    const prompt = `
    You are an expert SEO copywriter and data curator for 1Booking.Asia, a premium beauty and wellness directory.
    Generate JSON data for the following business:
    Name: ${item.name}
    Address: ${item.address}
    Phone: ${item.phone}
    Services provided by user: ${JSON.stringify(item.services || [])}
    
    Scraped text from website (may be empty or dirty):
    ${pageText.substring(0, 3000)}

    Found OpenGraph Images/Logos:
    ${JSON.stringify(images)}

    Return a JSON object strictly matching this format. Output ONLY valid JSON, no markdown blocks.
    IMPORTANT RULES FOR IMAGES:
    1. For 'banners', use the 'banner' url from Found Images. If none found or if it's a temporary facebook link, YOU MUST return an empty array []. DO NOT use any placeholders or stock images.
    2. For 'logo_url', use the 'logo' url from Found Images. If none found, return an empty string "". DO NOT use any placeholders.
    {
      "name": "${item.name}",
      "slug": "<generate-seo-friendly-slug-without-diacritics>",
      "short_description": "<1-2 engaging sentences>",
      "description": "<detailed PR article about the brand, ONLY plain text with \\n for newlines, DO NOT use HTML tags like <b> or <br>>",
      "seo_title": "<seo title, max 60 chars>",
      "seo_description": "<seo description, max 160 chars>",
      "phone": "<extract phone from text if provided phone is invalid/missing, else use provided. If NOT FOUND AT ALL, leave it empty. DO NOT use fake numbers>",
      "zalo": "<extract zalo phone number if any, else empty string>",
      "socials": {
        "facebook": "<facebook url if found, else empty string>",
        "tiktok": "<tiktok url if found, else empty string>",
        "youtube": "<youtube url if found, else empty string>",
        "instagram": "<instagram url if found, else empty string>"
      },
      "working_hours": "<extract working hours, else default to '08:00 - 20:00 (Thứ 2 - Chủ Nhật)'>",
      "price_range": "<extract price range, e.g. '100.000đ - 5.000.000đ' or '$$ - $$$', else empty string>",
      "amenities": ["<list of amenities like 'Có chỗ đậu xe', 'Wifi miễn phí' if found, else empty array>"],
      "services": [
         { "id": "s1", "name": "<Service name>", "price": "<price>", "status": "active", "description": "<brief description if any>" }
      ],
      "deals": [
         { "id": "d1", "title": "<deal title>", "original_price": "<original price if any>", "promo_price": "<promo price or discount>", "status": "active" }
      ],
      "banners": ["<if a suitable wide cover image is found in Found Images, use it, else empty array>"],
      "gallery": ["<pick valid URLs from Found Images for gallery, else empty array>"],
      "logo_url": ""
    }`;

    let aiData;
    try {
      const chatCompletion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'deepseek-chat',
        response_format: { type: 'json_object' }
      });
      const text = chatCompletion.choices[0].message.content;
      aiData = JSON.parse(text);
    } catch(e) {
      console.error("AI Generation failed", e.message);
      // Skip this item so the loop doesn't get stuck
      item.processed = true;
      item.error = "AI Generation Failed";
      fs.writeFileSync(backlogPath, JSON.stringify(backlog, null, 2));
      continue;
    }

    // 3. Prepare Final Business Data
    const businessData = {
      name: item.name,
      slug: aiData.slug,
      address: item.address,
      phone: aiData.phone || item.phone,
      zalo: aiData.zalo || null,
      email: item.email || (aiData.slug + "@1booking.asia"),
      website: item.website || null,
      socials: aiData.socials || null,
      short_description: aiData.short_description,
      description: aiData.description,
      seo_title: aiData.seo_title,
      seo_description: aiData.seo_description,
      status: 'draft',
      is_featured: false,
      plan_tier: 'premium',
      page_content: {
        logo_url: aiData.logo_url || '',
        banners: (aiData.banners && aiData.banners.length > 0) ? aiData.banners : [],
        gallery: (aiData.gallery && aiData.gallery.length > 0) ? aiData.gallery : [],
        working_hours: aiData.working_hours || "08:00 - 20:00 (Thứ 2 - Chủ Nhật)",
        price_range: aiData.price_range || '',
        amenities: aiData.amenities || [],
        services: (aiData.services && aiData.services.length > 0) ? aiData.services : (item.services || []).map((s,i) => ({ id: 's'+i, name: s.name, price: s.price, status: 'active'})),
        deals: aiData.deals || []
      }
    };

    // 4. Save to queue folder just for reference
    const queuePath = path.resolve(process.cwd(), 'data/onboarding/queue', `${businessData.slug}.json`);
    fs.writeFileSync(queuePath, JSON.stringify(businessData, null, 2));

    // 5. Run Seed
    console.log("Seeding to Supabase...");
    let { data: users, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    let user = users?.users?.find(u => u.email === businessData.email);
    if (!user) {
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: businessData.email,
        password: '123456',
        email_confirm: true,
        user_metadata: { name: businessData.name }
      });
      if (!createError && newUser) {
        user = newUser.user;
      }
    }

    if (user) {
      businessData.owner_id = user.id;
    }

    // 5.5 Match existing business by name
    const { data: existingBiz } = await supabase.from('businesses').select('id, slug').eq('name', businessData.name).single();
    if (existingBiz) {
      businessData.slug = existingBiz.slug; // Preserve original slug
      const { error: updateError } = await supabase.from('businesses').update(businessData).eq('id', existingBiz.id);
      if (updateError) {
        console.error("Update failed:", updateError);
      } else {
        console.log(`Success Updated: ${businessData.slug}`);
      }
    } else {
      const { error: upsertError } = await supabase.from('businesses').upsert(businessData, { onConflict: 'slug' });
      if (upsertError) {
        console.error("Upsert failed:", upsertError);
      } else {
        console.log(`Success Inserted: ${businessData.slug}`);
      }
    }

    // Mark processed
    backlog[itemIndex].processed = true;
    fs.writeFileSync(backlogPath, JSON.stringify(backlog, null, 2));
    
    processedCount++;
    console.log(`Finished ${processedCount} items. Waiting 5s before next...`);
    await new Promise(r => setTimeout(r, 5000));
  }
}

run();
