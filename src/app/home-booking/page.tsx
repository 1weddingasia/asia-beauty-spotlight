import Link from "next/link";
import {
  ArrowRight, Bell, Smartphone, Sparkles, CheckCircle,
  Zap, Star, Users, Bot, Calendar,
  Stethoscope, UtensilsCrossed, Car, Dumbbell, Camera, PawPrint,
  Wrench, Home, BriefcaseBusiness, MessageSquare, FileSpreadsheet, BadgeCheck,
} from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site/Layout";
import { HeroSlider } from "@/components/site/HeroSlider";
import { PlatformChatWidget } from "@/components/site/PlatformChatWidget";
import { createStaticClient } from "@/utils/supabase/server";
import { CONTACT_ZALO } from "@/config/site-config";

export const revalidate = 3600;

export const metadata = {
  title: "1Booking.Asia — Nền Tảng Đặt Lịch 1-Chạm & Trợ Lý Lễ Tân AI Thế Hệ Mới",
  description:
    "Biến người lướt mạng thành khách quen ghé tiệm. Hệ thống đặt lịch tự động 24/7, chuông Telegram tức thì, Mini-CRM quản lý khách. Áp dụng cho 10 nhóm ngành dịch vụ. Chỉ 500.000đ/năm.",
};

// icon được render trực tiếp trong card — không có emoji field thừa
const INDUSTRIES = [
  { slug: "nha-khoa-quoc-te", icon: <Stethoscope className="size-7 text-gold" />, title: "Nha Khoa & Phòng Khám", desc: "Đặt hẹn khám chữa răng, chọn bác sĩ chuyên khoa, nhắc lịch tái khám tự động." },
  { slug: "luxury-spa-demo", icon: <UtensilsCrossed className="size-7 text-gold" />, title: "Nhà Hàng & Quán Ăn (F&B)", desc: "Đặt bàn tiệc trước giờ cao điểm, chọn trước set menu, giữ chỗ không lo hủy bàn." },
  { slug: "luxury-spa-demo", icon: <Car className="size-7 text-gold" />, title: "Chăm Sóc & Độ Xe Ô Tô", desc: "Đặt lịch rửa xe chi tiết, dán phim cách nhiệt, phủ ceramic với bảng giá minh bạch." },
  { slug: "luxury-spa-demo", icon: <Dumbbell className="size-7 text-gold" />, title: "Thể Hình, Yoga & PT", desc: "Đăng ký buổi tập thử, chọn khung giờ 1:1 cùng huấn luyện viên, kiểm soát số học viên." },
  { slug: "luxury-spa-demo", icon: <Sparkles className="size-7 text-gold" />, title: "Spa & Thẩm Mỹ Viện", desc: "Trưng bày liệu trình làm đẹp, săn voucher giảm giá giờ vàng, đặt lịch thư giãn cuối tuần." },
  { slug: "luxury-spa-demo", icon: <Camera className="size-7 text-gold" />, title: "Studio Chụp Ảnh & Áo Cưới", desc: "Xem lookbook concept, đặt lịch thử váy cưới, giữ lịch chụp ngoại cảnh." },
  { slug: "luxury-spa-demo", icon: <PawPrint className="size-7 text-gold" />, title: "Spa & Khách Sạn Thú Cưng", desc: "Đặt hẹn tắm tỉa lông, đưa đón thú cưng, đặt phòng gửi chó mèo an toàn." },
  { slug: "luxury-spa-demo", icon: <Wrench className="size-7 text-gold" />, title: "Dịch Vụ Sửa Chữa Tại Nhà", desc: "Đặt thợ vệ sinh máy lạnh, sửa điện nước, giặt sofa tận nơi đúng giờ hẹn." },
  { slug: "luxury-spa-demo", icon: <Home className="size-7 text-gold" />, title: "Homestay & Du Lịch Trải Nghiệm", desc: "Đặt phòng nghỉ dưỡng cuối tuần, thuê tour trải nghiệm trực tiếp không qua trung gian." },
  { slug: "luxury-spa-demo", icon: <BriefcaseBusiness className="size-7 text-gold" />, title: "Tư Vấn & Coaching 1:1", desc: "Đặt lịch tham vấn trực tuyến hoặc trực tiếp, chọn gói thời lượng và chủ đề tư vấn." },
];

export default async function HomeBookingPage() {
  const supabase = createStaticClient();

  let activeShops = 0;
  let totalLeads = 0;

  // Promise.allSettled: 2 query độc lập, 1 query lỗi không ảnh hưởng query kia
  const [shopsResult, leadsResult] = await Promise.allSettled([
    supabase.from("businesses").select("*", { count: "exact", head: true }).in("status", ["published", "active", "trial"]),
    supabase.from("business_leads").select("*", { count: "exact", head: true }),
  ]);

  if (shopsResult.status === "fulfilled") {
    if (shopsResult.value.error) console.error("Failed to fetch shops count:", shopsResult.value.error);
    activeShops = shopsResult.value.count ?? 0;
  } else {
    console.error("Failed to fetch shops count:", shopsResult.reason);
  }
  if (leadsResult.status === "fulfilled") {
    if (leadsResult.value.error) console.error("Failed to fetch leads count:", leadsResult.value.error);
    totalLeads = leadsResult.value.count ?? 0;
  } else {
    console.error("Failed to fetch leads count:", leadsResult.reason);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader solid />

      {/* ═══════════════════════════════════════════════════ */}
      {/* HERO                                               */}
      {/* ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-ink pt-28 pb-24 md:pt-36 md:pb-32">
        <HeroSlider />
        <div className="relative mx-auto max-w-5xl px-6 text-center z-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-gold uppercase mb-8">
            <Zap className="size-3" />
            🚀 Nền Tảng Đặt Lịch 1-Chạm &amp; Trợ Lý Lễ Tân AI Thế Hệ Mới
          </div>

          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-white leading-[1.1] tracking-tight">
            Biến Người Lướt Mạng Thành{" "}
            <span className="text-gradient-gold">Khách Quen</span>
            <br />Ghé Tiệm Của Bạn
          </h1>

          <p className="mt-6 text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            Hệ thống trang đặt lịch tự động chốt khách 24/7,{" "}
            <span className="text-gold font-semibold">nổ chuông báo Telegram tức thì trong 1 giây</span>,
            quản trị giá và menu siêu tốc qua chat. Không cắt phế hoa hồng, giữ trọn 100% lợi nhuận và tệp data khách hàng.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/luxury-spa-demo"
              className="group inline-flex items-center gap-2 bg-gold text-ink font-bold px-8 py-4 rounded-2xl text-lg shadow-xl hover:bg-gold-soft hover:scale-105 transition-all"
            >
              <Sparkles className="size-5" />
              Trải Nghiệm Thử Demo Ngay
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#bang-gia"
              className="inline-flex items-center gap-2 border border-white/20 text-white px-8 py-4 rounded-2xl text-lg hover:bg-white/10 transition-colors"
            >
              📋 Xem Bảng Giá &amp; Ưu Đãi
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-white/60 text-sm">
            <span className="flex items-center gap-1.5"><Zap className="size-4 text-gold" /> Triển khai chỉ trong 5 phút</span>
            <span className="text-white/20">·</span>
            <span className="flex items-center gap-1.5"><BadgeCheck className="size-4 text-gold" /> Không cần cài app phức tạp</span>
            <span className="text-white/20">·</span>
            <span className="flex items-center gap-1.5"><Smartphone className="size-4 text-gold" /> Tương thích 100% điện thoại</span>
          </div>

          {(activeShops > 0 || totalLeads > 0) && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-white/60 text-sm">
              {activeShops > 0 && (
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-gold" />
                  <span><strong className="text-white">{activeShops}</strong> cơ sở đang dùng</span>
                </div>
              )}
              {totalLeads > 0 && (
                <div className="flex items-center gap-2">
                  <Bell className="size-4 text-gold" />
                  <span><strong className="text-white">{totalLeads.toLocaleString()}</strong> khách đã đặt hẹn</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Star className="size-4 text-gold" />
                <span><strong className="text-white">500.000đ</strong>/năm trọn gói</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════ */}
      {/* 3 VŨ KHÍ ĐỘT PHÁ                                  */}
      {/* ═══════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-background">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <p className="text-xs tracking-[0.3em] text-gold uppercase">Công nghệ độc quyền</p>
            <h2 className="mt-4 font-display text-3xl md:text-4xl text-ink">
              3 Vũ Khí Đột Phá Giúp Bạn Bỏ Xa Đối Thủ
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Một hệ thống duy nhất thay thế toàn bộ nhân viên trực page, sổ ghi tay và phần mềm đắt tiền.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Bot className="size-10 text-gold" />,
                badge: "AI 24/7",
                title: "Lễ Tân AI Trực Trang 24/7",
                desc: "Tư vấn thông minh, giải đáp thắc mắc dịch vụ và xin thông tin hẹn lịch ngay cả lúc nửa đêm khi tiệm đã đóng cửa.",
                highlight: "Không bỏ lỡ khách hàng ban đêm",
              },
              {
                icon: <Bell className="size-10 text-gold" />,
                badge: "Chuông < 1 giây",
                title: "Chuông Báo Telegram Tức Thì",
                desc: "Khách vừa bấm đặt lịch là điện thoại chủ tiệm đổ chuông kèm tên, số điện thoại, giờ hẹn và dịch vụ đã chọn. Không bao giờ lo trôi tin nhắn hay sót đơn.",
                highlight: "Gọi lại ngay khi khách đang nóng",
              },
              {
                icon: <MessageSquare className="size-10 text-gold" />,
                badge: "Độc quyền",
                title: "Quản Trị Trang Siêu Tốc Qua Chat",
                desc: "Nhập passcode bảo mật vào khung chat để bot tự đổi giá, cập nhật giờ mở cửa hay bật/tắt khuyến mãi trong 3 giây mà không cần vào trang quản trị rườm rà.",
                highlight: "Quản lý tiệm ngay từ điện thoại",
              },
            ].map((f, i) => (
              <div key={i} className="group rounded-3xl border border-gold-soft bg-champagne p-8 transition-all hover:-translate-y-1 hover:shadow-card hover:border-gold">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gold/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-gold">{f.badge}</div>
                <div className="mb-5">{f.icon}</div>
                <h3 className="font-display text-xl text-ink mb-3">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">{f.desc}</p>
                <p className="text-xs font-bold text-gold">✓ {f.highlight}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════ */}
      {/* 10 NGÀNH TRỌNG ĐIỂM                               */}
      {/* ═══════════════════════════════════════════════════ */}
      <section className="py-20 bg-muted/40 border-y border-border">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <p className="text-xs tracking-[0.3em] text-gold uppercase">Đa ngành · Đa lĩnh vực</p>
            <h2 className="mt-4 font-display text-3xl md:text-4xl text-ink">10 Nhóm Ngành Được Hỗ Trợ</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Từ nha khoa, nhà hàng đến spa, thú cưng và coaching — 1Booking.Asia vận hành trơn tru cho mọi loại hình dịch vụ.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {INDUSTRIES.map((industry, i) => (
              <Link
                key={i}
                href={`/${industry.slug}`}
                className="group relative flex flex-col items-start rounded-2xl border border-border bg-background p-5 transition-all hover:-translate-y-1 hover:border-gold hover:shadow-card"
              >
                <div className="mb-3 p-2 rounded-xl bg-gold/10 group-hover:bg-gold/20 transition-colors">
                  {industry.icon}
                </div>
                <h3 className="font-bold text-sm text-ink mb-2 leading-snug">{industry.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{industry.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs text-gold font-semibold group-hover:gap-2 transition-all">
                  Xem mẫu <ArrowRight className="size-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════ */}
      {/* MINI-CRM                                           */}
      {/* ═══════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-background">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs tracking-[0.3em] text-gold uppercase">Quản lý thông minh</p>
              <h2 className="mt-4 font-display text-3xl md:text-4xl text-ink">
                Quản Lý Khách Hẹn Gọn Gàng — Nói Không Với Sổ Sách Rối Rắm
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Toàn bộ lịch hẹn của khách được gom tự động vào trang quản trị riêng của cơ sở bạn.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  { icon: <Calendar className="size-5 text-gold shrink-0" />, text: "Toàn bộ danh sách khách đặt lịch được gom tự động vào trang quản trị riêng của cơ sở." },
                  { icon: <BadgeCheck className="size-5 text-gold shrink-0" />, text: "Phân loại rõ ràng theo trạng thái: Chờ xác nhận · Đã tiếp nhận · Đã hoàn thành." },
                  { icon: <FileSpreadsheet className="size-5 text-gold shrink-0" />, text: "Xuất toàn bộ dữ liệu ra file Excel chỉ bằng 1 cú nhấp chuột để chăm sóc lại khách quen hoặc chạy quảng cáo." },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    {item.icon}
                    <p className="text-sm text-ink leading-relaxed">{item.text}</p>
                  </li>
                ))}
              </ul>
              <Link
                href={CONTACT_ZALO}
                target="_blank"
                className="mt-8 inline-flex items-center gap-2 bg-gold text-ink font-bold px-6 py-3 rounded-xl hover:bg-gold/90 hover:scale-105 transition-all"
              >
                <Zap className="size-4" /> Dùng Thử Miễn Phí 7 Ngày
              </Link>
            </div>

            {/* Visual mockup */}
            <div className="rounded-3xl border border-gold-soft bg-champagne p-6 space-y-3">
              <p className="text-xs font-bold text-gold uppercase tracking-widest mb-4">📋 Sổ Lịch Hẹn Hôm Nay</p>
              {[
                { name: "Nguyễn Thị Lan", service: "Cắt tóc + Nhuộm", time: "09:00", status: "Đã tiếp nhận", color: "text-green-600 bg-green-50" },
                { name: "Trần Minh Khoa", service: "Massage thư giãn 60ph", time: "10:30", status: "Chờ xác nhận", color: "text-yellow-600 bg-yellow-50" },
                { name: "Lê Thu Hà", service: "Chăm sóc da mặt", time: "14:00", status: "Đã tiếp nhận", color: "text-green-600 bg-green-50" },
                { name: "Phạm Văn Đức", service: "Cắt tóc nam", time: "15:30", status: "Hoàn thành", color: "text-blue-600 bg-blue-50" },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-background p-3 border border-border">
                  <div>
                    <p className="text-sm font-semibold text-ink">{row.name}</p>
                    <p className="text-xs text-muted-foreground">{row.service} · {row.time}</p>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${row.color}`}>{row.status}</span>
                </div>
              ))}
              <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border">
                <span>Tổng hôm nay: <strong className="text-ink">4 lịch</strong></span>
                {/* span thay vì button vì đây là mockup visual, không có handler */}
                <span className="flex items-center gap-1 text-gold font-semibold">
                  <FileSpreadsheet className="size-3" /> Xuất Excel
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════ */}
      {/* BẢNG GIÁ                                           */}
      {/* ═══════════════════════════════════════════════════ */}
      <section id="bang-gia" className="py-20 md:py-28 bg-muted/40 border-y border-border">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-14">
            <p className="text-xs tracking-[0.3em] text-gold uppercase">Minh bạch · Không ẩn phí</p>
            <h2 className="mt-4 font-display text-3xl md:text-4xl text-ink">Bảng Giá Rõ Ràng — Chọn Gói Phù Hợp</h2>
            <p className="mt-4 text-muted-foreground">Không cần ký hợp đồng dài hạn. Không bị ép mua thêm gói.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Gói Tự Vận Hành */}
            <div className="relative rounded-3xl border-2 border-gold-soft bg-background p-8">
              <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-4">Gói Tự Vận Hành</p>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-5xl font-black text-ink">500K</span>
                <span className="text-lg text-muted-foreground mb-1.5">/năm</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">Tự cài đặt theo hướng dẫn chi tiết</p>
              <ul className="space-y-3 mb-8">
                {[
                  "Trang đặt lịch riêng tại 1booking.asia/ten-co-so",
                  "Tích hợp chuông báo Telegram tức thì",
                  "Mini-CRM quản lý danh sách khách",
                  "Chatbot AI tiếp đón và giải đáp cơ bản",
                  "Xuất danh sách khách ra Excel",
                  "Dùng thử miễn phí 7 ngày",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-ink">
                    <CheckCircle className="size-4 text-gold mt-0.5 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href={CONTACT_ZALO} target="_blank" className="block text-center border-2 border-gold text-gold font-bold px-6 py-3 rounded-xl hover:bg-gold hover:text-ink transition-all">
                Đăng Ký Gói Này
              </Link>
            </div>
            {/* Gói VIP */}
            <div className="relative rounded-3xl border-2 border-gold bg-champagne p-8 shadow-card">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold text-ink text-xs font-black px-5 py-1.5 rounded-full uppercase tracking-widest whitespace-nowrap">
                ⭐ Được chọn nhiều nhất
              </div>
              <p className="text-xs font-bold tracking-widest text-gold uppercase mb-4">Gói VIP Setup Trọn Gói</p>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-5xl font-black text-ink">2.000K</span>
                <span className="text-lg text-muted-foreground mb-1.5">một lần</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">Đội kỹ thuật làm hết, bàn giao tận tay</p>
              <ul className="space-y-3 mb-8">
                {[
                  "Toàn bộ tính năng của Gói Tự Vận Hành",
                  "Setup hình ảnh, dịch vụ, menu từ A-Z",
                  "Tinh chỉnh Lễ tân AI nhận diện thương hiệu riêng",
                  "Tặng Standee in mã QR cao cấp đặt quầy thu ngân",
                  "Hỗ trợ ưu tiên qua Zalo trong 12 tháng",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-ink">
                    <CheckCircle className="size-4 text-gold mt-0.5 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href={CONTACT_ZALO} target="_blank" className="block text-center bg-gold text-ink font-bold px-6 py-3 rounded-xl hover:bg-gold/90 hover:scale-105 transition-all shadow-lg">
                ⚡ Kích Hoạt Gói VIP Ngay
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════ */}
      {/* CTA CUỐI TRANG                                     */}
      {/* ═══════════════════════════════════════════════════ */}
      <section className="py-24 bg-ink text-center">
        <div className="mx-auto max-w-2xl px-6">
          <p className="text-xs tracking-[0.3em] text-gold uppercase mb-4">Hành động ngay hôm nay</p>
          <h2 className="font-display text-3xl md:text-4xl text-white">
            Đừng Để Mất Thêm Khách Hàng Nào Vào Tay Đối Thủ{" "}
            <span className="text-gold">Vì Trễ Tin Nhắn!</span>
          </h2>
          <p className="mt-4 text-white/70">
            Cơ sở bạn sẽ có hệ thống đặt lịch hoàn chỉnh và chuyên nghiệp chỉ trong 5 phút.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={CONTACT_ZALO}
              target="_blank"
              className="inline-flex items-center justify-center gap-2 bg-gold text-ink font-bold px-8 py-4 rounded-2xl text-lg hover:bg-gold/90 transition-all hover:scale-105 shadow-xl"
            >
              📲 Nhận Trang Đặt Lịch Chuẩn Tên Tiệm Chỉ Trong 5 Phút
            </Link>
          </div>
          <p className="mt-6 text-white/40 text-sm">
            ⚡ Triển khai trong 5 phút · 🛡️ Không cần cài app · 📱 Tương thích 100% điện thoại
          </p>
        </div>
      </section>

      <SiteFooter />
      <PlatformChatWidget />
    </div>
  );
}
