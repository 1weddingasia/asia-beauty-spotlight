"use client";
import Link from "next/link";
import { BadgeCheck, MapPin, Star } from "lucide-react";

export function BusinessCard({ business: dbBusiness }: { business: any }) {
  // Merge db properties and page_content json
  const business = { ...dbBusiness, ...(dbBusiness.page_content || {}) };

  const firstCategory = business.categories_list?.[0]?.name || business.category_slug || "Làm đẹp";
  const firstLocation = business.locations_list?.[0]?.name || business.location_slug || "Việt Nam";
  const offer = business.offers && business.offers.length > 0 ? business.offers[0] : null;
  const rating = business.rating || 5.0;
  const reviewsCount = business.reviews || 0;

  return (
    <Link
      href={`/doanh-nghiep/${business.slug}`}
      className="group shadow-card hover:shadow-luxe relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition-all duration-500 hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={business.cover_image || business.hero_image || "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80"}
          alt={business.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="overlay-ink absolute inset-0" />
        {offer && (
          <span className="bg-gradient-gold absolute top-4 left-4 rounded-full px-3 py-1 text-[11px] font-semibold tracking-widest text-ink uppercase">
            {offer.discount}
          </span>
        )}
        <div className="absolute right-4 bottom-4 left-4 flex items-end justify-between gap-3">
          <span className="text-xs tracking-[0.2em] text-background/80 uppercase">
            {firstCategory}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold">
            <Star className="size-3 fill-gold text-gold" />
            {Number(rating).toFixed(1)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-start gap-3">
          {business.logo_url ? (
            <img src={business.logo_url} alt="logo" className="size-11 shrink-0 rounded-xl border border-gold-soft object-contain bg-white p-1" />
          ) : (
            <span className="font-display grid size-11 shrink-0 place-items-center rounded-xl border border-gold-soft bg-champagne text-sm tracking-widest text-ink">
              {business.name.substring(0, 2).toUpperCase()}
            </span>
          )}
          
          <div className="min-w-0">
            <h3 className="flex items-center gap-1.5 truncate text-lg">
              {business.name}
              {business.is_featured && <BadgeCheck className="size-4 shrink-0 text-gold" />}
            </h3>
            <p className="truncate text-sm text-muted-foreground">{business.tagline || business.short_description}</p>
          </div>
        </div>

        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5 text-gold" />
          {firstLocation} · {reviewsCount} đánh giá
        </p>

        <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
          {(business.services_list || business.services || []).slice(0, 3).map((s: any) => (
            <span
              key={s.name}
              className="rounded-full border border-border bg-secondary px-2.5 py-1 text-[11px] text-secondary-foreground"
            >
              {s.name}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
