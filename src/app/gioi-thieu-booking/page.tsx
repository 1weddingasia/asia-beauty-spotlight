import Link from "next/link";
import { ArrowRight, Bot, Zap, ShieldCheck, PieChart, Users, TrendingUp } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site/Layout";
import { PlatformChatWidget } from "@/components/site/PlatformChatWidget";

export const metadata = {
  title: "Về 1Booking.Asia — Nền tảng Đặt lịch 1-chạm & Lễ tân AI",
  description: "Giải pháp Micro-SaaS giúp chủ cơ sở dịch vụ tự động hóa quy trình đón khách, quản lý lịch hẹn thông minh và giữ trọn 100% lợi nhuận.",
};

export default function GioiThieuBookingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <SiteHeader solid={false} />

      {/* Hero Section */}
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-ink pt-24 pb-16">
        <div className="absolute inset-0 z-0">
          <div className="absolute -top-[20%] -right-[10%] h-[70vw] w-[70vw] rounded-full border border-gold/20" />
          <div className="absolute top-[30%] -left-[20%] h-[50vw] w-[50vw] rounded-full border border-champagne/10" />
        </div>

        <div className="container relative z-10 mx-auto max-w-5xl px-6 text-center">
          <span className="mb-6 block text-xs font-semibold tracking-[0.3em] text-gold uppercase">
            Micro-SaaS Cho Ngành Dịch Vụ
          </span>
          <h1 className="font-display text-5xl font-bold leading-[1.1] tracking-tight text-white md:text-7xl">
            Sứ Mệnh Giải Phóng <br />
            <span className="text-gradient-gold">Người Làm Dịch Vụ</span>
          </h1>
          <p className="mx-auto mt-8 max-w-3xl text-lg font-light leading-relaxed text-gray-300 md:text-xl">
            Chúng tôi tin rằng chủ tiệm sinh ra là để sáng tạo và phục vụ khách hàng bằng cả trái tim, chứ không phải để cắm mặt vào màn hình điện thoại trả lời tin nhắn lúc 2h sáng.
          </p>
          <div className="mt-12 flex justify-center">
            <Link
              href="#cau-chuyen"
              className="inline-flex items-center gap-2 rounded-2xl bg-gold px-8 py-4 font-bold text-ink transition-transform hover:scale-105"
            >
              Xem Câu Chuyện Của Chúng Tôi <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Story / Problem Section */}
      <section id="cau-chuyen" className="py-24 md:py-32 bg-champagne/30 scroll-mt-20">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-display text-3xl md:text-5xl font-bold text-ink mb-6">
                Nỗi Đau Của Việc <br className="hidden md:block" />
                "Bán Máu" Cho Nền Tảng
              </h2>
              <div className="w-20 h-1 bg-gold mb-8 rounded-full" />
              <p className="text-muted-foreground leading-relaxed mb-6 text-lg">
                Nhiều cơ sở dịch vụ đang mắc kẹt trong một vòng lặp nghiệt ngã: Đăng ký lên các ứng dụng đặt chỗ để có khách, nhưng lại phải chịu <strong>cắt phế hoa hồng từ 20% đến 30%</strong> trên mỗi hóa đơn.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6 text-lg">
                Đau đớn hơn, <strong>dữ liệu khách hàng hoàn toàn thuộc về nền tảng</strong>. Bạn không có số điện thoại để chăm sóc, không thể chủ động gửi ưu đãi. Khi rời nền tảng, bạn mất trắng.
              </p>
              <div className="p-6 bg-white border border-gold/30 rounded-2xl shadow-sm">
                <p className="font-semibold text-ink text-lg italic">
                  "Lợi nhuận gộp của một dịch vụ gội đầu hay làm nail chỉ khoảng 40%. Bị cắt phế 20% thì chủ tiệm đang làm thuê trên chính cơ sở của mình."
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gold/10 rounded-[3rem] transform rotate-3" />
              <img 
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80" 
                alt="Tiệm dịch vụ" 
                className="relative rounded-[3rem] shadow-2xl object-cover aspect-[4/5] w-full border-4 border-white"
              />
            </div>
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="py-24 md:py-32 bg-background border-y border-border">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="text-center mb-20">
            <span className="text-xs font-bold tracking-[0.2em] text-gold uppercase">Giải Pháp Của 1Booking</span>
            <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold text-ink">Làm Chủ Hoàn Toàn 100%</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg">
              1Booking.Asia không phải là sàn thương mại điện tử thu phế. Chúng tôi cung cấp công cụ phần mềm (SaaS) để bạn tự xây vương quốc của mình.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <PieChart className="size-10 text-gold" />,
                title: "Giữ Trọn 100% Lợi Nhuận",
                desc: "Chúng tôi thu phí thuê bao cố định cực rẻ (chỉ từ 500K/năm). Dù bạn có 10 khách hay 1000 khách mỗi tháng, bạn không phải chia sẻ thêm bất kỳ đồng nào."
              },
              {
                icon: <Users className="size-10 text-gold" />,
                title: "Sở Hữu Tệp Khách Hàng",
                desc: "Khách đặt lịch xong, số điện thoại tự động chạy vào Mini-CRM của riêng bạn. Bạn có thể xuất Excel để remarketing, nhắn tin chúc mừng sinh nhật tùy ý."
              },
              {
                icon: <Bot className="size-10 text-gold" />,
                title: "Tự Động Hóa Vận Hành",
                desc: "Hệ thống Lễ tân AI trực trang 24/7. Chuông báo Telegram nổ ngay khi có đơn. Giúp chủ tiệm tập trung vào chuyên môn thay vì canh điện thoại."
              }
            ].map((f, i) => (
              <div key={i} className="bg-muted/30 border border-border p-8 rounded-3xl hover:border-gold hover:shadow-card transition-all">
                <div className="mb-6 inline-flex p-4 rounded-2xl bg-gold/10">{f.icon}</div>
                <h3 className="font-display text-2xl font-bold text-ink mb-4">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Industries */}
      <section className="py-24 bg-ink text-white">
        <div className="container mx-auto max-w-6xl px-6 text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-16">
            Nền Tảng Sinh Ra Cho <span className="text-gold">Mọi Ngành Nghề</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              "Spa & Thẩm Mỹ", "Nha Khoa", "Nhà Hàng (F&B)", "Chăm Sóc Ô Tô",
              "Phòng Khám", "Thú Cưng", "Dịch Vụ Tại Nhà", "Studio Ảnh",
              "Homestay", "Coaching 1:1", "Yoga & PT", "Salon Tóc"
            ].map((item, i) => (
              <div key={i} className="py-4 px-6 rounded-2xl border border-white/10 bg-white/5 font-semibold hover:bg-gold/10 hover:border-gold/30 hover:text-gold transition-colors">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-champagne text-center border-t border-gold/20">
        <div className="container mx-auto max-w-3xl px-6">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-ink mb-6">
            Bắt Đầu Hiện Đại Hóa Tiệm Của Bạn Ngay Hôm Nay
          </h2>
          <p className="text-muted-foreground mb-10 text-lg">
            Gia nhập cộng đồng hàng trăm cơ sở dịch vụ đang tiên phong sử dụng nền tảng 1Booking.Asia. Triển khai siêu tốc chỉ trong 5 phút.
          </p>
          <Link
            href="/lien-he"
            className="inline-flex items-center gap-2 rounded-2xl bg-ink text-white px-8 py-4 font-bold transition-transform hover:scale-105 shadow-xl"
          >
            <TrendingUp className="size-5 text-gold" />
            Đăng Ký Tư Vấn Setup Miễn Phí
          </Link>
        </div>
      </section>

      <SiteFooter />
      <PlatformChatWidget />
    </div>
  );
}
