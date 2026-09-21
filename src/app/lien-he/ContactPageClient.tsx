"use client";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { PageShell } from "@/components/site/Layout";

interface ContactPageClientProps {
  address?: string;
  phone?: string;
  email?: string;
}

export default function ContactPageClient({ address, phone, email }: ContactPageClientProps) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    
    const formData = new FormData(e.currentTarget);
    try {
      const { submitContactForm } = await import("@/app/actions/contact");
      const res = await submitContactForm(formData);
      if (res.success) {
        setSent(true);
      } else {
        setErrorMsg(res.error || "Có lỗi xảy ra, vui lòng thử lại.");
      }
    } catch (err) {
      setErrorMsg("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <section className="relative border-b border-border">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("https://images.pexels.com/photos/7648306/pexels-photo-7648306.jpeg?auto=compress&cs=tinysrgb&w=1920")' }}
        >
          <div className="absolute inset-0 bg-ink/70"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 md:py-24 text-center">
          <p className="text-xs tracking-[0.3em] text-gold uppercase drop-shadow-sm">Liên hệ</p>
          <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl text-white drop-shadow-md font-display tracking-tight">Đăng ký doanh nghiệp</h1>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.4fr_1fr]">
        <form
          className="space-y-4 rounded-xl border border-border bg-card p-6"
          onSubmit={handleSubmit}
        >
          {sent ? (
            <div className="py-10 text-center">
              <p className="text-lg text-gold font-medium">Yêu cầu đã được gửi!</p>
              <p className="mt-2 text-sm text-muted-foreground">Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.</p>
            </div>
          ) : (
            <>
              {errorMsg && (
                <div className="p-3 mb-4 text-sm text-red-500 bg-red-100/10 border border-red-500/20 rounded-md">
                  {errorMsg}
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Tên doanh nghiệp / Spa</label>
                <input required type="text" name="businessName" className="mt-1.5 w-full rounded-md border bg-transparent p-2 text-sm" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Người liên hệ</label>
                  <input required type="text" name="contactName" className="mt-1.5 w-full rounded-md border bg-transparent p-2 text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium">Số điện thoại</label>
                  <input required type="tel" name="phone" className="mt-1.5 w-full rounded-md border bg-transparent p-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Lời nhắn</label>
                <textarea required rows={4} name="message" className="mt-1.5 w-full rounded-md border bg-transparent p-2 text-sm"></textarea>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-gold w-full rounded-md py-2.5 text-sm font-medium text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Đang gửi..." : "Gửi yêu cầu đăng ký"}
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
                <MapPin className="size-4 text-gold shrink-0" />
                {address || "Khu Công nghệ cao, TP. Hồ Chí Minh"}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="size-4 text-gold shrink-0" />
                {phone || "+84 28 7300 1988"}
              </p>
              <p className="flex items-center gap-2">
                <Mail className="size-4 text-gold shrink-0" />
                {email || "contact@1beauty.asia"}
              </p>
            </div>
          </div>
        </aside>
      </section>
    </PageShell>
  );
}
