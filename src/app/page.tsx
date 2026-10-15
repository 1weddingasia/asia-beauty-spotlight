import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createStaticClient } from "@/utils/supabase/server";
import { getSiteConfig } from "@/config/site-config";
import { SiteHeader, SiteFooter } from "@/components/site/Layout";
import { B2CHomepageClient } from "@/components/site/B2CHomepageClient";

// Dynamic — cần đọc header để phân biệt domain
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const h = await headers();
  const host = h.get("host") || "";
  const config = getSiteConfig(host);

  if (config.domain === "1beauty.asia") {
    return {
      title: "1Beauty.Asia — Danh Bạ Làm Đẹp Việt Nam",
      description: config.description,
    };
  }

  return {
    title: "1Booking.Asia — Cẩm Nang Ưu Đãi Dịch Vụ",
    description:
      "Khám phá cẩm nang hàng ngàn ưu đãi làm đẹp, ẩm thực, sức khỏe & đời sống từ các thương hiệu uy tín. Đặt lịch 1-chạm, nhận ưu đãi độc quyền.",
    openGraph: {
      title: "1Booking.Asia — Cẩm Nang Ưu Đãi",
      description:
        "Khám phá cẩm nang hàng ngàn ưu đãi làm đẹp, ẩm thực, sức khỏe & đời sống từ các thương hiệu uy tín.",
      url: "https://1booking.asia",
      siteName: "1Booking.Asia",
      type: "website",
    },
  };
}

export default async function RootPage() {
  const h = await headers();
  const host = h.get("host") || "";
  const config = getSiteConfig(host);

  // 1Beauty.asia — chuyển về trang landing đúng cho domain này
  if (config.domain === "1beauty.asia") {
    redirect("/home-beauty");
  }

  // 1Booking.asia — trang chủ B2C mới
  const supabase = createStaticClient();

  const [
    { data: categories, error: catErr },
    { data: locations, error: locErr },
    { data: featuredBusinesses, error: bizErr },
    { count: totalBusinesses, error: cntErr },
  ] = await Promise.all([
    supabase
      .from("directory_categories")
      .select("id, name, slug, icon, description")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })
      .limit(20),

    supabase
      .from("directory_locations")
      .select("id, name, slug")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })
      .limit(20),

    supabase
      .from("businesses")
      .select(
        `id, name, slug, status, is_featured, plan_tier,
         business_categories(directory_categories(id, name, slug, icon)),
         business_locations(directory_locations(id, name, slug)),
         page_content`
      )
      .in("status", ["published", "active", "trial"])
      .order("is_featured", { ascending: false })
      .order("plan_tier", { ascending: false })
      .limit(24),

    supabase
      .from("businesses")
      .select("*", { count: "exact", head: true })
      .in("status", ["published", "active", "trial"]),
  ]);

  if (catErr) console.error("[homepage] categories:", catErr.message);
  if (locErr) console.error("[homepage] locations:", locErr.message);
  if (bizErr) console.error("[homepage] businesses:", bizErr.message);
  if (cntErr) console.error("[homepage] count:", cntErr.message);

  // Format businesses cho client
  const businesses = (featuredBusinesses || []).map((b: any) => {
    const pc = b.page_content || {};
    const cats = (b.business_categories || [])
      .map((bc: any) => bc.directory_categories)
      .filter(Boolean);
    const locs = (b.business_locations || [])
      .map((bl: any) => bl.directory_locations)
      .filter(Boolean);

    const dealsArr = Array.isArray(pc.deals)
      ? pc.deals
      : Array.isArray(pc.offers)
      ? pc.offers
      : [];
    const activeDeals = dealsArr.filter((d: any) => d && d.status !== "paused");

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
