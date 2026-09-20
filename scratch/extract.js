const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\Dell\\.gemini\\antigravity\\brain\\d15fe3a5-5fb6-47b2-a8a6-a33b6536a9eb\\.system_generated\\steps\\1005\\content.md', 'utf8');

const titleMatch = content.match(/<title>(.*?)<\/title>/i);
const descMatch = content.match(/<meta\s+name=[\"']description[\"']\s+content=[\"'](.*?)[\"']/i) || content.match(/<meta\s+property=[\"']og:description[\"']\s+content=[\"'](.*?)[\"']/i);

console.log('Title:', titleMatch ? titleMatch[1] : 'N/A');
console.log('Desc:', descMatch ? descMatch[1] : 'N/A');

const imgMatches = content.match(/<img[^>]+src=[\"']([^\"']+)[\"'][^>]*>/gi) || [];
const imgs = imgMatches.map(m => {
  const match = m.match(/src=[\"']([^\"']+)[\"']/i);
  return match ? match[1] : null;
}).filter(Boolean);

console.log('Images:', imgs.slice(0, 15).join('\n'));
