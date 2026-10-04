const puppeteer = require('puppeteer');
async function run() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto('https://www.google.com/maps/search/Lụa+Spa+Quận+3+Ho+Chi+Minh+City');
  await new Promise(r => setTimeout(r, 4000));
  
  const imgs = await page.evaluate(() => {
    let urls = [];
    document.querySelectorAll('*').forEach(el => {
      const bg = window.getComputedStyle(el).backgroundImage;
      if (bg && bg.includes('url(')) {
        urls.push(bg.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, ''));
      }
      if (el.tagName === 'IMG' && el.src) urls.push(el.src);
    });
    return [...new Set(urls)].filter(s => s.includes('googleusercontent.com') && !s.includes('=w36'));
  });
  console.log('Total:', imgs.length);
  console.log(imgs);
  await browser.close();
}
run();
