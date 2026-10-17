'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { PartyVenue, PartyFilterState } from '@/types/party';
import VenueBottomSheet from './components/VenueBottomSheet';
import PartyFilterWidget from './components/PartyFilterWidget';
import VenueListView from './components/VenueListView';
import { Map as MapIcon, List as ListIcon, Sparkles, ChevronLeft } from 'lucide-react';

// Lazy load MapView với dynamic ssr: false
const MapView = dynamic(() => import('./components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-amber-400 gap-3">
      <div className="w-9 h-9 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-bold tracking-widest text-amber-300 uppercase">
        Đang khởi tạo Bản đồ 2.5D...
      </span>
    </div>
  ),
});

interface TatNienClientProps {
  initialVenues: PartyVenue[];
}

export default function TatNienClient({ initialVenues }: TatNienClientProps) {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedVenue, setSelectedVenue] = useState<PartyVenue | null>(null);

  // Bộ lọc Client-side
  const [filter, setFilter] = useState<PartyFilterState>({
    guests: 0,
    priceMax: 0,
    spaces: [],
    cuisines: [],
    perks: [],
    onlyVip: false,
  });

  // ⚡ TỐI ƯU 0MS: Lọc trực tiếp trên React State qua useMemo (không chờ mạng)
  const filteredVenues = useMemo(() => {
    return initialVenues.filter((v) => {
      // 1. Số lượng khách
      if (filter.guests > 0 && v.max_guests < filter.guests) return false;

      // 2. Mức giá
      if (filter.priceMax > 0 && v.price_min > filter.priceMax) return false;

      // 3. Chỉ quán VIP
      if (filter.onlyVip && !v.is_vip) return false;

      // 4. Tiện ích & Không gian
      if (filter.spaces.length > 0) {
        const hasAllSpaces = filter.spaces.every((s) =>
          v.spaces_and_amenities.includes(s)
        );
        if (!hasAllSpaces) return false;
      }

      // 5. Phong cách ẩm thực
      if (filter.cuisines.length > 0) {
        const hasAnyCuisine = filter.cuisines.some((c) =>
          v.cuisines.includes(c)
        );
        if (!hasAnyCuisine) return false;
      }

      return true;
    });
  }, [initialVenues, filter]);

  // Set ID để MapView highlight/dim markers
  const filteredVenueIds = useMemo(() => {
    return new Set(filteredVenues.map((v) => v.id));
  }, [filteredVenues]);

  // Khi bấm từ List sang xem trên Map
  const handleSelectOnMap = (venue: PartyVenue) => {
    setSelectedVenue(venue);
    setViewMode('map');
  };

  return (
    // ⚠️ BẮT BUỘC THEO CHỈ DẪN KỸ THUẬT:
    // Dùng h-[100dvh] để thích nghi với Zalo/Facebook Webview, tuyệt đối không dùng 100vh cứng
    <div className="relative w-full h-[100dvh] overflow-hidden bg-slate-950 flex flex-col select-none">
      {/* 1. Header Festive Bar */}
      <header className="relative z-30 flex items-center justify-between px-3.5 py-2.5 bg-zinc-950/90 border-b border-amber-500/20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white hover:border-amber-400 transition-colors shrink-0"
            title="Về trang chủ"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>

          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white flex items-center gap-1">
                <span className="text-amber-400">PHỐ TIỆC</span>
                <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">
                  TẤT NIÊN 2026
                </span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-rose-950 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold">
                <Sparkles className="w-2.5 h-2.5" /> YEAR-END PARTY
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 hidden xs:block">
              Bản đồ 2.5D khám phá nhà hàng tiệc VIP, phòng riêng & ưu đãi độc quyền
            </p>
          </div>
        </div>

        {/* Dual View Mode Toggle */}
        <div className="flex items-center gap-1.5 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'map'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-950'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bản Đồ</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'list'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-950'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ListIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Danh Sách ({filteredVenues.length})</span>
          </button>
        </div>
      </header>

      {/* 2. Main Content View Area */}
      <main className="relative flex-1 w-full overflow-hidden">
        {viewMode === 'map' ? (
          <MapView
            venues={initialVenues}
            filteredVenueIds={filteredVenueIds}
            selectedVenue={selectedVenue}
            onSelectVenue={setSelectedVenue}
          />
        ) : (
          <div className="w-full h-full overflow-y-auto">
            <VenueListView
              venues={filteredVenues}
              onSelectOnMap={handleSelectOnMap}
            />
          </div>
        )}

        {/* 3. Floating Bottom Controls: Filter Widget */}
        <div className="absolute bottom-5 inset-x-0 z-30 flex justify-center pointer-events-none px-4">
          <div className="pointer-events-auto">
            <PartyFilterWidget
              filter={filter}
              onFilterChange={setFilter}
              totalVenues={initialVenues.length}
              matchedCount={filteredVenues.length}
            />
          </div>
        </div>
      </main>

      {/* 4. Bottom Sheet Details when selecting a venue */}
      <VenueBottomSheet
        venue={selectedVenue}
        onClose={() => setSelectedVenue(null)}
      />
    </div>
  );
}
