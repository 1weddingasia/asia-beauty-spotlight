export const SHARED_LOCATION_HERO_IMAGE = "/images/hero/shared-location-hero.jpg";
export const SHARED_CATEGORY_HERO_IMAGE = "/images/hero/shared-category-hero.jpg";
export const HANOI_HO_GUOM_IMAGE = "/images/locations/hanoi-ho-guom.jpg";

export const DEFAULT_LOCATION_IMAGES: Record<string, string> = {
  "ha-noi": HANOI_HO_GUOM_IMAGE,
  "hanoi": HANOI_HO_GUOM_IMAGE,
  "nha-trang": SHARED_LOCATION_HERO_IMAGE,
  "da-lat": SHARED_LOCATION_HERO_IMAGE,
  "quan-1-hcm": SHARED_LOCATION_HERO_IMAGE,
  "quan-1": SHARED_LOCATION_HERO_IMAGE,
  "ho-chi-minh": SHARED_LOCATION_HERO_IMAGE,
  "da-nang": SHARED_LOCATION_HERO_IMAGE,
  "toan-quoc": SHARED_LOCATION_HERO_IMAGE,
};

export function getLocationHeroImage(slug?: string | null, customHero?: string | null): string {
  const cleanSlug = (slug || "").toLowerCase().trim();
  // Riêng Hà Nội ưu tiên tuyệt đối ảnh Hồ Gươm theo yêu cầu
  if (cleanSlug === "ha-noi" || cleanSlug === "hanoi") {
    return HANOI_HO_GUOM_IMAGE;
  }
  if (customHero && typeof customHero === "string" && customHero.trim() && customHero !== SHARED_LOCATION_HERO_IMAGE) {
    return customHero;
  }
  return SHARED_LOCATION_HERO_IMAGE;
}

export function getLocationCardImage(slug?: string | null, customHero?: string | null): string {
  const cleanSlug = (slug || "").toLowerCase().trim();
  if (cleanSlug === "ha-noi" || cleanSlug === "hanoi") {
    return HANOI_HO_GUOM_IMAGE;
  }
  return customHero || DEFAULT_LOCATION_IMAGES[cleanSlug] || SHARED_LOCATION_HERO_IMAGE;
}

export function getCategoryHeroImage(slug?: string | null, customHero?: string | null): string {
  // Đồng bộ 1 hình nền sang trọng chuẩn chung cho tất cả các danh mục ngành nghề
  return SHARED_CATEGORY_HERO_IMAGE;
}
