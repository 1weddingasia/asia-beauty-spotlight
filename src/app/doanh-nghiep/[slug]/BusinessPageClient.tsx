"use client";

import { PageShell } from "@/components/site/Layout";
import { BusinessCard } from "@/components/site/BusinessCard";
import { categories, locations } from "@/data/directory";
import { 
  BadgeCheck, Clock, Globe, Mail, MapPin, 
  MessageCircle, Phone, Share2, Sparkles, 
  Star, Ticket, X, CheckCircle2 
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function BusinessPageClient({ business: b }: { business: any }) {
  const [activeTab, setActiveTab] = useState("about");
  const [service, setService] = useState<any>(null);
  const [offer, setOffer] = useState<any>(null);

  const category = categories.find((c) => c.slug === b.category_slug);
  const location = locations.find((l) => l.slug === b.location_slug);
  const related: any[] = []; // Tạm thời để trống hoặc query từ DB sau

  return (
    <PageShell solidHeader={false}>
      {/* Hero Header */}
      <div className="relative h-[50vh] min-h-[400px] w-full bg-ink">
        <Image
          src={b.cover_image || "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80"}
          alt={b.name}
          fill
          className="object-cover opacity-50 mix-blend-overlay"
          priority
        />
        <div className="overlay-ink absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 pb-12 md:flex-row md:items-end md:gap-8">
              <div className="relative size-32 shrink-0 overflow-hidden rounded-full border-4 border-background bg-white md:size-40 p-2">
                <Image
                  src={b.logo_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80"}
                  alt={b.name}
                  fill
                  className="object-contain p-2"
                />
            </div>
            <div className="text-center md:mb-4 md:text-left">
              <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
                <span className="rounded-full border border-gold-soft bg-champagne px-3 py-1 text-xs font-semibold tracking-widest text-ink uppercase">
                  {category?.name}
                </span>
                {b.is_featured && (
                  <span className="flex items-center gap-1 rounded-full bg-gold/20 px-3 py-1 text-xs font-semibold tracking-widest text-gold uppercase backdrop-blur-md">
                    <BadgeCheck className="size-3.5" /> Nổi bật
                  </span>
                )}
                {b.plan_tier && b.plan_tier !== "free" && (
                  <span className="flex items-center gap-1 rounded-full bg-ink px-3 py-1 text-xs font-semibold tracking-widest text-gold uppercase border border-gold">
                    <Sparkles className="size-3.5" /> Đối tác {b.plan_tier}
                  </span>
                )}
              </div>
              <h1 className="mt-4 font-display text-4xl text-background md:text-5xl lg:text-6xl">
                {b.name}
              </h1>
              <p className="mt-3 text-lg text-background/80 md:text-xl">
                {b.tagline}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-background/80 md:justify-start">
                <span className="flex items-center gap-1">
                  <Star className="size-4 fill-gold text-gold" />
                  <span className="font-medium text-background">{b.rating}</span>
                  <span>({b.reviews} đánh giá)</span>
                </span>
                <span className="hidden size-1 rounded-full bg-background/20 md:block" />
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4" />
                  {location?.name}
                </span>
              </div>
            </div>
            <div className="md:mb-4 md:ml-auto md:flex md:gap-3">
              <button className="grid size-12 place-items-center rounded-full border border-background/20 bg-background/10 text-background backdrop-blur-md transition-colors hover:bg-background/20 hover:text-gold">
                <Share2 className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl gap-8 px-6">
          {[
            { id: "about", label: "Tổng quan" },
            { id: "services", label: "Dịch vụ" },
            { id: "offers", label: "Ưu đãi" },
            { id: "reviews", label: "Đánh giá" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`border-b-2 py-5 text-sm font-medium transition-colors ${
                activeTab === t.id
                  ? "border-gold text-ink"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-12 lg:grid-cols-[1fr_340px]">
        <div className="space-y-16">
          {/* Về chúng tôi */}
          <section id="about" className={activeTab !== "about" ? "hidden" : "block"}>
            <p className="text-xs tracking-[0.3em] text-gold uppercase">Về chúng tôi</p>
            <div className="rule-gold mt-3" />
            <h2 className="mt-5 text-2xl md:text-3xl">Câu chuyện thương hiệu</h2>
            <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
              {b.about?.split("\n").map((p: string, i: number) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {/* Gallery (Nếu có) */}
            {b.gallery && b.gallery.length > 0 && (
              <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
                {b.gallery.map((img: string, i: number) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden">
                    <Image src={img} alt={`Gallery ${i}`} fill className="object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Dịch vụ */}
          <section id="services" className={activeTab !== "services" && activeTab !== "about" ? "hidden" : "block"}>
            <p className="text-xs tracking-[0.3em] text-gold uppercase">Bảng giá</p>
            <div className="rule-gold mt-3" />
            <h2 className="mt-5 text-2xl md:text-3xl">Dịch vụ nổi bật</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {b.services?.map((s: any) => (
                <div
                  key={s.name}
                  onClick={() => setService(s)}
                  className="group cursor-pointer rounded-2xl border border-border bg-card p-5 transition-all hover:border-gold hover:shadow-card"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-medium group-hover:text-gold transition-colors">{s.name}</h3>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {s.description}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
                        <Clock className="size-3" /> {s.duration}
                      </span>
                    </div>
                    <span className="text-gradient-gold font-display font-semibold whitespace-nowrap">
                      {s.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Ưu đãi */}
          <section id="offers" className={activeTab !== "offers" && activeTab !== "about" ? "hidden" : "block"}>
            <p className="text-xs tracking-[0.3em] text-gold uppercase">Khuyến mãi</p>
            <div className="rule-gold mt-3" />
            <h2 className="mt-5 text-2xl md:text-3xl">Ưu đãi hiện có</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {b.offers?.map((o: any) => (
                <div
                  key={o.title}
                  onClick={() => setOffer(o)}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border border-gold-soft bg-champagne p-6 transition-all hover:border-gold hover:shadow-card"
                >
                  <span className="bg-gradient-gold rounded-full px-3 py-1 text-[11px] font-semibold tracking-widest text-ink uppercase">
                    {o.discount}
                  </span>
                  <h3 className="mt-4 font-display text-xl">{o.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {o.description}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="size-3.5" /> Có hiệu lực đến: {o.validUntil}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Đánh giá */}
          <section id="reviews" className={activeTab !== "reviews" ? "hidden" : "block"}>
            <p className="text-xs tracking-[0.3em] text-gold uppercase">Phản hồi</p>
            <div className="rule-gold mt-3" />
            <h2 className="mt-5 text-2xl md:text-3xl">Đánh giá từ khách hàng</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {b.reviewsList?.map((r: any, i: number) => (
                <blockquote key={i} className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex gap-1">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} className="size-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed">"{r.comment}"</p>
                  <footer className="mt-4 flex items-center gap-3">
                    <div className="grid size-8 place-items-center rounded-full bg-secondary text-xs font-medium uppercase">
                      {r.author.slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{r.author}</div>
                      <div className="text-xs text-muted-foreground">{r.date}</div>
                    </div>
                  </footer>
                </blockquote>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section>
            <p className="text-xs tracking-[0.3em] text-gold uppercase">Hỏi đáp</p>
            <div className="rule-gold mt-3" />
            <h2 className="mt-5 text-2xl md:text-3xl">Câu hỏi thường gặp</h2>
            <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card">
              {b.faqs?.map((f: any) => (
                <details key={f.q} className="group p-5">
                  <summary className="cursor-pointer list-none text-base font-medium hover:text-gold transition-colors">
                    {f.q}
                  </summary>
                  <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar thông tin */}
        <aside className="shadow-card h-fit space-y-4 rounded-2xl border border-border bg-card p-7 lg:sticky lg:top-24">
          <p className="text-xs tracking-[0.25em] text-gold uppercase">Thông tin liên hệ</p>
          <p className="flex items-start gap-2 text-sm">
            <MapPin className="mt-0.5 size-4 shrink-0 text-gold" />
            {b.address}
          </p>
          <p className="flex items-center gap-2 text-sm">
            <Phone className="size-4 text-gold" />
            {b.phone}
          </p>
          <p className="flex items-center gap-2 text-sm">
            <Mail className="size-4 text-gold" />
            {b.email}
          </p>
          <p className="flex items-center gap-2 text-sm">
            <Globe className="size-4 text-gold" />
            {b.website}
          </p>
          <p className="flex items-center gap-2 text-sm">
            <Clock className="size-4 text-gold" />
            {b.hours}
          </p>
          <div className="border-t border-border pt-4 text-sm text-muted-foreground">
            Hoạt động từ {b.since} · {category?.name} · {location?.name}
          </div>
          
          {/* Uy tín (Trust Signals) cho Landing Page */}
          <div className="mt-4 bg-champagne rounded-xl p-4 space-y-2 border border-gold-soft">
            <p className="flex items-center gap-2 text-xs font-medium text-ink">
              <CheckCircle2 className="size-4 text-gold" /> Đối tác xác thực của 1Beauty
            </p>
            <p className="flex items-center gap-2 text-xs font-medium text-ink">
              <CheckCircle2 className="size-4 text-gold" /> Cam kết chất lượng dịch vụ
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-3">
            {b.tags?.map((t: any) => (
              <span
                key={t}
                className="rounded-full border border-border bg-secondary px-2.5 py-1 text-[11px]"
              >
                {t}
              </span>
            ))}
          </div>
          <Link
            href="/lien-he"
            className="bg-gradient-gold mt-4 block rounded-full px-6 py-3 text-center text-sm font-semibold tracking-[0.1em] text-ink uppercase hover:opacity-90 transition-opacity"
          >
            Liên hệ đặt lịch
          </Link>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="border-t border-border bg-champagne/40">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <p className="text-xs tracking-[0.3em] text-gold uppercase">Gợi ý</p>
            <div className="rule-gold mt-3" />
            <h2 className="mt-5 text-2xl md:text-3xl">Doanh nghiệp cùng danh mục</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {related.map((r) => (
                <BusinessCard key={r.slug} business={r} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popup dịch vụ */}
      {service && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-6 backdrop-blur-sm"
          onClick={() => setService(null)}
          role="dialog"
          aria-modal="true"
          aria-label={service.name}
        >
          <div
            className="shadow-luxe relative w-full max-w-md rounded-3xl border border-gold-soft bg-card p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setService(null)}
              aria-label="Đóng"
              className="absolute top-4 right-4 grid size-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="size-4" />
            </button>
            <span className="grid size-12 place-items-center rounded-2xl border border-gold-soft bg-champagne">
              <Sparkles className="size-5 text-gold" />
            </span>
            <h3 className="mt-4 text-2xl">{service.name}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {service.description}
            </p>
            <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary px-4 py-3">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="size-4 text-gold" />
                Thời gian
              </span>
              <span className="font-medium">{service.duration}</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-gold-soft bg-champagne px-4 py-3">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Ticket className="size-4 text-gold" />
                Giá dịch vụ
              </span>
              <span className="text-gradient-gold font-display text-lg font-semibold whitespace-nowrap">
                {service.price}
              </span>
            </div>
            <Link
              href="/lien-he"
              className="bg-gradient-gold mt-6 block rounded-full px-6 py-3 text-center text-sm font-semibold tracking-[0.1em] text-ink uppercase"
            >
              Đặt lịch ngay
            </Link>
          </div>
        </div>
      )}

      {/* Popup ưu đãi */}
      {offer && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-6 backdrop-blur-sm"
          onClick={() => setOffer(null)}
          role="dialog"
          aria-modal="true"
          aria-label={offer.title}
        >
          <div
            className="shadow-luxe relative w-full max-w-md rounded-3xl border border-gold-soft bg-card p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOffer(null)}
              aria-label="Đóng"
              className="absolute top-4 right-4 grid size-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="size-4" />
            </button>
            <span className="bg-gradient-gold rounded-full px-3 py-1 text-[11px] font-semibold tracking-widest text-ink uppercase">
              {offer.discount}
            </span>
            <h3 className="mt-4 text-2xl">{offer.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {offer.description}
            </p>
            {offer.code && (
              <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-dashed border-gold bg-champagne px-4 py-3">
                <span className="flex items-center gap-2 text-sm">
                  <Ticket className="size-4 text-gold" />
                  Mã ưu đãi
                </span>
                <span className="font-semibold tracking-[0.2em]">{offer.code}</span>
              </div>
            )}
            <p className="mt-4 text-xs text-muted-foreground">
              Có hiệu lực đến: {offer.validUntil}
            </p>
            <Link
              href="/lien-he"
              className="bg-gradient-gold mt-6 block rounded-full px-6 py-3 text-center text-sm font-semibold tracking-[0.1em] text-ink uppercase"
            >
              Lấy mã ngay
            </Link>
          </div>
        </div>
      )}
    </PageShell>
  );
}
