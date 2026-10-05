export type BusinessStatus = 'draft' | 'published' | 'suspended' | 'expired' | 'archived';

export interface BusinessContent {
  // Banners & Images
  logo_url?: string;
  banners?: string[];
  gallery?: string[] | {
    id: string;
    url: string;
    caption?: string;
  }[];

  // Contact Info overrides
  phone?: string;

  // Services & Pricing
  services?: any[];
  
  // Deals & Cross-Sells
  deals?: any[];
  offers?: any[]; // legacy
  cross_sells?: any[];

  // Info
  working_hours?: any[] | string;
  amenities?: string[];
  
  // Other basic
  tagline?: string;
  hero_image?: string;
  map_embed?: string;
  booking_url?: string;
  price_range?: string;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  location_id: string | null;
  address: string | null;
  map_coordinates: { lat: number; lng: number } | null;
  phone: string | null;
  zalo: string | null;
  email: string | null;
  website: string | null;
  socials: {
    facebook?: string;
    tiktok?: string;
    youtube?: string;
    instagram?: string;
  } | null;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  structured_data: any | null;
  status: BusinessStatus;
  is_featured: boolean;
  page_content: BusinessContent;
  plan_id: string | null;
  owner_id: string | null;
  category_slug: string | null;
  location_slug: string | null;
  plan_tier: string | null;
  claim_token: string | null;
  chatbot_passcode: string | null;
  created_at: string;
  updated_at: string;
}
