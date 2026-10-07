"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, PhoneCall, Mail, Zap, CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/site/Layout";
import { PlatformChatWidget } from "@/components/site/PlatformChatWidget";
import { CONTACT_ZALO, CONTACT_PHONE, CONTACT_EMAIL } from "@/config/site-config";

export default function ContactBookingClient() {
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
      console.error("Contact form error:", err);
      setErrorMsg("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <section className="relative border-b border-border bg-ink">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center bg-no-repeat opacity-20 mix-blend-luminosity"></div>
        
        <div className="relative z-10 mx-auto max-w-6xl px-6 py-24 text-center md:py-32 lg:py-36">
          <p className="text-xs font-bold tracking-[0.3em] text-gold uppercase mb-4">Kết nối cùng chuyên gia</p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white tracking-tight">
            Liên Hệ Tư Vấn
          </h1>
          <p className="mt-6 text-gray-300 md:text-lg max-w-2xl mx-auto">
            Vui lòng để lại thông tin, đội ngũ của chúng tôi sẽ liên hệ lại với bạn trong thời gian sớm nhất.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-20">
        {/* Form đăng ký */}
        <div className="rounded-3xl border border-border bg-card p-8 md:p-10 shadow-sm">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink mb-2">
            Đăng Ký Tư Vấn
          </h2>
          <p className="text-muted-foreground mb-8">
            Vui lòng điền thông tin bên dưới, chúng tôi sẽ liên hệ với bạn.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {sent ? (
              <div className="py-12 text-center bg-green-50 rounded-2xl border border-green-100">
                <CheckCircle2 className="size-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl text-green-700 font-bold mb-2">Đã Nhận Yêu Cầu!</h3>
                <p className="text-green-600/80">Chúng tôi sẽ liên hệ lại với bạn trong thời gian sớm nhất.</p>
              </div>
            ) : (
              <>
                {errorMsg && (
                  <div className="p-4 mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
                    {errorMsg}
                  </div>
                )}
                <div>
                  <label className="text-sm font-bold text-ink mb-2 block">Tên cơ sở / Cửa hàng</label>
                  <input required type="text" name="businessName" placeholder="VD: Nha khoa Nụ Cười, Spa Relax..." className="w-full rounded-xl border border-border bg-muted/30 p-3.5 text-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all" />
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-bold text-ink mb-2 block">Người liên hệ</label>
                    <input required type="text" name="contactName" placeholder="Tên của bạn" className="w-full rounded-xl border border-border bg-muted/30 p-3.5 text-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-ink mb-2 block">Số điện thoại Zalo</label>
                    <input required type="tel" name="phone" placeholder="09xx.xxx.xxx" className="w-full rounded-xl border border-border bg-muted/30 p-3.5 text-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-bold text-ink mb-2 block">Yêu cầu thêm (Tùy chọn)</label>
                  <textarea rows={4} name="message" placeholder="Bạn muốn tư vấn thêm về ngành nghề nào?" className="w-full rounded-xl border border-border bg-muted/30 p-3.5 text-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all resize-none"></textarea>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gold w-full rounded-xl py-4 text-ink font-bold transition-all hover:bg-gold-soft hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-gold/20"
                >
                  {loading ? (
                    <div className="size-5 rounded-full border-2 border-ink/30 border-t-ink animate-spin"></div>
                  ) : (
                    <><Zap className="size-5" /> Gửi Yêu Cầu Ngay</>
                  )}
                </button>
              </>
            )}
          </form>
        </div>


      </section>
      
      <PlatformChatWidget />
    </PageShell>
  );
}
