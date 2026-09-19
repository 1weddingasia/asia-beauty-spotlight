"use client";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { PageShell } from "@/components/site/Layout";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <PageShell>
      <section className="border-b border-border bg-champagne/40">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <p className="text-xs tracking-[0.3em] text-gold uppercase">Liên hệ</p>
          <div className="rule-gold mt-3" />
          <h1 className="mt-5 text-3xl md:text-4xl">Đăng ký doanh nghiệp của bạn</h1>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.4fr_1fr]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
          className="shadow-card space-y-4 rounded-sm border border-border/70 bg-card p-8"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              Tên doanh nghiệp
              <input
                required
                className="mt-1.5 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-gold"
              />
            </label>
            <label className="block text-sm">
              Người liên hệ
              <input
                required
                className="mt-1.5 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-gold"
              />
            </label>
            <label className="block text-sm">
              Email
              <input
                type="email"
                required
                className="mt-1.5 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-gold"
              />
            </label>
            <label className="block text-sm">
              Điện thoại
              <input
                className="mt-1.5 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-gold"
              />
            </label>
          </div>
          <label className="block text-sm">
            Nội dung
            <textarea
              rows={5}
              className="mt-1.5 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-gold"
            />
          </label>
          <button
            type="submit"
            className="bg-gradient-gold rounded-sm px-7 py-3 text-xs font-semibold tracking-[0.2em] text-ink uppercase"
          >
            Gửi thông tin
          </button>
          {sent && (
            <p className="text-sm text-gold">
              Cảm ơn bạn! Thông tin đã được ghi nhận, đội ngũ sẽ liên hệ trong 24 giờ.
            </p>
          )}
        </form>

        <aside className="space-y-5 rounded-sm border border-border/70 bg-champagne p-8">
          <p className="text-xs tracking-[0.25em] text-gold uppercase">Thông tin</p>
          <p className="flex items-center gap-2 text-sm">
            <Mail className="size-4 text-gold" /> contact@1beauty.asia
          </p>
          <p className="flex items-center gap-2 text-sm">
            <Phone className="size-4 text-gold" /> +84 28 7300 1988
          </p>
          <p className="flex items-center gap-2 text-sm">
            <MapPin className="size-4 text-gold" /> TP. Hồ Chí Minh, Việt Nam
          </p>
          <p className="text-sm text-muted-foreground">
            Thông tin doanh nghiệp hiện được đội ngũ biên tập cập nhật thủ công để đảm bảo chất
            lượng danh bạ.
          </p>
        </aside>
      </section>
    </PageShell>
  );
}
