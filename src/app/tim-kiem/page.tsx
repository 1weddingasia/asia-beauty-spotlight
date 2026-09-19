import { BusinessCard } from "@/components/site/BusinessCard";
import { PageShell } from "@/components/site/Layout";
import { SearchBar } from "@/components/site/SearchBar";
import { getCategory, getLocation } from "@/data/directory";
import { searchBusinessesDB } from "@/data/business";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tìm kiếm doanh nghiệp làm đẹp | 1Beauty.Asia",
  description: "Tìm spa, thẩm mỹ viện, salon, nail và học viện làm đẹp theo từ khoá, danh mục hoặc địa điểm trên 1Beauty.Asia.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const q = typeof resolvedParams.q === "string" ? resolvedParams.q : "";
  const category = typeof resolvedParams.category === "string" ? resolvedParams.category : "all";
  const location = typeof resolvedParams.location === "string" ? resolvedParams.location : "all";

  const results = await searchBusinessesDB({ q, category, location });

  return (
    <PageShell>
      <section className="border-b border-border bg-champagne/40">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <p className="text-xs tracking-[0.3em] text-gold uppercase">Danh bạ</p>
          <div className="rule-gold mt-3" />
          <h1 className="mt-5 text-3xl md:text-4xl">Tìm kiếm doanh nghiệp làm đẹp</h1>
          <div className="mt-8">
            <SearchBar
              key={`${q}-${category}-${location}`}
              variant="compact"
              defaultQ={q}
              defaultCategory={category}
              defaultLocation={location}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <p className="text-sm text-muted-foreground">
          {results.length} kết quả
          {q ? ` cho “${q}”` : ""}
          {category !== "all" ? ` — ${getCategory(category)?.name ?? ""}` : ""}
          {location !== "all" ? ` — ${getLocation(location)?.name ?? ""}` : ""}
        </p>

        {results.length === 0 ? (
          <p className="mt-10 rounded-sm border border-border bg-card p-10 text-center text-muted-foreground">
            Không tìm thấy doanh nghiệp phù hợp. Hãy thử từ khoá khác.
          </p>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.map((b) => (
              <BusinessCard key={b.slug} business={b as any} />
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
