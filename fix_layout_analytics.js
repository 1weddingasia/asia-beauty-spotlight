const fs = require('fs');
let code = fs.readFileSync('src/app/layout.tsx', 'utf8');

if (!code.includes('@vercel/analytics/next')) {
    code = code.replace(
        "import './globals.css';",
        "import './globals.css';\nimport { Analytics } from '@vercel/analytics/next';"
    );
    
    code = code.replace(
        "{children}",
        "{children}\n        <Analytics />"
    );
    
    fs.writeFileSync('src/app/layout.tsx', code, 'utf8');
}
