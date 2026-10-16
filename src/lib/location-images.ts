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

export const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  "clinic-tham-my": "/images/categories/clinic-tham-my.jpg",
  "nails-mi": "/images/categories/nails-mi.jpg",
  "nha-khoa": "/images/categories/nha-khoa.jpg",
  "salon-toc": "/images/categories/salon-toc.jpg",
  "spa-thu-gian": "/images/categories/spa-thu-gian.jpg",
  "nha-hang-am-thuc": "/images/categories/nha-hang-am-thuc.jpg",
  "fitness-the-thao": "/images/categories/fitness-the-thao.jpg",
  "thoi-trang-mua-sam": "/images/categories/thoi-trang-mua-sam.jpg",
  "dich-vu-sua-chua": "/images/categories/dich-vu-sua-chua.jpg",
  "tu-van-giao-duc": "/images/categories/tu-van-giao-duc.jpg",
  "thu-cung": "/images/categories/thu-cung.jpg",
  "studio-chup-anh": "/images/categories/studio-chup-anh.jpg",
};

export function getCategoryHeroImage(slug?: string | null, customHero?: string | null): string {
  const cleanSlug = (slug || "").toLowerCase().trim();
  if (customHero && typeof customHero === "string" && customHero.trim() && customHero !== SHARED_CATEGORY_HERO_IMAGE) {
    return customHero;
  }
  return DEFAULT_CATEGORY_IMAGES[cleanSlug] || SHARED_CATEGORY_HERO_IMAGE;
}

