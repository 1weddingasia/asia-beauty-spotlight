const fs = require('fs');
const path = require('path');

const dir = 'src/components/site';
const files = fs.readdirSync(dir);

files.forEach(f => {
    if (!f.endsWith('.tsx')) return;
    const p = path.join(dir, f);
    let content = fs.readFileSync(p, 'utf8');
    
    // Replace tanstack link with next/link
    content = content.replace(/import\s+\{.*Link.*\}\s+from\s+["']@tanstack\/react-router["'];?/g, 'import Link from "next/link";');
    
    // If useNavigate or useRouter is used
    if (content.includes('useNavigate') || content.includes('useRouter')) {
        content = content.replace(/import\s+\{.*use(Navigate|Router).*\}\s+from\s+["']@tanstack\/react-router["'];?/g, 'import { useRouter } from "next/navigation";');
        content = content.replace(/useNavigate\(\)/g, 'useRouter()');
        // change navigate({ to: ... }) to router.push(...)
        content = content.replace(/navigate\(\{[\s\S]*?to:\s*(["'][^"']+["'])[\s\S]*?\}\)/g, 'router.push()');
    }
    
    // fix Link 	o props to href
    content = content.replace(/<Link\s+([^>]*?)to=/g, '<Link =');

    fs.writeFileSync(p, content);
});
