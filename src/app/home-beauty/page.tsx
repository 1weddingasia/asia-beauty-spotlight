import Link from "next/link";
import { ArrowRight, Bell, QrCode, Smartphone, Sparkles, CheckCircle, Zap, Star, Users, Bot } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site/Layout";
import { HeroSlider } from "@/components/site/HeroSlider";
import { PlatformChatWidget } from "@/components/site/PlatformChatWidget";
import { createStaticClient } from "@/utils/supabase/server";
import { CONTACT_ZALO } from "@/config/site-config";

export const revalidate = 3600;

export const metadata = {
  title: "1Beauty.Asia — Cổng Nhận Khách 1-Chạm Cho Tiệm Làm Đẹp",
  description: "Giải pháp số hóa hoàn chỉnh cho Spa & Salon: Landing page ưu đãi riêng, chuông Telegram tức thì, sổ quản lý khách hàng Mini-CRM. Chỉ 500.000đ/năm.",
};

export default async function HomePage() {
  const supabase = createStaticClient();

  // Lấy số lượng tiệm đang hoạt động để social proof
  let activeShops = 0;
  let totalLeads = 0;

  try {
    const { count: shops } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .in('status', ['published', 'active', 'trial']);
    activeShops = shops || 0;

    const { count: leads } = await supabase
      .from('business_leads')
      .select('*', { count: 'exact', head: true });
    totalLeads = leads || 0;
  } catch (error) {
    console.error("Failed to fetch stats:", error);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader solid />

      {/* ═══════════════════════════════════════════════════ */}
      {/* HERO — Headline B2B                                */}
      {/* ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-ink pt-28 pb-24 md:pt-36 md:pb-32">
        <HeroSlider />
        <div className="relative mx-auto max-w-5xl px-6 text-center z-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-gold uppercase mb-8">
            <Zap className="size-3" />
            Giải pháp chìa khóa trao tay — 500.000đ/năm
          </div>

          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-white leading-[1.1] tracking-tight">
            Cổng Nhận Khách{" "}
            <span className="text-gradient-gold">1-Chạm</span>
            <br />cho Tiệm Làm Đẹp
          </h1>

          <p className="mt-6 text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            Khách quét QR → Chọn deal → Để số điện thoại →{" "}
            <span className="text-gold font-semibold">Tiệm nghe chuông Telegram ngay lập tức.</span>{" "}
            Không cần app. Không cần kỹ thuật.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/luxury-spa-demo"
              className="group inline-flex items-center gap-2 bg-gold text-ink font-bold px-8 py-4 rounded-2xl text-lg shadow-xl hover:bg-gold-soft hover:scale-105 transition-all"
            >
              <Sparkles className="size-5" />
              Xem Demo Tiệm (Luxury Spa)
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href={CONTACT_ZALO} target="_blank"
              className="inline-flex items-center gap-2 border border-white/20 text-white px-8 py-4 rounded-2xl text-lg hover:bg-white/10 transition-colors"
            >
              📞 Liên hệ kích hoạt
            </Link>
          </div>

          {/* Social proof numbers */}
          {(activeShops || totalLeads) ? (
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-white/60 text-sm">
              {activeShops ? (
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-gold" />
                  <span><strong className="text-white">{activeShops}</strong> tiệm đang dùng</span>
                </div>
              ) : null}
              {totalLeads ? (
                <div className="flex items-center gap-2">
                  <Bell className="size-4 text-gold" />
                  <span><strong className="text-white">{totalLeads.toLocaleString()}</strong> khách hàng đã đăng ký</span>
                </div>
              ) : null}
              <div className="flex items-center gap-2">
                <Star className="size-4 text-gold" />
                <span><strong className="text-white">500.000đ</strong>/năm trọn gói</span>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════ */}
      {/* 3 TÍNH NĂNG CỐT LÕI                               */}
      {/* ═══════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-background">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <p className="text-xs tracking-[0.3em] text-gold uppercase">Hệ thống 4-trong-1</p>
            <h2 className="mt-4 font-display text-3xl md:text-4xl text-ink">
              Tất cả những gì tiệm bạn cần
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Một hệ thống duy nhất thay thế toàn bộ: trang web giới thiệu, form đặt lịch, phần mềm quản lý khách hàng và nhân viên trực page 24/7.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <QrCode className="size-8 text-gold" />,
                title: "Landing Page Riêng",
                badge: "Mặt tiền số",
                desc: "Tiệm bạn có ngay 1 trang web chuyên nghiệp tại địa chỉ 1beauty.asia/[ten-tiem]. Đăng link lên bio TikTok, Facebook, Google Maps — khách bấm vào là thấy deal ngay.",
                highlight: "Không chia traffic với đối thủ"
              },
              {
                icon: <Bell className="size-8 text-gold" />,
                title: "Chuông Telegram < 1s",
                badge: "Không sót đơn",
                desc: "Mỗi khi có khách để lại số điện thoại, điện thoại của bạn/quản lý nổ chuông Telegram ngay lập tức. Tin nhắn ghi rõ: Tên, SĐT, Gói chọn và Khách mới/VIP.",
                highlight: "Gọi ngay khi khách đang nóng"
              },
              {
                icon: <Smartphone className="size-8 text-gold" />,
                title: "Sổ Khách Mini-CRM",
                badge: "Giữ chân khách VIP",
                desc: "Mọi khách hàng đều được lưu lại với tag tự động: Khách mới, Quay lại, VIP. Xuất Excel cuối tháng để chăm sóc qua Zalo, SMS vào dịp lễ Tết.",
                highlight: "Biết khách cũ để phục vụ tốt hơn"
              },
              {
                icon: <Bot className="size-8 text-gold" />,
                title: "Bot AI Trực 24/7",
                badge: "Chăm sóc tự động",
                desc: "Chatbot thông minh học thuộc mọi bảng giá, dịch vụ của tiệm. Tự động trả lời khách hàng 24/7, xin thông tin và chốt sale ngay cả khi bạn đang ngủ.",
                highlight: "Không bỏ lỡ khách hàng ban đêm"
              }
            ].map((f, i) => (
              <div key={i} className="group rounded-3xl border border-gold-soft bg-champagne p-6 transition-all hover:-translate-y-1 hover:shadow-card hover:border-gold">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gold/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-gold">
                  {f.badge}
                </div>
                <div className="mb-4">{f.icon}</div>
                <h3 className="font-display text-lg text-ink mb-3">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{f.desc}</p>
                <p className="text-xs font-bold text-gold">✓ {f.highlight}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════ */}
      {/* LUỒNG 5 BƯỚC                                       */}
      {/* ═══════════════════════════════════════════════════ */}
      <section className="py-20 bg-muted/40 border-y border-border">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] text-gold uppercase">Cực kỳ đơn giản</p>
            <h2 className="mt-4 font-display text-3xl md:text-4xl text-ink">Khách hàng chỉ cần 3 bước</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Quét QR hoặc bấm link", desc: "Khách thấy deal rõ ràng với giá ưu đãi ngay lập tức." },
              { step: "02", title: "Để lại số điện thoại", desc: "Popup đơn giản, chỉ cần nhập SĐT. Không cần đăng ký tài khoản." },
              { step: "03", title: "Đến tiệm nhận ưu đãi", desc: "Khách đọc SĐT tại quầy — đó chính là mã giảm giá của họ." },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-start p-6 bg-background rounded-2xl border border-border">
                <span className="text-5xl font-black text-gold/20 leading-none">{s.step}</span>
                <h3 className="mt-3 font-bold text-ink text-lg">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════ */}
      {/* BẢNG GIÁ                                           */}
      {/* ═══════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-background">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-xs tracking-[0.3em] text-gold uppercase">Minh bạch, không ẩn phí</p>
          <h2 className="mt-4 font-display text-3xl md:text-4xl text-ink">Một mức giá. Đầy đủ tính năng.</h2>
          <p className="mt-4 text-muted-foreground">Không cần ký hợp đồng dài hạn. Không bị ép mua thêm gói.</p>

          <div className="mt-10 relative rounded-3xl border-2 border-gold bg-champagne p-10 shadow-card">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold text-ink text-xs font-black px-5 py-1.5 rounded-full uppercase tracking-widest">
              Trọn gói
            </div>
            <div className="flex items-end justify-center gap-2 mt-2">
              <span className="text-6xl font-black text-ink">500K</span>
              <span className="text-xl text-muted-foreground mb-2">/năm</span>
            </div>

            <ul className="mt-8 space-y-3 text-left max-w-xs mx-auto">
              {[
                "Landing Page ưu đãi riêng của tiệm",
                "Chuông Telegram bắn tức thì < 1 giây",
                "Sổ quản lý khách Mini-CRM",
                "Bảng QR Standee A5 (in ngay trên web)",
                "Xuất danh sách khách ra Excel",
                "Hỗ trợ cài đặt & bàn giao tận tay",
                "Dùng thử miễn phí 7 ngày",
              ].map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-ink">
                  <CheckCircle className="size-4 text-gold mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={CONTACT_ZALO} target="_blank"
                className="inline-flex items-center justify-center gap-2 bg-gold text-ink font-bold px-8 py-4 rounded-2xl text-lg shadow-lg hover:bg-gold/90 hover:scale-105 transition-all"
              >
                ⚡ Kích Hoạt Cổng Ngay
              </Link>
              <Link
                href="/luxury-spa-demo"
                className="inline-flex items-center justify-center gap-2 border border-gold/40 text-gold px-8 py-4 rounded-2xl text-lg hover:bg-gold/10 transition-colors"
              >
                Xem trang Demo trước
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════ */}
      {/* CTA CUỐI TRANG                                     */}
      {/* ═══════════════════════════════════════════════════ */}
      <section className="py-20 bg-ink text-center">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="font-display text-3xl md:text-4xl text-white">
            Mỗi ngày không có hệ thống là{" "}
            <span className="text-gold">một ngày mất khách</span>
          </h2>
          <p className="mt-4 text-white/70">
            Bắt đầu ngay hôm nay. Tiệm bạn sẽ có hệ thống hoàn chỉnh trong vòng 15 phút.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={CONTACT_ZALO} target="_blank"
              className="inline-flex items-center justify-center gap-2 bg-gold text-ink font-bold px-8 py-4 rounded-2xl text-lg hover:bg-gold/90 transition-all hover:scale-105"
            >
              📞 Nhắn Zalo Ngay
            </Link>
            <Link
              href="/uu-dai"
              className="inline-flex items-center justify-center gap-2 border border-white/20 text-white px-8 py-4 rounded-2xl text-lg hover:bg-white/10 transition-colors"
            >
              Khám phá Ưu đãi
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
      <PlatformChatWidget />
    </div>
  );
}
