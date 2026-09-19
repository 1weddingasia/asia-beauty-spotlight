"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Search, Tag } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { categories, locations } from "@/data/directory";
import { suggest } from "@/lib/search";
import { cn } from "@/lib/utils";

type Props = {
  variant?: "hero" | "compact";
  defaultQ?: string;
  defaultCategory?: string;
  defaultLocation?: string;
};

export function SearchBar({
  variant = "hero",
  defaultQ = "",
  defaultCategory = "all",
  defaultLocation = "all",
}: Props) {
  const router = useRouter();
  const [q, setQ] = useState(defaultQ);
  const [category, setCategory] = useState(defaultCategory);
  const [location, setLocation] = useState(defaultLocation);
  const [open, setOpen] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const suggestions = useMemo(() => suggest(q), [q]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    router.push("/tim-kiem?q=" + q + "&category=" + category + "&location=" + location);
  };

  return (
    <form
      onSubmit={submit}
      onBlur={() => {
        blurTimer.current = setTimeout(() => setOpen(false), 120);
      }}
      onFocus={() => {
        if (blurTimer.current) clearTimeout(blurTimer.current);
      }}
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
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            placeholder="Từ khoá, tên doanh nghiệp, dịch vụ, ưu đãi…"
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

      {open && suggestions.length > 0 && (
        <ul className="shadow-luxe absolute top-full right-0 left-0 z-40 mt-2 overflow-hidden rounded-sm border border-border bg-popover">
          {suggestions.map((s) => {
            const inner = (
              <>
                <span className="font-medium">{s.label}</span>
                <span className="truncate text-xs text-muted-foreground">{s.sub}</span>
              </>
            );
            const cls =
              "flex items-center justify-between gap-4 px-4 py-3 text-sm transition-colors hover:bg-secondary";
            return (
              <li key={`${s.kind}-${s.slug}`}>
                {s.kind === "business" ? (
                  <Link
                    href="/doanh-nghiep/$slug"
                     
                    onClick={() => setOpen(false)}
                    className={cls}
                  >
                    {inner}
                  </Link>
                ) : s.kind === "category" ? (
                  <Link
                    href="/danh-muc/$slug"
                     
                    onClick={() => setOpen(false)}
                    className={cls}
                  >
                    {inner}
                  </Link>
                ) : (
                  <Link
                    href="/tim-kiem"
                    
                    onClick={() => setOpen(false)}
                    className={cls}
                  >
                    {inner}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </form>
  );
}
