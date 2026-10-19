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
      } ${isSelected ? 'z-50 scale-115' : 'z-20'}`}
      style={{ willChange: 'transform' }}
    >
      {/* Tooltip Deal Highlight on hover */}
      {highlight && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/90 text-amber-300 text-[11px] font-medium px-2 py-0.5 rounded-full border border-amber-500/40 shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          🎁 {highlight}
        </div>
      )}

      {/* Main Pin Pill */}
      <div
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full shadow-2xl transition-all ${
          isVip
            ? 'bg-gradient-to-r from-amber-950 via-zinc-900 to-amber-950 border-2 border-amber-400 text-amber-200 vip-pin-glow'
            : isSelected
            ? 'bg-rose-950 border-2 border-rose-400 text-white shadow-rose-900/50'
            : 'bg-zinc-900/95 border border-zinc-700 text-zinc-100 hover:border-amber-400/80 hover:bg-zinc-800'
        }`}
      >
        {isVip && (
          <span className="text-amber-400 text-xs animate-bounce font-bold">★</span>
        )}
        <div className="flex flex-col text-left leading-none">
          <span className="text-xs font-bold tracking-tight line-clamp-1 max-w-[120px]">
            {venue.name}
          </span>
          <span className="text-[10px] text-zinc-400 font-medium">
            từ <strong className="text-amber-300">{priceFormatted}</strong>/người
          </span>
        </div>
      </div>

      {/* Pin Pointer Arrow */}
      <div
        className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px] mx-auto -mt-[1px] ${
          isVip ? 'border-t-amber-400' : isSelected ? 'border-t-rose-400' : 'border-t-zinc-700'
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
          ? `<div class="venue-deal-badge absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/95 text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-500/50 shadow-md transition-all duration-200">
              🎁 ${highlight}
             </div>`
          : ''
      }
      <div class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full shadow-2xl ${
        isVip
          ? 'bg-gradient-to-r from-amber-950 via-zinc-900 to-amber-950 border-2 border-amber-400 text-amber-200 vip-pin-glow'
          : 'bg-zinc-900/95 border border-zinc-600 text-zinc-100 hover:border-amber-400'
      }">
        ${isVip ? `<span class="text-amber-400 text-xs font-bold">★</span>` : ''}
        <div class="flex flex-col text-left leading-none">
          <span class="text-[11px] font-bold tracking-tight max-w-[130px] truncate text-white">
            ${venue.name}
          </span>
          <span class="text-[9px] text-zinc-400 font-medium">
            từ <strong class="text-amber-300">${priceFormatted}</strong>/người
          </span>
        </div>
      </div>
      <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px] mx-auto -mt-[1px] ${
        isVip ? 'border-t-amber-400' : 'border-t-zinc-600'
      }"></div>
    </div>
  `;

  el.addEventListener('click', (e) => {
    e.stopPropagation();
    onClick();
  });

  return el;
}
