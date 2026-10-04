const puppeteer = require('puppeteer');
async function run() {
  const browser = await puppeteer.launch({ headless: true, args: ['--lang=en-US'] });
  const page = await browser.newPage();
  await page.goto('https://www.google.com/maps/search/Lụa+Spa+Quận+3+Ho+Chi+Minh+City');
  await new Promise(r => setTimeout(r, 4000));
  const text = await page.evaluate(() => {
    return document.querySelector('[data-item-id="oh"]')?.getAttribute('aria-label');
  });
  console.log('Aria:', text);
  await browser.close();
}
run();
