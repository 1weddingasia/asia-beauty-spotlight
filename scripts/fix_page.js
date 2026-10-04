const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf8');
content = content.replace(/key=\{.*?\}/, 'key={${o.business.slug}-}');
content = content.replace(/href=\{.*?\}/, 'href={/doanh-nghiep/}');
fs.writeFileSync('src/app/page.tsx', content);
