const fs = require('fs');
const files = ['HeroSlider.tsx', 'Layout.tsx', 'SearchBar.tsx', 'BusinessCard.tsx'];
files.forEach(f => {
    const path = 'src/components/site/' + f;
    const content = fs.readFileSync(path, 'utf8');
    if (!content.startsWith('"use client"')) {
        fs.writeFileSync(path, '"use client";\n' + content);
    }
});
