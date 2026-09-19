const fs = require('fs');

let page = fs.readFileSync('src/app/page.tsx', 'utf8');
page = page.replace(/business=\{b\}/g, 'business={b as any}');
fs.writeFileSync('src/app/page.tsx', page);

let search = fs.readFileSync('src/components/site/SearchBar.tsx', 'utf8');
if (!search.includes('import Link from')) {
    search = 'import Link from "next/link";\n' + search;
}
fs.writeFileSync('src/components/site/SearchBar.tsx', search);

let b = fs.readFileSync('src/data/business.ts', 'utf8');
b = b.replace(/const supabase = createClient\(\);/g, 'const supabase = await createClient();');
fs.writeFileSync('src/data/business.ts', b);
