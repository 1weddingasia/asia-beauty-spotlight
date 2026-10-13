import { createStaticClient } from "@/utils/supabase/server";
import { SiteHeader, SiteFooter } from "@/components/site/Layout";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 3600; // 1 giờ cache

export const metadata: Metadata = {
  title: "Danh Mục Ngành Nghề",
  description: "Khám phá các doanh nghiệp theo từng ngành nghề: làm đẹp, y tế, nhà hàng, thể thao và nhiều hơn nữa.",
};

// Icon defaults theo ngành
const CATEGORY_ICONS: Record<string, string> = {
  beauty: "💅",
  spa: "🧖",
  salon: "✂️",
  nail: "💅",
  health: "🏥",
  clinic: "🏥",
  dining: "🍽️",
  fnb: "🍜",
  fitness: "💪",
  sport: "⚽",
  sports: "⚽",
  auto: "🚗",
  pet: "🐾",
  studio: "📸",
  travel: "✈️",
  consulting: "💼",
  repair: "🔧",
  fashion: "👗",
  education: "📚",
  entertainment: "🎭",
};

function getCategoryIcon(icon?: string | null, slug?: string): string {
  if (icon) return icon;
  const key = (slug || "").toLowerCase();
  for (const [k, v] of Object.entries(CATEGORY_ICONS)) {
    if (key.includes(k)) return v;
  }
  return "🏪";
}

export default async function CategoriesIndexPage() {
  const supabase = createStaticClient();

  const { data: categories } = await supabase
    .from("directory_categories")
    .select("id, name, slug, description, icon, hero_image")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  // Đếm số lượng doanh nghiệp cho mỗi danh mục
  const { data: bizCounts } = await supabase
    .from("business_categories")
    .select("category_id");

  // Group count by category_id
  const countMap: Record<string, number> = {};
  (bizCounts || []).forEach((bc: any) => {
    countMap[bc.category_id] = (countMap[bc.category_id] || 0) + 1;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader solid />
      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section className="relative bg-ink overflow-hidden">
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=1920&q=80")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/60 to-ink/90" />
          <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 md:py-32 text-center">
            <p className="text-xs tracking-[0.3em] text-gold uppercase mb-4">Khám Phá</p>
            <h1 className="text-4xl md:text-6xl font-display text-white font-bold mb-6 leading-tight">
              Tất Cả Danh Mục
              <br />
              <span className="text-gradient-gold">Ngành Nghề</span>
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Tìm kiếm dịch vụ bạn cần từ hàng trăm doanh nghiệp uy tín được phân loại theo từng lĩnh vực.
            </p>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-16 px-4 md:px-6">
          <div className="mx-auto max-w-6xl">
            {!categories || categories.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-2xl border">
                <p className="text-4xl mb-4">📋</p>
                <h3 className="text-xl font-semibold">Chưa có danh mục nào</h3>
                <p className="text-muted-foreground mt-2">Admin đang cập nhật danh mục. Vui lòng quay lại sau.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {categories.map((cat) => {
                  const count = countMap[cat.id] || 0;
                  const icon = getCategoryIcon(cat.icon, cat.slug);
                  return (
                    <Link
                      key={cat.id}
                      href={`/danh-muc/${cat.slug}`}
                      className="group relative bg-card border border-border rounded-2xl p-6 text-center hover:border-gold/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                    >
                      {/* Background subtle gradient on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-gold/0 to-gold/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                      <div className="relative z-10">
                        <div className="text-5xl mb-4">{icon}</div>
                        <h2 className="font-bold text-lg text-foreground group-hover:text-gold transition-colors leading-tight">
                          {cat.name}
                        </h2>
                        {cat.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {cat.description}
                          </p>
                        )}
                        <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                          {count > 0 ? `${count} doanh nghiệp` : "Sắp có"}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
