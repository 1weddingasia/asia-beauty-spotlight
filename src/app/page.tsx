import Link from "next/link";
import { ArrowRight, BadgeCheck, Sparkles, Ticket } from "lucide-react";
import { BusinessCard } from "@/components/site/BusinessCard";
import { HeroSlider } from "@/components/site/HeroSlider";
import { SiteFooter, SiteHeader } from "@/components/site/Layout";
import { getPublishedBusinesses } from "@/data/business";
import { categories, locations } from "@/data/directory";

export default async function Index() {
  const businesses = await getPublishedBusinesses(6);
  const featured = businesses.filter((b) => b.is_featured).slice(0, 6);
  
  const offers = [
    { title: "Giảm 20% Dịch vụ Spa", description: "Áp dụng cho khách hàng mới", discount: "-20%", validUntil: "30/10/2026", business: { slug: "spa-1", name: "Luxury Spa" } },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSlider />

        {/* Categories */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.3em] text-gold uppercase">Danh mục</p>
              <div className="rule-gold mt-3" />
              <h2 className="mt-5 text-3xl md:text-4xl">Khám phá theo lĩnh vực</h2>
            </div>
            <Link
              href="/tim-kiem"
              className="inline-flex items-center gap-2 text-xs tracking-[0.2em] text-gold uppercase"
            >
              Xem tất cả <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c: any) => {
              return (
                <Link
                  key={c.slug}
                  href={`/danh-muc/${c.slug}`}
                  className="shadow-card hover:shadow-luxe group rounded-sm border border-border/70 bg-card p-6 transition-all duration-500 hover:-translate-y-1"
                >
                  <Sparkles className="size-5 text-gold" />
                  <h3 className="mt-4 text-xl">{c.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Featured */}
        <section className="bg-champagne/40 border-y border-border/60">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <p className="text-xs tracking-[0.3em] text-gold uppercase">Tuyển chọn</p>
            <div className="rule-gold mt-3" />
            <h2 className="mt-5 text-3xl md:text-4xl">Doanh nghiệp nổi bật</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featured.map((b) => (
                <BusinessCard key={b.slug} business={b as any} />
              ))}
              {featured.length === 0 && (
                <p className="col-span-3 text-center text-muted-foreground py-10">Chưa có doanh nghiệp nổi bật nào.</p>
              )}
            </div>
          </div>
        </section>

        {/* Offers */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.3em] text-gold uppercase">Ưu đãi</p>
              <div className="rule-gold mt-3" />
              <h2 className="mt-5 text-3xl md:text-4xl">Đặc quyền dành cho bạn</h2>
            </div>
            <Link
              href="/uu-dai"
              className="inline-flex items-center gap-2 text-xs tracking-[0.2em] text-gold uppercase"
            >
              Tất cả ưu đãi <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {offers.map((o) => (
              <Link
                key={`${o.business.slug}-${o.title}`}
                href={`/doanh-nghiep/${o.business.slug}`}
                className="shadow-card hover:shadow-luxe flex flex-col rounded-sm border border-border/70 bg-card p-6 transition-all duration-500 hover:-translate-y-1"
              >
                <span className="bg-gradient-gold w-fit rounded-sm px-3 py-1 text-[11px] font-semibold tracking-widest text-ink uppercase">
                  {o.discount}
                </span>
                <h3 className="mt-4 text-xl">{o.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{o.description}</p>
                <p className="mt-4 flex items-center gap-1.5 text-sm">
                  <Ticket className="size-4 text-gold" /> {o.business.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">HSD: {o.validUntil}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Locations */}
        <section className="bg-ink text-background">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <p className="text-xs tracking-[0.3em] text-gold uppercase">Địa điểm</p>
            <div className="rule-gold mt-3" />
            <h2 className="mt-5 text-3xl text-background md:text-4xl">Có mặt khắp châu Á</h2>
            <div className="mt-8 flex flex-wrap gap-3">
              {locations.map((l: any) => (
                <Link
                  key={l.slug}
                  href={`/tim-kiem?location=${l.slug}`}
                  className="rounded-sm border border-background/20 px-5 py-2.5 text-sm transition-colors hover:border-gold hover:text-gold"
                >
                  {l.name}
                </Link>
              ))}
            </div>

            <div className="mt-14 flex flex-wrap items-center justify-between gap-6 border-t border-background/10 pt-10">
              <p className="flex items-center gap-2 text-lg">
                <BadgeCheck className="size-5 text-gold" />
                Bạn sở hữu một thương hiệu làm đẹp?
              </p>
              <Link
                href="/lien-he"
                className="bg-gradient-gold rounded-sm px-7 py-3 text-xs font-semibold tracking-[0.2em] text-ink uppercase"
              >
                Đăng ký doanh nghiệp
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
