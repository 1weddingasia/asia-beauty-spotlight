import Link from "next/link";
import { createStaticClient } from "@/utils/supabase/server";
import { SiteHeader, SiteFooter } from "@/components/site/Layout";
import { B2CHomepageClient } from "@/components/site/B2CHomepageClient";

export const revalidate = 900; // 15 phút

export const metadata = {
  title: "1Booking.asia — Cổng Ưu Đãi Dịch Vụ Khu Phố",
  description:
    "Khám phá hàng ngàn ưu đãi làm đẹp, ẩm thực, sức khỏe & giải trí ngay trong khu phố bạn. Đặt lịch 1-chạm, nhận ưu đãi độc quyền.",
  openGraph: {
    title: "1Booking.asia — Cổng Ưu Đãi Khu Phố",
    description:
      "Khám phá hàng ngàn ưu đãi làm đẹp, ẩm thực, sức khỏe & giải trí ngay trong khu phố bạn.",
    url: "https://1booking.asia",
    siteName: "1Booking.asia",
    type: "website",
  },
};

export default async function B2CHomePage() {
  const supabase = createStaticClient();

  // Lấy categories thật
  const { data: categories } = await supabase
    .from("directory_categories")
    .select("id, name, slug, icon, description")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })
    .limit(20);

  // Lấy locations thật
  const { data: locations } = await supabase
    .from("directory_locations")
    .select("id, name, slug")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })
    .limit(20);

  // Lấy deals/businesses có ưu đãi — featured trước, có logo
  const { data: featuredBusinesses } = await supabase
    .from("businesses")
    .select(`
      id, name, slug, status, is_featured, plan_tier,
      business_categories(directory_categories(id, name, slug, icon)),
      business_locations(directory_locations(id, name, slug)),
      page_content
    `)
    .in("status", ["published", "active", "trial"])
    .order("is_featured", { ascending: false })
    .order("plan_tier", { ascending: false })
    .limit(24);

  // Đếm tổng số businesses
  const { count: totalBusinesses } = await supabase
    .from("businesses")
    .select("*", { count: "exact", head: true })
    .in("status", ["published", "active", "trial"]);

  // Format businesses cho client
  const businesses = (featuredBusinesses || []).map((b: any) => {
    const pc = b.page_content || {};
    const cats = (b.business_categories || [])
      .map((bc: any) => bc.directory_categories)
      .filter(Boolean);
    const locs = (b.business_locations || [])
      .map((bl: any) => bl.directory_locations)
      .filter(Boolean);

    // Lấy deals count an toàn
    const dealsArr = Array.isArray(pc.deals)
      ? pc.deals
      : Array.isArray(pc.offers)
      ? pc.offers
      : [];
    const activeDeals = dealsArr.filter(
      (d: any) => d && d.status !== "inactive"
    );

    // Lấy cover image
    const coverImage =
      pc.cover_image ||
      (Array.isArray(pc.banners) && typeof pc.banners[0] === "string"
        ? pc.banners[0]
        : null) ||
      pc.hero_image ||
      null;

    return {
      id: b.id,
      name: b.name,
      slug: b.slug,
      is_featured: b.is_featured,
      plan_tier: b.plan_tier,
      logo_url: pc.logo_url || null,
      cover_image: coverImage,
      tagline: pc.tagline || null,
      address: pc.address || null,
      categories: cats,
      locations: locs,
      deals: activeDeals,
      deals_count: activeDeals.length,
      top_deal: activeDeals[0] || null,
    };
  });

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader solid={false} />
      <B2CHomepageClient
        categories={categories || []}
        locations={locations || []}
        businesses={businesses}
        totalBusinesses={totalBusinesses || 0}
      />
      <SiteFooter />
    </div>
  );
}
