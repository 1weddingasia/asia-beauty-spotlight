import React from 'react';
import { PartyVenue } from '@/types/party';

interface VenuePinProps {
  venue: PartyVenue;
  isSelected?: boolean;
  isDimmed?: boolean;
  onClick?: () => void;
}

const VIP_STAR_SVG = (
  <svg className="w-3.5 h-3.5 text-amber-600 fill-amber-500 shrink-0" viewBox="0 0 24 24">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

const PARTY_SVG = (
  <svg className="w-3 h-3 text-amber-700 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
  </svg>
);

/**
 * 🏷️ Rút gọn tên nhà hàng thông minh trên bản đồ:
 * Giúp người dùng nhận diện ngay thương hiệu (Quê Nhà, Dìn Ký, Quá Ngon, Sesan, Vườn Quê...)
 * mà không bị che khuất bản đồ.
 */
export function getShortVenueName(fullName: string): string {
  if (!fullName) return '';
  let s = fullName
    .replace(/^(Nhà\s+Hàng|Khu\s+Du\s+Lịch|Trung\s+Tâm\s+Hội\s+Nghị\s*(&|\+)?\s*Sảnh\s+Tiệc|Trung\s+Tâm|Ẩm\s+Thực|Hải\s+Sản)\s+/i, '')
    .trim();

  const parts = s.split(/\s*[-–]\s*/);
  if (parts.length > 1) {
    const mainBrand = parts[0].trim();
    const branch = parts[1].trim();

    if (mainBrand.includes('Quê Nhà') || mainBrand.includes('Hàng Dương') || mainBrand.includes('Adora')) {
      if (branch.includes('Quận 1') || branch.includes('Ngô Đức Kế')) return `${mainBrand} (Q.1)`;
      if (branch.includes('Quận 3') || branch.includes('Phạm Ngọc Thạch')) return `${mainBrand} (Q.3)`;
      if (branch.includes('Quận 7') || branch.includes('Đường 65')) return `${mainBrand} (Q.7)`;
      if (branch.includes('Quận 10') || branch.includes('Thành Thái')) return `${mainBrand} (Q.10)`;
      if (branch.includes('Quận 5') || branch.includes('Grand View')) return `${mainBrand} (Q.5)`;
    }
    return mainBrand;
  }
  return s;
}

export function VenuePin({ venue, isSelected, isDimmed, onClick }: VenuePinProps) {
  const isVip = venue.is_vip;
  const highlight = venue.party_deal_highlight;
  const priceFormatted = `${Math.round(venue.price_min / 1000)}k`;
  const shortName = getShortVenueName(venue.name);
  const logoUrl = venue.page_content?.logo_url;

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
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/95 text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-400/50 shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5 backdrop-blur-md">
          <svg className="w-2.5 h-2.5 text-amber-400 fill-amber-400 shrink-0" viewBox="0 0 24 24">
            <path d="M12 0l2.5 8.5L23 11l-8.5 2.5L12 22l-2.5-8.5L1 11l8.5-2.5z" />
          </svg>
          <span>{highlight}</span>
        </div>
      )}

      {/* Main Pin Pill (Warm Luxury Light) */}
      <div
        className={`venue-pin-pill flex items-center gap-1.5 px-2.5 py-1.5 rounded-full shadow-md transition-all ${
          isSelected
            ? 'bg-amber-600 border-2 border-yellow-300 text-white shadow-amber-950/30'
            : isVip
            ? 'bg-white border-2 border-amber-400 text-slate-900 shadow-amber-950/15 hover:border-amber-500'
            : 'bg-white border-2 border-amber-300 text-slate-900 shadow-amber-950/10 hover:border-amber-400'
        }`}
      >
        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${isSelected ? 'bg-white/20' : isVip ? 'bg-amber-100' : 'bg-amber-50'}`}>
          {logoUrl ? (
            <img src={logoUrl} alt={venue.name} className="w-full h-full object-cover" />
          ) : isVip ? (
            VIP_STAR_SVG
          ) : (
            PARTY_SVG
          )}
        </div>
        <div className="venue-pin-text flex flex-col text-left leading-none">
          <span
            className={`text-[11px] font-bold tracking-tight line-clamp-1 max-w-[115px] ${
              isSelected ? 'text-white' : 'text-slate-900'
            }`}
            title={venue.name}
          >
            {shortName}
          </span>
          <span
            className={`venue-pin-price text-[9px] font-semibold mt-0.5 ${
              isSelected ? 'text-yellow-200' : isVip ? 'text-amber-800' : 'text-amber-700'
            }`}
          >
            từ <strong>{priceFormatted}</strong>/người
          </span>
        </div>
      </div>

      {/* Pin Pointer Arrow */}
      <div
        className={`w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] mx-auto -mt-[1px] ${
          isSelected ? 'border-t-amber-600' : isVip ? 'border-t-amber-400' : 'border-t-amber-300'
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
  const shortName = getShortVenueName(venue.name);
  const logoUrl = venue.page_content?.logo_url;

  const escapeHtml = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const safeName = escapeHtml(shortName);
  const safeFullName = escapeHtml(venue.name);
  const safeHighlight = escapeHtml(highlight);

  // Logo or Star Icon
  const iconContent = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="${safeFullName}" class="w-full h-full object-cover rounded-full" />`
    : isVip
    ? `<svg class="w-3.5 h-3.5 text-amber-600 fill-amber-500 shrink-0" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`
    : `<svg class="w-3 h-3 text-amber-700 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>`;

  el.innerHTML = `
    <div class="venue-pin-inner relative group cursor-pointer transition-transform duration-200 select-none ${
      isDimmed ? 'opacity-30 scale-90' : 'opacity-100 scale-100 hover:scale-105'
    }">
      ${
        safeHighlight
          ? `<div class="venue-deal-badge absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/95 text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-400/50 shadow-xl pointer-events-none items-center gap-1.5 backdrop-blur-md transition-all">
              <svg class="w-2.5 h-2.5 text-amber-400 fill-amber-400 shrink-0" viewBox="0 0 24 24"><path d="M12 0l2.5 8.5L23 11l-8.5 2.5L12 22l-2.5-8.5L1 11l8.5-2.5z"/></svg>
              <span>${safeHighlight}</span>
             </div>`
          : ''
      }
      <div class="venue-pin-pill flex items-center gap-1.5 px-2.5 py-1.5 rounded-full shadow-md transition-all duration-200 ${
        isVip
          ? 'bg-white border-2 border-amber-400 text-slate-900 shadow-amber-950/15 hover:border-amber-500'
          : 'bg-white border-2 border-amber-300 text-slate-900 shadow-amber-950/10 hover:border-amber-400'
      }">
        <div class="w-4 h-4 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${isVip ? 'bg-amber-100' : 'bg-amber-50'}">
          ${iconContent}
        </div>
        <div class="venue-pin-text flex flex-col text-left leading-none">
          <span class="text-[11px] font-bold tracking-tight max-w-[115px] truncate text-slate-900" title="${safeFullName}">
            ${safeName}
          </span>
          <span class="venue-pin-price text-[9px] mt-0.5 text-amber-800 font-semibold">
            từ <strong>${priceFormatted}</strong>/người
          </span>
        </div>
      </div>
      <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] mx-auto -mt-[1px] ${
        isVip ? 'border-t-amber-400' : 'border-t-amber-300'
      }"></div>
    </div>
  `;

  el.addEventListener('click', (e) => {
    e.stopPropagation();
    onClick();
  });

  return el;
}
