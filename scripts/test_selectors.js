const puppeteer = require('puppeteer');

async function test() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=vi-VN,en-US', '--disable-blink-features=AutomationControlled'],
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
  
  await page.goto('https://www.google.com/maps/search/Nam+Hoang+Ben+Salon', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 5000));
  
  const scraped = await page.evaluate(() => {
      let address = null, phone = null, website = null;
      
      const addrEl = document.querySelector('[data-item-id="address"]');
      if (addrEl) address = addrEl.getAttribute('aria-label')?.replace(/^(Address|Địa chỉ|Địa chỉ:|Address:)\s*/i, '').trim();
      
      const phoneEl = document.querySelector('[data-item-id^="phone:tel:"]');
      if (phoneEl) {
        phone = phoneEl.getAttribute('aria-label')?.replace(/^(Phone|Điện thoại|Phone:|Điện thoại:)\s*/i, '').trim();
        if (!phone && phoneEl.innerText) phone = phoneEl.innerText.split('\n').pop().trim();
      }
      
      const webEl = document.querySelector('[data-item-id="authority"]');
      if (webEl) {
        website = webEl.getAttribute('href'); 
        if (!website) website = webEl.getAttribute('aria-label')?.replace(/^(Website|Website:)\s*/i, '').trim();
        if (!website && webEl.innerText) website = webEl.innerText.split('\n').pop().trim();
      }
      
      return { address, phone, website };
  });
  
  console.log(JSON.stringify(scraped, null, 2));
  await browser.close();
}
test();
