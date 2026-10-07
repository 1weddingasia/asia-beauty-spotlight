import Link from "next/link";
import { 
  ArrowRight, Bot, PieChart, BellRing, 
  MessageSquareLock, ShieldCheck, Database, Smartphone, CheckCircle2 
} from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site/Layout";
import { PlatformChatWidget } from "@/components/site/PlatformChatWidget";
import { CONTACT_ZALO } from "@/config/site-config";

export const metadata = {
  title: "Giới Thiệu 1Booking.Asia — Nền tảng Đặt lịch 1-chạm & Lễ tân AI",
  description: "Giải pháp Micro-SaaS giúp chủ cơ sở dịch vụ thoát khỏi sự phụ thuộc vào các sàn trung gian, tự động hóa khâu đón tiếp khách hàng 24/7 và giữ trọn 100% lợi nhuận.",
};

export default function GioiThieuBookingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <SiteHeader solid={false} />

      {/* 1. Khối Đầu Trang (Hero Section) */}
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-ink pt-24 pb-16">
        <div className="absolute inset-0 z-0">
          <div className="absolute -top-[20%] -right-[10%] h-[70vw] w-[70vw] rounded-full border border-gold/20" />
          <div className="absolute top-[30%] -left-[20%] h-[50vw] w-[50vw] rounded-full border border-champagne/10" />
        </div>

        <div className="container relative z-10 mx-auto max-w-5xl px-6 text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-semibold tracking-[0.1em] text-gold uppercase">
            💡 Câu Chuyện & Sứ Mệnh 1Booking.Asia
          </span>
          <h1 className="font-display text-4xl font-bold leading-[1.2] tracking-tight text-white md:text-6xl">
            Nền Tảng Đặt Lịch Hẹn Đa Ngành & <br className="hidden md:block" />
            <span className="text-gradient-gold">Trợ Lý Lễ Tân AI Thế Hệ Mới</span>
          </h1>
          <p className="mx-auto mt-8 max-w-3xl text-lg font-light leading-relaxed text-gray-300 md:text-xl">
            Chúng tôi xây dựng 1Booking.Asia với một mục tiêu duy nhất: Giúp các chủ doanh nghiệp dịch vụ và cửa hàng vừa & nhỏ thoát khỏi sự phụ thuộc vào các sàn trung gian, tự động hóa khâu đón tiếp khách hàng 24/7 và giữ trọn 100% lợi nhuận.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/home-booking"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-gold px-8 py-4 font-bold text-ink transition-transform hover:scale-105"
            >
              Trải Nghiệm Demo Ngay <ArrowRight className="size-5" />
            </Link>
            <Link
              href="/lien-he-booking"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-8 py-4 font-bold text-white transition-all hover:bg-white/10"
            >
              Nhận Tư Vấn Kỹ Thuật
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Vì Sao 1Booking.Asia Ra Đời? (Nỗi Đau Thực Tế) */}
      <section className="py-24 bg-champagne/30">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-ink mb-6">
              Vì Sao 1Booking.Asia Ra Đời?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Thực trạng ngành dịch vụ đang rỉ máu và lãng phí tài nguyên mỗi ngày.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-border shadow-sm">
              <div className="size-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6">
                <PieChart className="size-7" />
              </div>
              <h3 className="font-display text-2xl font-bold text-ink mb-4">Phí Sàn Quá Cao (15% - 30%)</h3>
              <p className="text-muted-foreground leading-relaxed">
                Mỗi đơn hàng thành công, chủ tiệm phải chia lại một phần lớn doanh thu cho các nền tảng trung gian. Càng bán nhiều, càng bào mòn lợi nhuận thực tế của bạn.
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-border shadow-sm">
              <div className="size-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
                <BellRing className="size-7" />
              </div>
              <h3 className="font-display text-2xl font-bold text-ink mb-4">Trôi Tin Nhắn, Sót Lịch Hẹn</h3>
              <p className="text-muted-foreground leading-relaxed">
                Khách nhắn tin qua Fanpage/Zalo lúc nửa đêm hoặc khi quán đang đông nghẹt. Nhân viên trả lời trễ 10 phút là khách đã bỏ đi chuyển sang đối thủ khác.
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-border shadow-sm">
              <div className="size-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Database className="size-7" />
              </div>
              <h3 className="font-display text-2xl font-bold text-ink mb-4">Mất Trắng Tệp Khách Quen</h3>
              <p className="text-muted-foreground leading-relaxed">
                Khách đặt qua sàn hoặc nhắn rời rạc, chủ tiệm không lưu được số điện thoại, không có lịch sử giao dịch để chăm sóc lại hay bán chéo thêm dịch vụ.
              </p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <p className="inline-flex items-center gap-3 bg-gold/10 text-ink font-bold px-8 py-4 rounded-full text-lg">
              👉 1Booking.Asia ra đời để chấm dứt toàn bộ những lãng phí đó.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Chúng Tôi Là Ai & Làm Được Gì? */}
      <section className="py-24 bg-white border-y border-border">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold tracking-[0.2em] text-gold uppercase">Giải Pháp Cốt Lõi</span>
            <h2 className="mt-4 font-display text-3xl md:text-5xl font-bold text-ink">Chúng Tôi Là Ai & Làm Được Gì?</h2>
            <p className="mt-4 text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed">
              1Booking.Asia là nền tảng Micro-SaaS ứng dụng AI, cung cấp cho mỗi cơ sở dịch vụ một <strong className="text-ink">Hệ Thống Tiếp Đón & Đặt Lịch 1-Chạm Riêng Biệt</strong>.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="space-y-8">
              <div className="flex gap-6 items-start">
                <div className="shrink-0 p-4 bg-blue-50 text-blue-600 rounded-2xl">
                  <Bot className="size-8" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-ink mb-2">Lễ Tân AI Trực Trang 24/7</h3>
                  <p className="text-muted-foreground leading-relaxed">Tư vấn thông minh, giải đáp dịch vụ, xin thông tin lịch hẹn và chăm sóc khách ngay cả khi cửa hàng đã tắt đèn đóng cửa.</p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="shrink-0 p-4 bg-green-50 text-green-600 rounded-2xl">
                  <BellRing className="size-8" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-ink mb-2">Chuông Báo Telegram (1 Giây)</h3>
                  <p className="text-muted-foreground leading-relaxed">Khách vừa bấm đặt lịch là điện thoại chủ tiệm đổ chuông kèm tên, số điện thoại, giờ hẹn và dịch vụ đã chọn. Tuyệt đối không sót đơn.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="flex gap-6 items-start">
                <div className="shrink-0 p-4 bg-purple-50 text-purple-600 rounded-2xl">
                  <MessageSquareLock className="size-8" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-ink mb-2">Quản Trị Siêu Tốc Qua Chat</h3>
                  <p className="text-muted-foreground leading-relaxed">Độc quyền tính năng nhập passcode bảo mật trực tiếp vào khung chat để cập nhật giá, đổi menu, chỉnh giờ mở cửa chỉ trong 3 giây.</p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="shrink-0 p-4 bg-gold/10 text-gold rounded-2xl">
                  <Database className="size-8" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-ink mb-2">Sổ Khách Hàng Mini-CRM</h3>
                  <p className="text-muted-foreground leading-relaxed">Toàn bộ danh sách khách hàng được gom tự động, phân loại trạng thái rõ ràng và xuất ra file Excel chỉ bằng 1 cú nhấp chuột.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Hệ Sinh Thái Đa Ngành Đang Phục Vụ */}
      <section className="py-24 bg-ink text-white">
        <div className="container mx-auto max-w-5xl px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
              Hệ Sinh Thái <span className="text-gold">Đa Ngành</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              1Booking.Asia được thiết kế mở và tối ưu giao diện cũng như nghiệp vụ chuyên biệt cho 7 nhóm ngành trọng điểm:
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
            {[
              { title: "Y tế & Sức khỏe", desc: "Nha khoa, phòng khám chuyên khoa, nhà thuốc tư vấn." },
              { title: "Ẩm thực & Đời sống", desc: "Nhà hàng, quán ăn, tiệc gia đình, dịch vụ F&B." },
              { title: "Chăm sóc phương tiện", desc: "Trung tâm Detailing ô tô, rửa xe chuyên sâu, gara sửa chữa." },
              { title: "Thể thao & Huấn luyện", desc: "Phòng gym, trung tâm yoga, lịch dạy 1:1 của Huấn luyện viên (PT)." },
              { title: "Làm đẹp & Nghỉ dưỡng", desc: "Spa trị liệu, gội đầu dưỡng sinh, salon tóc, nail art." },
              { title: "Nghệ thuật & Sự kiện", desc: "Studio ảnh cưới, chụp lookbook, make-up chuyên nghiệp." },
              { title: "Dịch vụ & Du lịch", desc: "Spa thú cưng, sửa chữa tại nhà, homestay, khai vấn 1:1." },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start">
                <CheckCircle2 className="size-6 text-gold shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-xl mb-1">{item.title}</h4>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. 3 Cam Kết Sống Còn Của 1Booking.Asia */}
      <section className="py-24 bg-background">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-ink mb-6">
              3 Cam Kết Sống Còn Của Chúng Tôi
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-champagne/30 p-10 rounded-[2rem] border border-border text-center flex flex-col items-center">
              <div className="size-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                <ShieldCheck className="size-10 text-gold" />
              </div>
              <h3 className="font-display text-2xl font-bold text-ink mb-4">0% Phí Hoa Hồng</h3>
              <p className="text-muted-foreground leading-relaxed">
                Bạn không bao giờ phải chia sẻ doanh thu cho chúng tôi. 100% tiền khách trả thuộc về tiệm của bạn.
              </p>
            </div>
            
            <div className="bg-champagne/30 p-10 rounded-[2rem] border border-border text-center flex flex-col items-center">
              <div className="size-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Database className="size-10 text-gold" />
              </div>
              <h3 className="font-display text-2xl font-bold text-ink mb-4">Bạn Sở Hữu Trọn Vẹn Data</h3>
              <p className="text-muted-foreground leading-relaxed">
                Khách hàng của bạn là tài sản của bạn. Toàn bộ thông tin số điện thoại, lịch sử hẹn đều nằm trong quyền kiểm soát của bạn.
              </p>
            </div>
            
            <div className="bg-champagne/30 p-10 rounded-[2rem] border border-border text-center flex flex-col items-center">
              <div className="size-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Smartphone className="size-10 text-gold" />
              </div>
              <h3 className="font-display text-2xl font-bold text-ink mb-4">Cực Kỳ Tinh Gọn</h3>
              <p className="text-muted-foreground leading-relaxed">
                Khách hàng không cần tải app, không cần đăng ký tài khoản phức tạp. Mọi thao tác gói gọn trong 1 chạm trên trình duyệt điện thoại.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Khối Kêu Gọi Hành Động (CTA Cuối Trang) */}
      <section className="py-24 bg-ink text-center border-t border-gold/20">
        <div className="container mx-auto max-w-3xl px-6">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Sẵn Sàng Biến Mỗi Lượt Xem <br className="hidden md:block"/> Thành Khách Hàng Thực Tế?
          </h2>
          <p className="text-gray-300 mb-10 text-lg md:text-xl">
            Hãy trang bị cho cơ sở của bạn một Lễ tân AI và trang đặt hẹn 1-chạm chuyên nghiệp ngay hôm nay.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/home-booking"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-gold text-ink px-8 py-4 font-bold transition-transform hover:scale-105 shadow-xl"
            >
              Bắt Đầu Tạo Trang Ngay <ArrowRight className="size-5" />
            </Link>
            <Link
              href={CONTACT_ZALO}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-8 py-4 font-bold text-white transition-all hover:bg-white/10"
            >
              <MessageSquareLock className="size-5" />
              Chat Zalo Với Kỹ Thuật
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
      <PlatformChatWidget />
    </div>
  );
}
