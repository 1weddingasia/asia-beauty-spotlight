'use client';

import React from 'react';
import Link from 'next/link';
import { PartyVenue, PARTY_SPACES, PARTY_PERKS } from '@/types/party';
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
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 text-2xl">
          🔍
        </div>
        <h3 className="text-lg font-bold text-white mb-1">
          Chưa tìm thấy quán phù hợp
        </h3>
        <p className="text-xs text-zinc-400 max-w-sm">
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

        const priceFormatted = `${venue.price_min?.toLocaleString('vi-VN')} - ${venue.price_max?.toLocaleString('vi-VN')} đ`;

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
            className={`flex flex-col rounded-2xl overflow-hidden bg-zinc-900/90 border transition-all duration-200 hover:border-amber-400/60 hover:shadow-xl hover:shadow-black/60 group text-left ${
              venue.is_vip ? 'border-amber-500/40' : 'border-zinc-800'
            }`}
          >
            {/* Image & Badges */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-950">
              <img
                src={heroImage}
                alt={venue.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/categories/nha-hang-am-thuc.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

              {/* VIP Badge & Distance */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <div className="flex flex-wrap gap-1.5">
                  {venue.is_vip && (
                    <span className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-700 text-black font-extrabold text-[10px] px-2.5 py-0.5 rounded-full shadow-md vip-pin-glow">
                      <Sparkles className="w-3 h-3" /> VIP VENUE
                    </span>
                  )}
                  {venue.num_vip_rooms > 0 && (
                    <span className="bg-zinc-950/80 text-amber-300 border border-amber-500/30 text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-md">
                      {venue.num_vip_rooms} Phòng VIP
                    </span>
                  )}
                </div>

                {distance !== null && (
                  <span className="bg-blue-950/90 text-blue-300 border border-blue-500/50 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full backdrop-blur-md shadow-md shadow-blue-950">
                    📍 {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)} km`}
                  </span>
                )}
              </div>

              {/* Price badge */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 bg-black/80 px-2.5 py-1 rounded-lg border border-amber-500/30">
                  {priceFormatted}/người
                </span>
                <span className="text-[11px] font-semibold text-zinc-300 bg-black/80 px-2 py-1 rounded-lg flex items-center gap-1">
                  <Users className="w-3 h-3 text-amber-400" />
                  {venue.min_guests} - {venue.max_guests} khách
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1 mb-1">
                  {venue.name}
                </h3>

                {venue.address && (
                  <p className="flex items-center gap-1 text-xs text-zinc-400 line-clamp-1 mb-2.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    {venue.address}
                  </p>
                )}

                {/* Highlight Deal */}
                {venue.party_deal_highlight && (
                  <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl px-2.5 py-1.5 text-xs text-amber-200 font-medium mb-3 flex items-center gap-1.5">
                    <span className="text-sm">🎁</span>
                    <span className="line-clamp-1">{venue.party_deal_highlight}</span>
                  </div>
                )}

                {/* Perks tags */}
                {venue.party_perks && venue.party_perks.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {venue.party_perks.slice(0, 3).map((p, idx) => {
                      const label = PARTY_PERKS.find((item) => item.id === p)?.label || p;
                      return (
                        <span
                          key={idx}
                          className="bg-zinc-800 text-zinc-300 text-[10px] px-2 py-0.5 rounded-md"
                        >
                          ✓ {label}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-zinc-800/80 mt-2">
                <button
                  type="button"
                  onClick={() => onSelectOnMap(venue)}
                  className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all shrink-0 active:scale-95"
                >
                  <MapIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Bản Đồ</span>
                </button>

                <Link
                  href={`/${venue.slug}/tiec`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-extrabold shadow-md transition-all active:scale-[0.98] text-center"
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
