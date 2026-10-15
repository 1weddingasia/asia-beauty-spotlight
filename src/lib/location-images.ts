export const SHARED_LOCATION_HERO_IMAGE = "/images/hero/shared-location-hero.jpg";
export const SHARED_CATEGORY_HERO_IMAGE = "/images/hero/shared-category-hero.jpg";
export const HANOI_AUTUMN_IMAGE = "/images/locations/hanoi-autumn-hoguom.jpg";
export const NHATRANG_BEACH_IMAGE = "/images/locations/nhatrang-beach.jpg";
export const HOCHIMINH_SKYLINE_IMAGE = "/images/locations/ho-chi-minh-saigon.jpg";
export const DANANG_DRAGON_BRIDGE_IMAGE = "/images/locations/danang-dragon-bridge.jpg";
export const DALAT_XUAN_HUONG_IMAGE = "/images/locations/dalat-xuan-huong.jpg";

export const DEFAULT_LOCATION_IMAGES: Record<string, string> = {
  "ha-noi": HANOI_AUTUMN_IMAGE,
  "hanoi": HANOI_AUTUMN_IMAGE,
  "nha-trang": NHATRANG_BEACH_IMAGE,
  "ho-chi-minh": HOCHIMINH_SKYLINE_IMAGE,
  "tphcm": HOCHIMINH_SKYLINE_IMAGE,
  "saigon": HOCHIMINH_SKYLINE_IMAGE,
  "quan-1-hcm": HOCHIMINH_SKYLINE_IMAGE,
  "quan-1": HOCHIMINH_SKYLINE_IMAGE,
  "da-nang": DANANG_DRAGON_BRIDGE_IMAGE,
  "danang": DANANG_DRAGON_BRIDGE_IMAGE,
  "da-lat": DALAT_XUAN_HUONG_IMAGE,
  "dalat": DALAT_XUAN_HUONG_IMAGE,
  "toan-quoc": SHARED_LOCATION_HERO_IMAGE,
};

export function getLocationHeroImage(slug?: string | null, customHero?: string | null): string {
  const cleanSlug = (slug || "").toLowerCase().trim();
  // Ưu tiên ảnh đặc trưng theo yêu cầu
  if (cleanSlug === "ha-noi" || cleanSlug === "hanoi") {
    return HANOI_AUTUMN_IMAGE;
  }
  if (cleanSlug === "nha-trang") {
    return NHATRANG_BEACH_IMAGE;
  }
  if (cleanSlug === "ho-chi-minh" || cleanSlug === "tphcm" || cleanSlug === "saigon" || cleanSlug === "quan-1-hcm" || cleanSlug === "quan-1") {
    return HOCHIMINH_SKYLINE_IMAGE;
  }
  if (cleanSlug === "da-nang" || cleanSlug === "danang") {
    return DANANG_DRAGON_BRIDGE_IMAGE;
  }
  if (cleanSlug === "da-lat" || cleanSlug === "dalat") {
    return DALAT_XUAN_HUONG_IMAGE;
  }
  if (customHero && typeof customHero === "string" && customHero.trim() && customHero !== SHARED_LOCATION_HERO_IMAGE) {
    return customHero;
  }
  return SHARED_LOCATION_HERO_IMAGE;
}

export function getLocationCardImage(slug?: string | null, customHero?: string | null): string {
  const cleanSlug = (slug || "").toLowerCase().trim();
  if (cleanSlug === "ha-noi" || cleanSlug === "hanoi") {
    return HANOI_AUTUMN_IMAGE;
  }
  if (cleanSlug === "nha-trang") {
    return NHATRANG_BEACH_IMAGE;
  }
  if (cleanSlug === "ho-chi-minh" || cleanSlug === "tphcm" || cleanSlug === "saigon" || cleanSlug === "quan-1-hcm" || cleanSlug === "quan-1") {
    return HOCHIMINH_SKYLINE_IMAGE;
  }
  if (cleanSlug === "da-nang" || cleanSlug === "danang") {
    return DANANG_DRAGON_BRIDGE_IMAGE;
  }
  if (cleanSlug === "da-lat" || cleanSlug === "dalat") {
    return DALAT_XUAN_HUONG_IMAGE;
  }
  return customHero || DEFAULT_LOCATION_IMAGES[cleanSlug] || SHARED_LOCATION_HERO_IMAGE;
}

export function getCategoryHeroImage(slug?: string | null, customHero?: string | null): string {
  // Đồng bộ 1 hình nền sang trọng chuẩn chung cho tất cả các danh mục ngành nghề
  return SHARED_CATEGORY_HERO_IMAGE;
}
