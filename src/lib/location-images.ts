export const DEFAULT_LOCATION_IMAGES: Record<string, string> = {
  "nha-trang": "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1920&q=80",
  "da-lat": "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1920&q=80",
  "quan-1-hcm": "https://images.unsplash.com/photo-1574482620811-1aa16ffe3c82?auto=format&fit=crop&w=1920&q=80",
  "quan-1": "https://images.unsplash.com/photo-1574482620811-1aa16ffe3c82?auto=format&fit=crop&w=1920&q=80",
  "ho-chi-minh": "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1920&q=80",
  "ha-noi": "https://images.unsplash.com/photo-1555921015-5532091f6026?auto=format&fit=crop&w=1920&q=80",
  "da-nang": "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1920&q=80",
  "toan-quoc": "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1920&q=80",
};

export function getLocationHeroImage(slug?: string | null, customHero?: string | null): string {
  if (customHero && typeof customHero === "string" && customHero.trim()) {
    return customHero;
  }
  const cleanSlug = (slug || "").toLowerCase().trim();
  if (DEFAULT_LOCATION_IMAGES[cleanSlug]) {
    return DEFAULT_LOCATION_IMAGES[cleanSlug];
  }
  for (const [key, url] of Object.entries(DEFAULT_LOCATION_IMAGES)) {
    if (cleanSlug === key || cleanSlug.startsWith(`${key}-`) || cleanSlug.endsWith(`-${key}`)) {
      return url;
    }
  }
  return DEFAULT_LOCATION_IMAGES["ho-chi-minh"];
}
