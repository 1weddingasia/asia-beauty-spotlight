const puppeteer = require('puppeteer');

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=vi-VN,en-US', '--disable-blink-features=AutomationControlled'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.evaluateOnNewDocument(() => { Object.defineProperty(navigator, 'webdriver', { get: () => false }); });

  await page.goto('https://www.google.com/maps/search/Lụa+Spa+Quận+3+Ho+Chi+Minh+City', { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise(r => setTimeout(r, 4000));
  
  // Try to click Photos tab
  try {
    const tabs = await page.$$('.hh2c6, button[aria-label*="Photo"], button[aria-label*="Ảnh"], button[aria-label*="ảnh"]');
    if (tabs.length > 0) {
      await tabs[0].click();
      await new Promise(r => setTimeout(r, 4000));
    }
  } catch (e) { console.log(e); }
  
  // Scroll
  await page.evaluate(async () => {
    const scrollable = document.querySelector('div.m6QErb, div[role="main"]');
    if (scrollable) {
      for (let i = 0; i < 5; i++) {
        scrollable.scrollTop += 800;
        await new Promise(r => setTimeout(r, 500));
      }
    }
  });

  const imgs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).map(i => i.src).filter(s => s && s.includes('googleusercontent.com'));
  });
  console.log('Total:', imgs.length);
  console.log(imgs.filter(s => !s.includes('=s40') && !s.includes('=w36') && !s.includes('=w40') && !s.includes('=s24')));
  await browser.close();
}
run();
