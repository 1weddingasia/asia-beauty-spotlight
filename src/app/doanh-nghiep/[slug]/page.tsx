import { getBusinessBySlug } from "@/data/business";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import BusinessPageClient from "./BusinessPageClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const resolvedParams = await params;
  const dbBusiness = await getBusinessBySlug(resolvedParams.slug);
  if (!dbBusiness) return { title: "Không tìm thấy" };

  const pageContent = (dbBusiness.page_content as any) || {};
  const b = { ...pageContent, ...dbBusiness }; // DB fields take precedence over page_content
  const title = b ? `${b.name} - ${b.tagline || '1Beauty.Asia'}` : "Doanh nghiệp | 1Beauty.Asia";
  const desc = b?.description?.slice(0, 155) ?? "Thông tin doanh nghiệp làm đẹp trên 1Beauty.Asia.";
  
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
  if (!dbBusiness) return notFound();

  // merge db fields and JSON page_content, db fields take precedence
  const pageContent = dbBusiness.page_content || {};
  const b = { 
    ...pageContent,
    ...dbBusiness, 
    services: pageContent.services || [],
    offers: pageContent.offers || [],
    gallery: pageContent.gallery || [],
    banners: pageContent.banners || [],
    about: dbBusiness.description || pageContent.description || '',
    hours: pageContent.working_hours || []
  };

  return <BusinessPageClient business={b} />;
}
