"use client";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  Globe,
  Mail,
  MapPin,
  Phone,
  Quote,
  Sparkles,
  Star,
  Ticket,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { BusinessCard } from "@/components/site/BusinessCard";
import { PageShell } from "@/components/site/Layout";
import { businesses, getBusiness, getCategory, getLocation } from "@/data/directory";
import { cn } from "@/lib/utils";

export default function BusinessPageClient({ business: b }: { business: any }) {
  const category = getCategory(b.category);
  const location = getLocation(b.location);
  const slides = [b.cover, ...b.gallery].slice(0, 3);
  const [index, setIndex] = useState(0);
  const [offer, setOffer] = useState<(typeof b.offers)[number] | null>(null);
  const [service, setService] = useState<(typeof b.services)[number] | null>(null);

  useEffect(() => {
    setIndex(0);
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, [b.slug, slides.length]);

  const related = businesses
    .filter((x: any) => x.slug !== b.slug && x.category === b.category)
    .slice(0, 3);

  return (
    <PageShell solidHeader={false}>
      {/* Hero 3 slide */}
      <section className="relative min-h-[72vh] w-full overflow-hidden bg-ink">
        {slides.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000",
              i === index ? "opacity-100" : "opacity-0",
            )}
            aria-hidden={i !== index}
          >
            <img src={src} alt={`${b.name} ${i + 1}`} className="size-full object-cover" />
            <div className="absolute inset-0 bg-ink/60" />
          </div>
        ))}

        <div className="relative mx-auto flex min-h-[72vh] max-w-6xl flex-col justify-end gap-6 px-6 pt-32 pb-14">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-display grid size-16 place-items-center rounded-2xl border border-gold/50 bg-background/95 text-lg tracking-widest text-ink">
              {b.logoText}
            </span>
            <div>
              <p className="text-xs tracking-[0.3em] text-gold uppercase">{category?.name}</p>
              <h1 className="mt-2 flex items-center gap-2 text-3xl text-background md:text-5xl">
                {b.name}
                {b.verified && <BadgeCheck className="size-6 text-gold" />}
              </h1>
            </div>
          </div>
          <p className="max-w-2xl text-background/80">{b.tagline}</p>
          <div className="flex flex-wrap gap-5 text-sm text-background/80">
            <span className="flex items-center gap-1.5">
              <Star className="size-4 fill-gold text-gold" />
              {b.rating.toFixed(1)} · {b.reviews} đánh giá
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4 text-gold" />
              {location?.name}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4 text-gold" />
              {b.hours}
            </span>
          </div>
          <div className="flex gap-2">
            {slides.map((s, i) => (
              <button
                key={s}
                onClick={() => setIndex(i)}
                aria-label={`Ảnh ${i + 1}`}
                className={cn("h-0.5 w-12", i === index ? "bg-gradient-gold" : "bg-background/30")}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[1.7fr_1fr]">
        <div className="space-y-16">
          {/* Giới thiệu */}
          <section>
            <p className="text-xs tracking-[0.3em] text-gold uppercase">Giới thiệu</p>
            <div className="rule-gold mt-3" />
            <h2 className="mt-5 text-2xl md:text-3xl">Về {b.name}</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">{b.about}</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {b.highlights.map((h: any) => (
                <li key={h} className="flex items-start gap-2 text-sm">
                  <BadgeCheck className="mt-0.5 size-4 shrink-0 text-gold" />
                  {h}
                </li>
              ))}
            </ul>
          </section>

          {/* Dịch vụ */}
          <section>
            <p className="text-xs tracking-[0.3em] text-gold uppercase">Dịch vụ</p>
            <div className="rule-gold mt-3" />
            <h2 className="mt-5 text-2xl md:text-3xl">Bảng dịch vụ & giá</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {b.services.map((s: any) => (
                <button
                  key={s.name}
                  onClick={() => setService(s)}
                  className="group shadow-card hover:shadow-luxe flex flex-col rounded-2xl border border-border bg-card p-6 text-left transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg">{s.name}</h3>
                    <span className="grid size-9 shrink-0 place-items-center rounded-full border border-gold-soft bg-champagne">
                      <Sparkles className="size-4 text-gold" />
                    </span>
                  </div>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {s.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-4">
                    <span className="flex items-center gap-1.5 text-xs tracking-widest text-muted-foreground uppercase">
                      <Clock className="size-3.5 text-gold" />
                      {s.duration}
                    </span>
                    <p className="text-gradient-gold font-display text-lg whitespace-nowrap">
                      {s.price}
                    </p>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.15em] text-gold uppercase">
                    Xem chi tiết
                    <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Ưu đãi */}
          <section>
            <p className="text-xs tracking-[0.3em] text-gold uppercase">Ưu đãi</p>
            <div className="rule-gold mt-3" />
            <h2 className="mt-5 text-2xl md:text-3xl">Ưu đãi của doanh nghiệp</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {b.offers.map((o: any) => (
                <button
                  key={o.title}
                  onClick={() => setOffer(o)}
                  className="group shadow-card hover:shadow-luxe rounded-2xl border border-gold-soft bg-champagne p-6 text-left transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="bg-gradient-gold rounded-full px-3 py-1 text-[11px] font-semibold tracking-widest text-ink uppercase">
                      {o.discount}
                    </span>
                    <Ticket className="size-4 text-gold" />
                  </div>
                  <h3 className="mt-4 text-lg">{o.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {o.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.15em] text-gold uppercase">
                    Xem ưu đãi
                    <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Bộ sưu tập */}
          <section>
            <p className="text-xs tracking-[0.3em] text-gold uppercase">Không gian</p>
            <div className="rule-gold mt-3" />
            <h2 className="mt-5 text-2xl md:text-3xl">Bộ sưu tập hình ảnh</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[b.cover, ...b.gallery].map((src, i) => (
                <img
                  key={`${src}-${i}`}
                  src={src}
                  alt={`${b.name} không gian ${i + 1}`}
                  loading="lazy"
                  className="aspect-[4/3] w-full rounded-2xl object-cover"
                />
              ))}
            </div>
          </section>

          {/* Đội ngũ */}
          <section>
            <p className="text-xs tracking-[0.3em] text-gold uppercase">Đội ngũ</p>
            <div className="rule-gold mt-3" />
            <h2 className="mt-5 text-2xl md:text-3xl">Chuyên gia phụ trách</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {b.team.map((t: any) => (
                <div key={t.name} className="rounded-2xl border border-border bg-card p-5">
                  <p className="font-display text-lg">{t.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{t.role}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Đánh giá */}
          <section>
            <p className="text-xs tracking-[0.3em] text-gold uppercase">Đánh giá</p>
            <div className="rule-gold mt-3" />
            <h2 className="mt-5 text-2xl md:text-3xl">Khách hàng nói gì</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {b.testimonials.map((t: any) => (
                <blockquote key={t.name} className="rounded-2xl border border-border bg-card p-6">
                  <Quote className="size-5 text-gold" />
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">“{t.text}”</p>
                  <footer className="mt-4 flex items-center justify-between text-sm">
                    <span className="font-medium">{t.name}</span>
                    <span className="flex items-center gap-1">
                      <Star className="size-3.5 fill-gold text-gold" />
                      {t.rating.toFixed(1)}
                    </span>
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
              {b.faqs.map((f: any) => (
                <details key={f.q} className="group p-5">
                  <summary className="cursor-pointer list-none text-base font-medium">
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
          <div className="flex flex-wrap gap-1.5 pt-1">
            {b.tags.map((t: any) => (
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
            className="bg-gradient-gold mt-2 block rounded-full px-6 py-3 text-center text-xs font-semibold tracking-[0.2em] text-ink uppercase"
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
              className="bg-gradient-gold mt-6 block rounded-full px-6 py-3 text-center text-xs font-semibold tracking-[0.2em] text-ink uppercase"
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
              className="bg-gradient-gold mt-6 block rounded-full px-6 py-3 text-center text-xs font-semibold tracking-[0.2em] text-ink uppercase"
            >
              Đặt lịch ngay
            </Link>
          </div>
        </div>
      )}
    </PageShell>
  );
}
