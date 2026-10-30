export interface SetMenu {
  id?: string;
  name: string;
  price: number;
  pax: number;
  description?: string;
  dishes?: string[];
  image_url?: string;
}

export interface PartyHall {
  id: string;
  name: string;
  capacity?: string;
  price_min?: number;
  features?: string;
  image_url?: string;
}

export interface PartySpecification {
  id: string;
  title: string;
  content: string;
}

export interface BusinessPartyProfile {
  business_id: string;
  min_guests: number;
  max_guests: number;
  num_vip_rooms: number;
  price_min: number;
  price_max: number;
  spaces_and_amenities: string[];
  cuisines: string[];
  party_perks: string[];
  party_description: string | null;
  party_deal_highlight: string | null;
  party_banner_url?: string | null;
  party_gallery?: string[];
  party_menu_url?: string | null;
  set_menus: SetMenu[];
  party_halls?: PartyHall[];
  party_specifications?: PartySpecification[];
  is_vip: boolean;
  is_active: boolean;
  is_demo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PartyVenue {
  // Từ bảng businesses
  id: string;
  slug: string;
  name: string;
  address: string | null;
  phone: string | null;
  zalo: string | null;
  map_coordinates: { lat: number; lng: number } | null;
  page_content: {
    banners?: string[];
    gallery?: (string | { id?: string; url: string; caption?: string })[];
    logo_url?: string;
    price_range?: string;
    hero_image?: string;
    phone?: string;
    zalo?: string;
    telegram_chat_id?: string;
    menu_url?: string | null;
  };
  plan_tier: string | null;
  status: string;
  category_slug: string | null;
  location_slug?: string | null;
  is_demo?: boolean;

  // Từ bảng business_party_profiles
  min_guests: number;
  max_guests: number;
  num_vip_rooms: number;
  price_min: number;
  price_max: number;
  spaces_and_amenities: string[];
  cuisines: string[];
  party_perks: string[];
  party_description: string | null;
  party_deal_highlight: string | null;
  party_banner_url?: string | null;
  party_gallery?: string[];
  party_menu_url?: string | null;
  set_menus: SetMenu[];
  party_halls?: PartyHall[];
  party_specifications?: PartySpecification[];
  is_vip: boolean;
  is_active: boolean;

  // Matching score (khi gọi API)
  match_score?: number;
}

export interface PartyFilterState {
  guests: number;
  priceMax: number;
  spaces: string[];
  cuisines: string[];
  perks: string[];
  onlyVip: boolean;
}

export const PARTY_SPACES = [
  { id: 'phong_vip', label: 'Phòng VIP riêng', icon: 'DoorClosed' },
  { id: 'ngoai_troi', label: 'Sân vườn / Ngoài trời', icon: 'Trees' },
  { id: 'rooftop', label: 'Rooftop ngắm cảnh', icon: 'Building' },
  { id: 'sanh_lon', label: 'Sảnh tiệc lớn', icon: 'Users' },
  { id: 'san_khau', label: 'Có sân khấu', icon: 'Mic2' },
  { id: 'karaoke', label: 'Dàn Karaoke', icon: 'Music' },
  { id: 'man_chieu_led', label: 'Màn chiếu / LED', icon: 'Tv' },
] as const;

export const PARTY_CUISINES = [
  { id: 'viet_truyen_thong', label: 'Ẩm thực Việt' },
  { id: 'hai_san', label: 'Hải sản tươi sống' },
  { id: 'lau_nuong', label: 'Lẩu & Nướng tiệc' },
  { id: 'bia_thu_cong', label: 'Bia tiệc / Craft beer' },
  { id: 'mon_hoa', label: 'Món Trung Hoa' },
  { id: 'mon_au_steak', label: 'Âu / Steak & Rượu vang' },
  { id: 'chay_thanh_dam', label: 'Chay thanh đạm' },
] as const;

export const PARTY_PERKS = [
  { id: 'free_karaoke', label: 'Tặng dàn Karaoke' },
  { id: 'free_backdrop', label: 'Tặng Backdrop tiệc' },
  { id: 'tang_bia', label: 'Tặng bia / nước ngọt' },
  { id: 'giam_gia_menu', label: 'Giảm giá menu bàn' },
  { id: 'free_gui_xe', label: 'Miễn phí giữ xe' },
  { id: 'cho_mang_ruou_vao', label: 'Miễn phí mang rượu' },
] as const;

function getLabelById<T extends { readonly id: string; readonly label: string }>(list: readonly T[], idOrCustom: string): string {
  return list.find((item) => item.id === idOrCustom)?.label ?? idOrCustom;
}

export function getSpaceLabel(idOrCustom: string): string {
  return getLabelById(PARTY_SPACES, idOrCustom);
}

export function getCuisineLabel(idOrCustom: string): string {
  return getLabelById(PARTY_CUISINES, idOrCustom);
}

export function getPerkLabel(idOrCustom: string): string {
  return getLabelById(PARTY_PERKS, idOrCustom);
}

export function formatPartyPriceToK(n: number): string {
  if (n >= 1000000) {
    return `${(n / 1000000).toFixed(1).replace('.0', '')}tr`;
  }
  if (n >= 1000) {
    return `${Math.round(n / 1000)}k`;
  }
  return `${Math.round(n)} đ`;
}

export function formatShortPartyPrice(min?: number | null, max?: number | null): string {
  const hasMin = typeof min === 'number' && min > 0;
  const hasMax = typeof max === 'number' && max > 0;
  if (!hasMin && !hasMax) return 'Liên hệ';
  if (hasMin && hasMax) {
    return `${formatPartyPriceToK(min)} - ${formatPartyPriceToK(max)} đ`;
  }
  return hasMin ? `Từ ${formatPartyPriceToK(min)} đ` : `${formatPartyPriceToK(max as number)} đ`;
}

export const DEFAULT_PARTY_PROFILE_VALUES = {
  min_guests: 10,
  max_guests: 200,
  num_vip_rooms: 0,
  price_min: 250000,
  price_max: 600000,
  party_deal_highlight: '🎉 Nhận đặt tiệc Tất Niên & Year-End Party',
  party_deal_vip_highlight: '⭐ Điểm Tiệc VIP Hot 2026',
} as const;

export function isFnBCategory(categorySlug?: string | null): boolean {
  if (!categorySlug) return false;
  const s = categorySlug.toLowerCase();
  return ['dining', 'fnb', 'restaurant', 'nha-hang', 'am-thuc'].some(k => s.includes(k));
}

export const VN_PHONE_REGEX = /^(03|05|07|08|09)\d{8}$/;

export interface PartyDistrictItem {
  id: string;
  name: string;
  slug: string;
  keywords?: string[] | null;
  map_coordinates?: [number, number] | null;
  sort_order?: number;
  parent_slug?: string | null;
}
