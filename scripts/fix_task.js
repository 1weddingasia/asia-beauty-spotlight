const fs = require('fs');
let c = fs.readFileSync('C:/Users/Dell/.gemini/antigravity/brain/d15fe3a5-5fb6-47b2-a8a6-a33b6536a9eb/task.md', 'utf8');
c = c.replace(/## \[ \] PHASE 3[\s\S]*?Portal\./, ## [x] Phase 3: Admin Operating System (Tr?m ?i?u khi?n)\n- [x] D?ng UI Admin Dashboard (AppSidebar).\n- [x] T?nh n?ng CRM Doanh nghi?p (Danh s?ch & Edit/Th?m m?i v?i JSON editor).\n- [x] B?o v? Middleware route (/admin).\n- [x] Magic Link Login cho Admin Portal (/login).);
fs.writeFileSync('C:/Users/Dell/.gemini/antigravity/brain/d15fe3a5-5fb6-47b2-a8a6-a33b6536a9eb/task.md', c);
