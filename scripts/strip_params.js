const fs = require('fs');
const path = require('path');
const dir = 'src/components/site';
const files = fs.readdirSync(dir);
files.forEach(f => {
    if (!f.endsWith('.tsx')) return;
    const p = path.join(dir, f);
    let content = fs.readFileSync(p, 'utf8');
    
    // Remove params={{...}} and search={{...}}
    content = content.replace(/\s+params=\{[^\}]+\}\s*/g, ' ');
    content = content.replace(/\s+search=\{[^\}]+\}\s*/g, ' ');
    
    // In HeroSlider.tsx, change image source to string if it was imported as StaticImageData
    // Actually, Next.js Image component handles StaticImageData. But the code might be using <img>
    // Let's replace <img> with next/image or just append .src to the imports.
    fs.writeFileSync(p, content);
});
