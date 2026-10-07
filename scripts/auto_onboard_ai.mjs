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
          return Array.from(document.querySelectorAll('img'))
            .map(i => i.src)
            .filter(src => src && src.startsWith('http') && !src.includes('logo') && !src.includes('icon'));
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

    Found Images:
    ${images.slice(0, 10).join('\n')}

    Return a JSON object strictly matching this format. Output ONLY valid JSON, no markdown blocks.
    {
      "name": "${item.name}",
      "slug": "<generate-seo-friendly-slug-without-diacritics>",
      "short_description": "<1-2 engaging sentences>",
      "description": "<detailed HTML string, beautiful PR article about the brand, use <b> and <br>>",
      "seo_title": "<seo title, max 60 chars>",
      "seo_description": "<seo description, max 160 chars>",
      "services": [
         { "id": "s1", "name": "<Service name>", "price": "<price>", "status": "active" }
      ],
      "banners": ["<pick 2 valid URLs from Found Images, or return empty array if none valid>"],
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
      phone: item.phone,
      email: item.email || (aiData.slug + "@1booking.asia"),
      website: item.website || null,
      short_description: aiData.short_description,
      description: aiData.description,
      seo_title: aiData.seo_title,
      seo_description: aiData.seo_description,
      status: 'draft',
      is_featured: false,
      plan_tier: 'premium',
      page_content: {
        logo_url: aiData.logo_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=200&h=200',
        banners: (aiData.banners && aiData.banners.length > 0) ? aiData.banners : ['https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&q=80&w=1200&h=600'],
        services: (aiData.services && aiData.services.length > 0) ? aiData.services : (item.services || []).map((s,i) => ({ id: 's'+i, name: s.name, price: s.price, status: 'active'})),
        deals: [],
        gallery: []
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

    const { error: upsertError } = await supabase.from('businesses').upsert(businessData, { onConflict: 'slug' });
    if (upsertError) {
      console.error("Upsert failed:", upsertError);
    } else {
      console.log(`Success: ${businessData.slug}`);
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
