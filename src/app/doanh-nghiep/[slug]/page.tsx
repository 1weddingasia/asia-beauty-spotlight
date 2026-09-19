import { getBusinessBySlug } from "@/data/business";
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
  if (!dbBusiness) return { title: "Không tìm thấy" };

  const b = { ...dbBusiness, ...(dbBusiness.page_content as any) };
  const title = b ? `${b.name} — ${b.tagline}` : "Doanh nghiệp | 1Beauty.Asia";
  const desc = b?.about?.slice(0, 155) ?? "Thông tin doanh nghiệp làm đẹp trên 1Beauty.Asia.";
  
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
