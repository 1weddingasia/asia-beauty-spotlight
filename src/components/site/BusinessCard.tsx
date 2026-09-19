"use client";
import Link from "next/link";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import { getCategory, getLocation, type Business } from "@/data/directory";

export function BusinessCard({ business }: { business: Business }) {
  const category = getCategory(business.category);
  const location = getLocation(business.location);
  const offer = business.offers[0];

  return (
    <Link
      href="/doanh-nghiep/$slug"
       
      className="group shadow-card hover:shadow-luxe relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition-all duration-500 hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={business.cover}
          alt={business.name}
          loading="lazy"
          width={1200}
          height={800}
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
            {category?.name}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold">
            <Star className="size-3 fill-gold text-gold" />
            {business.rating.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-start gap-3">
          <span className="font-display grid size-11 shrink-0 place-items-center rounded-xl border border-gold-soft bg-champagne text-sm tracking-widest text-ink">
            {business.logoText}
          </span>
          <div className="min-w-0">
            <h3 className="flex items-center gap-1.5 truncate text-lg">
              {business.name}
              {business.verified && <BadgeCheck className="size-4 shrink-0 text-gold" />}
            </h3>
            <p className="truncate text-sm text-muted-foreground">{business.tagline}</p>
          </div>
        </div>

        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5 text-gold" />
          {location?.name} · {business.reviews} đánh giá
        </p>

        <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
          {business.services.slice(0, 3).map((s) => (
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
