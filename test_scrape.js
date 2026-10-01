const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://www.google.com/maps/search/Lụa Spa Ho Chi Minh City', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 3000));
  
  const firstResult = await page.$('a[href*="/maps/place/"]');
  if (firstResult) {
    console.log('Found link');
    await firstResult.click();
    await new Promise(r => setTimeout(r, 4000));
    await page.screenshot({ path: 'lua_spa_clicked.png' });
    const ohEl = await page.$('[data-item-id="oh"]');
    if (ohEl) {
      const ariaOh = await page.evaluate(el => el.getAttribute('aria-label'), ohEl);
      console.log('Hours:', ariaOh);
    } else {
      console.log('No hours element found');
    }
  } else {
    console.log('No link found');
  }
  await browser.close();
})();
