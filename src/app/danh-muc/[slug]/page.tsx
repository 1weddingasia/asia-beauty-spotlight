import { BusinessCard } from "@/components/site/BusinessCard";
import { PageShell } from "@/components/site/Layout";
import { createStaticClient } from "@/utils/supabase/server";
import { searchBusinessesAction } from "@/app/actions/search";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const revalidate = 3600;

async function getCategoryFromDB(slug: string) {
  const supabase = createStaticClient();
  const { data } = await supabase.from('directory_categories').select('*').eq('slug', slug).single();
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const resolvedParams = await params;
  const category = await getCategoryFromDB(resolvedParams.slug);
  if (!category) return { title: "Không tìm thấy" };

  return {
    title: `${category.name} | 1Beauty.Asia`,
    description: category.description || `Danh mục ${category.name}`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params;
  const category = await getCategoryFromDB(resolvedParams.slug);
  if (!category) return notFound();

  // Fetch businesses for this category
  const list = await searchBusinessesAction("", category.slug, "all");

  return (
    <PageShell>
      <section className="relative border-b border-border">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1920&q=80")' }}
        >
          <div className="absolute inset-0 bg-ink/70"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-24 md:py-36 lg:py-40 flex flex-col justify-center min-h-[35vh]">
          <p className="text-xs tracking-[0.3em] text-gold uppercase drop-shadow-sm">Danh mục</p>
          <h1 className="mt-3 font-display text-4xl md:text-5xl lg:text-6xl text-white">Danh mục: {category.name}</h1>
          <p className="mt-4 text-gray-200 md:text-lg max-w-2xl">
            {category.description || `Tìm kiếm các địa điểm ${category.name.toLowerCase()} tốt nhất tại Việt Nam.`}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        {list.length === 0 ? (
          <p className="text-muted-foreground">Chưa có doanh nghiệp trong danh mục này.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {list.map((b: any) => (
              <BusinessCard key={b.slug} business={b} />
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
