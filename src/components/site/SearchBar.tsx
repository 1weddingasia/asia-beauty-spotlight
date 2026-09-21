"use client";
import { useRouter } from "next/navigation";
import { MapPin, Search, Tag } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Category = { slug: string; name: string };
type Location = { slug: string; name: string };

type Props = {
  variant?: "hero" | "compact";
  defaultQ?: string;
  defaultCategory?: string;
  defaultLocation?: string;
  // Nhận data từ server — tránh double-fetch Supabase
  categories?: Category[];
  locations?: Location[];
};

export function SearchBar({
  variant = "hero",
  defaultQ = "",
  defaultCategory = "all",
  defaultLocation = "all",
  categories = [],
  locations = [],
}: Props) {
  const router = useRouter();
  const [q, setQ] = useState(defaultQ);
  const [category, setCategory] = useState(defaultCategory);
  const [location, setLocation] = useState(defaultLocation);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // FIX #9: Dùng URLSearchParams để encode đúng tiếng Việt & ký tự đặc biệt
    const params = new URLSearchParams({ q, category, location });
    router.push(`/tim-kiem?${params.toString()}`);
  };

  return (
    <form
      onSubmit={submit}
      className={cn(
        "relative w-full rounded-sm border border-border/70 bg-card/95 backdrop-blur",
        variant === "hero" ? "shadow-luxe p-2" : "shadow-card p-1.5",
      )}
    >
      <div className="grid gap-1.5 md:grid-cols-[1.6fr_1fr_1fr_auto]">
        <label className="flex items-center gap-2 rounded-sm px-3 py-2.5">
          <Search className="size-4 shrink-0 text-gold" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Từ khoá, tên doanh nghiệp, dịch vụ..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </label>

        <label className="flex items-center gap-2 border-border/70 px-3 py-2.5 md:border-l">
          <Tag className="size-4 shrink-0 text-gold" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-transparent text-sm outline-none"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 border-border/70 px-3 py-2.5 md:border-l">
          <MapPin className="size-4 shrink-0 text-gold" />
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-transparent text-sm outline-none"
          >
            <option value="all">Mọi địa điểm</option>
            {locations.map((l) => (
              <option key={l.slug} value={l.slug}>
                {l.name}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="bg-gradient-gold rounded-sm px-7 py-3 text-sm font-semibold tracking-wide text-ink uppercase transition-opacity hover:opacity-90"
        >
          Tìm kiếm
        </button>
      </div>
    </form>
  );
}
