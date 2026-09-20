"use client";

import { PageShell } from "@/components/site/Layout";
import { categories, locations } from "@/data/directory";
import { 
  BadgeCheck, Clock, Globe, MapPin, 
  Phone, Sparkles, Star, ChevronLeft, ChevronRight, CheckCircle2, X, Ticket, Image as ImageIcon, ArrowUp, Navigation
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion, AnimatePresence } from "framer-motion";

const fadeUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function BusinessPageClient({ business: b }: { business: any }) {
  const category = categories.find((c) => c.slug === b.category_slug);
  
  // Embla Carousels
  const [heroRef, heroApi] = useEmblaCarousel({ loop: true });
  const [galleryRef, galleryApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [servicesRef, servicesApi] = useEmblaCarousel({ loop: false, align: "start" });
  
  const scrollPrevGallery = useCallback(() => galleryApi && galleryApi.scrollPrev(), [galleryApi]);
  const scrollNextGallery = useCallback(() => galleryApi && galleryApi.scrollNext(), [galleryApi]);
  const scrollPrevServices = useCallback(() => servicesApi && servicesApi.scrollPrev(), [servicesApi]);
  const scrollNextServices = useCallback(() => servicesApi && servicesApi.scrollNext(), [servicesApi]);

  // States for Popups
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);

  // State for Back to Top Button
  const [showTopBtn, setShowTopBtn] = useState(false);

  // Auto-play Hero Carousel
  useEffect(() => {
    if (!heroApi) return;
    const interval = setInterval(() => {
      heroApi.scrollNext();
    }, 4000); // 4 seconds per slide
    return () => clearInterval(interval);
  }, [heroApi]);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const heroSlides = b.banners?.length > 0 
    ? b.banners 
    : (b.gallery?.length >= 3 ? b.gallery.slice(0,3) : [b.hero_image, b.cover_image, b.hero_image].filter(Boolean));

  const galleryItems = b.gallery && b.gallery.length > 0 
    ? b.gallery 
    : [null, null, null, null]; // 4 placeholders

  const servicesItems = b.services && b.services.length > 0 
    ? b.services 
    : [
        { name: "Dịch vụ đang cập nhật", description: "Vui lòng liên hệ trực tiếp với cơ sở để biết thêm chi tiết về dịch vụ này.", price: "Liên hệ" },
        { name: "Dịch vụ đang cập nhật", description: "Vui lòng liên hệ trực tiếp với cơ sở để biết thêm chi tiết về dịch vụ này.", price: "Liên hệ" },
        { name: "Dịch vụ đang cập nhật", description: "Vui lòng liên hệ trực tiếp với cơ sở để biết thêm chi tiết về dịch vụ này.", price: "Liên hệ" }
      ];
  
  // Dummy offers if none exist to show the luxury layout
  const offers = b.offers?.length > 0 ? b.offers : [
    { title: "Giảm 20% Lần Đầu", description: "Áp dụng cho khách hàng mới trải nghiệm dịch vụ. (Đang chờ doanh nghiệp cập nhật mã thật)", discount: "-20%", code: "NEW20" }
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <PageShell solidHeader={false}>
      {/* 1. HERO BANNER (3 SLIDES) */}
      <section className="relative w-full bg-champagne">
        <div className="relative h-[45vh] min-h-[350px] w-full md:h-[65vh] md:min-h-[550px] overflow-hidden" ref={heroRef}>
          <div className="flex h-full touch-pan-y">
            {heroSlides.length > 0 ? (
              heroSlides.map((slideUrl: string, index: number) => (
                <div key={index} className="relative flex-[0_0_100%] h-full">
                  <Image
                    src={slideUrl}
                    alt={`${b.name} Banner ${index + 1}`}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                  {/* Clean gradient overlay for readability, removed mix-blend-overlay to keep image crisp */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-90" />
                </div>
              ))
            ) : (
              <div className="relative flex-[0_0_100%] h-full">
                <div className="absolute inset-0 bg-gradient-to-tr from-champagne via-gold/10 to-secondary/30 opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              </div>
            )}
          </div>
        </div>
        
        {/* LOGO & HEADER TITTLE */}
        <div className="mx-auto max-w-6xl px-6 relative -mt-24 md:-mt-32 z-10 pointer-events-none">
          <div className="flex flex-col items-center md:items-end md:flex-row gap-6 pointer-events-auto">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}
              className="relative size-32 md:size-48 shrink-0 overflow-hidden rounded-full border-4 border-background bg-white shadow-luxe flex items-center justify-center"
            >
              {b.logo_url ? (
                <Image src={b.logo_url} alt={b.name} fill className="object-contain p-4 bg-white" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-champagne text-5xl font-display text-gold">
                  {b.name.substring(0, 1)}
                </div>
              )}
            </motion.div>
            
            <motion.div 
              initial="hidden" animate="visible" variants={fadeUp}
              className="text-center md:text-left pb-4 md:pb-8 flex-1"
            >
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4">
                {/* 1. Location Badge (Địa điểm) */}
                <Link href={`/tim-kiem?location=${b.city || "ho-chi-minh"}`} className="flex items-center gap-1.5 rounded-full bg-ink text-gold px-3 py-1.5 text-[10px] md:text-xs font-bold tracking-widest uppercase hover:bg-ink/80 transition-colors shadow-sm">
                  <Navigation className="size-3.5" /> {b.city || b.province || "TP. Hồ Chí Minh"}
                </Link>

                {/* 2. Multiple Categories (Danh mục ngành nghề) */}
                {(b.categories?.length > 0 ? b.categories : [
                  { name: category?.name || "Làm Đẹp", slug: category?.slug || "lam-dep" },
                  { name: "Chăm sóc da", slug: "cham-soc-da" }
                ]).map((cat: any, i: number) => (
                  <Link key={i} href={`/danh-muc/${cat.slug}`} className="rounded-full border border-gold-soft bg-champagne px-3 py-1.5 text-[10px] md:text-xs font-bold tracking-widest text-ink uppercase hover:bg-gold/20 hover:border-gold transition-colors">
                    {cat.name}
                  </Link>
                ))}

                {/* 3. Verified Badge (Xác thực) */}
                {b.is_featured && (
                  <span className="flex items-center gap-1 rounded-full bg-gradient-gold px-3 py-1.5 text-[10px] md:text-xs font-bold tracking-widest text-ink uppercase shadow-sm">
                    <BadgeCheck className="size-3.5" /> Xác Thực
                  </span>
                )}
              </div>
              <h1 className="font-display text-3xl md:text-5xl lg:text-6xl text-foreground mb-2 px-2 md:px-0 leading-tight">
                {b.name}
              </h1>
              {b.tagline && (
                <p className="text-base md:text-xl text-muted-foreground font-light italic px-4 md:px-0 drop-shadow-sm">
                  "{b.tagline}"
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* NAVIGATION BAR (NON-STICKY) */}
      <div className="relative w-full bg-background border-y border-border/50">
        <div className="mx-auto flex max-w-6xl items-center gap-8 overflow-x-auto px-6 py-4 no-scrollbar whitespace-nowrap">
          <a href="#about" onClick={(e) => handleNavClick(e, 'about')} className="text-xs md:text-sm font-semibold text-foreground hover:text-gold uppercase tracking-widest transition-colors">Giới thiệu</a>
          <a href="#services" onClick={(e) => handleNavClick(e, 'services')} className="text-xs md:text-sm font-semibold text-foreground hover:text-gold uppercase tracking-widest transition-colors">Bảng giá</a>
          <a href="#offers" onClick={(e) => handleNavClick(e, 'offers')} className="text-xs md:text-sm font-semibold text-foreground hover:text-gold uppercase tracking-widest transition-colors">Khuyến mãi</a>
          <a href="#gallery" onClick={(e) => handleNavClick(e, 'gallery')} className="text-xs md:text-sm font-semibold text-foreground hover:text-gold uppercase tracking-widest transition-colors">Không gian</a>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-12 md:py-16 space-y-20 md:space-y-24 overflow-hidden">
        
        {/* 2. CÂU CHUYỆN THƯƠNG HIỆU & THÔNG TIN */}
        <motion.section 
          id="about"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
          className="grid md:grid-cols-3 gap-10 md:gap-12 scroll-mt-24"
        >
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-4 mb-6 md:mb-8">
              <div className="h-px bg-gold flex-1" />
              <h2 className="text-[10px] md:text-xs tracking-[0.3em] text-gold uppercase font-semibold">Câu Chuyện Thương Hiệu</h2>
              <div className="h-px bg-gold flex-1" />
            </div>
            <p className="text-base md:text-lg leading-relaxed text-foreground font-medium">
              {b.short_description || "Đang cập nhật giới thiệu..."}
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {b.about || b.description || "Nội dung đang được hệ thống hoặc doanh nghiệp cập nhật thêm."}
            </p>
          </div>
          
          <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-card h-fit space-y-6">
            <h3 className="font-display text-lg md:text-xl border-b border-border pb-4">Thông tin liên hệ</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="size-4 md:size-5 text-gold shrink-0 mt-0.5" />
                <span className="text-xs md:text-sm text-muted-foreground leading-relaxed">{b.address || "Đang cập nhật"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="size-4 md:size-5 text-gold shrink-0" />
                <span className="text-xs md:text-sm font-medium">{b.phone || "Đang cập nhật"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="size-4 md:size-5 text-gold shrink-0" />
                <span className="text-xs md:text-sm text-muted-foreground">{b.hours || "Đang cập nhật"}</span>
              </div>
            </div>
            <button
              className="w-full block bg-gradient-gold rounded-full px-6 py-4 text-center text-xs md:text-sm font-semibold tracking-[0.1em] text-ink uppercase hover:opacity-90 transition-opacity"
            >
              Đặt Lịch Ngay
            </button>
          </div>
        </motion.section>

        {/* 3. DỊCH VỤ NỔI BẬT (PRODUCT CARDS) */}
        <motion.section 
          id="services"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
          className="bg-secondary/30 -mx-6 px-6 py-12 md:py-16 md:rounded-[3rem] md:mx-0 md:px-12 border border-border/50 scroll-mt-24"
        >
          <div className="flex items-end justify-between mb-8 md:mb-10">
            <div>
              <p className="text-[10px] md:text-xs tracking-[0.3em] text-gold uppercase mb-2 md:mb-3">Bảng giá</p>
              <h2 className="font-display text-2xl md:text-4xl">Dịch vụ nổi bật</h2>
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
              {servicesItems.map((s: any, idx: number) => (
                <div key={idx} className="flex-[0_0_85%] md:flex-[0_0_45%] lg:flex-[0_0_30%] min-w-0">
                  <div 
                    onClick={() => setSelectedService(s)}
                    className="bg-card border border-border rounded-2xl overflow-hidden h-full flex flex-col hover:border-gold hover:shadow-luxe transition-all cursor-pointer group"
                  >
                    <div className="w-full h-40 md:h-48 bg-secondary relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-champagne to-secondary opacity-50 group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="size-8 text-gold/40" />
                      </div>
                    </div>
                    <div className="p-5 md:p-6 flex flex-col flex-1">
                      <h3 className="text-lg md:text-xl font-display mb-2 group-hover:text-gold transition-colors">{s.name}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground flex-1 line-clamp-2 mb-4 leading-relaxed">
                        {s.description}
                      </p>
                      <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                        <span className="font-semibold text-gold text-base md:text-lg">
                          {s.price || s.price_min || "Liên hệ"}
                        </span>
                        <span className="text-[10px] md:text-xs uppercase tracking-wider text-muted-foreground group-hover:text-gold transition-colors">Chi tiết &rarr;</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 4. ƯU ĐÃI ĐỘC QUYỀN (OFFERS) */}
        <motion.section 
          id="offers"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
          className="scroll-mt-24"
        >
          <div className="text-center mb-8 md:mb-10">
            <p className="text-[10px] md:text-xs tracking-[0.3em] text-gold uppercase mb-2 md:mb-3">Khuyến mãi</p>
            <h2 className="font-display text-2xl md:text-4xl">Ưu Đãi Đặc Quyền</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            {offers.map((o: any, idx: number) => (
              <div 
                key={idx} 
                onClick={() => setSelectedOffer(o)}
                className="group relative overflow-hidden rounded-2xl border border-gold-soft bg-champagne p-6 transition-all hover:border-gold hover:shadow-card md:p-8 cursor-pointer"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-20">
                  <Ticket className="size-24 md:size-32 text-gold" />
                </div>
                <div className="relative">
                  <span className="bg-gradient-gold rounded-full px-3 py-1 text-[10px] md:text-[11px] font-semibold tracking-widest text-ink uppercase">
                    {o.discount}
                  </span>
                  <h3 className="mt-4 md:mt-5 max-w-[240px] md:max-w-[280px] font-display text-xl md:text-3xl group-hover:text-gold transition-colors leading-tight">
                    {o.title}
                  </h3>
                  <p className="mt-2 md:mt-3 text-xs md:text-sm text-muted-foreground line-clamp-2 leading-relaxed">{o.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 5. KHÔNG GIAN (GALLERY) */}
        <motion.section 
          id="gallery"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
          className="scroll-mt-24"
        >
          <div className="flex items-end justify-between mb-6 md:mb-8">
            <div>
              <p className="text-[10px] md:text-xs tracking-[0.3em] text-gold uppercase mb-2 md:mb-3">Trải nghiệm</p>
              <h2 className="font-display text-2xl md:text-4xl">Không gian & Cơ sở</h2>
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
          
          <div className="overflow-hidden -mx-6 px-6 md:mx-0 md:px-0" ref={galleryRef}>
            <div className="flex gap-3 md:gap-6">
              {galleryItems.map((img: string | null, idx: number) => (
                <div key={idx} className="relative flex-[0_0_85%] md:flex-[0_0_40%] lg:flex-[0_0_30%] h-[250px] md:h-[400px] rounded-2xl overflow-hidden group bg-secondary/50 border border-border/50">
                  {img ? (
                    <Image
                      src={img}
                      alt={`Gallery ${idx}`}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/50">
                      <ImageIcon className="size-10 md:size-12 mb-3" />
                      <span className="text-xs md:text-sm font-medium">Đang cập nhật hình ảnh</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.section>

      </main>

      {/* MODAL: CHI TIẾT DỊCH VỤ */}
      <AnimatePresence>
        {selectedService && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-ink/80 p-4 md:p-6 backdrop-blur-sm overflow-y-auto"
            onClick={() => setSelectedService(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg rounded-3xl border border-gold-soft bg-card overflow-hidden shadow-2xl my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full h-32 md:h-48 bg-champagne relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="size-10 md:size-12 text-gold/40" />
                </div>
                <button
                  onClick={() => setSelectedService(null)}
                  className="absolute top-4 right-4 grid size-8 md:size-10 place-items-center rounded-full bg-background/50 backdrop-blur-md text-foreground transition-colors hover:bg-background"
                >
                  <X className="size-4 md:size-5" />
                </button>
              </div>
              <div className="p-6 md:p-8">
                <h3 className="font-display text-xl md:text-3xl mb-3 md:mb-4 leading-tight">{selectedService.name}</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6">
                  {selectedService.description}
                </p>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-champagne border border-gold-soft mb-6 md:mb-8">
                  <span className="text-[10px] md:text-sm uppercase tracking-wider text-muted-foreground">Chi phí dự kiến</span>
                  <span className="font-display text-xl md:text-2xl text-gold font-semibold">
                    {selectedService.price || selectedService.price_min || "Liên hệ"}
                  </span>
                </div>
                <button className="w-full bg-gradient-gold rounded-full py-3.5 md:py-4 text-ink text-xs md:text-sm font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity">
                  Đặt Lịch Tư Vấn
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL: ƯU ĐÃI */}
      <AnimatePresence>
        {selectedOffer && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-ink/80 p-4 md:p-6 backdrop-blur-sm overflow-y-auto"
            onClick={() => setSelectedOffer(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md rounded-3xl border border-gold-soft bg-champagne p-6 md:p-8 shadow-2xl text-center my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedOffer(null)}
                className="absolute top-4 right-4 grid size-8 md:size-10 place-items-center rounded-full border border-gold bg-transparent text-ink transition-colors hover:bg-gold/20"
              >
                <X className="size-4 md:size-5" />
              </button>
              <Ticket className="size-12 md:size-16 text-gold mx-auto mb-4 md:mb-6" />
              <span className="inline-block bg-gold rounded-full px-3 md:px-4 py-1 text-[10px] md:text-xs font-bold tracking-widest text-ink uppercase mb-3 md:mb-4">
                {selectedOffer.discount}
              </span>
              <h3 className="font-display text-2xl md:text-3xl text-ink mb-3 md:mb-4 leading-tight">{selectedOffer.title}</h3>
              <p className="text-xs md:text-sm text-ink/70 leading-relaxed mb-6 md:mb-8">
                {selectedOffer.description}
              </p>
              {selectedOffer.code && (
                <div className="mb-6 md:mb-8 p-3 md:p-4 border-2 border-dashed border-gold rounded-xl bg-white/50">
                  <p className="text-[10px] md:text-xs uppercase tracking-widest text-ink/70 mb-1">Mã Khuyến Mãi</p>
                  <p className="font-display text-xl md:text-2xl tracking-widest text-ink">{selectedOffer.code}</p>
                </div>
              )}
              <button className="w-full bg-ink rounded-full py-3.5 md:py-4 text-gold text-xs md:text-sm font-semibold uppercase tracking-widest hover:bg-ink/90 transition-colors">
                Lưu Mã Ưu Đãi
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BACK TO TOP BUTTON */}
      <AnimatePresence>
        {showTopBtn && (
          <motion.button
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-40 grid size-10 md:size-12 place-items-center rounded-full bg-gold text-ink shadow-lg transition-transform hover:scale-110 active:scale-95"
          >
            <ArrowUp className="size-5 md:size-6" />
          </motion.button>
        )}
      </AnimatePresence>

    </PageShell>
  );
}
