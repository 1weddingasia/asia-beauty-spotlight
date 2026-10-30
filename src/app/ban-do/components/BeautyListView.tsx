'use client';

import React from 'react';
import Link from 'next/link';
import { BeautyVenue } from '@/types/beauty';
import { MapPin, Sparkles, ExternalLink, Map as MapIcon, Star } from 'lucide-react';

interface BeautyListViewProps {
  venues: BeautyVenue[];
  onSelectOnMap: (venue: BeautyVenue) => void;
  userLocation?: { lat: number; lng: number } | null;
}

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function BeautyListView({
  venues,
  onSelectOnMap,
  userLocation,
}: BeautyListViewProps) {
  if (venues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700 mb-4 text-2xl shadow-xs">
          🌸
        </div>
        <h3 className="text-lg font-black text-slate-900 mb-1">
          Chưa tìm thấy cơ sở phù hợp
        </h3>
        <p className="text-xs text-slate-500 max-w-sm">
          Thử chọn lại quận huyện hoặc danh mục dịch vụ khác trong bộ lọc để khám phá thêm nhiều địa chỉ làm đẹp chất lượng.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 pb-28">
      {venues.map((venue) => {
        const banners = venue.page_content?.banners || [];
        const gallery = venue.page_content?.gallery || [];
        const heroImage =
          banners[0] ||
          (typeof gallery[0] === 'string' ? gallery[0] : (gallery[0] as any)?.url) ||
          venue.page_content?.hero_image ||
          '/images/categories/spa-thu-gian.jpg';

        const coords = venue.map_coordinates;
        const distance =
          userLocation &&
          coords &&
          typeof coords.lat === 'number' &&
          typeof coords.lng === 'number'
            ? getDistanceKm(userLocation.lat, userLocation.lng, coords.lat, coords.lng)
            : null;

        const priceDisplay = venue.price_min
          ? `Từ ${venue.price_min.toLocaleString('vi-VN')} đ`
          : 'Bảng giá niêm yết';

        return (
          <div
            key={venue.id}
            className={`flex flex-col rounded-2xl overflow-hidden bg-white border transition-all duration-200 hover:border-rose-400 hover:shadow-xl hover:shadow-rose-950/10 group text-left ${
              venue.is_vip ? 'border-rose-300 shadow-md shadow-rose-950/5' : 'border-slate-200/90 shadow-xs'
            }`}
          >
            {/* Image */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
              <img
                src={heroImage}
                alt={venue.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/categories/spa-thu-gian.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <div className="flex flex-wrap gap-1.5">
                  {venue.is_vip && (
                    <span className="flex items-center gap-1 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-md">
                      <Sparkles className="w-3 h-3" /> TOP PRESTIGE
                    </span>
                  )}
                  <span className="bg-white/95 text-rose-900 border border-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md shadow-xs flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
                    {venue.rating || '4.9'}
                  </span>
                </div>

                {distance !== null && (
                  <span className="bg-blue-600 text-white border border-blue-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full backdrop-blur-md shadow-md">
                    📍 {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)} km`}
                  </span>
                )}
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <span className="text-xs font-black text-rose-300 bg-black/70 px-2.5 py-1 rounded-lg border border-rose-400/40 backdrop-blur-xs">
                  {priceDisplay}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 group-hover:text-rose-700 transition-colors line-clamp-1 mb-1">
                  {venue.name}
                </h3>

                {venue.address && (
                  <p className="flex items-center gap-1 text-xs text-slate-500 line-clamp-1 mb-2.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    {venue.address}
                  </p>
                )}

                {venue.deal_highlight && (
                  <div className="bg-rose-50/90 border border-rose-200 rounded-xl px-2.5 py-1.5 text-xs text-rose-900 font-bold mb-3 flex items-center gap-1.5 shadow-xs">
                    <span className="text-sm">🎁</span>
                    <span className="line-clamp-1">{venue.deal_highlight}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={() => onSelectOnMap(venue)}
                  className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-slate-700 hover:text-rose-900 text-xs font-bold transition-all shrink-0 active:scale-95"
                >
                  <MapIcon className="w-3.5 h-3.5 text-rose-600" />
                  <span>Bản Đồ</span>
                </button>

                <Link
                  href={`/${venue.slug}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-black shadow-sm shadow-rose-900/15 transition-all active:scale-[0.98] text-center"
                >
                  <span>Xem Dịch Vụ &amp; Bảng Giá</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
