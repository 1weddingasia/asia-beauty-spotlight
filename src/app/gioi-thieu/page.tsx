"use client";

import { motion } from "framer-motion";
import { 
  Clock, 
  MessageCircle, 
  Users, 
  MonitorSmartphone, 
  Megaphone,
  CheckCircle2,
  BellRing,
  QrCode,
  LineChart,
  Globe,
  ArrowRight,
  ShieldCheck,
  Zap,
  Smartphone,
  Bot,
  Sparkles,
  UserMinus
} from "lucide-react";
import Link from "next/link";
import { PlatformChatWidget } from "@/components/site/PlatformChatWidget";

const PRICING_AMOUNT = "500.000đ";
const SETUP_TIME = "15 phút";

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as any } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function GioiThieuPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden pt-20">
      
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-ink text-white">
        {/* Abstract elegant background shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] rounded-full border-[1px] border-gold/30" />
          <div className="absolute top-[20%] -left-[20%] w-[50vw] h-[50vw] rounded-full border-[1px] border-champagne/20" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <span className="text-gold tracking-[0.3em] text-sm md:text-base uppercase mb-6 block font-medium">
              B2B Sales Kit • Giới thiệu giải pháp
            </span>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.1] mb-8 tracking-tight">
              1BEAUTY.ASIA
              <span className="block text-3xl md:text-5xl lg:text-6xl mt-4 font-display font-medium text-champagne">
                Giải pháp Cổng Đón Khách & Chống Trôi Đơn Tự Động
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed mb-12">
              Hệ thống đặt lịch 1-chạm & chuông báo thông minh dành riêng cho Spa, Salon, Nail, Thẩm mỹ và Quán dịch vụ.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="#giai-phap" 
                className="px-8 py-4 bg-gold text-ink font-medium uppercase tracking-wider hover:bg-white transition-colors duration-300 rounded-sm flex items-center gap-2"
              >
                Khám phá ngay <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* I. THỰC TRẠNG */}
      <section className="py-24 md:py-32 bg-champagne/10 relative">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="text-center mb-20"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-ink mb-6">
              Những "Lỗ Hổng" Tàng Hình
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Rất nhiều chủ tiệm đang tốn tiền chạy quảng cáo, làm hình ảnh Fanpage, xây kênh TikTok nhưng doanh thu vẫn không tăng vì khách hàng bị rơi rụng ở những khâu vô hình.
            </p>
            <div className="w-24 h-[1px] bg-gold mx-auto mt-8" />
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                icon: <Clock className="w-8 h-8 text-gold" />,
                title: "Mất khách đêm khuya",
                desc: "Hơn 40% khách hàng tìm dịch vụ vào 22h–24h. Tiệm đóng cửa, không người trực, khách nhắn tin không ai trả lời sẽ lập tức lướt sang tiệm khác."
              },
              {
                icon: <MessageCircle className="w-8 h-8 text-gold" />,
                title: "Trôi tin nhắn",
                desc: "Giờ cao điểm thợ mải làm móng, gội đầu... Tin nhắn Fanpage/Zalo trôi xuống dưới. 1–2 tiếng sau mới trả lời thì khách đã đặt chỗ nơi khác."
              },
              {
                icon: <Users className="w-8 h-8 text-gold" />,
                title: "Khách vãng lai đến rồi đi",
                desc: "Khách trải nghiệm dịch vụ, thanh toán rồi về nhưng tiệm không có cách nào lưu số điện thoại để gửi ưu đãi kéo họ quay lại."
              },
              {
                icon: <MonitorSmartphone className="w-8 h-8 text-gold" />,
                title: "Web truyền thống đắt & rối",
                desc: "Bỏ 5–10 triệu làm web cồng kềnh, tải chậm, bắt đăng ký tài khoản rườm rà khiến 80% khách bỏ cuộc trước khi đặt lịch."
              },
              {
                icon: <Megaphone className="w-8 h-8 text-gold" />,
                title: "Tiệm mới thiếu kênh tiếp cận",
                desc: "Quán mới khai trương thường bị cô lập, thiếu kênh phủ sóng để cư dân quanh khu vực biết đến các chương trình ưu đãi."
              },
              {
                icon: <UserMinus className="w-8 h-8 text-gold" />,
                title: "Thất lạc dữ liệu khách hàng",
                desc: "Thông tin khách rời rạc, bị mất. Không biết khách ghé bao nhiêu lần, là khách quen hay mới để có chương trình chăm sóc thân thiết."
              }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                variants={fadeIn}
                className="bg-white p-8 rounded-lg shadow-sm border border-champagne/30 hover:border-gold transition-colors duration-300"
              >
                <div className="w-16 h-16 bg-champagne/20 rounded-full flex items-center justify-center mb-6">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-ink mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* II. GIẢI PHÁP */}
      <section id="giai-phap" className="py-24 md:py-32 bg-ink text-white relative overflow-hidden scroll-mt-20">
        <div className="absolute -right-20 top-20 text-[20vw] font-display text-white/5 font-bold leading-none select-none pointer-events-none">
          SOLUTION
        </div>
        
        <div className="container mx-auto px-6 max-w-5xl relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center"
          >
            <h2 className="font-display text-4xl md:text-6xl font-bold text-gold mb-8">
              Chìa Khóa Trao Tay Cho Chủ Tiệm
            </h2>
            <p className="text-xl md:text-2xl font-light leading-relaxed max-w-4xl mx-auto text-gray-300">
              1Beauty.asia không phải là một phần mềm phức tạp bắt chủ tiệm phải học sử dụng. Chúng tôi cung cấp <strong className="text-white font-medium">giải pháp trọn gói A-Z</strong>: Tiệm chỉ cần gửi bảng giá, 1Beauty lo toàn bộ khâu kỹ thuật và bàn giao hệ thống hoàn chỉnh sẵn sàng đón khách sau {SETUP_TIME}.
            </p>
          </motion.div>
        </div>
      </section>

      {/* III. CHI TIẾT TÍNH NĂNG */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-24">
            <span className="text-gold tracking-widest uppercase text-sm font-semibold">Khám Phá Sức Mạnh</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-ink mt-4">Giá Trị Vượt Trội</h2>
          </div>

          <div className="space-y-32">
            {/* Feature 1 */}
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="w-full md:w-1/2"
              >
                <div className="aspect-[4/5] bg-champagne/30 rounded-2xl relative overflow-hidden flex items-center justify-center group">
                  <Smartphone className="w-32 h-32 text-gold/50 group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 border-2 border-gold/20 m-6 rounded-xl pointer-events-none" />
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="w-full md:w-1/2"
              >
                <div className="text-gold font-display text-7xl font-bold opacity-30 mb-2">01</div>
                <h3 className="font-display text-3xl md:text-4xl font-bold text-ink mb-6">Cổng Ưu Đãi 1-Chạm Siêu Tốc</h3>
                <ul className="space-y-6">
                  {[
                    { title: "Mobile-First", desc: "Tốc độ tải dưới 1 giây, hiển thị hình ảnh dịch vụ sắc nét." },
                    { title: "Quy tắc 5 Deal", desc: "Chỉ hiển thị tối đa 5 ưu đãi mồi hấp dẫn nhất kèm nhãn 'Chỉ còn vài suất' kích thích chốt ngay." },
                    { title: "Giữ chỗ 3 giây", desc: "Không cần tạo tài khoản rườm rà. Chỉ cần chọn dịch vụ + nhập SĐT." },
                    { title: "Điều hướng thông minh", desc: "Sau khi đặt, hiện ngay nút Gọi Hotline & Nhắn Zalo để kết nối tức thì." }
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <Zap className="w-6 h-6 text-gold shrink-0 mt-1" />
                      <div>
                        <strong className="block text-ink">{f.title}</strong>
                        <span className="text-muted-foreground">{f.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-24">
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="w-full md:w-1/2"
              >
                <div className="aspect-[4/5] bg-ink rounded-2xl relative overflow-hidden flex items-center justify-center group">
                  <BellRing className="w-32 h-32 text-gold/50 group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 border-2 border-gold/20 m-6 rounded-xl pointer-events-none" />
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="w-full md:w-1/2"
              >
                <div className="text-gold font-display text-7xl font-bold opacity-30 mb-2">02</div>
                <h3 className="font-display text-3xl md:text-4xl font-bold text-ink mb-6">Chuông Báo Telegram Tức Thì</h3>
                <ul className="space-y-6">
                  {[
                    { title: "Bắn thông báo trong 3 giây", desc: "Khách vừa bấm giữ chỗ, Telegram nổ chuông ngay lập tức." },
                    { title: "Chống trôi tuyệt đối", desc: "Âm thanh đặc trưng, tách biệt với tin nhắn rác. Đầy đủ: Tên - SĐT - Gói Deal - Giờ đặt." },
                    { title: "Cơ chế kiểm soát kép", desc: "Đảm bảo 100% không sót đơn kể cả khi mạng tại tiệm chập chờn." }
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <ShieldCheck className="w-6 h-6 text-gold shrink-0 mt-1" />
                      <div>
                        <strong className="block text-ink">{f.title}</strong>
                        <span className="text-muted-foreground">{f.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="w-full md:w-1/2"
              >
                <div className="aspect-[4/5] bg-champagne/30 rounded-2xl relative overflow-hidden flex items-center justify-center group">
                  <QrCode className="w-32 h-32 text-gold/50 group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 border-2 border-gold/20 m-6 rounded-xl pointer-events-none" />
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="w-full md:w-1/2"
              >
                <div className="text-gold font-display text-7xl font-bold opacity-30 mb-2">03</div>
                <h3 className="font-display text-3xl md:text-4xl font-bold text-ink mb-6">Mã QR Đón Khách Tại Quầy</h3>
                <ul className="space-y-6">
                  {[
                    { title: "Standee QR thiết kế riêng", desc: "Cấp mã QR đồng bộ màu sắc và thương hiệu tiệm." },
                    { title: "Hứng trọn khách vãng lai", desc: "Thông điệp kích thích: 'Quét mã nhận ngay ưu đãi 20% cho lần ghé tiếp theo'." },
                    { title: "Biến khách lạ thành quen", desc: "Khách tự để lại SĐT ngay trong lúc chờ phục vụ, tiệm dễ dàng remarketing." }
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <CheckCircle2 className="w-6 h-6 text-gold shrink-0 mt-1" />
                      <div>
                        <strong className="block text-ink">{f.title}</strong>
                        <span className="text-muted-foreground">{f.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Feature 4: Chatbot AI */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-24">
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="w-full md:w-1/2"
              >
                <div className="aspect-[4/5] bg-ink rounded-2xl relative overflow-hidden flex items-center justify-center group">
                  <Bot className="w-32 h-32 text-gold/50 group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 border-2 border-gold/20 m-6 rounded-xl pointer-events-none" />
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="w-full md:w-1/2"
              >
                <div className="text-gold font-display text-7xl font-bold opacity-30 mb-2">04</div>
                <h3 className="font-display text-3xl md:text-4xl font-bold text-ink mb-6">Trợ Lý AI Chốt Đơn 24/7</h3>
                <ul className="space-y-6">
                  {[
                    { title: "Không bao giờ ngủ", desc: "Tự động tư vấn, giải đáp thắc mắc và báo giá dịch vụ ngay cả lúc 2h sáng." },
                    { title: "Khéo léo xin SĐT", desc: "Dẫn dắt câu chuyện tự nhiên, tư vấn gói phù hợp và chủ động xin thông tin khách để chốt lịch." },
                    { title: "Cá nhân hóa 100%", desc: "Chatbot được huấn luyện riêng biệt dựa trên bảng giá và văn phong phục vụ của chính cơ sở bạn." }
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <Sparkles className="w-6 h-6 text-gold shrink-0 mt-1" />
                      <div>
                        <strong className="block text-ink">{f.title}</strong>
                        <span className="text-muted-foreground">{f.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Feature 5 & 6 Compact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 pt-16 border-t border-champagne">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
              >
                <div className="text-gold font-display text-6xl font-bold opacity-30 mb-2">05</div>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-ink mb-6 flex items-center gap-3">
                  <LineChart className="text-gold" /> Mini-CRM Quản Lý
                </h3>
                <p className="text-muted-foreground mb-4">Xem danh sách khách trên mọi thiết bị. Tự động nhận diện [Khách Mới] / [Khách Quen]. Cập nhật trạng thái gọi chốt lịch và xuất Excel 1-chạm để chạy quảng cáo.</p>
              </motion.div>

              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
              >
                <div className="text-gold font-display text-6xl font-bold opacity-30 mb-2">06</div>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-ink mb-6 flex items-center gap-3">
                  <Globe className="text-gold" /> Phủ Sóng Cộng Đồng
                </h3>
                <p className="text-muted-foreground mb-4">Toàn bộ deal ưu đãi tự động lên "Khám Phá Ưu Đãi" của 1Beauty. Giúp tiệm mới khai trương có ngay hiện diện uy tín mà không tốn phí quảng cáo.</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* IV. BẢNG SO SÁNH */}
      <section className="py-24 bg-ink text-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-gold mb-4">Hiệu Quả Thực Tế</h2>
            <p className="text-gray-400">Vì sao 1Beauty là lựa chọn tối ưu nhất cho ngành dịch vụ làm đẹp?</p>
          </motion.div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-white/10 text-gold uppercase tracking-wider text-sm">
                  <th className="py-6 px-4 font-medium w-1/4">Tiêu chí</th>
                  <th className="py-6 px-4 font-medium w-1/4">Fanpage / Zalo</th>
                  <th className="py-6 px-4 font-medium w-1/4">Làm Website Tự Thân</th>
                  <th className="py-6 px-4 font-medium w-1/4 bg-gold/10 rounded-t-lg">1Beauty.asia</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                {[
                  { crit: "Chi phí đầu tư", fz: "Miễn phí (nhưng tốn tiền nhân viên trực)", web: "5M – 10M VNĐ", beauty: `${PRICING_AMOUNT}/năm (Trọn gói)` },
                  { crit: "Tốc độ đón khách", fz: "Chậm (phụ thuộc người cầm máy)", web: "Rườm rà (nhiều bước đăng ký)", beauty: "3 giây (Chỉ cần 1 chạm điền SĐT)" },
                  { crit: "Nguy cơ sót đơn", fz: "Rất cao (trôi tin, khách thoát)", web: "Trung bình (khách lười điền form)", beauty: "0% (Chuông Telegram nổ tức thì)" },
                  { crit: "Thời gian triển khai", fz: "Tự quản lý thủ công", web: "Mất 2 – 4 tuần lập trình", beauty: `Bàn giao dùng ngay trong ${SETUP_TIME}` },
                  { crit: "Quảng bá cộng đồng", fz: "Tự chạy quảng cáo", web: "Tự làm SEO", beauty: "Xuất hiện miễn phí trên Khám Phá" },
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-6 px-4 font-medium text-white">{row.crit}</td>
                    <td className="py-6 px-4">{row.fz}</td>
                    <td className="py-6 px-4">{row.web}</td>
                    <td className="py-6 px-4 bg-gold/5 font-medium text-gold">{row.beauty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* V. TÌNH HUỐNG ỨNG DỤNG */}
      <section className="py-24 bg-champagne/10">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-ink">Ứng Dụng Thực Tế</h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                time: "23:00 Đêm",
                title: "Khách lướt mạng lúc khuya",
                desc: "Khách thấy hình ảnh tiệm trên FB, bấm link 1Beauty, thấy gói 'Gội đầu giảm 40%', bấm đặt trong 3s. Sáng hôm sau tiệm mở mắt đã có sẵn khách chờ phục vụ."
              },
              {
                time: "Giờ cao điểm",
                title: "Thợ đang bận tay",
                desc: "Không cần mở máy rep tin nhắn. Telegram 'ting ting', chủ tiệm liếc mắt là biết ngay có khách vừa đặt gói nào để chủ động sắp xếp bàn."
              },
              {
                time: "Tại quầy",
                title: "Tiếp đón & Chăm sóc",
                desc: "Khách ngồi chờ, quét mã QR trên bàn nhận voucher. Tiệm giữ chân được khách trung thành, thu được tệp SĐT chất lượng cao."
              }
            ].map((scen, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2, duration: 0.8 }}
                className="bg-white p-10 rounded-xl border border-gold/20 shadow-sm relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-gold text-ink px-4 py-1 text-sm font-bold rounded-bl-lg">
                  {scen.time}
                </div>
                <h4 className="font-display text-2xl font-bold text-ink mt-4 mb-4">{scen.title}</h4>
                <p className="text-muted-foreground leading-relaxed">{scen.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* VI. BÁO GIÁ & CAM KẾT */}
      <section className="py-24 md:py-32 bg-ink text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="container mx-auto px-6 max-w-4xl relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="font-display text-5xl md:text-6xl font-bold text-gold mb-6">Cam Kết Đồng Hành</h2>
            
            <div className="inline-block border-2 border-gold p-8 md:p-12 rounded-2xl mb-12 bg-black/30 backdrop-blur-sm">
              <div className="text-2xl text-gray-300 mb-2">Chi phí trọn gói</div>
              <div className="text-5xl md:text-7xl font-bold text-gold mb-4">{PRICING_AMOUNT}<span className="text-2xl text-gray-400 font-normal">/Năm</span></div>
              <p className="text-gray-400 italic">~ 1.300đ mỗi ngày (chưa bằng một cốc trà đá)</p>
            </div>

            <div className="text-left bg-white/5 p-8 rounded-xl backdrop-blur-sm border border-white/10 mb-12">
              <h4 className="text-2xl font-display font-bold text-champagne mb-6 border-b border-white/10 pb-4">Quyền lợi trọn gói:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "01 Trang Cổng Ưu Đãi riêng biệt",
                  "Tích hợp chuông báo Telegram không giới hạn",
                  "Tặng thiết kế Standee mã QR để bàn",
                  "Tài khoản CRM & xuất Excel",
                  "Đăng deal trên Khám Phá Ưu Đãi 1Beauty",
                  "Hỗ trợ cập nhật dịch vụ 365 ngày"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="text-gold shrink-0 mt-1" size={20} />
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xl text-gold font-medium mb-10">
              Cam kết bàn giao: Hoàn tất cài đặt & chạy thực tế trong {SETUP_TIME}.
            </p>

            <Link href="/login?tab=register" className="inline-block bg-gold text-ink font-bold uppercase tracking-widest px-12 py-5 rounded-sm hover:bg-white transition-all duration-300 transform hover:-translate-y-1">
              Đăng Ký Ngay
            </Link>
          </motion.div>
        </div>
      </section>

      <PlatformChatWidget />
    </div>
  );
}
