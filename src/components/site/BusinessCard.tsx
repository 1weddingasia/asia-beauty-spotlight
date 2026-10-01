"use client";
import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, MapPin, Star } from "lucide-react";

import { Business, BusinessContent } from "@/types/business";

type BusinessCardProps = Partial<Business> & {
  page_content?: BusinessContent & { banners?: string[], offers?: any[], rating?: number, reviews?: number };
  categories_list?: { name: string, slug: string }[];
  locations_list?: { name: string, slug: string }[];
  category_slug?: string;
  location_slug?: string;
  logo_url?: string;
  services?: any[];
  [key: string]: any;
};

export function BusinessCard({ business: dbBusiness }: { business: BusinessCardProps }) {
  // Merge db properties and page_content json
  const pc = dbBusiness.page_content || {};
  const business: any = { ...dbBusiness, ...pc };

  const firstCategory = business.categories_list?.[0]?.name || business.category_slug || "Làm đẹp";
  const firstLocation = business.locations_list?.[0]?.name || business.location_slug || "Việt Nam";
  const offer = business.offers && business.offers.length > 0 ? business.offers[0] : null;
  const rating = business.rating || 5.0;
  const reviewsCount = business.reviews || 0;

  // Cover image: banners[0] > logo_url fallback > placeholder
  const coverImage = (pc.banners || []).filter(Boolean)[0] 
    || pc.hero_image 
    || "https://images.pexels.com/photos/3997989/pexels-photo-3997989.jpeg?auto=compress&cs=tinysrgb&w=800";

  return (
    <Link
      href={`/doanh-nghiep/${business.slug}`}
      className="group shadow-card hover:shadow-luxe relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition-all duration-500 hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={coverImage as string}
          alt={business.name || "Doanh nghiệp"}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
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

      <div className="relative flex flex-1 flex-col items-center text-center gap-3 p-5 pt-12">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 rounded-full bg-white p-1.5 shadow-xl border border-gold/30">
          {business.logo_url ? (
            <Image 
              src={business.logo_url} 
              alt="logo" 
              width={72} 
              height={72}
              className="size-[72px] shrink-0 rounded-full object-contain p-1" 
            />
          ) : (
            <span className="font-display grid size-[72px] shrink-0 place-items-center rounded-full bg-champagne text-xl tracking-widest text-ink">
              {(business.name || "1B").substring(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        
        <div className="w-full">
          <h3 className="font-serif text-[18px] font-bold leading-tight line-clamp-2 mb-1.5 uppercase tracking-wide text-ink">
            {business.name}
            {business.is_featured && <BadgeCheck className="inline-block ml-1.5 mb-0.5 size-[18px] shrink-0 text-gold" />}
          </h3>
          <p className="line-clamp-2 text-[13px] text-muted-foreground/90">
            {business.tagline || business.short_description}
          </p>
        </div>

        <p className="flex items-center justify-center gap-1 text-[13px] text-muted-foreground mt-1 w-full">
          <MapPin className="size-3.5 text-gold shrink-0" />
          <span className="truncate">{firstLocation} · {reviewsCount} đánh giá</span>
        </p>

        <div className="mt-auto flex flex-wrap justify-center gap-1.5 pt-3">
          {(business.services_list || business.services || []).slice(0, 3).map((s: any) => (
            <span
              key={s.name}
              className="rounded-full border border-gold/20 bg-champagne/30 px-3 py-1 text-[11px] text-ink"
            >
              {s.name}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
