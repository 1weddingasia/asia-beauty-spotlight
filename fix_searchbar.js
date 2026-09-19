const fs = require('fs');
let c = fs.readFileSync('src/components/site/SearchBar.tsx', 'utf8');
c = c.replace(/const navigate = useNavigate\(\);/g, 'const router = useRouter();');
c = c.replace(/navigate\(\{ to: "\/tim-kiem", search: \{ q, category, location \} \}\);/g, 'router.push("/tim-kiem?q=" + q + "&category=" + category + "&location=" + location);');
fs.writeFileSync('src/components/site/SearchBar.tsx', c);
