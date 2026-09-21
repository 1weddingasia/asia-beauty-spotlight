import { PageShell } from "@/components/site/Layout";
import { Search, SlidersHorizontal } from "lucide-react";
import { getCategoriesAction, getLocationsAction, searchBusinessesAction } from "../actions/search";
import { BusinessCard } from "@/components/site/BusinessCard";
import Link from "next/link";

export const metadata = {
  title: "Tìm kiếm | 1Beauty.Asia",
  description: "Tìm kiếm spa, thẩm mỹ viện và salon làm đẹp tại Việt Nam.",
};

export default async function SearchPage(props: {
  searchParams: Promise<{ q?: string; category?: string; location?: string }>;
}) {
  const searchParams = await props.searchParams;
  const q = searchParams.q || "";
  const category = searchParams.category || "all";
  const location = searchParams.location || "all";

  const [categories, locations, results] = await Promise.all([
    getCategoriesAction(),
    getLocationsAction(),
    searchBusinessesAction(q, category, location)
  ]);

  return (
    <PageShell>
      <div className="relative border-b border-border">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1920&q=80")' }}
        >
          <div className="absolute inset-0 bg-ink/70"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 mx-auto max-w-6xl px-6 py-24 text-center md:py-36 lg:py-40 flex flex-col justify-center min-h-[35vh]">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white">Tìm kiếm</h1>
          <p className="mt-4 text-gray-200 md:text-lg">
            Khám phá hàng ngàn địa điểm làm đẹp uy tín trên khắp Việt Nam.
          </p>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-64">
          <div className="sticky top-24 space-y-8">
            <div>
              <div className="flex items-center gap-2 font-medium">
                <SlidersHorizontal className="size-4" /> BỘ LỌC
              </div>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                    Danh mục
                  </label>
                  <div className="mt-3 space-y-2">
                    <Link
                      scroll={false}
                      href={`/tim-kiem?${new URLSearchParams({ q, location, category: 'all' }).toString()}`}
                      className={`block text-sm transition-colors hover:text-gold ${category === 'all' ? 'text-gold font-bold' : ''}`}
                    >
                      Tất cả
                    </Link>
                    {categories.map((c) => (
                      <Link
                        key={c.slug}
                        scroll={false}
                        href={`/tim-kiem?${new URLSearchParams({ q, location, category: c.slug }).toString()}`}
                        className={`block text-sm transition-colors hover:text-gold ${category === c.slug ? 'text-gold font-bold' : ''}`}
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4">
                  <label className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                    Khu vực
                  </label>
                  <div className="mt-3 space-y-2">
                    <Link
                      scroll={false}
                      href={`/tim-kiem?${new URLSearchParams({ q, category, location: 'all' }).toString()}`}
                      className={`block text-sm transition-colors hover:text-gold ${location === 'all' ? 'text-gold font-bold' : ''}`}
                    >
                      Tất cả
                    </Link>
                    {locations.map((l) => (
                      <Link
                        key={l.slug}
                        scroll={false}
                        href={`/tim-kiem?${new URLSearchParams({ q, category, location: l.slug }).toString()}`}
                        className={`block text-sm transition-colors hover:text-gold ${location === l.slug ? 'text-gold font-bold' : ''}`}
                      >
                        {l.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <form action="/tim-kiem" method="GET" className="relative mb-8">
            <input type="hidden" name="category" value={category} />
            <input type="hidden" name="location" value={location} />
            <Search className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Tên doanh nghiệp, dịch vụ..."
              className="w-full rounded-full border border-border bg-card py-4 pr-32 pl-12 text-sm outline-none transition-colors focus:border-gold"
            />
            <button type="submit" className="absolute top-1.5 right-1.5 rounded-full bg-gold px-6 py-2.5 text-xs font-bold text-ink uppercase tracking-wide hover:bg-gold/90">
              Tìm
            </button>
          </form>
          
          {results.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {results.map((b: any) => (
                <BusinessCard key={b.slug} business={b} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              Không tìm thấy doanh nghiệp nào phù hợp với điều kiện tìm kiếm.
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
