const fs = require('fs');
const path = require('path');
const dir = 'src/components/site';
const files = fs.readdirSync(dir);

files.forEach(f => {
    if (!f.endsWith('.tsx')) return;
    const p = path.join(dir, f);
    let content = fs.readFileSync(p, 'utf8');
    
    // replace imports
    content = content.replace(/import \{ Link \} from "@tanstack\/react-router";/g, 'import Link from "next/link";');
    content = content.replace(/import \{.*useRouter.*\} from "@tanstack\/react-router";/g, 'import { useRouter } from "next/navigation";');
    content = content.replace(/import \{.*useNavigate.*\} from "@tanstack\/react-router";/g, 'import { useRouter } from "next/navigation";');

    // Fix <Link> tags
    content = content.replace(/to=/g, 'href=');
    // For specific files, replace params:
    content = content.replace(/params=\{\{ slug: ([^\}]+) \}\}/g, ' '); // just remove params
    content = content.replace(/href="\/doanh-nghiep\/\"/g, 'href={/doanh-nghiep/}');
    content = content.replace(/href="\/danh-muc\/\"/g, 'href={/danh-muc/}');
    content = content.replace(/search=\{\{([^}]+)\}\}/g, '');

    // Add use client
    if (!content.startsWith('"use client";')) {
        content = '"use client";\n' + content;
    }

    fs.writeFileSync(p, content);
});

let d = fs.readFileSync('src/data/directory.ts', 'utf8');
d = d.replace(/import (\w+) from "@\/assets\/([^"]+)";/g, 'import _ from "@/assets/";\nconst  = _.src;');
fs.writeFileSync('src/data/directory.ts', d);
