import React from 'react';
import { BeautyVenue } from '@/types/beauty';

interface BeautyPinProps {
  venue: BeautyVenue;
  isSelected?: boolean;
  isDimmed?: boolean;
  onClick?: () => void;
}

export function BeautyPin({ venue, isSelected, isDimmed, onClick }: BeautyPinProps) {
  const isVip = venue.is_vip;
  const highlight = venue.deal_highlight;
  const priceDisplay = venue.price_min
    ? `từ ${Math.round(venue.price_min / 1000)}k`
    : 'Đặt lịch 1-1';

  return (
    <div
      onClick={onClick}
      className={`relative group cursor-pointer transition-all duration-300 select-none ${
        isDimmed ? 'opacity-30 scale-90' : 'opacity-100 scale-100 hover:scale-110'
      } ${isSelected ? 'z-50 scale-110' : 'z-20'}`}
      style={{ willChange: 'transform' }}
    >
      {/* Tooltip Deal Highlight on hover */}
      {highlight && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gradient-to-r from-rose-600 to-pink-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-rose-200 shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          ✨ {highlight}
        </div>
      )}

      {/* Main Pin Pill (Warm Luxury Rose Gold) */}
      <div
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full shadow-lg transition-all ${
          isSelected
            ? 'bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 border-2 border-yellow-200 text-white shadow-rose-900/30'
            : isVip
            ? 'bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 border-2 border-rose-500 text-rose-950 shadow-rose-900/20'
            : 'bg-white/95 border-2 border-rose-400 text-slate-900 hover:border-rose-500 hover:bg-rose-50/50 shadow-black/10'
        }`}
      >
        <span className="text-rose-500 text-xs font-black">
          {isVip ? '👑' : '🌸'}
        </span>
        <div className="flex flex-col text-left leading-none">
          <span
            className={`text-xs font-black tracking-tight line-clamp-1 max-w-[125px] ${
              isSelected ? 'text-white' : isVip ? 'text-rose-950' : 'text-slate-900'
            }`}
          >
            {venue.name}
          </span>
          <span
            className={`text-[9.5px] font-semibold mt-0.5 ${
              isSelected ? 'text-rose-100' : isVip ? 'text-rose-700' : 'text-slate-500'
            }`}
          >
            <strong
              className={`font-bold ${
                isSelected ? 'text-yellow-200' : isVip ? 'text-rose-600' : 'text-rose-600'
              }`}
            >
              {priceDisplay}
            </strong>
          </span>
        </div>
      </div>

      {/* Pin Pointer Arrow */}
      <div
        className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px] mx-auto -mt-[1px] ${
          isSelected ? 'border-t-rose-600' : isVip ? 'border-t-rose-500' : 'border-t-rose-400'
        }`}
      />
    </div>
  );
}

// Helper to generate HTML string for MapLibre Marker element
export function createBeautyPinElement(
  venue: BeautyVenue,
  isDimmed: boolean,
  onClick: () => void
): HTMLElement {
  const el = document.createElement('div');
  el.className = 'beauty-marker-container';

  const isVip = venue.is_vip;
  const highlight = venue.deal_highlight || '';
  const priceDisplay = venue.price_min
    ? `từ ${Math.round(venue.price_min / 1000)}k`
    : 'Đặt lịch 1-1';

  el.innerHTML = `
    <div class="beauty-pin-inner relative group cursor-pointer transition-all duration-300 ${
      isDimmed ? 'opacity-30 scale-90' : 'opacity-100 scale-100 hover:scale-110'
    }">
      ${
        highlight
          ? `<div class="beauty-deal-badge absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gradient-to-r from-rose-600 to-pink-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200 shadow-md transition-all duration-200">
              ✨ ${highlight}
             </div>`
          : ''
      }
      <div class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full shadow-lg ${
        isVip
          ? 'bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 border-2 border-rose-500 text-rose-950 shadow-rose-900/20'
          : 'bg-white/95 border-2 border-rose-400 text-slate-900 shadow-black/10 hover:border-rose-500 hover:bg-rose-50'
      }">
        <span class="text-rose-500 text-xs font-black">${isVip ? '👑' : '🌸'}</span>
        <div class="flex flex-col text-left leading-none">
          <span class="text-[11px] font-black tracking-tight max-w-[130px] truncate ${
            isVip ? 'text-rose-950' : 'text-slate-900'
          }">
            ${venue.name}
          </span>
          <span class="text-[9.5px] mt-0.5 ${isVip ? 'text-rose-700' : 'text-slate-500'} font-semibold">
            <strong class="text-rose-600 font-bold">${priceDisplay}</strong>
          </span>
        </div>
      </div>
      <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px] mx-auto -mt-[1px] ${
        isVip ? 'border-t-rose-500' : 'border-t-rose-400'
      }"></div>
    </div>
  `;

  el.addEventListener('click', (e) => {
    e.stopPropagation();
    onClick();
  });

  return el;
}
