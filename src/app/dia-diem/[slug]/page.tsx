import { createStaticClient } from "@/utils/supabase/server";
import { SiteHeader, SiteFooter } from "@/components/site/Layout";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import LocationPageClient from "./LocationPageClient";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createStaticClient();
  const { data: loc } = await supabase
    .from("directory_locations")
    .select("name, description")
    .eq("slug", slug)
    .single();

  if (!loc) return { title: "Địa điểm không tìm thấy" };

  return {
    title: `Dịch Vụ Tại ${loc.name} — Ưu Đãi & Đặt Lịch`,
    description:
      loc.description ||
      `Khám phá hàng trăm doanh nghiệp, spa, nhà hàng, phòng khám và dịch vụ tại ${loc.name}. Nhận ưu đãi độc quyền ngay hôm nay.`,
  };
}

export default async function LocationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createStaticClient();

  // Lấy thông tin location
  const { data: location } = await supabase
    .from("directory_locations")
    .select("id, name, slug, description, hero_image")
    .eq("slug", slug)
    .single();

  if (!location) notFound();

  // Lấy danh sách doanh nghiệp thuộc location này
  const { data: businesses } = await supabase
    .from("businesses")
    .select(`
      id, name, slug, short_description, address, phone,
      status, is_featured, plan_tier, page_content,
      business_locations!inner(location_id),
      business_categories(directory_categories(name, slug, icon))
    `)
    .eq("business_locations.location_id", location.id)
    .in("status", ["published", "active", "trial"])
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(200);

  // Format data
  const formattedBusinesses = (businesses || []).map((b: any) => {
    const pc = b.page_content || {};
    const firstGallery = pc.gallery?.[0];
    const galleryUrl =
      typeof firstGallery === "string" ? firstGallery : firstGallery?.url;
    const coverImage = pc.banners?.[0] || galleryUrl || null;

    const categories = (b.business_categories || [])
      .map((bc: any) => bc.directory_categories)
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
      categories,
      deals_count: (pc.deals || pc.offers || []).filter(
        (d: any) => d.status !== "inactive"
      ).length,
    };
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader solid />
      <main className="flex-grow">
        <LocationPageClient
          location={location}
          businesses={formattedBusinesses}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
