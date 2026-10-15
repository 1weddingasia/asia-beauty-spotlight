import { createStaticClient } from "@/utils/supabase/server";
import { SiteHeader, SiteFooter } from "@/components/site/Layout";
import { LocationIcon } from "@/components/ui/category-icon";
import { getLocationHeroImage } from "@/lib/location-images";
import { MapPin } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Khám Phá Theo Địa Điểm",
  description:
    "Tìm kiếm doanh nghiệp, dịch vụ và ưu đãi gần bạn theo từng khu vực: TP.HCM, Hà Nội, Đà Nẵng và nhiều tỉnh thành khác.",
};

export default async function LocationsIndexPage() {
  const supabase = createStaticClient();

  const { data: locations } = await supabase
    .from("directory_locations")
    .select("id, name, slug, description, hero_image")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  // Đếm số lượng doanh nghiệp cho mỗi địa điểm
  const { data: bizCounts } = await supabase
    .from("business_locations")
    .select("location_id");

  const countMap: Record<string, number> = {};
  (bizCounts || []).forEach((bl: any) => {
    countMap[bl.location_id] = (countMap[bl.location_id] || 0) + 1;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader solid />
      <main className="flex-grow pt-16">
        {/* Hero */}
        <section className="relative bg-ink overflow-hidden">
          <div
            className="absolute inset-0 opacity-35 bg-cover bg-center"
            style={{
              backgroundImage: `url("https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1920&q=80")`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/20 via-ink/15 to-ink/65" />
          <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 md:py-32 text-center">
            <p className="text-xs tracking-[0.3em] text-gold uppercase mb-4">
              Khám Phá
            </p>
            <h1 className="text-4xl md:text-6xl font-display text-white font-bold mb-6 leading-tight">
              Tìm Dịch Vụ
              <br />
              <span className="text-gradient-gold">Gần Bạn</span>
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Khám phá hàng trăm doanh nghiệp uy tín tại các thành phố lớn trên khắp Việt Nam.
            </p>
          </div>
        </section>

        {/* Location Grid */}
        <section className="py-16 px-4 md:px-6">
          <div className="mx-auto max-w-6xl">
            {!locations || locations.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-2xl border">
                <MapPin className="size-12 mx-auto mb-4 text-muted-foreground/40" />
                <h3 className="text-xl font-semibold">Chưa có địa điểm nào</h3>
                <p className="text-muted-foreground mt-2">Admin đang cập nhật. Vui lòng quay lại sau.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {locations.map((loc) => {
                  const count = countMap[loc.id] || 0;
                  const locImage = getLocationHeroImage(loc.slug, loc.hero_image);

                  return (
                    <Link
                      key={loc.id}
                      href={`/dia-diem/${loc.slug}`}
                      className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-gold/50 transition-all duration-300 hover:-translate-y-1"
                    >
                      {/* Background image */}
                      {locImage ? (
                        <div className="aspect-video relative">
                          <img
                            src={locImage}
                            alt={loc.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h2 className="font-bold text-white text-lg">{loc.name}</h2>
                            <p className="text-white/70 text-xs mt-0.5">
                              {count > 0 ? `${count} doanh nghiệp` : "Sắp có"}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 text-center">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gold/10 to-amber-500/10 border border-gold/20 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-ink group-hover:scale-110 transition-all duration-300">
                            <LocationIcon slug={loc.slug} name={loc.name} className="size-8" />
                          </div>
                          <h2 className="font-bold text-lg text-foreground group-hover:text-gold transition-colors">
                            {loc.name}
                          </h2>
                          {loc.description && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {loc.description}
                            </p>
                          )}
                          <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                            {count > 0 ? `${count} doanh nghiệp` : "Sắp có"}
                          </div>
                        </div>
                      )}
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
