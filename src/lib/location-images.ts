export const SHARED_LOCATION_HERO_IMAGE = "/images/hero/shared-location-hero.jpg";
export const SHARED_CATEGORY_HERO_IMAGE = "/images/hero/shared-category-hero.jpg";

export const DEFAULT_LOCATION_IMAGES: Record<string, string> = {
  "nha-trang": SHARED_LOCATION_HERO_IMAGE,
  "da-lat": SHARED_LOCATION_HERO_IMAGE,
  "quan-1-hcm": SHARED_LOCATION_HERO_IMAGE,
  "quan-1": SHARED_LOCATION_HERO_IMAGE,
  "ho-chi-minh": SHARED_LOCATION_HERO_IMAGE,
  "ha-noi": SHARED_LOCATION_HERO_IMAGE,
  "da-nang": SHARED_LOCATION_HERO_IMAGE,
  "toan-quoc": SHARED_LOCATION_HERO_IMAGE,
};

export function getLocationHeroImage(slug?: string | null, customHero?: string | null): string {
  // Đồng bộ 1 hình nền sang trọng chuẩn chung cho tất cả các địa điểm (tránh lệch hình sai vị trí)
  return SHARED_LOCATION_HERO_IMAGE;
}

export function getCategoryHeroImage(slug?: string | null, customHero?: string | null): string {
  // Đồng bộ 1 hình nền sang trọng chuẩn chung cho tất cả các danh mục ngành nghề
  return SHARED_CATEGORY_HERO_IMAGE;
}
