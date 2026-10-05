const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/[slug]/(dashboard)/layout.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const startStr = '        {/* Sidebar */}';
const endStr = '        <div className="flex-1 overflow-y-auto">';

const start = content.indexOf(startStr);
const end = content.indexOf(endStr);

if (start !== -1 && end !== -1) {
  content = content.slice(0, start) + '        <Sidebar slug={slug} businessName={business?.name || "Chưa có doanh nghiệp"} businessStatus={business?.status || "trial"} planTier={business?.plan_tier} />\n\n' + content.slice(end);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Sidebar replaced successfully!");
} else {
  console.log("Could not find start or end string.");
}
