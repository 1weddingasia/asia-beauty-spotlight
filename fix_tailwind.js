const fs = require('fs');
let css = fs.readFileSync('src/app/globals.css', 'utf8');
css = css.replace('@source "../src";', '@source "../";');
fs.writeFileSync('src/app/globals.css', css, 'utf8');
