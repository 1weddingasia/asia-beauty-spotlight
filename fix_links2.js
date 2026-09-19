const fs = require('fs');
const files = ['HeroSlider.tsx', 'Layout.tsx', 'BusinessCard.tsx', 'SearchBar.tsx'];
files.forEach(f => {
    const path = 'src/components/site/' + f;
    let content = fs.readFileSync(path, 'utf8');
    content = content.replace(/<Link =/g, '<Link href=');
    fs.writeFileSync(path, content);
});
