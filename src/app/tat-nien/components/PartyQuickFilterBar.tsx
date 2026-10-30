'use client';

import React from 'react';
import { PartyFilterState } from '@/types/party';
import {
  SlidersHorizontal,
  DoorClosed,
  Mic2,
  Trees,
  Building,
  Wine,
  Sparkles,
  RotateCcw,
  Users,
  BadgePercent,
  Check,
} from 'lucide-react';

interface PartyQuickFilterBarProps {
  filter: PartyFilterState;
  onFilterChange: (newFilter: PartyFilterState) => void;
  totalVenues: number;
  matchedCount: number;
  onOpenAdvancedModal: () => void;
}

export default function PartyQuickFilterBar({
  filter,
  onFilterChange,
  totalVenues,
  matchedCount,
  onOpenAdvancedModal,
}: PartyQuickFilterBarProps) {
  // Đếm tổng số lượng tiêu chí đang được áp dụng
  const activeCount =
    (filter.guests > 0 ? 1 : 0) +
    (filter.priceMax > 0 ? 1 : 0) +
    filter.spaces.length +
    filter.cuisines.length +
    filter.perks.length +
    (filter.onlyVip ? 1 : 0);

  // Toggle tiện ích không gian (spaces)
  const toggleSpace = (spaceId: string) => {
    const next = filter.spaces.includes(spaceId)
      ? filter.spaces.filter((s) => s !== spaceId)
      : [...filter.spaces, spaceId];
    onFilterChange({ ...filter, spaces: next });
  };

  // Toggle ưu đãi (perks)
  const togglePerk = (perkId: string) => {
    const next = filter.perks.includes(perkId)
      ? filter.perks.filter((p) => p !== perkId)
      : [...filter.perks, perkId];
    onFilterChange({ ...filter, perks: next });
  };

  // Chọn nhanh quy mô khách
  const handleSelectGuests = (guests: number) => {
    onFilterChange({ ...filter, guests: filter.guests === guests ? 0 : guests });
  };

  // Chọn nhanh mức giá
  const handleSelectPrice = (priceMax: number) => {
    onFilterChange({ ...filter, priceMax: filter.priceMax === priceMax ? 0 : priceMax });
  };

  // Reset toàn bộ bộ lọc
  const handleReset = () => {
    onFilterChange({
      guests: 0,
      priceMax: 0,
      spaces: [],
      cuisines: [],
      perks: [],
      onlyVip: false,
    });
  };

  return (
    <div className="relative z-20 bg-white/95 border-b border-amber-200/70 px-2.5 sm:px-3 py-1 sm:py-1.5 flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none overscroll-x-contain touch-pan-x backdrop-blur-md shadow-xs select-none">
      {/* 1. Nút mở Modal Bộ Lọc Chi Tiết */}
      <button
        type="button"
        onClick={onOpenAdvancedModal}
        className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold shrink-0 transition-all active:scale-95 border ${
          activeCount > 0
            ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
            : 'bg-amber-50 text-slate-800 border-amber-300 hover:bg-amber-100 hover:border-amber-400'
        }`}
        title="Mở tất cả tiêu chí tìm tiệc tất niên"
      >
        <SlidersHorizontal className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        <span>Bộ lọc</span>
        {activeCount > 0 && (
          <span className="w-3.5 h-3.5 rounded-full bg-white text-amber-700 text-[9.5px] font-black flex items-center justify-center ml-0.5">
            {activeCount}
          </span>
        )}
      </button>

      <div className="h-3.5 w-px bg-amber-200/70 shrink-0 mx-0.5" />

      {/* 2. Tiêu chí 1-chạm: Phòng VIP riêng */}
      <button
        type="button"
        onClick={() => toggleSpace('phong_vip')}
        className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold shrink-0 transition-all active:scale-95 border ${
          filter.spaces.includes('phong_vip')
            ? 'bg-amber-600 text-white font-bold border-amber-600 shadow-xs'
            : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:text-amber-800 hover:bg-amber-50/50'
        }`}
      >
        <DoorClosed className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        <span>Phòng VIP</span>
        {filter.spaces.includes('phong_vip') && <Check className="w-2.5 h-2.5 ml-0.5 stroke-[3]" />}
      </button>

      {/* 3. Tiêu chí 1-chạm: Dàn Karaoke */}
      <button
        type="button"
        onClick={() => toggleSpace('karaoke')}
        className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold shrink-0 transition-all active:scale-95 border ${
          filter.spaces.includes('karaoke')
            ? 'bg-amber-600 text-white font-bold border-amber-600 shadow-xs'
            : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:text-amber-800 hover:bg-amber-50/50'
        }`}
      >
        <Mic2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        <span>Dàn Karaoke</span>
        {filter.spaces.includes('karaoke') && <Check className="w-2.5 h-2.5 ml-0.5 stroke-[3]" />}
      </button>

      {/* 4. Tiêu chí 1-chạm: Sân vườn / Ngoài trời */}
      <button
        type="button"
        onClick={() => toggleSpace('ngoai_troi')}
        className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold shrink-0 transition-all active:scale-95 border ${
          filter.spaces.includes('ngoai_troi')
            ? 'bg-amber-600 text-white font-bold border-amber-600 shadow-xs'
            : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:text-amber-800 hover:bg-amber-50/50'
        }`}
      >
        <Trees className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        <span>Sân vườn</span>
        {filter.spaces.includes('ngoai_troi') && <Check className="w-2.5 h-2.5 ml-0.5 stroke-[3]" />}
      </button>

      {/* 5. Tiêu chí 1-chạm: Rooftop ngắm cảnh */}
      <button
        type="button"
        onClick={() => toggleSpace('rooftop')}
        className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold shrink-0 transition-all active:scale-95 border ${
          filter.spaces.includes('rooftop')
            ? 'bg-amber-600 text-white font-bold border-amber-600 shadow-xs'
            : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:text-amber-800 hover:bg-amber-50/50'
        }`}
      >
        <Building className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        <span>Rooftop</span>
        {filter.spaces.includes('rooftop') && <Check className="w-2.5 h-2.5 ml-0.5 stroke-[3]" />}
      </button>

      {/* 6. Tiêu chí 1-chạm: Ưu đãi Tặng Bia tiệc */}
      <button
        type="button"
        onClick={() => togglePerk('tang_bia')}
        className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold shrink-0 transition-all active:scale-95 border ${
          filter.perks.includes('tang_bia')
            ? 'bg-rose-600 text-white font-bold border-rose-600 shadow-xs'
            : 'bg-white text-rose-700 border-rose-200 hover:border-rose-300 hover:bg-rose-50/50'
        }`}
        title="Lọc các quán có ưu đãi tặng bia hoặc nước ngọt"
      >
        <Wine className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-500" />
        <span>Tặng bia</span>
        {filter.perks.includes('tang_bia') && <Check className="w-2.5 h-2.5 ml-0.5 stroke-[3]" />}
      </button>

      <div className="h-3.5 w-px bg-amber-200/70 shrink-0 mx-0.5" />

      {/* 7. Tiêu chí Quy mô khách */}
      <button
        type="button"
        onClick={() => handleSelectGuests(20)}
        className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold shrink-0 transition-all active:scale-95 border ${
          filter.guests === 20
            ? 'bg-amber-600 text-white font-bold border-amber-600 shadow-xs'
            : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:text-amber-800 hover:bg-amber-50/50'
        }`}
      >
        <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        <span>≥ 20 khách</span>
      </button>

      <button
        type="button"
        onClick={() => handleSelectGuests(50)}
        className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold shrink-0 transition-all active:scale-95 border ${
          filter.guests === 50
            ? 'bg-amber-600 text-white font-bold border-amber-600 shadow-xs'
            : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:text-amber-800 hover:bg-amber-50/50'
        }`}
      >
        <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        <span>≥ 50 khách</span>
      </button>

      <button
        type="button"
        onClick={() => handleSelectGuests(100)}
        className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold shrink-0 transition-all active:scale-95 border ${
          filter.guests === 100
            ? 'bg-amber-600 text-white font-bold border-amber-600 shadow-xs'
            : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:text-amber-800 hover:bg-amber-50/50'
        }`}
      >
        <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        <span>≥ 100 khách</span>
      </button>

      <div className="h-3.5 w-px bg-amber-200/70 shrink-0 mx-0.5" />

      {/* 8. Tiêu chí Mức giá */}
      <button
        type="button"
        onClick={() => handleSelectPrice(350000)}
        className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold shrink-0 transition-all active:scale-95 border ${
          filter.priceMax === 350000
            ? 'bg-amber-600 text-white font-bold border-amber-600 shadow-xs'
            : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:text-amber-800 hover:bg-amber-50/50'
        }`}
      >
        <BadgePercent className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        <span>≤ 350k/khách</span>
      </button>

      <button
        type="button"
        onClick={() => handleSelectPrice(600000)}
        className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold shrink-0 transition-all active:scale-95 border ${
          filter.priceMax === 600000
            ? 'bg-amber-600 text-white font-bold border-amber-600 shadow-xs'
            : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:text-amber-800 hover:bg-amber-50/50'
        }`}
      >
        <BadgePercent className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        <span>≤ 600k/khách</span>
      </button>

      {/* 9. Nút Đặt lại khi có bộ lọc hoạt động */}
      {activeCount > 0 && (
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold shrink-0 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-300 hover:border-rose-300 transition-all active:scale-95 ml-auto"
          title="Xóa tất cả bộ lọc"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Đặt lại</span>
        </button>
      )}

      {/* 10. Đếm số lượng quán phù hợp */}
      <div className="shrink-0 text-[10.5px] sm:text-[11px] font-bold text-slate-500 pl-1 whitespace-nowrap">
        {matchedCount === totalVenues ? (
          <span>{totalVenues} điểm tiệc</span>
        ) : (
          <span className="text-amber-700 font-black">
            {matchedCount}/{totalVenues} điểm tiệc
          </span>
        )}
      </div>
    </div>
  );
}
