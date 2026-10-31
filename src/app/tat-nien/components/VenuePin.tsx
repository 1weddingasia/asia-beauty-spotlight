import React from 'react';
import { PartyVenue } from '@/types/party';

interface VenuePinProps {
  venue: PartyVenue;
  isSelected?: boolean;
  isDimmed?: boolean;
  onClick?: () => void;
}

/**
 * 🏷️ Hệ thống Icon nhận diện theo loại hình tiệc & phong cách quán:
 * Giúp người dùng lướt nhanh trên bản đồ là phân biệt ngay:
 * - 👑 Trung tâm hội nghị / Sảnh tiệc lớn (White Palace, Gala Center, Diamond Place, The Adora)
 * - 🦞 Hải sản & Hầm rượu VIP (Sesan, Sepia, Rạn Biển, Hàng Dương, NS Bến Thuyền, Dìn Ký, Ngọc Sương, Quá Ngon)
 * - 🌿 Sân vườn & Sinh thái ven sông (Bình Quới, Tân Cảng, Vườn Quê, Vườn Phố, Thoáng Việt, Đông Hồ, Cù Lao Xanh)
 * - 🍲 Ẩm thực cổ truyền & Cơm Niêu (Quê Nhà, Cơm Niêu Sài Gòn, Làng Nướng Nam Bộ, Hai Lúa)
 */
export function getVenueIconData(venue: PartyVenue): { svg: string; bgClass: string; label: string } {
  const type = venue.page_content?.venue_type || '';
  const name = venue.name || '';

  // 1. Sảnh tiệc / Trung tâm hội nghị 5 sao
  if (
    type === 'banquet_grand' ||
    name.includes('Palace') ||
    name.includes('Adora') ||
    name.includes('Diamond') ||
    name.includes('Gala') ||
    name.includes('Metropole') ||
    name.includes('Asiana') ||
    name.includes('Capella') ||
    name.includes('Đệ Nhất') ||
    name.includes('First Hotel') ||
    name.includes('Én')
  ) {
    return {
      label: 'Sảnh tiệc lớn',
      bgClass: 'bg-gradient-to-br from-amber-500 to-yellow-600 text-white shadow-amber-900/20',
      svg: `<svg class="w-3 h-3 text-white fill-white shrink-0" viewBox="0 0 24 24"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>`,
    };
  }

  // 2. Hải sản & Hầm rượu tiệc / Bia thủ công
  if (
    type === 'seafood_party' ||
    name.includes('Hải Sản') ||
    name.includes('Sesan') ||
    name.includes('Sepia') ||
    name.includes('Rạn Biển') ||
    name.includes('Hàng Dương') ||
    name.includes('Bến Thuyền') ||
    name.includes('Ngọc Sương') ||
    name.includes('Dìn Ký') ||
    name.includes('Quá Ngon') ||
    name.includes('Phố 79') ||
    name.includes('Hoa Viên')
  ) {
    return {
      label: 'Hải sản & Tiệc VIP',
      bgClass: 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-blue-900/20',
      svg: `<svg class="w-3 h-3 text-white fill-white shrink-0" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5zm4 4h-2v-2h2v2zm0-4h-2V7h2v5z"/></svg>`,
    };
  }

  // 3. Sân vườn sinh thái & Ven sông
  if (
    type === 'garden_party' ||
    name.includes('Vườn') ||
    name.includes('Bình Quới') ||
    name.includes('Tân Cảng') ||
    name.includes('Cù Lao') ||
    name.includes('Thoáng Việt') ||
    name.includes('Đông Hồ') ||
    name.includes('Chay Garden')
  ) {
    return {
      label: 'Sân vườn sinh thái',
      bgClass: 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-emerald-900/20',
      svg: `<svg class="w-3 h-3 text-white shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-7l-2-2"/><path d="M17 8a5 5 0 0 0-10 0c0 2.76 2.24 5 5 5s5-2.24 5-5z"/></svg>`,
    };
  }

  // 4. Ẩm thực truyền thống / Cơm Niêu
  return {
    label: 'Ẩm thực truyền thống',
    bgClass: 'bg-gradient-to-br from-amber-600 to-orange-700 text-white shadow-orange-900/20',
    svg: `<svg class="w-3 h-3 text-white fill-white shrink-0" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`,
  };
}

/**
 * 🏷️ Rút gọn tên nhà hàng thông minh trên bản đồ:
 * Giúp người dùng nhận diện ngay thương hiệu (Quê Nhà, Dìn Ký, Quá Ngon, Sesan, Vườn Quê...)
 * mà không bị che khuất bản đồ.
 */
export function getShortVenueName(fullName: string): string {
  if (!fullName) return '';
  let s = fullName
    .replace(/^(Nhà\s+Hàng|Khu\s+Du\s+Lịch|Trung\s+Tâm\s+Hội\s+Nghị\s*(&|\+)?\s*(Tiệc\s+Cưới|Sảnh\s+Tiệc)?|Trung\s+Tâm|Ẩm\s+Thực|Làng\s+Ẩm\s+Thực|Hải\s+Sản|Khách\s+Sạn)\s+/i, '')
    .trim();

  // Rút gọn các hậu tố dài
  s = s.replace(/\s*(&|\+)?\s*Event\s+Space/i, '');

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
  return s || fullName.trim();
}

export function VenuePin({ venue, isSelected, isDimmed, onClick }: VenuePinProps) {
  const isVip = venue.is_vip;
  const highlight = venue.party_deal_highlight;
  const priceFormatted = `${Math.round(venue.price_min / 1000)}k`;
  const shortName = getShortVenueName(venue.name);
  const logoUrl = venue.page_content?.logo_url;
  const iconData = getVenueIconData(venue);

  return (
    <div
      onClick={onClick}
      className={`venue-marker-container relative group cursor-pointer transition-all duration-200 select-none ${
        isDimmed ? 'opacity-30 scale-90' : 'opacity-100 scale-100 hover:scale-105'
      } ${isSelected ? 'z-50 scale-110' : 'z-20'}`}
      style={{ willChange: 'transform' }}
    >
      {/* Tooltip Deal Highlight on hover */}
      {highlight && (
        <div className="venue-deal-badge absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/95 text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-400/50 shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5 backdrop-blur-md">
          <svg className="w-2.5 h-2.5 text-amber-400 fill-amber-400 shrink-0" viewBox="0 0 24 24">
            <path d="M12 0l2.5 8.5L23 11l-8.5 2.5L12 22l-2.5-8.5L1 11l8.5-2.5z" />
          </svg>
          <span>{highlight}</span>
        </div>
      )}

      {/* Main Pin Pill (Warm Luxury Light) */}
      <div
        className={`venue-pin-pill inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-md transition-all ${
          isSelected
            ? 'bg-amber-600 border-2 border-yellow-300 text-white shadow-amber-950/30'
            : isVip
            ? 'bg-white border-2 border-amber-400 text-slate-900 shadow-amber-950/15 hover:border-amber-500'
            : 'bg-white border-2 border-amber-300 text-slate-900 shadow-amber-950/10 hover:border-amber-400'
        }`}
      >
        {/* Crisp Icon Badge */}
        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${iconData.bgClass} shadow-xs`}>
          {logoUrl ? (
            <>
              <img
                src={logoUrl}
                alt={venue.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const next = e.currentTarget.nextElementSibling as HTMLElement | null;
                  if (next) next.style.display = 'flex';
                }}
              />
              <div style={{ display: 'none' }} className="w-full h-full items-center justify-center">
                <span dangerouslySetInnerHTML={{ __html: iconData.svg }} />
              </div>
            </>
          ) : (
            <span dangerouslySetInnerHTML={{ __html: iconData.svg }} />
          )}
        </div>

        {/* Concise Brand Name + Price */}
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
  const priceFormatted = `${Math.round((venue.price_min || 0) / 1000)}k`;
  const shortName = getShortVenueName(venue.name);
  const logoUrl = venue.page_content?.logo_url;
  const iconData = getVenueIconData(venue);

  const escapeHtml = (s: string) =>
    (s || '')
      .toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const safeName = escapeHtml(shortName);
  const safeFullName = escapeHtml(venue.name);
  const safeHighlight = escapeHtml(highlight);

  // Logo or Fallback Vector Badge
  const iconContent = logoUrl
    ? `
      <img
        src="${escapeHtml(logoUrl)}"
        alt="${safeFullName}"
        class="w-full h-full object-cover rounded-full"
        onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';"
      />
      <div style="display: none;" class="w-full h-full items-center justify-center">
        ${iconData.svg}
      </div>
    `
    : iconData.svg;

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
      <div class="venue-pin-pill inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-md transition-all duration-200 ${
        isVip
          ? 'bg-white border-2 border-amber-400 text-slate-900 shadow-amber-950/15 hover:border-amber-500'
          : 'bg-white border-2 border-amber-300 text-slate-900 shadow-amber-950/10 hover:border-amber-400'
      }">
        <div class="w-5 h-5 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${iconData.bgClass} shadow-xs">
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
