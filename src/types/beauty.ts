export interface BeautyCategoryItem {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export const BEAUTY_CATEGORIES: BeautyCategoryItem[] = [
  { id: 'all', name: 'Tất Cả', slug: 'all', icon: '✨' },
  { id: 'spa-thu-gian', name: 'Spa & Thư Giãn', slug: 'spa-thu-gian', icon: '💆' },
  { id: 'clinic-tham-my', name: 'Viện Thẩm Mỹ & Clinic', slug: 'clinic-tham-my', icon: '🏥' },
  { id: 'chamsoc-da', name: 'Trị Mụn & Trẻ Hóa', slug: 'chamsoc-da', icon: '🌸' },
  { id: 'nails-mi', name: 'Nails & Mi', slug: 'nails-mi', icon: '💅' },
  { id: 'salon-toc', name: 'Salon Tóc', slug: 'salon-toc', icon: '✂️' },
  { id: 'nha-khoa', name: 'Nha Khoa Thẩm Mỹ', slug: 'nha-khoa', icon: '🦷' },
];

export interface BeautyAmenityItem {
  id: string;
  label: string;
  icon?: string;
}

export const BEAUTY_AMENITIES: BeautyAmenityItem[] = [
  { id: 'phong-vip', label: 'Phòng VIP riêng tư', icon: '👑' },
  { id: 'bac-si', label: 'Bác sĩ Da liễu 1-1', icon: '🩺' },
  { id: 'fda', label: 'Công nghệ chuẩn FDA', icon: '🛡️' },
  { id: 'cho-dau-xe', label: 'Bãi đỗ xe ô tô', icon: '🚗' },
  { id: 'tra-thao-moc', label: 'Trà thảo mộc & Thư giãn', icon: '🍵' },
  { id: 'cam-ket', label: 'Cam kết bằng văn bản', icon: '📜' },
];

export interface BeautyServiceItem {
  id?: string;
  name: string;
  price?: number | string;
  duration?: string;
  description?: string;
  highlight?: boolean;
}

export interface BeautyVenue {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
  zalo: string | null;
  map_coordinates: { lat: number; lng: number } | null;
  category_slug: string | null;
  location_slug: string | null;
  plan_tier?: string | null;
  is_vip: boolean;
  rating?: number;
  review_count?: number;
  deal_highlight?: string | null;
  price_min?: number;
  price_max?: number;
  amenities?: string[];
  specialties?: string[];
  services?: BeautyServiceItem[];
  page_content?: any;
}

export interface BeautyFilterState {
  category: string;
  priceMax: number;
  amenities: string[];
  onlyVip: boolean;
}
