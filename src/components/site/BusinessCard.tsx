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
  const pc = dbBusiness.page_content || {};
  const business: any = { ...dbBusiness, ...pc };

  const firstCategory = business.categories_list?.[0]?.name || business.category_slug || "Làm đẹp";
  const firstLocation = business.locations_list?.[0]?.name || business.location_slug || "Việt Nam";
  const offer = business.offers && business.offers.length > 0 ? business.offers[0] : null;
  const rating = business.rating || 5.0;
  const reviewsCount = business.reviews || 0;

  const coverImage = (pc.banners || []).filter(Boolean)[0]
    || pc.hero_image
    || "https://images.pexels.com/photos/3997989/pexels-photo-3997989.jpeg?auto=compress&cs=tinysrgb&w=800";

  return (
    <Link
      href={`/uu-dai/${business.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-[oklch(0.92_0.012_85)] transition-all duration-500 hover:-translate-y-1.5"
      style={{ boxShadow: "0 4px 24px -8px oklch(0.35 0.05 70 / 0.15)" }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 48px -12px oklch(0.35 0.05 70 / 0.3)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px -8px oklch(0.35 0.05 70 / 0.15)";
      }}
    >
      {/* Cover image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={coverImage as string}
          alt={business.name || "Doanh nghiệp"}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Offer badge */}
        {offer && (
          <span className="absolute top-3 left-3 rounded-full px-3 py-1 text-[11px] font-semibold tracking-widest uppercase text-white"
            style={{ background: "linear-gradient(100deg, oklch(0.82 0.09 88), oklch(0.72 0.11 78))" }}
          >
            {offer.discount}
          </span>
        )}

        {/* Category + Rating row on image bottom */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
          <span className="text-[10px] font-semibold tracking-[0.18em] text-white/90 uppercase">
            {firstCategory}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-amber-600">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            {Number(rating).toFixed(1)}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="relative flex flex-1 flex-col px-5 pt-10 pb-5 gap-2">

        {/* Logo avatar — floated up */}
        <div className="absolute -top-7 left-5 size-14 rounded-xl overflow-hidden border-2 border-white bg-white"
          style={{ boxShadow: "0 4px 16px -4px oklch(0.35 0.05 70 / 0.25)" }}
        >
          {business.logo_url ? (
            <Image
              src={business.logo_url}
              alt="logo"
              width={56}
              height={56}
              className="size-full object-contain p-0.5"
            />
          ) : (
            <span className="flex size-full items-center justify-center bg-[oklch(0.955_0.024_88)] text-base font-bold tracking-tight text-[oklch(0.32_0.018_60)]">
              {(business.name || "1B").substring(0, 2).toUpperCase()}
            </span>
          )}
        </div>

        {/* Business name */}
        <h3 className="text-[15px] font-semibold leading-snug line-clamp-2 text-[oklch(0.18_0.012_60)] tracking-[-0.01em]">
          {business.name}
          {business.is_featured && (
            <BadgeCheck className="inline-block ml-1.5 mb-0.5 size-[15px] shrink-0 text-amber-500" />
          )}
        </h3>

        {/* Short desc */}
        <p className="line-clamp-2 text-[12.5px] leading-relaxed text-[oklch(0.52_0.02_70)]">
          {business.short_description}
        </p>

        {/* Location */}
        <p className="flex items-center gap-1 text-[12px] text-[oklch(0.6_0.03_75)] mt-0.5">
          <MapPin className="size-3 shrink-0 text-amber-500" />
          <span className="truncate">{firstLocation} · {reviewsCount} đánh giá</span>
        </p>

        {/* Service tags */}
        {(business.services_list || business.services || []).length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-2 border-t border-[oklch(0.94_0.01_85)]">
            {(business.services_list || business.services || []).slice(0, 3).map((s: any) => (
              <span
                key={s.name}
                className="rounded-full px-2.5 py-0.5 text-[11px] font-medium text-[oklch(0.38_0.04_75)]"
                style={{ background: "oklch(0.97 0.018 85)" }}
              >
                {s.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
