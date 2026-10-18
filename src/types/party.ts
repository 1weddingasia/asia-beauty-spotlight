export interface SetMenu {
  name: string;
  price: number;
  pax: number;
  dishes?: string[];
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
  set_menus: SetMenu[];
  is_vip: boolean;
  is_active: boolean;
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
  };
  plan_tier: string | null;
  status: string;
  category_slug: string | null;

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
  set_menus: SetMenu[];
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
  keywords: string[];
  center: [number, number];
}

export const PARTY_DISTRICTS: PartyDistrictItem[] = [
  { id: 'quan-1', name: 'Quận 1', keywords: ['quận 1', 'q.1', 'q1', 'quận 01', 'bến nghé', 'bến thành'], center: [106.6983, 10.7756] },
  { id: 'quan-3', name: 'Quận 3', keywords: ['quận 3', 'q.3', 'q3', 'quận 03', 'võ thị sáu', 'phạm ngọc thạch'], center: [106.6844, 10.7845] },
  { id: 'quan-10', name: 'Quận 10', keywords: ['quận 10', 'q.10', 'q10', 'thành thái'], center: [106.6668, 10.7715] },
  { id: 'binh-thanh', name: 'Bình Thạnh', keywords: ['bình thạnh', 'binh thanh'], center: [106.7093, 10.8033] },
  { id: 'phu-nhuan', name: 'Phú Nhuận', keywords: ['phú nhuận', 'phu nhuan'], center: [106.6806, 10.7992] },
  { id: 'tan-binh', name: 'Tân Bình', keywords: ['tân bình', 'tan binh', 'nguyễn thái bình'], center: [106.6558, 10.8015] },
  { id: 'thu-duc', name: 'Thành phố Thủ Đức', keywords: ['thủ đức', 'thu duc', 'quận 2', 'quận 9'], center: [106.7537, 10.8494] },
  { id: 'quan-7', name: 'Quận 7', keywords: ['quận 7', 'q.7', 'q7', 'phú mỹ hưng'], center: [106.7218, 10.7340] },
  { id: 'quan-4', name: 'Quận 4', keywords: ['quận 4', 'q.4', 'q4'], center: [106.7042, 10.7617] },
  { id: 'quan-5', name: 'Quận 5', keywords: ['quận 5', 'q.5', 'q5'], center: [106.6669, 10.7554] },
  { id: 'go-vap', name: 'Gò Vấp', keywords: ['gò vấp', 'go vap'], center: [106.6653, 10.8388] },
];

