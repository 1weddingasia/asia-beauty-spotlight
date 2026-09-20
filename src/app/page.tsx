import Link from "next/link";
import { ArrowRight, BadgeCheck, Sparkles, Ticket } from "lucide-react";
import { BusinessCard } from "@/components/site/BusinessCard";
import { HeroSlider } from "@/components/site/HeroSlider";
import { SiteFooter, SiteHeader } from "@/components/site/Layout";
import { getPublishedBusinesses } from "@/data/business";
import { getCategoriesAction, getLocationsAction } from "@/app/actions/search";
import React from "react";
import * as LucideIcons from "lucide-react";

export default async function Index() {
  const [businesses, categories, locations] = await Promise.all([
    getPublishedBusinesses(6),
    getCategoriesAction(),
    getLocationsAction()
  ]);
  
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
              className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-gold"
            >
              Xem tất cả <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => {
              const Icon = (LucideIcons as any)[c.icon || "Sparkles"] || LucideIcons.Sparkles;
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
        </section>

        {/* Featured */}
        <section className="border-t border-border bg-champagne/40">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs tracking-[0.3em] text-gold uppercase">Tuyển chọn</p>
                <div className="rule-gold mt-3" />
                <h2 className="mt-5 text-3xl md:text-4xl">Doanh nghiệp nổi bật</h2>
              </div>
            </div>
            {featured.length > 0 ? (
              <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {featured.map((b) => (
                  <BusinessCard key={b.slug} business={b} />
                ))}
              </div>
            ) : (
              <p className="mt-10 text-muted-foreground">Chưa có doanh nghiệp nổi bật nào.</p>
            )}
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
              className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-gold"
            >
              Tất cả ưu đãi <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {offers.map((o) => (
              <Link
                key={o.title}
                href={`/doanh-nghiep/${o.business.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-gold-soft bg-champagne p-6 transition-all hover:border-gold hover:shadow-card md:p-8"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-20">
                  <Ticket className="size-32 text-gold" />
                </div>
                <div className="relative">
                  <span className="bg-gradient-gold rounded-full px-3 py-1 text-[11px] font-semibold tracking-widest text-ink uppercase">
                    {o.discount}
                  </span>
                  <h3 className="mt-5 max-w-[280px] font-display text-2xl md:text-3xl">
                    {o.title}
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground">{o.description}</p>
                  <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-medium uppercase tracking-wider text-ink">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-gold" />
                      {o.business.name}
                    </span>
                    <span className="text-muted-foreground">HSD: {o.validUntil}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Locations */}
        <section className="border-t border-border bg-ink text-background">
          <div className="mx-auto max-w-6xl px-6 py-20 text-center">
            <p className="text-xs tracking-[0.3em] text-gold uppercase">Địa điểm</p>
            <div className="rule-gold mx-auto mt-3" />
            <h2 className="mt-5 font-display text-3xl md:text-4xl">Có mặt khắp châu Á</h2>
            <div className="mt-12 flex flex-wrap justify-center gap-3">
              {locations.map((l) => (
                <Link
                  key={l.slug}
                  href={`/tim-kiem?location=${l.slug}`}
                  className="rounded-full border border-background/20 bg-background/5 px-6 py-2.5 text-sm transition-colors hover:bg-gold hover:text-ink hover:border-gold"
                >
                  {l.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
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
