"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Search, ChevronLeft, ChevronRight, Gift, Star } from "lucide-react";

const PAGE_SIZE = 12;

const LOCATION_EMOJIS: Record<string, string> = {
  "ho-chi-minh": "🏙️", tphcm: "🏙️", saigon: "🏙️",
  "ha-noi": "🏛️", hanoi: "🏛️",
  "da-nang": "🌊", danang: "🌊",
  "can-tho": "🌾", hue: "🏯",
  "nha-trang": "🏖️", "da-lat": "🌸",
  "vung-tau": "⛵", "bien-hoa": "🏭",
};

function getLocationEmoji(slug: string): string {
  const key = slug.toLowerCase();
  for (const [k, v] of Object.entries(LOCATION_EMOJIS)) {
    if (key.includes(k)) return v;
  }
  return "📍";
}

const CATEGORY_ICONS: Record<string, string> = {
  beauty: "💅", spa: "🧖", salon: "✂️", nail: "💅", health: "🏥",
  clinic: "🏥", dining: "🍽️", fnb: "🍜", fitness: "💪", sport: "⚽",
  auto: "🚗", pet: "🐾", studio: "📸", travel: "✈️", consulting: "💼",
};

function getCategoryIcon(icon?: string | null, slug?: string): string {
  if (icon) return icon;
  const key = (slug || "").toLowerCase();
  for (const [k, v] of Object.entries(CATEGORY_ICONS)) {
    if (key.includes(k)) return v;
  }
  return "🏪";
}

function BusinessCard({ biz }: { biz: any }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-gold/40 transition-all duration-300 flex flex-col">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {biz.cover_image && !imgError ? (
          <Image
            src={biz.cover_image}
            alt={biz.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-champagne to-gold/20 flex items-center justify-center">
            {biz.logo_url ? (
              <img
                src={biz.logo_url}
                alt={biz.name}
                className="w-20 h-20 object-contain rounded-xl shadow"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <span className="text-5xl opacity-60">🏪</span>
            )}
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
          {biz.is_featured && (
            <span className="inline-flex items-center gap-1 bg-gold text-ink text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
              <Star className="size-2.5" />Nổi bật
            </span>
          )}
          {biz.deals_count > 0 && (
            <span className="inline-flex items-center gap-1 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
              <Gift className="size-2.5" />{biz.deals_count} ưu đãi
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Categories */}
        {biz.categories?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {biz.categories.slice(0, 2).map((cat: any) => (
              <Link
                key={cat.slug}
                href={`/danh-muc/${cat.slug}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-[10px] text-gold bg-gold/10 border border-gold/20 px-2 py-0.5 rounded-full hover:bg-gold/20 transition-colors"
              >
                <span>{getCategoryIcon(cat.icon, cat.slug)}</span>
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        <h3 className="font-bold text-base leading-snug group-hover:text-gold transition-colors line-clamp-2 mb-1">
          {biz.name}
        </h3>

        {(biz.tagline || biz.short_description) && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-grow">
            {biz.tagline || biz.short_description}
          </p>
        )}

        {/* Address */}
        {biz.address && (
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground mb-3">
            <MapPin className="size-3.5 shrink-0 mt-0.5 text-gold" />
            <span className="line-clamp-1">{biz.address}</span>
          </div>
        )}

        <Link
          href={`/${biz.slug}`}
          className="mt-auto block text-center bg-gold text-ink font-bold text-sm py-2.5 rounded-xl hover:bg-gold/90 active:scale-95 transition-all"
        >
          {biz.deals_count > 0 ? "🎁 Nhận Ưu Đãi" : "Xem Chi Tiết"}
        </Link>
      </div>
    </div>
  );
}

export default function LocationPageClient({
  location,
  businesses,
}: {
  location: any;
  businesses: any[];
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const emoji = getLocationEmoji(location.slug);

  // Default hero backgrounds by location
  const DEFAULT_HERO_IMAGES: Record<string, string> = {
    "ho-chi-minh": "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1920&q=80",
    "ha-noi": "https://images.unsplash.com/photo-1555921015-5532091f6026?auto=format&fit=crop&w=1920&q=80",
    "da-nang": "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1920&q=80",
  };

  const heroBgUrl = location.hero_image ||
    Object.entries(DEFAULT_HERO_IMAGES).find(([k]) =>
      location.slug.toLowerCase().includes(k)
    )?.[1] ||
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1920&q=80";

  // Filter
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return businesses;
    return businesses.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        (b.short_description || "").toLowerCase().includes(q) ||
        (b.tagline || "").toLowerCase().includes(q) ||
        (b.address || "").toLowerCase().includes(q) ||
        (b.categories || []).some((c: any) => c.name.toLowerCase().includes(q))
    );
  }, [businesses, search]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${heroBgUrl}")` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/55 to-ink/85" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 md:px-6 py-20 md:py-36 text-center">
          <div className="text-6xl mb-6 drop-shadow-lg">{emoji}</div>
          <p className="text-xs tracking-[0.3em] text-gold uppercase mb-4">Khu Vực</p>
          <h1 className="text-4xl md:text-6xl font-display text-white font-bold mb-4 leading-tight">
            Dịch Vụ Tại
            <br />
            <span className="text-gradient-gold">{location.name}</span>
          </h1>
          {location.description && (
            <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
              {location.description}
            </p>
          )}

          {/* Search */}
          <div className="max-w-lg mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={`Tìm dịch vụ tại ${location.name}...`}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-foreground placeholder:text-muted-foreground text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>

          <div className="mt-6 text-white/60 text-sm">
            {businesses.length > 0
              ? `${businesses.length} doanh nghiệp tại ${location.name}`
              : "Chưa có doanh nghiệp"}
          </div>
        </div>
      </section>

      {/* Business Grid */}
      <section className="py-12 px-4 md:px-6">
        <div className="mx-auto max-w-6xl">
          {search && (
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Tìm thấy <span className="font-bold text-foreground">{filtered.length}</span> kết quả
                {search && ` cho "${search}"`}
              </p>
              <button
                onClick={() => handleSearch("")}
                className="text-xs text-muted-foreground hover:text-foreground underline"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}

          {paginated.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-2xl border">
              <p className="text-4xl mb-4">{search ? "🔍" : "📍"}</p>
              <h3 className="text-xl font-semibold">
                {search ? "Không tìm thấy kết quả" : "Chưa có doanh nghiệp"}
              </h3>
              <p className="text-muted-foreground mt-2">
                {search
                  ? "Hãy thử từ khóa khác."
                  : `Khu vực ${location.name} đang được cập nhật.`}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {paginated.map((biz) => (
                  <BusinessCard key={biz.id} biz={biz} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="size-5" />
                  </button>

                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => {
                        if (totalPages <= 7) return true;
                        if (p === 1 || p === totalPages) return true;
                        if (Math.abs(p - currentPage) <= 2) return true;
                        return false;
                      })
                      .map((p, idx, arr) => {
                        const prev = arr[idx - 1];
                        return (
                          <>
                            {prev && p - prev > 1 && (
                              <span key={`el-${p}`} className="px-2 py-2 text-muted-foreground">…</span>
                            )}
                            <button
                              key={p}
                              onClick={() => setPage(p)}
                              className={`min-w-[2.5rem] h-10 rounded-xl font-semibold text-sm transition ${
                                p === currentPage
                                  ? "bg-gold text-ink shadow"
                                  : "border hover:bg-muted text-foreground"
                              }`}
                            >
                              {p}
                            </button>
                          </>
                        );
                      })}
                  </div>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </div>
              )}

              <p className="text-center text-xs text-muted-foreground mt-4">
                Trang {currentPage}/{totalPages} — {filtered.length} doanh nghiệp
              </p>
            </>
          )}
        </div>
      </section>
    </>
  );
}
