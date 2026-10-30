import React from 'react';
import { BeautyVenue } from '@/types/beauty';

interface BeautyPinProps {
  venue: BeautyVenue;
  isSelected?: boolean;
  isDimmed?: boolean;
  onClick?: () => void;
}

const CROWN_SVG = (
  <svg className="w-3.5 h-3.5 text-amber-600 fill-amber-500 shrink-0" viewBox="0 0 24 24">
    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
  </svg>
);

const SPARKLE_SVG = (
  <svg className="w-3 h-3 text-rose-500 fill-rose-500 shrink-0" viewBox="0 0 24 24">
    <path d="M12 0l2.5 8.5L23 11l-8.5 2.5L12 22l-2.5-8.5L1 11l8.5-2.5z" />
  </svg>
);

export function BeautyPin({ venue, isSelected, isDimmed, onClick }: BeautyPinProps) {
  const isVip = venue.is_vip;
  const highlight = venue.deal_highlight;
  const priceDisplay = venue.price_min
    ? `từ ${Math.round(venue.price_min / 1000)}k`
    : 'Đặt lịch 1-1';

  return (
    <div
      onClick={onClick}
      className={`relative group cursor-pointer transition-all duration-200 select-none ${
        isDimmed ? 'opacity-30 scale-90' : 'opacity-100 scale-100 hover:scale-105'
      } ${isSelected ? 'z-50 scale-110' : 'z-20'}`}
      style={{ willChange: 'transform' }}
    >
      {/* Tooltip Deal Highlight on hover */}
      {highlight && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/95 text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-rose-400/50 shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5 backdrop-blur-md">
          <svg className="w-2.5 h-2.5 text-yellow-300 fill-yellow-300 shrink-0" viewBox="0 0 24 24">
            <path d="M12 0l2.5 8.5L23 11l-8.5 2.5L12 22l-2.5-8.5L1 11l8.5-2.5z" />
          </svg>
          <span>{highlight}</span>
        </div>
      )}

      {/* Main Pin Pill (Warm Luxury Rose Gold / Pearl White) */}
      <div
        className={`venue-pin-pill flex items-center gap-1.5 px-2.5 py-1.5 rounded-full shadow-md transition-all ${
          isSelected
            ? 'bg-rose-600 border-2 border-yellow-300 text-white shadow-rose-950/30'
            : isVip
            ? 'bg-white border-2 border-amber-400 text-slate-900 shadow-amber-950/15 hover:border-amber-500'
            : 'bg-white border-2 border-rose-300 text-slate-900 shadow-rose-950/10 hover:border-rose-400'
        }`}
      >
        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${isSelected ? 'bg-white/20' : isVip ? 'bg-amber-50' : 'bg-rose-50'}`}>
          {isVip ? CROWN_SVG : SPARKLE_SVG}
        </div>
        <div className="venue-pin-text flex flex-col text-left leading-none">
          <span
            className={`text-[11px] font-bold tracking-tight line-clamp-1 max-w-[115px] ${
              isSelected ? 'text-white' : 'text-slate-900'
            }`}
          >
            {venue.name}
          </span>
          <span
            className={`venue-pin-price text-[9px] font-semibold mt-0.5 ${
              isSelected ? 'text-yellow-200' : isVip ? 'text-amber-700' : 'text-rose-600'
            }`}
          >
            {priceDisplay}
          </span>
        </div>
      </div>

      {/* Pin Pointer Arrow */}
      <div
        className={`w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] mx-auto -mt-[1px] ${
          isSelected ? 'border-t-rose-600' : isVip ? 'border-t-amber-400' : 'border-t-rose-300'
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
  el.className = 'venue-marker-container';

  const isVip = venue.is_vip;
  const highlight = venue.deal_highlight || '';
  const priceDisplay = venue.price_min
    ? `từ ${Math.round(venue.price_min / 1000)}k`
    : 'Đặt lịch 1-1';

  // Crisp Vector SVGs
  const iconSvg = isVip
    ? `<svg class="w-3.5 h-3.5 text-amber-600 fill-amber-500 shrink-0" viewBox="0 0 24 24"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>`
    : `<svg class="w-3 h-3 text-rose-500 fill-rose-500 shrink-0" viewBox="0 0 24 24"><path d="M12 0l2.5 8.5L23 11l-8.5 2.5L12 22l-2.5-8.5L1 11l8.5-2.5z"/></svg>`;

  const escapeHtml = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const safeName = escapeHtml(venue.name);
  const safeHighlight = escapeHtml(highlight);

  el.innerHTML = `
    <div class="beauty-pin-inner venue-pin-inner relative group cursor-pointer transition-transform duration-200 select-none ${
      isDimmed ? 'opacity-30 scale-90' : 'opacity-100 scale-100 hover:scale-105'
    }">
      ${
        safeHighlight
          ? `<div class="venue-deal-badge absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/95 text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-rose-400/50 shadow-xl pointer-events-none items-center gap-1.5 backdrop-blur-md transition-all">
              <svg class="w-2.5 h-2.5 text-yellow-300 fill-yellow-300 shrink-0" viewBox="0 0 24 24"><path d="M12 0l2.5 8.5L23 11l-8.5 2.5L12 22l-2.5-8.5L1 11l8.5-2.5z"/></svg>
              <span>${safeHighlight}</span>
             </div>`
          : ''
      }
      <div class="venue-pin-pill flex items-center gap-1.5 px-2.5 py-1.5 rounded-full shadow-md transition-all duration-200 ${
        isVip
          ? 'bg-white border-2 border-amber-400 text-slate-900 shadow-amber-950/15 hover:border-amber-500'
          : 'bg-white border-2 border-rose-300 text-slate-900 shadow-rose-950/10 hover:border-rose-400'
      }">
        <div class="w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${isVip ? 'bg-amber-50' : 'bg-rose-50'}">
          ${iconSvg}
        </div>
        <div class="venue-pin-text flex flex-col text-left leading-none">
          <span class="text-[11px] font-bold tracking-tight max-w-[115px] truncate text-slate-900">
            ${safeName}
          </span>
          <span class="venue-pin-price text-[9px] mt-0.5 font-semibold ${isVip ? 'text-amber-700' : 'text-rose-600'}">
            ${priceDisplay}
          </span>
        </div>
      </div>
      <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] mx-auto -mt-[1px] ${
        isVip ? 'border-t-amber-400' : 'border-t-rose-300'
      }"></div>
    </div>
  `;

  el.addEventListener('click', (e) => {
    e.stopPropagation();
    onClick();
  });

  return el;
}
