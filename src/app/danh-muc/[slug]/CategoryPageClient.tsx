"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Search, ChevronLeft, ChevronRight, Gift, Star } from "lucide-react";
import { CategoryIcon } from "@/components/ui/category-icon";
import { getCategoryHeroImage } from "@/lib/location-images";

const PAGE_SIZE = 12;

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
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gold/10 flex items-center justify-center text-gold/60">
                <CategoryIcon slug={biz.category_slug} className="size-8" />
              </div>
            )}
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
          {biz.is_featured && (
            <span className="inline-flex items-center gap-1 bg-gold text-ink text-[10px] font-bold px-2 py-0.5 rounded-full">
              <Star className="size-2.5" />Nổi bật
            </span>
          )}
          {biz.deals_count > 0 && (
            <span className="inline-flex items-center gap-1 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              <Gift className="size-2.5" />{biz.deals_count} ưu đãi
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-base leading-snug group-hover:text-gold transition-colors line-clamp-2 mb-1">
          {biz.name}
        </h3>

        {(biz.tagline || biz.short_description) && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-grow">
            {biz.tagline || biz.short_description}
          </p>
        )}

        {/* Location */}
        {(biz.address || biz.locations?.length > 0) && (
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground mb-3">
            <MapPin className="size-3.5 shrink-0 mt-0.5 text-gold" />
            <span className="line-clamp-1">
              {biz.locations?.length > 0
                ? biz.locations.map((l: any) => l.name).join(", ")
                : biz.address}
            </span>
          </div>
        )}

        <Link
          href={`/${biz.slug}`}
          className="mt-auto flex items-center justify-center gap-1.5 text-center bg-gold text-ink font-bold text-sm py-2.5 rounded-xl hover:bg-gold/90 active:scale-95 transition-all"
        >
          {biz.deals_count > 0 ? (
            <>
              <Gift className="size-4" /> Nhận Ưu Đãi
            </>
          ) : (
            "Xem Chi Tiết"
          )}
        </Link>
      </div>
    </div>
  );
}

export default function CategoryPageClient({
  category,
  businesses,
}: {
  category: any;
  businesses: any[];
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Filter by search
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return businesses;
    return businesses.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        (b.short_description || "").toLowerCase().includes(q) ||
        (b.tagline || "").toLowerCase().includes(q) ||
        (b.address || "").toLowerCase().includes(q) ||
        (b.locations || []).some((l: any) => l?.name?.toLowerCase().includes(q))
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

  // Hero background đồng bộ chuẩn sang trọng
  const heroBg = `url("${getCategoryHeroImage(category.slug, category.hero_image)}")`;

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: heroBg }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-ink/20 to-ink/70" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 md:px-6 py-20 md:py-36 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold shadow-2xl backdrop-blur-sm">
            <CategoryIcon slug={category.slug} name={category.name} className="size-10" />
          </div>
          <p className="text-xs tracking-[0.3em] text-gold uppercase mb-4">
            Danh Mục Ngành Nghề
          </p>
          <h1 className="text-4xl md:text-6xl font-display text-white font-bold mb-4 leading-tight">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
              {category.description}
            </p>
          )}

          {/* Search Box */}
          <div className="max-w-lg mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={`Tìm kiếm trong ${category.name}...`}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-foreground placeholder:text-muted-foreground text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>

          {/* Stats */}
          <div className="mt-6 text-white/60 text-sm">
            {businesses.length > 0
              ? `${businesses.length} doanh nghiệp trong danh mục này`
              : "Chưa có doanh nghiệp"}
          </div>
        </div>
      </section>

      {/* Business Grid */}
      <section className="py-12 px-4 md:px-6">
        <div className="mx-auto max-w-6xl">
          {/* Filter info */}
          {search && (
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Tìm thấy <span className="font-bold text-foreground">{filtered.length}</span> kết quả cho &ldquo;<span className="text-gold">{search}</span>&rdquo;
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
              <Search className="size-12 mx-auto mb-4 text-muted-foreground/40" />
              <h3 className="text-xl font-semibold">
                {search ? "Không tìm thấy kết quả" : "Chưa có doanh nghiệp"}
              </h3>
              <p className="text-muted-foreground mt-2">
                {search
                  ? "Hãy thử từ khóa khác hoặc xem toàn bộ danh mục."
                  : "Danh mục này đang được cập nhật. Vui lòng quay lại sau."}
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

                  {/* Page numbers */}
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
                              <span key={`ellipsis-${p}`} className="px-2 py-2 text-muted-foreground">…</span>
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
