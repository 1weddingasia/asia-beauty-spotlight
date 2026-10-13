"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  MapPin,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Gift,
  Star,
  ArrowRight,
  Sparkles,
  Tag,
  Building2,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";

// -- Deal type (aligned with page_content.deals shape) ------------------------
type Deal = {
  title?: string;
  badge?: string;
  promo_price?: number | string;
  original_price?: number | string;
  discount_percent?: number;
  status?: string;
  note?: string;
};

// --- Types ------------------------------------------------------------------
type Category = { id: string; name: string; slug: string; icon?: string | null; description?: string | null };
type Location = { id: string; name: string; slug: string };
type Business = {
  id: string;
  name: string;
  slug: string;
  is_featured: boolean;
  plan_tier: string;
  logo_url: string | null;
  cover_image: string | null;
  tagline: string | null;
  address: string | null;
  categories: Category[];
  locations: Location[];
  deals_count: number;
  top_deal: Deal | null;
};

// --- Hero Slides ------------------------------------------------------------
const HERO_SLIDES = [
  {
    tag: "Cam Nang Tet 2026",
    title: "Hang Ngan Voucher Lam Dep & Am Thuc",
    subtitle: "Giam den 50% cho hang tram cua hang uy tin quanh ban",
    cta: "Kham pha ngay",
    ctaHref: "/uu-dai",
    gradient: "from-rose-950 via-rose-900 to-amber-900",
  },
  {
    tag: "Dat Lich 1-Cham",
    title: "Nhan Uu Dai Doc Quyen Khong Can Thanh Toan Truoc",
    subtitle: "De lai SDT, tiem se goi xac nhan — don gian va nhanh chong",
    cta: "Xem uu dai",
    ctaHref: "/uu-dai",
    gradient: "from-slate-950 via-violet-950 to-indigo-900",
  },
  {
    tag: "Uu Dai Quanh Ban",
    title: "Ket Noi 500+ Thuong Hieu Uy Tin Gan Nha",
    subtitle: "Kham pha uu dai theo quan/huyen — chon dung noi, dung gia",
    cta: "Tim theo khu vuc",
    ctaHref: "/dia-diem",
    gradient: "from-emerald-950 via-teal-900 to-cyan-900",
  },
];

// --- Deal Badge -------------------------------------------------------------
function getDealBadge(deal: Deal | null): string | null {
  if (!deal) return null;
  if (deal.badge) return deal.badge;
  if (deal.discount_percent) return `-${deal.discount_percent}%`;
  if (deal.promo_price && deal.original_price) return "Giam gia";
  if (deal.title && deal.title.length < 20) return deal.title;
  return "Uu dai";
}

// --- Hero Slider ------------------------------------------------------------
function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % HERO_SLIDES.length), 5000);
  };

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const prev = () => { setCurrent((c) => (c - 1 + HERO_SLIDES.length) % HERO_SLIDES.length); resetTimer(); };
  const next = () => { setCurrent((c) => (c + 1) % HERO_SLIDES.length); resetTimer(); };
  const slide = HERO_SLIDES[current];

  return (
    <div className={`relative min-h-[72vh] md:min-h-[80vh] bg-gradient-to-br ${slide.gradient} flex items-center transition-all duration-700`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center pt-28 pb-48 md:pt-36 md:pb-52">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase mb-6 text-white backdrop-blur-sm">
          {slide.tag}
        </div>
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-white leading-[1.1] tracking-tight">
          {slide.title}
        </h1>
        <p className="mt-5 text-base md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
          {slide.subtitle}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={slide.ctaHref} className="inline-flex items-center gap-2 bg-white text-slate-900 font-bold px-8 py-4 rounded-2xl text-base shadow-xl hover:scale-105 transition-all">
            <Sparkles className="size-4" />
            {slide.cta}
            <ArrowRight className="size-4" />
          </Link>
          <Link href="/danh-muc" className="inline-flex items-center gap-2 border border-white/30 text-white px-8 py-4 rounded-2xl text-base hover:bg-white/10 transition-colors">
            <Tag className="size-4" />
            Xem theo danh muc
          </Link>
        </div>
      </div>

      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors">
        <ChevronLeft className="size-5" />
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors">
        <ChevronRight className="size-5" />
      </button>

      <div className="absolute bottom-36 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {HERO_SLIDES.map((_, i) => (
          <button key={i} onClick={() => { setCurrent(i); resetTimer(); }} className={`h-1.5 rounded-full transition-all ${i === current ? "w-8 bg-white" : "w-2 bg-white/40"}`} />
        ))}
      </div>
    </div>
  );
}

// --- Search Bar -------------------------------------------------------------
function SearchBar({ categories, locations }: { categories: Category[]; locations: Location[] }) {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [locationSlug, setLocationSlug] = useState("");
  const [categorySlug, setCategorySlug] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // /uu-dai does not support a location param -- always route to /dia-diem/[slug]
    if (locationSlug) {
      router.push(`/dia-diem/${locationSlug}`);
      return;
    }
    const params = new URLSearchParams();
    if (keyword) params.set("q", keyword);
    if (categorySlug) params.set("category", categorySlug);
    router.push(`/uu-dai?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="relative z-30 mx-auto max-w-4xl px-4 -mt-16">
      <div className="bg-white rounded-2xl shadow-2xl border border-border p-3 flex flex-col md:flex-row gap-2">
        <div className="flex items-center gap-3 flex-1 px-3 py-2 bg-muted/50 rounded-xl">
          <Search className="size-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tim ten tiem, dich vu (nail, spa, cat toc...)"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-xl md:w-44">
          <MapPin className="size-4 text-muted-foreground shrink-0" />
          <select value={locationSlug} onChange={(e) => setLocationSlug(e.target.value)} className="flex-1 bg-transparent text-sm text-foreground outline-none appearance-none cursor-pointer">
            <option value="">Tat ca khu vuc</option>
            {locations.map((l) => (<option key={l.slug} value={l.slug}>{l.name}</option>))}
          </select>
          <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-xl md:w-44">
          <Tag className="size-4 text-muted-foreground shrink-0" />
          <select value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)} className="flex-1 bg-transparent text-sm text-foreground outline-none appearance-none cursor-pointer">
            <option value="">Tat ca nganh</option>
            {categories.map((c) => (<option key={c.slug} value={c.slug}>{c.name}</option>))}
          </select>
          <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
        </div>

        <button type="submit" className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-xl transition-all hover:scale-105 active:scale-95 text-sm whitespace-nowrap">
          <Search className="size-4" />
          Tim Uu Dai
        </button>
      </div>
    </form>
  );
}

// --- Category Grid ----------------------------------------------------------
function CategoryGrid({ categories }: { categories: Category[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -240 : 240, behavior: "smooth" });
  };

  return (
    <section className="py-12 bg-background">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs tracking-[0.25em] text-gold uppercase">Nganh nghe</p>
            <h2 className="mt-1 text-xl md:text-2xl font-display text-ink font-semibold">Kham Pha Theo Danh Muc</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scroll("left")} className="p-2 rounded-full border border-border hover:border-gold/50 hover:bg-gold/5 transition-colors"><ChevronLeft className="size-4" /></button>
            <button onClick={() => scroll("right")} className="p-2 rounded-full border border-border hover:border-gold/50 hover:bg-gold/5 transition-colors"><ChevronRight className="size-4" /></button>
          </div>
        </div>
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto no-scrollbar pb-2" style={{ scrollSnapType: "x mandatory" }}>
          <Link href="/uu-dai" className="flex-shrink-0 flex flex-col items-center gap-2 w-24 md:w-28 group" style={{ scrollSnapAlign: "start" }}>
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 border-2 border-amber-200 flex items-center justify-center text-2xl group-hover:border-amber-400 group-hover:shadow-md transition-all">🎯</div>
            <span className="text-xs text-center text-foreground font-medium line-clamp-2 leading-tight">Tat ca</span>
          </Link>
          {categories.map((cat) => (
            <Link key={cat.slug} href={`/danh-muc/${cat.slug}`} className="flex-shrink-0 flex flex-col items-center gap-2 w-24 md:w-28 group" style={{ scrollSnapAlign: "start" }}>
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-champagne to-background border border-border flex items-center justify-center text-2xl group-hover:border-gold/50 group-hover:shadow-md group-hover:-translate-y-0.5 transition-all">
                {cat.icon || "🏪"}
              </div>
              <span className="text-xs text-center text-foreground font-medium line-clamp-2 leading-tight">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Deal Card --------------------------------------------------------------
function DealCard({ biz }: { biz: Business }) {
  const [imgError, setImgError] = useState(false);
  const badge = getDealBadge(biz.top_deal);
  const locationName = biz.locations[0]?.name || null;
  const catName = biz.categories[0]?.name || null;
  const catIcon = biz.categories[0]?.icon || "🏪";

  return (
    <Link href={`/${biz.slug}`} className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-gold/40 hover:-translate-y-0.5 transition-all duration-300">
      <div className="relative h-44 bg-muted overflow-hidden">
        {biz.cover_image && !imgError ? (
          <Image src={biz.cover_image} alt={biz.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" onError={() => setImgError(true)} />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-champagne to-gold-soft flex items-center justify-center text-5xl">{catIcon}</div>
        )}
        {badge && (<div className="absolute top-3 left-3 bg-rose-500 text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-lg">{badge}</div>)}
        {biz.is_featured && (<div className="absolute top-3 right-3 bg-gold text-ink text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1"><Star className="size-2.5" /> HOT</div>)}
        {locationName && (<div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-[11px] px-2 py-1 rounded-md"><MapPin className="size-3" />{locationName}</div>)}
      </div>
      <div className="flex flex-col flex-1 p-4">
        {catName && (<span className="text-[11px] text-gold font-semibold tracking-wider uppercase mb-1">{catName}</span>)}
        <h3 className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-gold transition-colors">{biz.name}</h3>
        {biz.tagline && (<p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">{biz.tagline}</p>)}
        <div className="mt-auto pt-3 flex items-center justify-between">
          {biz.deals_count > 0 && (<span className="flex items-center gap-1 text-xs text-muted-foreground"><Gift className="size-3.5 text-gold" />{biz.deals_count} uu dai</span>)}
          <span className="ml-auto text-xs font-semibold text-gold group-hover:underline flex items-center gap-1">Lay ma <ArrowRight className="size-3" /></span>
        </div>
      </div>
    </Link>
  );
}

// --- Deals Section ----------------------------------------------------------
function DealsSection({ businesses, locations, categories }: { businesses: Business[]; locations: Location[]; categories: Category[] }) {
  const [activeLocation, setActiveLocation] = useState<string>("all");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    let list = businesses;
    if (activeLocation !== "all") list = list.filter((b) => b.locations.some((l) => l.slug === activeLocation));
    if (activeCategory !== "all") list = list.filter((b) => b.categories.some((c) => c.slug === activeCategory));
    return list;
  }, [businesses, activeLocation, activeCategory]);

  const visible = showAll ? filtered : filtered.slice(0, 8);

  return (
    <section className="py-16 bg-background">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 border border-rose-200 px-4 py-1.5 text-xs font-bold text-rose-600 uppercase tracking-widest mb-4">
            <TrendingUp className="size-3.5" />
            Deal Hot &mdash; Giam Den 50%
          </div>
          <h2 className="font-display text-2xl md:text-3xl text-ink">Uu Dai Noi Bat Hom Nay</h2>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-4">
          <button onClick={() => setActiveCategory("all")} className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${activeCategory === "all" ? "bg-ink text-white" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}>Tat ca</button>
          {categories.slice(0, 10).map((cat) => (
            <button key={cat.slug} onClick={() => setActiveCategory(cat.slug)} className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${activeCategory === cat.slug ? "bg-gold text-ink" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}>
              {cat.icon && <span>{cat.icon}</span>}{cat.name}
            </button>
          ))}
        </div>

        {/* Location tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-6 border-b border-border">
          <button onClick={() => setActiveLocation("all")} className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs transition-all ${activeLocation === "all" ? "bg-foreground text-background font-semibold" : "text-muted-foreground hover:text-foreground"}`}>Tat ca khu vuc</button>
          {locations.slice(0, 8).map((loc) => (
            <button key={loc.slug} onClick={() => setActiveLocation(loc.slug)} className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs transition-all whitespace-nowrap ${activeLocation === loc.slug ? "bg-foreground text-background font-semibold" : "text-muted-foreground hover:text-foreground"}`}>{loc.name}</button>
          ))}
        </div>

        {visible.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground"><div className="text-5xl mb-4">🔍</div><p>Chua co uu dai trong khu vuc nay</p></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {visible.map((biz) => (<DealCard key={biz.id} biz={biz} />))}
          </div>
        )}

        {filtered.length > 8 && (
          <div className="mt-10 text-center">
            {showAll ? (
              <Link href="/uu-dai" className="inline-flex items-center gap-2 border border-border text-foreground px-8 py-3 rounded-full text-sm hover:border-gold hover:text-gold transition-colors">Xem tat ca uu dai <ArrowRight className="size-4" /></Link>
            ) : (
              <button onClick={() => setShowAll(true)} className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-3 rounded-full text-sm font-semibold hover:bg-ink transition-colors">Xem them {filtered.length - 8} uu dai <ChevronDown className="size-4" /></button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// --- Location Section -------------------------------------------------------
function LocationSection({ locations }: { locations: Location[] }) {
  const LOCATION_EMOJIS: Record<string, string> = {
    "ho-chi-minh": "🏙️", tphcm: "🏙️", saigon: "🏙️",
    "ha-noi": "🏛️", hanoi: "🏛️", "da-nang": "🌊",
    "can-tho": "🌾", hue: "🏯", "nha-trang": "🏖️",
    "da-lat": "🌸", "quan-1": "1️⃣", "quan-3": "3️⃣",
    "phu-nhuan": "🌺", "binh-thanh": "🏘️", "thu-duc": "🏗️",
  };
  const getEmoji = (slug: string) => {
    const lower = slug.toLowerCase();
    for (const [k, v] of Object.entries(LOCATION_EMOJIS)) {
      if (lower.includes(k)) return v;
    }
    return "📍";
  };

  return (
    <section className="py-16 bg-muted/40 border-y border-border">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.25em] text-gold uppercase mb-2">Tim theo vi tri</p>
          <h2 className="font-display text-2xl md:text-3xl text-ink">Kham Pha Theo Khu Vuc</h2>
          <p className="mt-3 text-muted-foreground text-sm max-w-xl mx-auto">Chon quan/huyen de kham pha ngay cac uu dai gan ban nhat</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {locations.map((loc) => (
            <Link key={loc.slug} href={`/dia-diem/${loc.slug}`} className="group flex items-center gap-3 p-4 bg-background rounded-xl border border-border hover:border-gold/50 hover:shadow-md hover:-translate-y-0.5 transition-all">
              <span className="text-2xl">{getEmoji(loc.slug)}</span>
              <span className="text-sm font-medium text-foreground group-hover:text-gold transition-colors line-clamp-1">{loc.name}</span>
            </Link>
          ))}
          <Link href="/dia-diem" className="group flex items-center gap-3 p-4 bg-gold/5 rounded-xl border border-gold/30 hover:border-gold hover:shadow-md hover:-translate-y-0.5 transition-all">
            <span className="text-2xl">🗺️</span>
            <span className="text-sm font-medium text-gold">Xem tat ca →</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

// --- B2B Banner -------------------------------------------------------------
function B2BBanner() {
  return (
    <section className="py-16 bg-ink">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-full px-4 py-1.5 text-xs font-bold text-gold uppercase tracking-widest mb-6">
          <Building2 className="size-3.5" />
          Danh cho chu doanh nghiep
        </div>
        <h2 className="font-display text-3xl md:text-4xl text-white leading-tight">
          Ban la chu cua hang / dich vu tai dia phuong?
        </h2>
        <p className="mt-5 text-white/70 text-base max-w-2xl mx-auto leading-relaxed">
          Gia nhap <strong className="text-gold">Lien minh Uu dai 1Booking</strong> de tiep can hon{" "}
          <strong className="text-white">5.000+ khach hang tiem nang</strong> ngay trong ban kinh 1km quanh quan cua ban. Chi phi chi tu 500.000d/nam.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/danh-cho-doanh-nghiep" className="inline-flex items-center gap-2 bg-gold text-ink font-bold px-8 py-4 rounded-2xl text-base shadow-xl hover:bg-gold/90 hover:scale-105 transition-all">
            <Sparkles className="size-4" />
            Dang ky mo gian hang uu dai
          </Link>
          <Link href="/lien-he" className="inline-flex items-center gap-2 border border-white/20 text-white px-8 py-4 rounded-2xl text-base hover:bg-white/10 transition-colors">
            Tu van mien phi
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {[{ n: "500+", label: "Thuong hieu" }, { n: "5.000+", label: "Khach hang" }, { n: "500K", label: "d/nam" }].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-black text-gold">{s.n}</div>
              <div className="text-xs text-white/50 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Main Client Component --------------------------------------------------
export function B2CHomepageClient({
  categories,
  locations,
  businesses,
  totalBusinesses,
}: {
  categories: Category[];
  locations: Location[];
  businesses: Business[];
  totalBusinesses: number;
}) {
  return (
    <main>
      <HeroSlider />
      <SearchBar categories={categories} locations={locations} />

      <div className="bg-champagne border-b border-border py-4">
        <div className="mx-auto max-w-6xl px-4 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          {totalBusinesses > 0 && (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
              <strong className="text-foreground">{totalBusinesses}</strong> doanh nghiep dang hoat dong
            </span>
          )}
          <span className="flex items-center gap-2"><span className="text-gold">✓</span> Dat lich khong can thanh toan truoc</span>
          <span className="flex items-center gap-2"><span className="text-gold">✓</span> Uu dai doc quyen chi co tai 1Booking</span>
        </div>
      </div>

      <CategoryGrid categories={categories} />
      <DealsSection businesses={businesses} locations={locations} categories={categories} />
      <LocationSection locations={locations} />
      <B2BBanner />
    </main>
  );
}
