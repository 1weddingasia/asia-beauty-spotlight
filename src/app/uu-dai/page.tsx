import { PageShell } from "@/components/site/Layout";
import { Sparkles, Ticket, Search, ChevronLeft, ChevronRight } from "lucide-react";
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
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const host = (await headers()).get("host") || "";
  const siteConfig = getSiteConfig(host);

  const supabase = createStaticClient();
  const params = await searchParams;
  const rawQ = params.q || "";           // giữ nguyên chữ hoa/dấu để hiển thị
  const q = rawQ.toLowerCase();           // chỉ dùng lowercase để so sánh/filter
  const currentPage = parseInt(params.page || "1") || 1;
  const ITEMS_PER_PAGE = 9;

  // Lấy tất cả các doanh nghiệp đang hoạt động
  const { data: businesses, error } = await supabase
    .from("businesses")
    .select("slug, name, page_content, status")
    .in("status", ["published", "active"])
    .limit(500);

  if (error) {
    console.error("Lỗi lấy ưu đãi:", error);
  }

  // Extract offers, filter expired ones, and sort by newest
  let allOffers = (businesses || [])
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

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-24 text-center md:py-36 lg:py-40 flex flex-col justify-center min-h-[35vh]">
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
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 aspect-square bg-gold text-ink rounded-full flex items-center justify-center hover:scale-105 transition-transform"
            >
              <Search className="size-5" />
            </button>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
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
                    href={`/uu-dai?page=${currentPage - 1}${rawQ ? `&q=${encodeURIComponent(rawQ)}` : ""}`}
                    className="p-3 border rounded-full hover:bg-gold hover:text-ink transition-colors"
                  >
                    <ChevronLeft className="size-5" />
                  </Link>
                ) : (
                  <div className="p-3 border rounded-full opacity-50 cursor-not-allowed">
                    <ChevronLeft className="size-5" />
                  </div>
                )}

                <div className="px-6 py-2 rounded-full bg-muted font-medium">
                  Trang {currentPage} / {totalPages}
                </div>

                {currentPage < totalPages ? (
                  <Link
                    href={`/uu-dai?page=${currentPage + 1}${rawQ ? `&q=${encodeURIComponent(rawQ)}` : ""}`}
                    className="p-3 border rounded-full hover:bg-gold hover:text-ink transition-colors"
                  >
                    <ChevronRight className="size-5" />
                  </Link>
                ) : (
                  <div className="p-3 border rounded-full opacity-50 cursor-not-allowed">
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
