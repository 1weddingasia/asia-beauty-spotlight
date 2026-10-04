const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://www.google.com/maps/search/Lụa Spa Ho Chi Minh City', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 3000));
  
  const firstResult = await page.$('a[href*="/maps/place/"]');
  if (firstResult) {
    await firstResult.click();
    await new Promise(r => setTimeout(r, 4000));
    
    // click expand hours
    const html = await page.content();
    require('fs').writeFileSync('lua_spa_panel.html', html);
  }
  await browser.close();
})();
