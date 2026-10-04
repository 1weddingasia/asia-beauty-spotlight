const fs = require('fs');
let content = fs.readFileSync('src/data/directory.ts', 'utf8');
content = content.replace(/import\s+(\w+)\s+from\s+["']@\/assets\/([^"']+)["'];/g, 'import _ from "@/assets/";\nconst  = _.src;');
fs.writeFileSync('src/data/directory.ts', content);
