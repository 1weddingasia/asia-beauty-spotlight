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
          className="space-y-4 rounded-xl border border-border bg-card p-6"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          {sent ? (
            <div className="py-10 text-center">
              <p className="text-lg text-gold font-medium">Yêu cầu đã được gửi!</p>
              <p className="mt-2 text-sm text-muted-foreground">Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.</p>
            </div>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium">Tên doanh nghiệp / Spa</label>
                <input required type="text" className="mt-1.5 w-full rounded-md border bg-transparent p-2 text-sm" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Người liên hệ</label>
                  <input required type="text" className="mt-1.5 w-full rounded-md border bg-transparent p-2 text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium">Số điện thoại</label>
                  <input required type="tel" className="mt-1.5 w-full rounded-md border bg-transparent p-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Lời nhắn</label>
                <textarea required rows={4} className="mt-1.5 w-full rounded-md border bg-transparent p-2 text-sm"></textarea>
              </div>
              <button
                type="submit"
                className="bg-gradient-gold w-full rounded-md py-2.5 text-sm font-medium text-ink transition-opacity hover:opacity-90"
              >
                Gửi yêu cầu đăng ký
              </button>
            </>
          )}
        </form>

        <aside className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-display text-xl text-gold">Tại sao chọn 1Beauty?</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>• Tiếp cận hàng ngàn khách hàng tiềm năng.</li>
              <li>• Tăng độ uy tín thương hiệu trên hệ thống của chúng tôi.</li>
              <li>• Trang đích chuẩn SEO, thiết kế sang trọng.</li>
              <li>• Hỗ trợ quảng cáo qua các chương trình Ưu đãi.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-medium">Thông tin hỗ trợ</h3>
            <div className="mt-4 space-y-4 text-sm">
              <p className="flex items-center gap-2">
                <MapPin className="size-4 text-gold" />
                Khu Công nghệ cao, TP. Hồ Chí Minh
              </p>
              <p className="flex items-center gap-2">
                <Phone className="size-4 text-gold" />
                +84 28 7300 1988
              </p>
              <p className="flex items-center gap-2">
                <Mail className="size-4 text-gold" />
                contact@1beauty.asia
              </p>
            </div>
          </div>
        </aside>
      </section>
    </PageShell>
  );
}
