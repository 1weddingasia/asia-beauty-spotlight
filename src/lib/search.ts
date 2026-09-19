import { businesses, categories, locations, type Business } from "@/data/directory";

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim();

export type SearchFilters = {
  q?: string;
  category?: string;
  location?: string;
};

/** Toàn bộ văn bản có thể tìm kiếm của một doanh nghiệp (tên, danh mục, địa điểm, dịch vụ, ưu đãi...) */
function haystack(b: Business) {
  const cat = categories.find((c) => c.slug === b.category);
  const loc = locations.find((l) => l.slug === b.location);
  return norm(
    [
      b.name,
      b.tagline,
      b.about,
      b.address,
      cat?.name ?? "",
      loc?.name ?? "",
      b.tags.join(" "),
      b.highlights.join(" "),
      b.services.map((s) => `${s.name} ${s.description}`).join(" "),
      b.offers.map((o) => `${o.title} ${o.description} ${o.code ?? ""}`).join(" "),
    ].join(" "),
  );
}

export function searchBusinesses({ q, category, location }: SearchFilters): Business[] {
  const terms = q ? norm(q).split(/\s+/).filter(Boolean) : [];
  return businesses.filter((b) => {
    if (category && category !== "all" && b.category !== category) return false;
    if (location && location !== "all" && b.location !== location) return false;
    if (!terms.length) return true;
    const hay = haystack(b);
    return terms.every((t) => hay.includes(t));
  });
}

export type Suggestion =
  | { kind: "category"; label: string; sub: string; slug: string }
  | { kind: "location"; label: string; sub: string; slug: string }
  | { kind: "business"; label: string; sub: string; slug: string };

export function suggest(q: string): Suggestion[] {
  const t = norm(q);
  if (!t) return [];
  const out: Suggestion[] = [];
  for (const c of categories) {
    if (norm(c.name).includes(t)) out.push({ kind: "category", label: c.name, sub: "Danh mục", slug: c.slug });
  }
  for (const l of locations) {
    if (norm(l.name).includes(t)) out.push({ kind: "location", label: l.name, sub: "Địa điểm", slug: l.slug });
  }
  for (const b of businesses) {
    if (haystack(b).includes(t)) out.push({ kind: "business", label: b.name, sub: b.address, slug: b.slug });
  }
  return out.slice(0, 8);
}
