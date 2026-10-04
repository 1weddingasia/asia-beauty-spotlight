const fs = require('fs');
let content = fs.readFileSync('src/components/ui/sidebar.tsx', 'utf8');
if (!content.includes('"use client"')) {
  fs.writeFileSync('src/components/ui/sidebar.tsx', '"use client";\n' + content);
}
