import { PageShell } from "@/components/site/Layout";
import { Sparkles, Ticket, Search, ChevronLeft, ChevronRight, Scissors, Utensils, Map, BookOpen, HeartPulse, MoreHorizontal, LayoutGrid, Camera, Activity, Gem, Home } from "lucide-react";
import Link from "next/link";
import { createStaticClient } from "@/utils/supabase/server";
import { PlatformChatWidget } from "@/components/site/PlatformChatWidget";
import { isOfferActive } from "@/lib/date-utils";
import { headers } from "next/headers";
import { getSiteConfig } from "@/config/site-config";

// Trang này là dynamic vì phụ thuộc vào hostname để phân biệt thương hiệu
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const host = (await headers()).get("host") || "";
  const config = getSiteConfig(host);
  return {
    title: `${config.exploreTitle} | ${config.metaTitleSuffix}`,
    description: config.exploreSubtitle,
  };
}

export default async function OffersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; category?: string }>;
}) {
  const host = (await headers()).get("host") || "";
  const siteConfig = getSiteConfig(host);

  const supabase = createStaticClient();
  const params = await searchParams;
  const rawQ = params.q || "";           // giữ nguyên chữ hoa/dấu để hiển thị
  const q = rawQ.toLowerCase();           // chỉ dùng lowercase để so sánh/filter
  const currentPage = parseInt(params.page || "1") || 1;
  const currentCategory = params.category || "";
  const ITEMS_PER_PAGE = 9;

  // Fetch categories from DB
  const { data: dbCategories } = await supabase
    .from("categories")
    .select("slug, name")
    .order("name", { ascending: true });
    
  const categories = dbCategories || [];

  const iconMap: Record<string, any> = {
    spa: Sparkles,
    beauty: Sparkles,
    salon: Scissors,
    dining: Utensils,
    travel: Map,
    education: BookOpen,
    health: HeartPulse,
    fitness: Activity,
    studio: Camera,
    wedding: Gem,
    realestate: Home,
    booking: MoreHorizontal,
    other: MoreHorizontal
  };

  const validCategory = categories.some(c => c.slug === currentCategory) ? currentCategory : "";

  const buildUrl = (overrides: { page?: number; category?: string | null; q?: string }) => {
    const search = new URLSearchParams();
    const newQ = overrides.q !== undefined ? overrides.q : rawQ;
    const newCat = overrides.category !== undefined ? overrides.category : validCategory;
    const newPage = overrides.page !== undefined ? overrides.page : currentPage;

    if (newQ) search.set("q", newQ);
    if (newCat) search.set("category", newCat);
    if (newPage > 1) search.set("page", newPage.toString());

    const qs = search.toString();
    return `/uu-dai${qs ? `?${qs}` : ""}`;
  };

  // Lấy tất cả các doanh nghiệp đang hoạt động
  const { data: rawBusinesses, error } = await supabase
    .from("businesses")
    .select("slug, name, page_content, status, category_slug")
    .in("status", ["published", "active"])
    .limit(500);

  if (error) {
    console.error("Lỗi lấy ưu đãi:", error);
  }

  const businesses = (rawBusinesses || []).filter((b: any) => {
    const cat = (b.category_slug || "").toLowerCase();
    
    // Nếu chọn category, lọc theo category đó trước bằng substring match
    if (validCategory && !cat.includes(validCategory)) {
      return false;
    }
    
    // Domain filtering
    if (!siteConfig.industryFilter) return true;
    return siteConfig.industryFilter.some((f) => cat.includes(f));
  });

  // Extract offers, filter expired ones, and sort by newest
  let allOffers = businesses
    .flatMap((b: any) => {
      const pc = b.page_content || {};
      const items = pc.deals || pc.offers || pc.promotions || [];
      return items.map((o: any) => ({
        ...o,
        business: { slug: b.slug, name: b.name },
      }));
    })
    .filter((o: any) => o.status !== "paused" && isOfferActive(o.validFrom, o.validUntil))
    .sort((a: any, b: any) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });

  // Filter by search query
  if (q) {
    allOffers = allOffers.filter(
      (o: any) =>
        (o.title || "").toLowerCase().includes(q) ||
        (o.business.name || "").toLowerCase().includes(q)
    );
  }

  // Pagination
  const totalItems = allOffers.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const paginatedOffers = allOffers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <PageShell>
      <section className="relative border-b border-border">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1920&q=80")',
          }}
        >
          <div className="absolute inset-0 bg-ink/40"></div>
          <div className="absolute inset-0 bg-gold/50 mix-blend-multiply"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-24 text-center md:py-36 lg:py-40 flex flex-col justify-center min-h-[40vh]">
          <p className="text-xs tracking-[0.3em] text-gold uppercase drop-shadow-sm">
            {siteConfig.exploreHeroTag}
          </p>
          <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl text-white drop-shadow-md font-display">
            {siteConfig.exploreTitle}
          </h1>
          <p className="mt-6 text-lg text-gray-200 drop-shadow-md max-w-2xl mx-auto">
            {siteConfig.exploreSubtitle}
          </p>

          <form action="/uu-dai" method="GET" className="mt-10 mx-auto w-full max-w-xl relative">
            <input
              type="text"
              name="q"
              defaultValue={rawQ}
              placeholder="Tìm ưu đãi, tên dịch vụ, tên cơ sở..."
              className="w-full h-14 pl-6 pr-14 rounded-full border-2 border-white/20 bg-white/10 backdrop-blur-md text-white placeholder:text-white/60 focus:outline-none focus:border-gold focus:bg-white/20 transition-all text-lg shadow-xl"
            />
            {validCategory && <input type="hidden" name="category" value={validCategory} />}
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 aspect-square bg-gold text-ink rounded-full flex items-center justify-center hover:scale-105 transition-transform"
            >
              <Search className="size-5" />
            </button>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Lọc danh mục */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <LayoutGrid className="size-5 text-gold" />
            <h2 className="text-xl font-bold text-ink font-display">Lọc theo ngành nghề</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={buildUrl({ category: null, page: 1 })}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all ${
                !validCategory 
                  ? "bg-gold text-ink font-bold border-gold shadow-md" 
                  : "bg-white text-muted-foreground border-border hover:border-gold hover:text-gold"
              }`}
            >
              <span>Tất cả</span>
            </Link>
            {categories.map((cat) => {
              const Icon = iconMap[cat.slug] || MoreHorizontal;
              const isActive = validCategory === cat.slug;
              // Ẩn chip nếu ngành này không thuộc industryFilter của domain hiện tại
              if (siteConfig.industryFilter && !siteConfig.industryFilter.includes(cat.slug)) {
                return null;
              }

              return (
                <Link
                  key={cat.slug}
                  href={buildUrl({ category: cat.slug, page: 1 })}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all ${
                    isActive
                      ? "bg-gold text-ink font-bold border-gold shadow-md"
                      : "bg-white text-muted-foreground border-border hover:border-gold hover:text-gold"
                  }`}
                >
                  <Icon className="size-4" />
                  <span>{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {paginatedOffers.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paginatedOffers.map((o: any, i: number) => (
                <Link
                  key={`${o.business.slug}-${i}`}
                  href={`/${o.business.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-gold-soft bg-champagne p-6 transition-all hover:border-gold hover:shadow-card md:p-8 hover:-translate-y-1"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-20">
                    <Ticket className="size-32 text-gold" />
                  </div>
                  <div className="relative flex-1">
                    <span className="bg-gradient-gold rounded-full px-3 py-1 text-[11px] font-semibold tracking-widest text-ink uppercase shadow-sm">
                      {o.badge || o.discount || "Ưu đãi HOT"}
                    </span>
                    <h3 className="mt-5 max-w-[280px] font-display text-2xl line-clamp-2">
                      {o.title}
                    </h3>
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
                      {o.note || o.description}
                    </p>
                  </div>
                  <div className="relative mt-8 border-t border-gold-soft pt-6">
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium uppercase tracking-wider text-ink">
                      <span className="flex items-center gap-1.5 font-bold">
                        <Sparkles className="size-3.5 text-gold" />
                        {o.business.name}
                      </span>
                    </div>
                    {(o.promo_price || o.original_price) && (
                      <div className="mt-3 flex items-end gap-3">
                        {o.original_price && (
                          <span className="text-sm line-through text-muted-foreground">
                            {o.original_price}
                          </span>
                        )}
                        {o.promo_price && (
                          <span className="text-2xl font-black text-red-600 leading-none">
                            {o.promo_price}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-16 flex items-center justify-center gap-2">
                {currentPage > 1 ? (
                  <Link
                    href={buildUrl({ page: currentPage - 1 })}
                    className="p-3 border rounded-full hover:bg-gold hover:text-ink transition-colors bg-white shadow-sm"
                  >
                    <ChevronLeft className="size-5" />
                  </Link>
                ) : (
                  <div className="p-3 border rounded-full opacity-50 cursor-not-allowed bg-white">
                    <ChevronLeft className="size-5" />
                  </div>
                )}

                <div className="px-6 py-2 rounded-full bg-white border font-medium shadow-sm">
                  Trang {currentPage} / {totalPages}
                </div>

                {currentPage < totalPages ? (
                  <Link
                    href={buildUrl({ page: currentPage + 1 })}
                    className="p-3 border rounded-full hover:bg-gold hover:text-ink transition-colors bg-white shadow-sm"
                  >
                    <ChevronRight className="size-5" />
                  </Link>
                ) : (
                  <div className="p-3 border rounded-full opacity-50 cursor-not-allowed bg-white">
                    <ChevronRight className="size-5" />
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-16 text-center">
            <Ticket className="mx-auto size-12 text-gold/40" />
            <h3 className="mt-4 text-xl font-bold">Không tìm thấy ưu đãi</h3>
            <p className="mt-2 text-muted-foreground">
              {q
                ? `Không có kết quả nào phù hợp với từ khóa "${q}"`
                : "Hiện chưa có ưu đãi nào đang mở."}
            </p>
            {q && (
              <Link
                href="/uu-dai"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold/40 px-6 py-2.5 text-sm text-gold transition-colors hover:bg-gold hover:text-ink"
              >
                Xem tất cả ưu đãi
              </Link>
            )}
          </div>
        )}
      </div>
      <PlatformChatWidget mode="b2c" />
    </PageShell>
  );
}
