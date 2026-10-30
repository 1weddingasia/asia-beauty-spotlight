'use client';

import React from 'react';
import Link from 'next/link';
import { PartyVenue, getPerkLabel } from '@/types/party';
import { MapPin, Users, Wine, Sparkles, ExternalLink, Map as MapIcon } from 'lucide-react';

interface VenueListViewProps {
  venues: PartyVenue[];
  onSelectOnMap: (venue: PartyVenue) => void;
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

export default function VenueListView({
  venues,
  onSelectOnMap,
  userLocation,
}: VenueListViewProps) {
  if (venues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 mb-4 text-2xl shadow-xs">
          🔍
        </div>
        <h3 className="text-lg font-black text-slate-900 mb-1">
          Chưa tìm thấy quán phù hợp
        </h3>
        <p className="text-xs text-slate-500 max-w-sm">
          Thử giảm số lượng khách hoặc mở rộng mức giá trong bộ lọc để khám phá thêm nhiều sảnh tiệc tất niên hấp dẫn.
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
          venue.party_banner_url ||
          banners[0] ||
          (typeof gallery[0] === 'string' ? gallery[0] : (gallery[0] as any)?.url) ||
          venue.page_content?.hero_image ||
          '/images/categories/nha-hang-am-thuc.jpg';

        const pMin = typeof venue.price_min === 'number' ? venue.price_min : Number(String(venue.price_min || '').replace(/[^\d]/g, '')) || 250000;
        const pMax = typeof venue.price_max === 'number' ? venue.price_max : Number(String(venue.price_max || '').replace(/[^\d]/g, '')) || 650000;
        const priceFormatted = `${pMin.toLocaleString('vi-VN')} - ${pMax.toLocaleString('vi-VN')} đ`;

        const coords = venue.map_coordinates;
        const distance =
          userLocation &&
          coords &&
          typeof coords.lat === 'number' &&
          typeof coords.lng === 'number'
            ? getDistanceKm(userLocation.lat, userLocation.lng, coords.lat, coords.lng)
            : null;

        return (
          <div
            key={venue.id}
            className={`flex flex-col rounded-2xl overflow-hidden bg-white border transition-all duration-200 hover:border-amber-400/80 hover:shadow-xl hover:shadow-amber-950/10 group text-left ${
              venue.is_vip ? 'border-amber-300/90 shadow-md shadow-amber-950/5' : 'border-slate-200/90 shadow-xs'
            }`}
          >
            {/* Image & Badges */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
              <img
                src={heroImage}
                alt={venue.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/categories/nha-hang-am-thuc.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

              {/* VIP Badge & Distance */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <div className="flex flex-wrap gap-1.5">
                  {venue.is_vip && (
                    <span className="flex items-center gap-1 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-md">
                      <Sparkles className="w-3 h-3" /> VIP VENUE
                    </span>
                  )}
                  {venue.num_vip_rooms > 0 && (
                    <span className="bg-white/95 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md shadow-xs">
                      {venue.num_vip_rooms} Phòng VIP
                    </span>
                  )}
                </div>

                {distance !== null && (
                  <span className="bg-blue-600 text-white border border-blue-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full backdrop-blur-md shadow-md">
                    📍 {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)} km`}
                  </span>
                )}
              </div>

              {/* Price badge */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <span className="text-xs font-black text-amber-300 bg-black/70 px-2.5 py-1 rounded-lg border border-amber-400/40 backdrop-blur-xs">
                  {priceFormatted}/người
                </span>
                <span className="text-[11px] font-semibold text-white bg-black/70 px-2 py-1 rounded-lg flex items-center gap-1 backdrop-blur-xs">
                  <Users className="w-3 h-3 text-amber-400" />
                  {venue.min_guests} - {venue.max_guests} khách
                </span>
              </div>
            </div>

            {/* Content (Warm Luxury Light) */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-1 mb-1">
                  {venue.name}
                </h3>

                {venue.address && (
                  <p className="flex items-center gap-1 text-xs text-slate-500 line-clamp-1 mb-2.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    {venue.address}
                  </p>
                )}

                {/* Highlight Deal */}
                {venue.party_deal_highlight && (
                  <div className="bg-amber-50/90 border border-amber-200 rounded-xl px-2.5 py-1.5 text-xs text-amber-900 font-bold mb-3 flex items-center gap-1.5 shadow-xs">
                    <span className="text-sm">🎁</span>
                    <span className="line-clamp-1">{venue.party_deal_highlight}</span>
                  </div>
                )}

                {/* Perks tags */}
                {venue.party_perks && venue.party_perks.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {venue.party_perks.slice(0, 3).map((p, idx) => {
                      const label = getPerkLabel(p);
                      return (
                        <span
                          key={idx}
                          className="bg-amber-50/60 text-slate-700 border border-amber-200/60 text-[10.5px] px-2 py-0.5 rounded-md font-medium"
                        >
                          ✓ {label}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={() => onSelectOnMap(venue)}
                  className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-slate-700 hover:text-amber-900 text-xs font-bold transition-all shrink-0 active:scale-95"
                >
                  <MapIcon className="w-3.5 h-3.5 text-amber-600" />
                  <span>Bản Đồ</span>
                </button>

                <Link
                  href={`/${venue.slug}/tiec`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-white text-xs font-black shadow-sm shadow-amber-900/15 transition-all active:scale-[0.98] text-center"
                >
                  <span>Xem Menu & Đặt Bàn</span>
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
