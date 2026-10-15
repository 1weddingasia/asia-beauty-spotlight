import { createStaticClient } from "@/utils/supabase/server";
import { SiteHeader, SiteFooter } from "@/components/site/Layout";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CategoryPageClient from "./CategoryPageClient";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createStaticClient();
  const { data: cat } = await supabase
    .from("directory_categories")
    .select("name, description")
    .eq("slug", slug)
    .single();

  if (!cat) return { title: "Danh mục không tìm thấy" };

  return {
    title: `${cat.name} — Danh Sách Doanh Nghiệp`,
    description:
      cat.description ||
      `Khám phá các doanh nghiệp trong lĩnh vực ${cat.name}. Tìm kiếm, so sánh và nhận ưu đãi tốt nhất.`,
  };
}

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createStaticClient();

  // Lấy thông tin category
  const { data: category } = await supabase
    .from("directory_categories")
    .select("id, name, slug, description, icon, hero_image")
    .eq("slug", slug)
    .single();

  if (!category) notFound();

  // Lấy danh sách doanh nghiệp thuộc category này (join qua junction table)
  const { data: businesses } = await supabase
    .from("businesses")
    .select(`
      id, name, slug, short_description, address, phone,
      status, is_featured, plan_tier, page_content,
      business_categories!inner(category_id),
      business_locations(directory_locations(name, slug))
    `)
    .eq("business_categories.category_id", category.id)
    .in("status", ["published", "active", "trial"])
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(200);

  // Format data — trích xuất locations và ảnh từ page_content
  const formattedBusinesses = (businesses || []).map((b: any) => {
    const pc = b.page_content || {};
    // Lấy ảnh tốt nhất: banner > gallery[0] > null
    const firstGallery = pc.gallery?.[0];
    const galleryUrl =
      typeof firstGallery === "string" ? firstGallery : firstGallery?.url;
    const coverImage = pc.banners?.[0] || galleryUrl || null;

    // Extract locations
    const locations = (b.business_locations || [])
      .map((bl: any) => bl.directory_locations)
      .filter(Boolean);

    return {
      id: b.id,
      name: b.name,
      slug: b.slug,
      short_description: b.short_description,
      address: b.address,
      phone: b.phone,
      status: b.status,
      is_featured: b.is_featured,
      plan_tier: b.plan_tier,
      logo_url: pc.logo_url || null,
      cover_image: coverImage,
      tagline: pc.tagline || null,
      locations,
      deals_count: (Array.isArray(pc.deals) ? pc.deals : Array.isArray(pc.offers) ? pc.offers : [])
        .filter((d: any) => d && d.status !== "inactive").length,
    };
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader solid />
      <main className="flex-grow">
        <CategoryPageClient
          category={category}
          businesses={formattedBusinesses}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
