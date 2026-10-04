const fs = require('fs');

const original = fs.readFileSync('src/app/doanh-nghiep/[slug]/page.tsx', 'utf8');

// The client component
let clientCode = original.replace(/export const Route = createFileRoute[\s\S]*?component: BusinessPage,\n\}\);\n\n/m, '');
clientCode = clientCode.replace(/import \{ createFileRoute, Link, notFound \} from "@tanstack\/react-router";/, 'import Link from "next/link";');
clientCode = clientCode.replace(/function BusinessPage\(\) \{[\s\S]*?const \{ business: b \} = Route\.useLoaderData\(\);/, 'export default function BusinessPageClient({ business: b }: { business: any }) {');
// Replace Link to props
clientCode = clientCode.replace(/to=/g, 'href=');
clientCode = clientCode.replace(/params=\{\{ slug: ([^\}]+) \}\}/g, ' ');
clientCode = clientCode.replace(/href="\/doanh-nghiep\/\"/g, 'href={/doanh-nghiep/}');
clientCode = clientCode.replace(/href="\/danh-muc\/\"/g, 'href={/danh-muc/}');
clientCode = clientCode.replace(/search=\{\{([^}]+)\}\}/g, '');

clientCode = '"use client";\n' + clientCode;
fs.writeFileSync('src/app/doanh-nghiep/[slug]/BusinessPageClient.tsx', clientCode);

// The server component
const serverCode = import { getBusinessBySlug } from "@/data/business";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import BusinessPageClient from "./BusinessPageClient";
import { getCategory } from "@/data/directory";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const resolvedParams = await params;
  const dbBusiness = await getBusinessBySlug(resolvedParams.slug);
  if (!dbBusiness) return { title: "Kh?ng t?m th?y" };

  const b = { ...dbBusiness, ...(dbBusiness.page_content as any) };
  const title = b ? \\ ? \\ : "Doanh nghi?p | 1Beauty.Asia";
  const desc = b?.about?.slice(0, 155) ?? "Th?ng tin doanh nghi?p l?m ??p tr?n 1Beauty.Asia.";
  
  return {
    title,
    description: desc,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params;
  const dbBusiness = await getBusinessBySlug(resolvedParams.slug);
  if (!dbBusiness) notFound();

  // merge db fields and JSON page_content
  const b = { ...dbBusiness, ...(dbBusiness.page_content as any) };

  return <BusinessPageClient business={b} />;
}
;

fs.writeFileSync('src/app/doanh-nghiep/[slug]/page.tsx', serverCode);
