const fs = require('fs');
let c = fs.readFileSync('../asia-beauty-spotlight/src/routes/lien-he.tsx', 'utf8');

c = c.replace(/export const Route = createFileRoute[\s\S]*?component: ContactPage,\r?\n\}\);\r?\n\r?\n/m, '');
c = c.replace(/import \{ createFileRoute \} from "@tanstack\/react-router";\r?\n/, '');

c = '"use client";\n' + c;
fs.writeFileSync('src/app/lien-he/ContactPageClient.tsx', c);

const serverCode = import { Metadata } from "next";
import ContactPageClient from "./ContactPageClient";

export const metadata: Metadata = {
  title: "Li?n h? & ??ng k? doanh nghi?p | 1Beauty.Asia",
  description: "??ng k? th??ng hi?u l?m ??p c?a b?n v?o danh b? 1Beauty.Asia ho?c li?n h? ??i ng? bi?n t?p ?? c?p nh?t th?ng tin.",
};

export default function ContactPage() {
  return <ContactPageClient />;
}
;
fs.writeFileSync('src/app/lien-he/page.tsx', serverCode);
