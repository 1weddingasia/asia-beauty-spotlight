const fs = require('fs');
let c = fs.readFileSync('src/app/doanh-nghiep/[slug]/BusinessPageClient.tsx', 'utf8');
c = c.replace(/\(h\) =>/g, '(h: any) =>');
c = c.replace(/\(s\) =>/g, '(s: any) =>');
c = c.replace(/\(o\) =>/g, '(o: any) =>');
c = c.replace(/\(t\) =>/g, '(t: any) =>');
c = c.replace(/\(f\) =>/g, '(f: any) =>');
c = c.replace(/\(x\) =>/g, '(x: any) =>');
fs.writeFileSync('src/app/doanh-nghiep/[slug]/BusinessPageClient.tsx', c);

let l = fs.readFileSync('src/app/lien-he/ContactPageClient.tsx', 'utf8');
l = l.replace(/function ContactPage/, 'export default function ContactPage');
fs.writeFileSync('src/app/lien-he/ContactPageClient.tsx', l);
