const fs = require('fs');

let index = fs.readFileSync('src/app/blog/page.tsx', 'utf8');
index = index.replace(/import { MainNav } from "@\/components\/layout\/MainNav";/, 'import { SiteHeader } from "@/components/site/Layout";');
index = index.replace(/import { Footer } from "@\/components\/layout\/Footer";/, 'import { SiteFooter } from "@/components/site/Layout";');
index = index.replace(/<MainNav \/>/, '<SiteHeader solid />');
index = index.replace(/<Footer \/>/, '<SiteFooter />');
fs.writeFileSync('src/app/blog/page.tsx', index);

let detail = fs.readFileSync('src/app/blog/[slug]/page.tsx', 'utf8');
detail = detail.replace(/import { MainNav } from "@\/components\/layout\/MainNav";/, 'import { SiteHeader } from "@/components/site/Layout";');
detail = detail.replace(/import { Footer } from "@\/components\/layout\/Footer";/, 'import { SiteFooter } from "@/components/site/Layout";');
detail = detail.replace(/<MainNav \/>/, '<SiteHeader solid />');
detail = detail.replace(/<Footer \/>/, '<SiteFooter />');
fs.writeFileSync('src/app/blog/[slug]/page.tsx', detail);

console.log('Fixed Blog layout imports');
