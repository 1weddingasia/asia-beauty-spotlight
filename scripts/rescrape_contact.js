const puppeteer = require('puppeteer');
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

async function run() {
  console.log('Fetching businesses missing contact info...');
  const { data, error } = await supabase.from('businesses').select('id, name, address, phone, website, page_content');
  if (error) {
    console.error('Failed to fetch:', error.message);
    return;
  }
  
  const toUpdate = data.filter(b => !b.phone || b.phone === 'Đang cập nhật' || !b.website || b.website === 'Đang cập nhật' || !b.address || b.address === 'Đang cập nhật');
  console.log(`Found ${toUpdate.length} businesses to fix.`);
  
  if (toUpdate.length === 0) return;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=vi-VN,en-US']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  let successCount = 0;

  for (let i = 0; i < toUpdate.length; i++) {
    const biz = toUpdate[i];
    console.log(`[${i+1}/${toUpdate.length}] Scraping: ${biz.name}`);
    
    try {
      await page.goto(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(biz.name)}`, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 2000));
      
      const scraped = await page.evaluate(() => {
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
          
          return { address, phone, website };
      });
      
      let updatePayload = {};
      let pc = biz.page_content;
      if (typeof pc === 'string') { try { pc = JSON.parse(pc); } catch(e) {} }
      
      let changed = false;
      
      if (scraped.phone && scraped.phone !== biz.phone) {
        updatePayload.phone = scraped.phone;
        if (pc) pc.phone = scraped.phone;
        changed = true;
      }
      if (scraped.website && scraped.website !== biz.website) {
        updatePayload.website = scraped.website;
        if (pc) pc.website = scraped.website;
        changed = true;
      }
      if (scraped.address && scraped.address !== biz.address) {
        updatePayload.address = scraped.address;
        if (pc) pc.address = scraped.address;
        changed = true;
      }
      
      if (changed) {
        if (pc) updatePayload.page_content = pc;
        const { error: updErr } = await supabase.from('businesses').update(updatePayload).eq('id', biz.id);
        if (!updErr) {
          console.log(`  -> Fixed! Phone: ${scraped.phone || 'N/A'}, Website: ${scraped.website || 'N/A'}`);
          successCount++;
        } else {
          console.error(`  -> Failed to update DB:`, updErr.message);
        }
      } else {
        console.log(`  -> Nothing new found.`);
      }
      
    } catch (e) {
      console.error(`  -> Failed to scrape:`, e.message);
    }
  }

  await browser.close();
  console.log(`✅ Done. Successfully fixed ${successCount} businesses.`);
}

run().catch(e => { console.error(e); process.exit(1); });
