"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, PhoneCall, Mail, Zap, CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/site/Layout";
import { PlatformChatWidget } from "@/components/site/PlatformChatWidget";
import { CONTACT_ZALO } from "@/config/site-config";

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
            Sẵn Sàng Chuyển Đổi Số <br className="hidden md:block" /> Cho Tiệm Của Bạn?
          </h1>
          <p className="mt-6 text-gray-300 md:text-lg max-w-2xl mx-auto">
            Hỗ trợ cài đặt trọn gói hệ thống đặt lịch tự động và chatbot AI chỉ trong 5 phút. Hãy để lại thông tin hoặc nhắn tin trực tiếp cho chúng tôi qua Zalo.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-[1.5fr_1fr]">
        {/* Form đăng ký */}
        <div className="rounded-3xl border border-border bg-card p-8 md:p-10 shadow-sm">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink mb-2">
            Đăng Ký Setup Siêu Tốc
          </h2>
          <p className="text-muted-foreground mb-8">
            Vui lòng điền thông tin, kỹ thuật viên của 1Booking sẽ liên hệ và cài đặt ngay cho bạn.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {sent ? (
              <div className="py-12 text-center bg-green-50 rounded-2xl border border-green-100">
                <CheckCircle2 className="size-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl text-green-700 font-bold mb-2">Đã Nhận Yêu Cầu!</h3>
                <p className="text-green-600/80">Kỹ thuật viên sẽ gọi cho bạn trong ít phút tới để tiến hành cài đặt.</p>
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
                    <><Zap className="size-5" /> Gửi Yêu Cầu Triển Khai Ngay</>
                  )}
                </button>
              </>
            )}
          </form>
        </div>

        {/* Thông tin liên hệ trực tiếp */}
        <aside className="space-y-6">
          <div className="rounded-3xl border-2 border-gold-soft bg-champagne p-8">
            <h3 className="font-display text-2xl font-bold text-ink mb-2">Cần Hỗ Trợ Gấp?</h3>
            <p className="text-sm text-muted-foreground mb-8">
              Nhắn tin trực tiếp qua Zalo để kỹ thuật viên phản hồi bạn ngay trong 1 phút.
            </p>
            
            <div className="space-y-4">
              <Link
                href={CONTACT_ZALO}
                target="_blank"
                className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm hover:border-gold hover:shadow-md transition-all group border border-border"
              >
                <div className="bg-blue-100 p-3 rounded-xl text-blue-600 group-hover:scale-110 transition-transform">
                  <MessageCircle className="size-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Chat Zalo Kỹ Thuật</p>
                  <p className="text-ink font-bold">1Booking.Asia Support</p>
                </div>
              </Link>

              <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-border">
                <div className="bg-green-100 p-3 rounded-xl text-green-600">
                  <PhoneCall className="size-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Hotline Đăng Ký</p>
                  <p className="text-ink font-bold">0918.731.411</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-border">
                <div className="bg-gold/20 p-3 rounded-xl text-gold">
                  <Mail className="size-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Email Đối Tác</p>
                  <p className="text-ink font-bold">partner@1booking.asia</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-ink p-8 rounded-3xl text-center text-white">
            <p className="text-gold font-bold text-xl mb-2">Cam Kết Của Chúng Tôi</p>
            <p className="text-white/70 text-sm leading-relaxed">
              Triển khai trong 5 phút. Không thu phí khởi tạo nền tảng. Hoàn tiền 100% nếu không tăng tỷ lệ khách quay lại sau 3 tháng sử dụng.
            </p>
          </div>
        </aside>
      </section>
      
      <PlatformChatWidget />
    </PageShell>
  );
}
