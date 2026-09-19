const fs = require('fs');
let c = fs.readFileSync('src/app/login/page.tsx', 'utf8');
c = c.replace(/\\\\\\$\\{window\.location\.origin\\}\/auth\/callback\\\/, '${window.location.origin}/auth/callback');
fs.writeFileSync('src/app/login/page.tsx', c);
