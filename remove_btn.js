const fs = require('fs');
let content = fs.readFileSync('src/components/site/Layout.tsx', 'utf8');

const regex = /<Link\s+href="\/lien-he"\s+className="bg-gradient-gold.*???ng k? doanh nghi?p.*?<\/Link>/is;
content = content.replace(regex, '');

fs.writeFileSync('src/components/site/Layout.tsx', content);
console.log('Button removed');
