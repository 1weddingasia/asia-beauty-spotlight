export type BusinessStatus = 'draft' | 'published' | 'suspended' | 'expired' | 'archived';

export interface BusinessContent {
  // Hero / Basic
  tagline?: string;
  hero_image?: string; // fallback to cover if empty
  
  // Services & Pricing
  services_list?: {
    id: string;
    name: string;
    description: string;
    price_min: number;
    price_max: number;
    image_url: string;
  }[];

  // Gallery
  gallery?: {
    id: string;
    url: string;
    caption?: string;
  }[];

  // Business Hours overrides or detailed text
  working_hours_text?: string;

  // Highlights/Amenities
  amenities?: string[];
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
  created_at: string;
  updated_at: string;
}
