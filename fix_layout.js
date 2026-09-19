const fs = require('fs');
let c = fs.readFileSync('src/components/site/Layout.tsx', 'utf8');
c = c.replace(/href="\/danh-muc\/\"/g, 'href={/danh-muc/}');
c = c.replace(/\{\.\.\.\(l\.to === "\/tim-kiem"[^}]+\}\s*:\s*\{\}\)\}/g, '');
fs.writeFileSync('src/components/site/Layout.tsx', c);
