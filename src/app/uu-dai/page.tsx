import Link from "next/link";
import { Ticket } from "lucide-react";
import { PageShell } from "@/components/site/Layout";
import { getPublishedBusinesses } from "@/data/business";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ưu đãi làm đẹp độc quyền | 1Beauty.Asia",
  description: "Tổng hợp ưu đãi, voucher và mã giảm giá từ các spa, thẩm mỹ viện và salon uy tín trên 1Beauty.Asia.",
};

export default async function OffersPage() {
  const businesses = await getPublishedBusinesses(50);
  
  // extract offers from page_content (JSON)
  const offers = businesses.flatMap((b) => {
    const content = b.page_content as any;
    const bizOffers = content?.offers || [];
    return bizOffers.map((o: any) => ({ ...o, business: { ...b, ...content } }));
  });

  return (
    <PageShell>
      <section className="border-b border-border bg-champagne/40">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <p className="text-xs tracking-[0.3em] text-gold uppercase">Đặc quyền</p>
          <div className="rule-gold mt-3" />
          <h1 className="mt-5 text-3xl md:text-4xl">Ưu đãi đang diễn ra</h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            {offers.length} ưu đãi từ các thương hiệu làm đẹp được tuyển chọn.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-14 md:grid-cols-2 lg:grid-cols-3">
        {offers.map((o: any) => (
          <div
            key={`${o.business.slug}-${o.title}`}
            className="shadow-card flex flex-col rounded-sm border border-border/70 bg-card p-6"
          >
            <span className="bg-gradient-gold w-fit rounded-sm px-3 py-1 text-[11px] font-semibold tracking-widest text-ink uppercase">
              {o.discount}
            </span>
            <h2 className="mt-4 text-xl">{o.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{o.description}</p>
            {o.code && (
              <p className="mt-4 rounded-sm border border-dashed border-gold-soft bg-champagne px-3 py-2 text-sm">
                Mã: <span className="font-semibold tracking-widest">{o.code}</span>
              </p>
            )}
            <p className="mt-3 text-xs text-muted-foreground">HSD: {o.validUntil}</p>
            <Link
              href={`/doanh-nghiep/${o.business.slug}`}
              className="mt-auto flex items-center gap-1.5 pt-5 text-sm text-gold"
            >
              <Ticket className="size-4" /> {o.business.name}
            </Link>
          </div>
        ))}
        {offers.length === 0 && (
          <p className="col-span-3 text-muted-foreground">Chưa có ưu đãi nào.</p>
        )}
      </section>
    </PageShell>
  );
}
