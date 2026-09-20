import { PageShell } from "@/components/site/Layout";
import { Sparkles, Ticket } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Ưu đãi | 1Beauty.Asia",
  description: "Tổng hợp các chương trình khuyến mãi, ưu đãi độc quyền từ các spa và thẩm mỹ viện.",
};

const offers = [
  {
    title: "Giảm 20% Dịch vụ Spa",
    description: "Áp dụng cho khách hàng mới lần đầu sử dụng dịch vụ tại Luxury Spa. Không áp dụng cùng các CTKM khác.",
    discount: "-20%",
    validUntil: "30/10/2026",
    code: "LUX20",
    business: { slug: "spa-1", name: "Luxury Spa" },
  },
  {
    title: "Mua 1 Tặng 1 Chăm sóc da",
    description: "Mua liệu trình chăm sóc da chuyên sâu 60 phút, tặng ngay 1 buổi massage cổ vai gáy 30 phút.",
    discount: "MUA 1 TẶNG 1",
    validUntil: "15/11/2026",
    code: "SKIN11",
    business: { slug: "clinic-1", name: "Seoul Clinic" },
  },
  {
    title: "Voucher 500k Làm Tóc",
    description: "Tặng voucher 500k cho hóa đơn từ 2 triệu đồng (cắt, uốn, nhuộm, phục hồi).",
    discount: "500K",
    validUntil: "31/12/2026",
    code: "HAIR500",
    business: { slug: "salon-1", name: "Tokyo Hair Salon" },
  }
];

export default function OffersPage() {
  return (
    <PageShell>
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl">Ưu đãi</h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Khám phá những chương trình khuyến mãi và đặc quyền tốt nhất từ các đối tác của 1Beauty.Asia.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {offers.map((o, i) => (
            <Link
              key={i}
              href={`/doanh-nghiep/${o.business.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-gold-soft bg-champagne p-6 transition-all hover:border-gold hover:shadow-card md:p-8"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-20">
                <Ticket className="size-32 text-gold" />
              </div>
              <div className="relative flex-1">
                <span className="bg-gradient-gold rounded-full px-3 py-1 text-[11px] font-semibold tracking-widest text-ink uppercase">
                  {o.discount}
                </span>
                <h3 className="mt-5 max-w-[280px] font-display text-2xl">
                  {o.title}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">{o.description}</p>
              </div>
              <div className="relative mt-8 border-t border-gold-soft pt-6">
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium uppercase tracking-wider text-ink">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-gold" />
                    {o.business.name}
                  </span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  HSD: {o.validUntil}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
