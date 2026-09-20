import { BusinessCard } from "@/components/site/BusinessCard";
import { PageShell } from "@/components/site/Layout";
import { createClient } from "@/utils/supabase/server";
import { searchBusinessesAction } from "@/app/actions/search";
import { notFound } from "next/navigation";
import { Metadata } from "next";

async function getCategoryFromDB(slug: string) {
  const supabase = await createClient();
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
  if (!category) notFound();

  // Fetch businesses for this category
  const list = await searchBusinessesAction("", category.slug, "all");

  return (
    <PageShell>
      <section className="relative border-b border-border">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("https://images.pexels.com/photos/398532/pexels-photo-398532.jpeg?auto=compress&cs=tinysrgb&w=1920")' }}
        >
          <div className="absolute inset-0 bg-ink/70"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 md:py-24">
          <p className="text-xs tracking-[0.3em] text-gold uppercase drop-shadow-sm">Danh mục</p>
          <div className="mt-3 h-[2px] w-12 bg-gold" />
          <h1 className="mt-5 text-3xl md:text-5xl text-white drop-shadow-md">{category.name}</h1>
          <p className="mt-4 max-w-xl text-gray-200 drop-shadow-md">{category.description}</p>
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
