import { PageShell } from "@/components/site/Layout";
import { categories, locations } from "@/data/directory";
import { Search, SlidersHorizontal } from "lucide-react";
import SearchClient from "./SearchClient";

export const metadata = {
  title: "Tìm kiếm | 1Beauty.Asia",
  description: "Tìm kiếm spa, thẩm mỹ viện và salon làm đẹp tại châu Á.",
};

export default function SearchPage() {
  return (
    <PageShell>
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-12 text-center md:py-16">
          <h1 className="font-display text-4xl md:text-5xl">Tìm kiếm</h1>
          <p className="mt-4 text-muted-foreground md:text-lg">
            Khám phá hàng ngàn địa điểm làm đẹp uy tín trên khắp châu Á.
          </p>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-64">
          <div className="sticky top-24 space-y-8">
            <div>
              <div className="flex items-center gap-2 font-medium">
                <SlidersHorizontal className="size-4" /> Bộ lọc
              </div>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                    Danh mục
                  </label>
                  <div className="mt-3 space-y-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded border-border" /> Tất cả
                    </label>
                    {categories.map((c) => (
                      <label key={c.slug} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="rounded border-border" /> {c.name}
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4">
                  <label className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                    Khu vực
                  </label>
                  <div className="mt-3 space-y-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded border-border" /> Tất cả
                    </label>
                    {locations.map((l) => (
                      <label key={l.slug} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="rounded border-border" /> {l.name}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="relative mb-8">
            <Search className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tên doanh nghiệp, dịch vụ..."
              className="w-full rounded-full border border-border bg-card py-4 pr-6 pl-12 text-sm outline-none transition-colors focus:border-gold"
            />
          </div>
          
          <SearchClient />
        </div>
      </div>
    </PageShell>
  );
}
