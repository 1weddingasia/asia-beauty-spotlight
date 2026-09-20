"use client";

import { PageShell } from "@/components/site/Layout";
import { BusinessCard } from "@/components/site/BusinessCard";
import { categories, locations } from "@/data/directory";
import { 
  BadgeCheck, Clock, Globe, Mail, MapPin, 
  Phone, Sparkles, Star, ChevronLeft, ChevronRight, CheckCircle2, Ticket
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";

const fadeUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function BusinessPageClient({ business: b }: { business: any }) {
  const category = categories.find((c) => c.slug === b.category_slug);
  const location = locations.find((l) => l.slug === b.location_slug);
  
  // Embla setup for sliders
  const [galleryRef, galleryApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [servicesRef, servicesApi] = useEmblaCarousel({ loop: false, align: "start" });
  
  const scrollPrevGallery = useCallback(() => galleryApi && galleryApi.scrollPrev(), [galleryApi]);
  const scrollNextGallery = useCallback(() => galleryApi && galleryApi.scrollNext(), [galleryApi]);
  
  const scrollPrevServices = useCallback(() => servicesApi && servicesApi.scrollPrev(), [servicesApi]);
  const scrollNextServices = useCallback(() => servicesApi && servicesApi.scrollNext(), [servicesApi]);

  const hasGallery = b.gallery && b.gallery.length > 0;
  const hasServices = b.services && b.services.length > 0;

  return (
    <PageShell solidHeader={false}>
      {/* 1. HERO SECTION (Fix Mobile Logo) */}
      <section className="relative w-full bg-ink">
        <div className="relative h-[45vh] min-h-[350px] w-full md:h-[60vh] md:min-h-[500px]">
          <Image
            src={b.hero_image || b.cover_image || "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80"}
            alt={b.name}
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </div>
        
        {/* Logo & Header Info - Overlapping */}
        <div className="mx-auto max-w-6xl px-6 relative -mt-24 md:-mt-32 z-10">
          <div className="flex flex-col items-center md:items-end md:flex-row gap-6">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative size-32 md:size-48 shrink-0 overflow-hidden rounded-full border-4 border-background bg-white shadow-2xl p-2"
            >
              <Image
                src={b.logo_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80"}
                alt={b.name}
                fill
                className="object-contain p-2"
              />
            </motion.div>
            
            <motion.div 
              initial="hidden" animate="visible" variants={fadeUp}
              className="text-center md:text-left pb-4 md:pb-8 flex-1"
            >
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                <span className="rounded-full border border-gold-soft bg-champagne px-3 py-1 text-xs font-semibold tracking-widest text-ink uppercase">
                  {category?.name || "Làm Đẹp"}
                </span>
                {b.is_featured && (
                  <span className="flex items-center gap-1 rounded-full bg-gold px-3 py-1 text-xs font-semibold tracking-widest text-ink uppercase">
                    <BadgeCheck className="size-3.5" /> Nổi Bật
                  </span>
                )}
              </div>
              <h1 className="font-display text-3xl md:text-5xl lg:text-6xl text-foreground mb-2">
                {b.name}
              </h1>
              {b.tagline && (
                <p className="text-lg md:text-xl text-muted-foreground font-light italic">
                  "{b.tagline}"
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-6 py-16 space-y-24">
        
        {/* GIỚI THIỆU & LIÊN HỆ */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
          className="grid md:grid-cols-3 gap-12"
        >
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px bg-gold flex-1" />
              <h2 className="text-xs tracking-[0.3em] text-gold uppercase font-semibold">Về Chúng Tôi</h2>
              <div className="h-px bg-gold flex-1" />
            </div>
            <p className="text-lg leading-relaxed text-foreground font-medium">
              {b.short_description}
            </p>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {b.about || b.description}
            </p>
          </div>
          
          <div className="bg-card rounded-3xl p-8 border border-border shadow-card h-fit space-y-6">
            <h3 className="font-display text-xl border-b border-border pb-4">Thông tin liên hệ</h3>
            <div className="space-y-4">
              {b.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="size-5 text-gold shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">{b.address}</span>
                </div>
              )}
              {b.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="size-5 text-gold shrink-0" />
                  <span className="text-sm font-medium">{b.phone}</span>
                </div>
              )}
              {b.hours && (
                <div className="flex items-center gap-3">
                  <Clock className="size-5 text-gold shrink-0" />
                  <span className="text-sm text-muted-foreground">{b.hours}</span>
                </div>
              )}
              {b.website && (
                <div className="flex items-center gap-3">
                  <Globe className="size-5 text-gold shrink-0" />
                  <span className="text-sm text-muted-foreground truncate">{b.website}</span>
                </div>
              )}
            </div>
            <Link
              href="/lien-he"
              className="w-full block bg-gradient-gold rounded-full px-6 py-4 text-center text-sm font-semibold tracking-[0.1em] text-ink uppercase hover:opacity-90 transition-opacity"
            >
              Đặt lịch tư vấn
            </Link>
          </div>
        </motion.section>

        {/* SLIDER 1: KHÔNG GIAN (GALLERY) */}
        {hasGallery && (
          <motion.section 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
          >
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs tracking-[0.3em] text-gold uppercase mb-3">Trải nghiệm</p>
                <h2 className="font-display text-3xl md:text-4xl">Không gian & Cơ sở</h2>
              </div>
              <div className="hidden md:flex gap-2">
                <button onClick={scrollPrevGallery} className="grid size-10 place-items-center rounded-full border border-border hover:border-gold hover:text-gold transition-colors">
                  <ChevronLeft className="size-5" />
                </button>
                <button onClick={scrollNextGallery} className="grid size-10 place-items-center rounded-full border border-border hover:border-gold hover:text-gold transition-colors">
                  <ChevronRight className="size-5" />
                </button>
              </div>
            </div>
            
            <div className="overflow-hidden" ref={galleryRef}>
              <div className="flex gap-4 md:gap-6">
                {b.gallery.map((img: string, idx: number) => (
                  <div key={idx} className="relative flex-[0_0_85%] md:flex-[0_0_40%] lg:flex-[0_0_30%] h-[300px] md:h-[400px] rounded-2xl overflow-hidden group">
                    <Image
                      src={img}
                      alt={`Gallery ${idx}`}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-ink/10 group-hover:bg-transparent transition-colors duration-500" />
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* SLIDER 2: DỊCH VỤ NỔI BẬT */}
        {hasServices && (
          <motion.section 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
            className="bg-secondary/50 -mx-6 px-6 py-16 md:rounded-3xl md:mx-0 md:px-12"
          >
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs tracking-[0.3em] text-gold uppercase mb-3">Bảng giá</p>
                <h2 className="font-display text-3xl md:text-4xl">Dịch vụ nổi bật</h2>
              </div>
              <div className="hidden md:flex gap-2">
                <button onClick={scrollPrevServices} className="grid size-10 place-items-center rounded-full border border-border bg-background hover:border-gold hover:text-gold transition-colors">
                  <ChevronLeft className="size-5" />
                </button>
                <button onClick={scrollNextServices} className="grid size-10 place-items-center rounded-full border border-border bg-background hover:border-gold hover:text-gold transition-colors">
                  <ChevronRight className="size-5" />
                </button>
              </div>
            </div>

            <div className="overflow-hidden -mx-4 px-4 md:mx-0 md:px-0" ref={servicesRef}>
              <div className="flex gap-4 md:gap-6">
                {b.services.map((s: any, idx: number) => (
                  <div key={idx} className="flex-[0_0_90%] md:flex-[0_0_45%] lg:flex-[0_0_33.33%] min-w-0">
                    <div className="bg-card border border-border rounded-2xl p-6 h-full flex flex-col hover:border-gold transition-colors group">
                      <div className="size-12 rounded-full bg-champagne border border-gold-soft flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                        <Sparkles className="size-5 text-gold" />
                      </div>
                      <h3 className="text-xl font-display mb-3">{s.name}</h3>
                      <p className="text-sm text-muted-foreground flex-1 line-clamp-3">
                        {s.description}
                      </p>
                      {(s.price_min || s.price_max || s.price) && (
                        <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider">Chi phí</span>
                          <span className="font-semibold text-gold">
                            {s.price || s.price_min || "Liên hệ"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* SECTION 3: TRUST SIGNALS / CAM KẾT */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
          className="border-t border-border pt-16"
        >
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-champagne/40 rounded-3xl border border-gold-soft">
              <BadgeCheck className="size-10 text-gold mx-auto mb-4" />
              <h3 className="font-display text-xl mb-2">Cam Kết Chất Lượng</h3>
              <p className="text-sm text-muted-foreground">Đội ngũ chuyên gia và công nghệ hàng đầu mang lại kết quả tối ưu.</p>
            </div>
            <div className="text-center p-6 bg-champagne/40 rounded-3xl border border-gold-soft">
              <Star className="size-10 text-gold mx-auto mb-4" />
              <h3 className="font-display text-xl mb-2">Đánh Giá Uy Tín</h3>
              <p className="text-sm text-muted-foreground">Hàng nghìn khách hàng đã trải nghiệm và hài lòng với dịch vụ.</p>
            </div>
            <div className="text-center p-6 bg-champagne/40 rounded-3xl border border-gold-soft">
              <CheckCircle2 className="size-10 text-gold mx-auto mb-4" />
              <h3 className="font-display text-xl mb-2">Bảo Hành Dài Lâu</h3>
              <p className="text-sm text-muted-foreground">Chế độ hậu mãi và chăm sóc khách hàng chu đáo sau liệu trình.</p>
            </div>
          </div>
        </motion.section>

      </main>
    </PageShell>
  );
}
