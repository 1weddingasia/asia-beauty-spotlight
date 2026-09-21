import { PageShell } from "@/components/site/Layout";
import { Sparkles, Ticket } from "lucide-react";
import Link from "next/link";
import { createStaticClient } from "@/utils/supabase/server";

export const metadata = {
  title: "Ưu đãi | 1Beauty.Asia",
  description: "Tổng hợp các chương trình khuyến mãi, ưu đãi độc quyền từ các spa và thẩm mỹ viện.",
};

export const revalidate = 3600; // Revalidate mỗi 1 tiếng

export default async function OffersPage() {
  const supabase = createStaticClient();
  
  // Lấy các doanh nghiệp Premium (có plan_id)
  const { data: businesses } = await supabase
    .from("businesses")
    .select("slug, name, page_content, plan_id")
    .eq("status", "published")
    .not("plan_id", "is", null);

  const now = new Date();

  // Extract offers, filter expired ones, and sort by newest
  const allOffers = (businesses || [])
    .flatMap((b: any) => {
      const pc = b.page_content || {};
      return (pc.offers || []).map((o: any) => ({
        ...o,
        business: { slug: b.slug, name: b.name },
      }));
    })
    .filter((o: any) => {
      // Bỏ qua nếu chưa tới ngày bắt đầu
      if (o.validFrom) {
        let startDate = new Date(`${o.validFrom}T00:00:00`);
        if (startDate && startDate > now) return false;
      }
      
      // Bỏ qua nếu đã hết hạn
      if (o.validUntil) {
        let endDate;
        if (o.validUntil.includes('/')) {
          const parts = o.validUntil.split('/');
          if (parts.length === 3) endDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T23:59:59`);
        } else {
          endDate = new Date(`${o.validUntil}T23:59:59`); // For YYYY-MM-DD
        }
        
        if (endDate && endDate < now) return false;
      }
      return true;
    })
    .sort((a: any, b: any) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });

  return (
    <PageShell>
      <section className="relative border-b border-border">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1920&q=80")' }}
        >
          <div className="absolute inset-0 bg-ink/70"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-24 text-center md:py-36 lg:py-40 flex flex-col justify-center min-h-[35vh]">
          <p className="text-xs tracking-[0.3em] text-gold uppercase drop-shadow-sm">Khuyến mãi</p>
          <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl text-white drop-shadow-md font-display">Ưu đãi</h1>
          <p className="mt-6 text-lg text-gray-200 drop-shadow-md max-w-2xl mx-auto">
            Khám phá những chương trình khuyến mãi và đặc quyền tốt nhất từ các đối tác của 1Beauty.Asia.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        {allOffers.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {allOffers.map((o: any, i: number) => (
              <Link
                key={`${o.business.slug}-${i}`}
                href={`/doanh-nghiep/${o.business.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-gold-soft bg-champagne p-6 transition-all hover:border-gold hover:shadow-card md:p-8"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-20">
                  <Ticket className="size-32 text-gold" />
                </div>
                <div className="relative flex-1">
                  <span className="bg-gradient-gold rounded-full px-3 py-1 text-[11px] font-semibold tracking-widest text-ink uppercase">
                    {o.discount || "Ưu đãi"}
                  </span>
                  <h3 className="mt-5 max-w-[280px] font-display text-2xl">
                    {o.title}
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{o.description}</p>
                </div>
                <div className="relative mt-8 border-t border-gold-soft pt-6">
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium uppercase tracking-wider text-ink">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-gold" />
                      {o.business.name}
                    </span>
                    {o.code && (
                      <span className="rounded bg-gold/10 px-2 py-0.5 font-mono text-gold border border-gold/30">
                        {o.code}
                      </span>
                    )}
                  </div>
                  {o.validUntil && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      HSD: {
                        o.validUntil.includes('-') 
                          ? new Date(o.validUntil).toLocaleDateString('vi-VN') 
                          : o.validUntil
                      }
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-16 text-center">
            <Ticket className="mx-auto size-12 text-gold/40" />
            <p className="mt-4 text-muted-foreground">
              Hiện chưa có ưu đãi nào. Các doanh nghiệp có thể thêm ưu đãi trong trang quản lý.
            </p>
            <Link
              href="/tim-kiem"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold/40 px-6 py-2.5 text-sm text-gold transition-colors hover:bg-gold hover:text-ink"
            >
              Xem danh bạ doanh nghiệp
            </Link>
          </div>
        )}
      </div>
    </PageShell>
  );
}
