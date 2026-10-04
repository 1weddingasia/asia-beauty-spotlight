const fs = require('fs');
let c = fs.readFileSync('src/components/site/SearchBar.tsx', 'utf8');
c = c.replace('import Link from "next/link";\n"use client";', '"use client";\nimport Link from "next/link";');
fs.writeFileSync('src/components/site/SearchBar.tsx', c);
