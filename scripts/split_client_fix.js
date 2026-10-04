const fs = require('fs');

const original = fs.readFileSync('src/app/doanh-nghiep/[slug]/page.tsx', 'utf8'); // Wait, page.tsx is currently server component. I need to read the original one from lovable!
const lovable = fs.readFileSync('../asia-beauty-spotlight/src/routes/doanh-nghiep..tsx', 'utf8');

// The client component
let clientCode = lovable.replace(/export const Route = createFileRoute[\s\S]*?component: BusinessPage,\r?\n\}\);\r?\n\r?\n/m, '');
clientCode = clientCode.replace(/import \{ createFileRoute, Link, notFound \} from "@tanstack\/react-router";/, 'import Link from "next/link";');
clientCode = clientCode.replace(/function BusinessPage\(\) \{[\s\S]*?const \{ business: b \} = Route\.useLoaderData\(\);/, 'export default function BusinessPageClient({ business: b }: { business: any }) {');
// Replace Link to props
clientCode = clientCode.replace(/to=/g, 'href=');
clientCode = clientCode.replace(/params=\{\{\s*slug:([^\}]+)\}\}/g, '');
clientCode = clientCode.replace(/href="\/doanh-nghiep\/\"/g, 'href={/doanh-nghiep/}');
clientCode = clientCode.replace(/href="\/danh-muc\/\"/g, 'href={/danh-muc/}');
clientCode = clientCode.replace(/search=\{\{([^}]+)\}\}/g, '');

clientCode = '"use client";\n' + clientCode;
fs.writeFileSync('src/app/doanh-nghiep/[slug]/BusinessPageClient.tsx', clientCode);
