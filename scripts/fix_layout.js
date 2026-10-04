const fs = require('fs');
let code = fs.readFileSync('src/components/site/Layout.tsx', 'utf8');

code = code.replace(
  /<span className=\{ont-display text-2xl \}>/g,
  '<span className={ont-display text-2xl }>'
);

fs.writeFileSync('src/components/site/Layout.tsx', code, 'utf8');
