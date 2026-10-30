import React from 'react';
import { PartyVenue } from '@/types/party';

interface VenuePinProps {
  venue: PartyVenue;
  isSelected?: boolean;
  isDimmed?: boolean;
  onClick?: () => void;
}

export function VenuePin({ venue, isSelected, isDimmed, onClick }: VenuePinProps) {
  const isVip = venue.is_vip;
  const highlight = venue.party_deal_highlight;
  const priceFormatted = `${Math.round(venue.price_min / 1000)}k`;

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
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gradient-to-r from-amber-600 to-rose-600 text-white text-[10.5px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200 shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          🎁 {highlight}
        </div>
      )}

      {/* Main Pin Pill (Warm Luxury Light) */}
      <div
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full shadow-lg transition-all ${
          isSelected
            ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 border-2 border-yellow-200 text-white shadow-rose-900/30'
            : isVip
            ? 'bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100 border-2 border-amber-500 text-amber-950 vip-pin-glow shadow-amber-900/20'
            : 'bg-white/95 border-2 border-amber-500/80 text-slate-900 hover:border-amber-600 hover:bg-amber-50/50 shadow-black/10'
        }`}
      >
        {isVip && (
          <span className="text-amber-600 text-xs animate-bounce font-black">★</span>
        )}
        <div className="flex flex-col text-left leading-none">
          <span
            className={`text-xs font-black tracking-tight line-clamp-1 max-w-[125px] ${
              isSelected ? 'text-white' : isVip ? 'text-amber-950' : 'text-slate-900'
            }`}
          >
            {venue.name}
          </span>
          <span
            className={`text-[10px] font-medium mt-0.5 ${
              isSelected ? 'text-rose-100' : isVip ? 'text-amber-800' : 'text-slate-500'
            }`}
          >
            từ{' '}
            <strong
              className={`font-bold ${
                isSelected ? 'text-yellow-200' : isVip ? 'text-red-600' : 'text-amber-700'
              }`}
            >
              {priceFormatted}
            </strong>
            /người
          </span>
        </div>
      </div>

      {/* Pin Pointer Arrow */}
      <div
        className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px] mx-auto -mt-[1px] ${
          isSelected ? 'border-t-red-600' : isVip ? 'border-t-amber-500' : 'border-t-amber-600'
        }`}
      />
    </div>
  );
}

// Helper to generate HTML string for MapLibre Marker element
export function createPinElement(
  venue: PartyVenue,
  isDimmed: boolean,
  onClick: () => void
): HTMLElement {
  const el = document.createElement('div');
  el.className = 'venue-marker-container';

  const isVip = venue.is_vip;
  const highlight = venue.party_deal_highlight || '';
  const priceFormatted = `${Math.round(venue.price_min / 1000)}k`;

  el.innerHTML = `
    <div class="venue-pin-inner relative group cursor-pointer transition-all duration-300 ${
      isDimmed ? 'opacity-30 scale-90' : 'opacity-100 scale-100 hover:scale-110'
    }">
      ${
        highlight
          ? `<div class="venue-deal-badge absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gradient-to-r from-amber-600 to-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 shadow-md transition-all duration-200">
              🎁 ${highlight}
             </div>`
          : ''
      }
      <div class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full shadow-lg ${
        isVip
          ? 'bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100 border-2 border-amber-500 text-amber-950 shadow-amber-900/20 vip-pin-glow'
          : 'bg-white/95 border-2 border-amber-500/80 text-slate-900 shadow-black/10 hover:border-amber-600 hover:bg-amber-50'
      }">
        ${isVip ? `<span class="text-amber-600 text-xs font-black">★</span>` : ''}
        <div class="flex flex-col text-left leading-none">
          <span class="text-[11px] font-black tracking-tight max-w-[130px] truncate ${
            isVip ? 'text-amber-950' : 'text-slate-900'
          }">
            ${venue.name}
          </span>
          <span class="text-[9.5px] mt-0.5 ${isVip ? 'text-amber-800' : 'text-slate-500'} font-medium">
            từ <strong class="${isVip ? 'text-red-600' : 'text-amber-700'} font-bold">${priceFormatted}</strong>/người
          </span>
        </div>
      </div>
      <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px] mx-auto -mt-[1px] ${
        isVip ? 'border-t-amber-500' : 'border-t-amber-600'
      }"></div>
    </div>
  `;

  el.addEventListener('click', (e) => {
    e.stopPropagation();
    onClick();
  });

  return el;
}
