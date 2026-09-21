import Link from "next/link";
import { ArrowRight, BadgeCheck, Sparkles, Ticket } from "lucide-react";

export const revalidate = 3600; // Cache for 1 hour
import { BusinessCard } from "@/components/site/BusinessCard";
import { HeroSlider } from "@/components/site/HeroSlider";
import { SiteFooter, SiteHeader } from "@/components/site/Layout";
import { getPublishedBusinesses } from "@/data/business";
import { getCategoriesAction, getLocationsAction } from "@/app/actions/search";
import React from "react";
import * as LucideIcons from "lucide-react";

/** Deterministic shuffle based on daily seed — same result all day, changes every 24h */
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default async function Index() {
  const today = new Date();
  // Seed changes every 24h (based on date only, not time)
  const dateSeed =
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate();

  const [allBusinesses, categories, locations] = await Promise.all([
    getPublishedBusinesses(50), // Fetch enough for rotation pool
    getCategoriesAction(),
    getLocationsAction(),
  ]);

  // --- FEATURED BUSINESSES: New first, then 24h random rotation ---
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newlyAdded = allBusinesses.filter(
    (b: any) => new Date(b.created_at) > sevenDaysAgo
  );
  const olderFeatured = allBusinesses.filter(
    (b: any) => new Date(b.created_at) <= sevenDaysAgo && b.is_featured
  );
  const olderAll = allBusinesses.filter(
    (b: any) => new Date(b.created_at) <= sevenDaysAgo && !b.is_featured
  );

  // Priority: newly added → featured (shuffled) → others (shuffled)
  const rotatedFeatured = [
    ...newlyAdded,
    ...seededShuffle(olderFeatured, dateSeed),
    ...seededShuffle(olderAll, dateSeed + 1),
  ].slice(0, 6);

  // --- OFFERS: Extract real offers from all businesses, rotate daily ---
  const allOffers = allBusinesses.flatMap((b: any) => {
    const pc = b.page_content || {};
    return (pc.offers || []).map((o: any) => ({
      ...o,
      business: { slug: b.slug, name: b.name },
    }));
  });
  const rotatedOffers = seededShuffle(allOffers, dateSeed + 2).slice(0, 4);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSlider categories={categories} locations={locations} />

        {/* --- SECTION 1: DANH MỤC (DB thật) --- */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.3em] text-gold uppercase">Danh mục</p>
              <div className="rule-gold mt-3" />
              <h2 className="mt-5 text-3xl md:text-4xl">Khám phá theo lĩnh vực</h2>
            </div>
            <Link
              href="/tim-kiem"
              className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-gold"
            >
              Xem tất cả <ArrowRight className="size-4" />
            </Link>
          </div>

          {categories.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((c: any) => {
                const Icon =
                  (LucideIcons as any)[c.icon || "Sparkles"] ||
                  LucideIcons.Sparkles;
                return (
                  <Link
                    key={c.slug}
                    href={`/tim-kiem?category=${c.slug}`}
                    className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-gold hover:shadow-card"
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-5 transition-opacity group-hover:opacity-10">
                      <Icon className="size-24" />
                    </div>
                    <Icon className="size-8 text-gold" />
                    <h3 className="mt-4 font-display text-xl">{c.name}</h3>
                    <p className="mt-2 max-w-[200px] text-sm text-muted-foreground">
                      {c.description || "Khám phá danh mục này"}
                    </p>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="mt-10 text-center text-muted-foreground">
              Chưa có danh mục nào. Hãy thêm danh mục trong Admin.
            </p>
          )}
        </section>

        {/* --- SECTION 2: DOANH NGHIỆP NỔI BẬT (DB thật, xoay vòng 24h) --- */}
        <section className="border-t border-border bg-champagne/40">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs tracking-[0.3em] text-gold uppercase">Tuyển chọn</p>
                <div className="rule-gold mt-3" />
                <h2 className="mt-5 text-3xl md:text-4xl">Doanh nghiệp nổi bật</h2>
                <p className="mt-2 text-xs text-muted-foreground">
                  Cập nhật mỗi ngày — ưu tiên doanh nghiệp mới nhất
                </p>
              </div>
              <Link
                href="/tim-kiem"
                className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-gold"
              >
                Xem tất cả <ArrowRight className="size-4" />
              </Link>
            </div>

            {rotatedFeatured.length > 0 ? (
              <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rotatedFeatured.map((b: any) => (
                  <BusinessCard key={b.slug} business={b} />
                ))}
              </div>
            ) : (
              <div className="mt-10 rounded-2xl border border-dashed border-border p-12 text-center">
                <Sparkles className="mx-auto size-10 text-gold/40" />
                <p className="mt-4 text-muted-foreground">
                  Chưa có doanh nghiệp nào. Hãy thêm trong{" "}
                  <Link href="/admin/businesses" className="text-gold underline">
                    Admin
                  </Link>
                  .
                </p>
              </div>
            )}
          </div>
        </section>

        {/* --- SECTION 3: ƯU ĐÃI (Lấy từ page_content.offers của DN thật, xoay vòng 24h) --- */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.3em] text-gold uppercase">Ưu đãi</p>
              <div className="rule-gold mt-3" />
              <h2 className="mt-5 text-3xl md:text-4xl">Đặc quyền dành cho bạn</h2>
            </div>
            <Link
              href="/uu-dai"
              className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-gold"
            >
              Tất cả ưu đãi <ArrowRight className="size-4" />
            </Link>
          </div>

          {rotatedOffers.length > 0 ? (
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {rotatedOffers.map((o: any, idx: number) => (
                <Link
                  key={idx}
                  href={`/doanh-nghiep/${o.business.slug}`}
                  className="group relative overflow-hidden rounded-2xl border border-gold-soft bg-champagne p-6 transition-all hover:border-gold hover:shadow-card md:p-8"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-20">
                    <Ticket className="size-32 text-gold" />
                  </div>
                  <div className="relative">
                    <span className="bg-gradient-gold rounded-full px-3 py-1 text-[11px] font-semibold tracking-widest text-ink uppercase">
                      {o.discount || "Ưu đãi"}
                    </span>
                    <h3 className="mt-5 max-w-[280px] font-display text-2xl md:text-3xl">
                      {o.title}
                    </h3>
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                      {o.description}
                    </p>
                    <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-medium uppercase tracking-wider text-ink">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="size-3.5 text-gold" />
                        {o.business.name}
                      </span>
                      {o.validUntil && (
                        <span className="text-muted-foreground">
                          HSD: {o.validUntil}
                        </span>
                      )}
                      {o.code && (
                        <span className="rounded bg-gold/10 px-2 py-0.5 font-mono text-gold border border-gold/30">
                          {o.code}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-2xl border border-dashed border-border p-12 text-center">
              <Ticket className="mx-auto size-10 text-gold/40" />
              <p className="mt-4 text-muted-foreground">
                Chưa có ưu đãi nào. Hãy thêm ưu đãi khi chỉnh sửa doanh nghiệp trong Admin.
              </p>
            </div>
          )}
        </section>

        {/* --- SECTION 4: ĐỊA ĐIỂM (DB thật) --- */}
        <section className="border-t border-border bg-ink text-background">
          <div className="mx-auto max-w-6xl px-6 py-20 text-center">
            <p className="text-xs tracking-[0.3em] text-gold uppercase">Địa điểm</p>
            <div className="rule-gold mx-auto mt-3" />
            <h2 className="mt-5 font-display text-3xl md:text-4xl">Có mặt khắp Việt Nam</h2>
            {locations.length > 0 ? (
              <div className="mt-12 flex flex-wrap justify-center gap-3">
                {locations.map((l: any) => (
                  <Link
                    key={l.slug}
                    href={`/tim-kiem?location=${l.slug}`}
                    className="rounded-full border border-background/20 bg-background/5 px-6 py-2.5 text-sm transition-colors hover:bg-gold hover:text-ink hover:border-gold"
                  >
                    {l.name}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-10 text-background/50">Chưa có địa điểm nào.</p>
            )}
          </div>
        </section>

        {/* --- SECTION 5: CTA --- */}
        <section className="border-t border-border bg-champagne">
          <div className="mx-auto max-w-4xl px-6 py-24 text-center">
            <BadgeCheck className="mx-auto size-12 text-gold" />
            <h2 className="mt-6 font-display text-3xl md:text-5xl">
              Bạn sở hữu một thương hiệu làm đẹp?
            </h2>
            <p className="mt-6 text-muted-foreground md:text-lg">
              Tham gia 1Beauty.Asia ngay hôm nay để tiếp cận hàng ngàn khách hàng tiềm năng.
              Khởi tạo hồ sơ doanh nghiệp miễn phí chỉ trong 5 phút.
            </p>
            <Link
              href="/lien-he"
              className="bg-gradient-gold mx-auto mt-10 flex w-fit items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold tracking-[0.2em] text-ink uppercase transition-opacity hover:opacity-90"
            >
              Đăng ký doanh nghiệp <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

