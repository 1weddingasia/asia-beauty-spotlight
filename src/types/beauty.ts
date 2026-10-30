export interface BeautyCategoryItem {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export const BEAUTY_CATEGORIES: BeautyCategoryItem[] = [
  { id: 'all', name: 'Tất Cả', slug: 'all', icon: 'sparkles' },
  { id: 'spa-thu-gian', name: 'Spa & Thư Giãn', slug: 'spa-thu-gian', icon: 'flower' },
  { id: 'clinic-tham-my', name: 'Viện Thẩm Mỹ & Clinic', slug: 'clinic-tham-my', icon: 'building' },
  { id: 'chamsoc-da', name: 'Trị Mụn & Trẻ Hóa', slug: 'chamsoc-da', icon: 'droplet' },
  { id: 'nails-mi', name: 'Nails & Mi', slug: 'nails-mi', icon: 'eye' },
  { id: 'salon-toc', name: 'Salon Tóc', slug: 'salon-toc', icon: 'scissors' },
  { id: 'nha-khoa', name: 'Nha Khoa Thẩm Mỹ', slug: 'nha-khoa', icon: 'smile' },
];

export interface BeautyAmenityItem {
  id: string;
  label: string;
  icon?: string;
}

export const BEAUTY_AMENITIES: BeautyAmenityItem[] = [
  { id: 'phong-vip', label: 'Phòng VIP riêng tư' },
  { id: 'bac-si', label: 'Bác sĩ Da liễu 1-1' },
  { id: 'fda', label: 'Công nghệ chuẩn FDA' },
  { id: 'cho-dau-xe', label: 'Bãi đỗ xe ô tô' },
  { id: 'tra-thao-moc', label: 'Trà thảo mộc & Thư giãn' },
  { id: 'cam-ket', label: 'Cam kết bằng văn bản' },
];

export interface BeautyServiceItem {
  id?: string;
  name: string;
  price?: number | string;
  duration?: string;
  description?: string;
  highlight?: boolean;
}

export interface BeautyPageContent {
  banners?: string[];
  gallery?: string[] | { id?: string; url: string; caption?: string }[];
  hero_image?: string;
  phone?: string;
  menu_url?: string;
  services?: BeautyServiceItem[];
  amenities?: string[];
  tagline?: string;
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
  page_content?: BeautyPageContent | null;
}

export interface BeautyFilterState {
  category: string;
  priceMax: number;
  amenities: string[];
  onlyVip: boolean;
}
