const fs = require('fs');
let css = fs.readFileSync('src/app/globals.css', 'utf8');
css = css.replace('@import "tailwindcss" source(none);\n@source "../";', '@import "tailwindcss";');
fs.writeFileSync('src/app/globals.css', css, 'utf8');
