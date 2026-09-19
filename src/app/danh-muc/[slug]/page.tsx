import { BusinessCard } from "@/components/site/BusinessCard";
import { PageShell } from "@/components/site/Layout";
import { getCategory } from "@/data/directory";
import { searchBusinessesDB } from "@/data/business";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const resolvedParams = await params;
  const category = getCategory(resolvedParams.slug);
  if (!category) return { title: "Không tìm thấy" };

  return {
    title: `${category.name} | 1Beauty.Asia`,
    description: category.description,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params;
  const category = getCategory(resolvedParams.slug);
  if (!category) notFound();

  // Fetch businesses for this category
  const list = await searchBusinessesDB({ q: "", category: category.slug, location: "all" });

  return (
    <PageShell>
      <section className="border-b border-border bg-champagne/40">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <p className="text-xs tracking-[0.3em] text-gold uppercase">Danh mục</p>
          <div className="rule-gold mt-3" />
          <h1 className="mt-5 text-3xl md:text-4xl">{category.name}</h1>
          <p className="mt-4 max-w-xl text-muted-foreground">{category.description}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        {list.length === 0 ? (
          <p className="text-muted-foreground">Chưa có doanh nghiệp trong danh mục này.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {list.map((b) => (
              <BusinessCard key={b.slug} business={b as any} />
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
