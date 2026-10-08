"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Zap, Clock, CheckCircle, Send, Phone, User, CalendarDays, StickyNote, ChevronRight, Trophy, Shield, Star, Bell, Dumbbell } from "lucide-react";

interface Props {
  heroImage: string;
  nightImage: string;
  badmintonImage: string;
  equipmentImage: string;
}

const SERVICES = [
  {
    emoji: "🏓",
    name: "Ca Giờ Vàng Pickleball",
    time: "17:00 – 22:00",
    price: "180.000đ",
    unit: "/giờ",
    desc: "Mặt sân tiêu chuẩn quốc tế, đèn LED chống chói, ghế nghỉ quạt mát riêng từng sân.",
    tag: "HOT",
    tagColor: "bg-lime-400 text-black",
  },
  {
    emoji: "☀️",
    name: "Ca Giờ Thường Pickleball",
    time: "06:00 – 16:00",
    price: "120.000đ",
    unit: "/giờ",
    desc: "Ưu đãi giờ vắng, tặng kèm nước suối lạnh cho nhóm đặt từ 2 tiếng.",
    tag: "TIẾT KIỆM",
    tagColor: "bg-sky-400 text-white",
  },
  {
    emoji: "🏸",
    name: "Thuê Sân Cầu Lông Yonex",
    time: "06:00 – 22:00",
    price: "90.000đ",
    unit: "/giờ",
    desc: "Thảm sàn Yonex chuyên dụng, độ bám cao, trần cao thoáng, ánh sáng chuẩn tập luyện.",
    tag: "",
    tagColor: "",
  },
  {
    emoji: "🎾",
    name: "Combo: Sân + Vợt + Rổ Bóng",
    time: "2 Tiếng Trọn Gói",
    price: "299.000đ",
    unit: "/combo",
    desc: "Dành cho người mới: 1 sân 2 giờ + 4 vợt Pickleball cao cấp + rổ bóng không giới hạn.",
    tag: "COMBO ĐỀ XUẤT",
    tagColor: "bg-amber-400 text-black",
  },
];

const COURTS = ["Sân 1", "Sân 2", "Sân 3", "Sân 4", "Sân 5", "Sân 6"];
const SPORTS = ["Bóng Đá", "Pickleball", "Cầu Lông", "Tennis"];
const DURATIONS = ["1 Tiếng", "1.5 Tiếng", "2 Tiếng", "3 Tiếng"];

const AMENITIES = [
  { icon: "💡", label: "Đèn LED Chuyên Nghiệp" },
  { icon: "❄️", label: "Máy Lạnh Mỗi Sân" },
  { icon: "🌀", label: "Quạt Mát Riêng" },
  { icon: "📶", label: "Wifi Miễn Phí" },
  { icon: "🏓", label: "Cho Thuê Vợt" },
  { icon: "🚗", label: "Bãi Giữ Xe Rộng" },
  { icon: "🚿", label: "WC Sạch Sẽ" },
  { icon: "🔐", label: "Tủ Khóa Đồ" },
];

export default function SanTheThaoClient({ heroImage, nightImage, badmintonImage, equipmentImage }: Props) {
  const [form, setForm] = useState({
    name: "", phone: "", sport: "Pickleball", court: "Sân 1",
    date: "", time: "", duration: "1 Tiếng", note: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const totalPrice = () => {
    if (!form.time) return "—";
    const hours = parseInt(form.duration);
    const hour = parseInt(form.time.split(":")[0]);
    const base = form.sport === "Cầu Lông" ? 90000 : (hour >= 17 ? 180000 : 120000);
    return (base * hours).toLocaleString("vi-VN") + "đ";
  };

  const telegramPreview = `🔔 CÓ LỊCH ĐẶT SÂN MỚI - SÂN THỂ THAO\n• Khách hàng: ${form.name || "Chưa nhập"} (${form.phone || "---"})\n• Môn: ${form.sport} - ${form.court}\n• Thời gian: ${form.time || "--:--"} (${form.date || "Hôm nay"})\n• Thời lượng: ${form.duration}\n• Ghi chú: ${form.note || "Không có"}\n• Tạm tính: ${form.time ? "~" + totalPrice() : "—"} (Chờ xác nhận)`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.date || !form.time) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/demo-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business_slug: "san-the-thao", type: "booking", ...form, message: telegramPreview }),
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new Error(`Failed to send telegram: ${res.status} ${detail}`);
      }
      setSubmitted(true);
    } catch (err) {
      alert("Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại sau.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-lime-400/20 border-2 border-lime-400 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <CheckCircle className="size-12 text-lime-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Đặt Sân Thành Công!</h2>
          <p className="text-white/60 mb-2">Thông tin đã được gửi đến ban quản lý.</p>
          <p className="text-lime-400 font-semibold mb-8">⚡ Chuông Telegram đã nổ – Đang xác nhận sân cho bạn...</p>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left text-sm text-white/70 font-mono whitespace-pre-line mb-8">{telegramPreview}</div>
          <button onClick={() => setSubmitted(false)} className="bg-lime-400 text-black font-bold px-8 py-3 rounded-full hover:bg-lime-300 transition">
            Đặt Thêm Sân
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-lime-400 flex items-center justify-center">
            <Dumbbell className="size-5 text-black" />
          </div>
          <span className="font-black text-lg tracking-tight">SÂN THỂ THAO <span className="text-lime-400">ĐA NĂNG</span></span>
        </div>
        <a href="#booking" className="bg-lime-400 text-black text-sm font-bold px-5 py-2 rounded-full hover:bg-lime-300 transition">
          ⚡ Đặt Sân Ngay
        </a>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="absolute inset-0">
          <Image src={heroImage} alt="Arena Sport" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
          <div className="inline-flex items-center gap-2 bg-lime-400/10 border border-lime-400/30 text-lime-400 text-xs font-bold px-4 py-2 rounded-full mb-8 tracking-widest">
            <Zap className="size-3" />
            ⚡ ĐẶT SÂN TỰ ĐỘNG 1-CHẠM • GIỮ CHỖ TỨC THÌ
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6">
            Đặt Sân Pickleball<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-green-300">&amp; Cầu Lông</span><br />
            <span className="text-2xl md:text-4xl font-bold text-white/80">Chuẩn Thi Đấu – Không Lo Trùng Lịch</span>
          </h1>

          <p className="text-white/60 text-lg max-w-xl mb-10 leading-relaxed">
            Chọn sân, chọn khung giờ trống trong tích tắc. Hệ thống tự động xác nhận và nổ chuông giữ sân trực tiếp đến ban quản lý sau <strong className="text-lime-400">1 giây</strong>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#booking" className="bg-lime-400 text-black font-black px-8 py-4 rounded-full text-lg flex items-center gap-2 hover:bg-lime-300 transition w-fit">
              Chọn Khung Giờ &amp; Đặt Sân <ChevronRight className="size-5" />
            </a>
            <a href="#services" className="border border-white/30 text-white font-bold px-8 py-4 rounded-full text-lg hover:bg-white/10 transition w-fit">
              Xem Bảng Giá →
            </a>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 mt-16">
            {[
              { num: "6", label: "Sân Thi Đấu" },
              { num: "24/7", label: "Đặt Online" },
              { num: "1s", label: "Xác Nhận Tức Thì" },
            ].map(s => (
              <div key={s.label}>
                <div className="text-3xl font-black text-lime-400">{s.num}</div>
                <div className="text-white/50 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-lime-400/10 border border-lime-400/20 text-lime-400 text-xs font-bold px-4 py-2 rounded-full mb-6 tracking-widest">
              <Trophy className="size-3" /> BẢNG GIÁ THUÊ SÂN
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">Gói Dịch Vụ & Bảng Giá</h2>
            <p className="text-white/50 max-w-lg mx-auto">Minh bạch, không phát sinh phụ phí. Đặt online giá tốt hơn tại quầy.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {SERVICES.map((svc, i) => (
              <div key={i} className="group relative bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-lime-400/40 hover:bg-white/8 transition-all duration-300">
                {svc.tag && (
                  <span className={`absolute top-4 right-4 text-xs font-black px-3 py-1 rounded-full ${svc.tagColor}`}>{svc.tag}</span>
                )}
                <div className="text-4xl mb-4">{svc.emoji}</div>
                <h3 className="text-xl font-black mb-1">{svc.name}</h3>
                <p className="text-white/40 text-sm mb-4 flex items-center gap-1"><Clock className="size-3" />{svc.time}</p>
                <p className="text-white/60 text-sm mb-6 leading-relaxed">{svc.desc}</p>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-black text-lime-400">{svc.price}</span>
                  <span className="text-white/40 text-sm mb-1">{svc.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[heroImage, badmintonImage, equipmentImage, nightImage].map((img, i) => (
            <div key={i} className="relative aspect-square rounded-2xl overflow-hidden">
              <Image src={img} alt={`Arena ${i}`} fill className="object-cover hover:scale-110 transition duration-500" />
            </div>
          ))}
        </div>
      </section>

      {/* AMENITIES */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-10">Tiện Ích Cụm Sân</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {AMENITIES.map((a, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3 hover:border-lime-400/30 transition">
                <span className="text-2xl">{a.icon}</span>
                <span className="text-sm font-semibold text-white/80">{a.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOOKING FORM */}
      <section id="booking" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-white/8 to-white/3 border border-lime-400/20 rounded-3xl p-8 md:p-12">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-lime-400 flex items-center justify-center">
                <Bell className="size-5 text-black" />
              </div>
              <div>
                <h2 className="text-2xl font-black">Đặt Sân Ngay</h2>
                <p className="text-white/40 text-sm">Xác nhận trong vòng 60 giây</p>
              </div>
            </div>
            <div className="w-16 h-1 bg-lime-400 rounded-full mb-8 mt-4" />

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-white/70 mb-2 flex items-center gap-2"><User className="size-3" /> Họ Tên *</label>
                  <input required value={form.name} onChange={e => handle("name", e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-lime-400 transition"
                    placeholder="Anh Hoàng Nam" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white/70 mb-2 flex items-center gap-2"><Phone className="size-3" /> Số Điện Thoại *</label>
                  <input required value={form.phone} onChange={e => handle("phone", e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-lime-400 transition"
                    placeholder="0909 123 456" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-white/70 mb-2">🏓 Môn Thể Thao</label>
                  <div className="flex gap-3">
                    {SPORTS.map(sp => (
                      <button type="button" key={sp} onClick={() => handle("sport", sp)}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition ${form.sport === sp ? "bg-lime-400 text-black" : "bg-white/10 text-white/60 hover:bg-white/20"}`}>
                        {sp}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-white/70 mb-2">🏟️ Chọn Sân</label>
                  <select value={form.court} onChange={e => handle("court", e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition">
                    {COURTS.map(c => <option key={c} value={c} className="bg-zinc-900">{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-white/70 mb-2 flex items-center gap-2"><CalendarDays className="size-3" /> Ngày Chơi *</label>
                  <input required type="date" value={form.date} onChange={e => handle("date", e.target.value)}
                    min={new Date().toLocaleDateString('en-CA')}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white/70 mb-2"><Clock className="size-3 inline mr-1" />Giờ Bắt Đầu *</label>
                  <input required type="time" value={form.time} onChange={e => handle("time", e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white/70 mb-2">⏱️ Thời Lượng</label>
                  <div className="flex gap-2">
                    {DURATIONS.map(d => (
                      <button type="button" key={d} onClick={() => handle("duration", d)}
                        className={`flex-1 py-3 rounded-xl font-bold text-xs transition ${form.duration === d ? "bg-lime-400 text-black" : "bg-white/10 text-white/60 hover:bg-white/20"}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-white/70 mb-2 flex items-center gap-2"><StickyNote className="size-3" /> Ghi Chú Thêm</label>
                <textarea value={form.note} onChange={e => handle("note", e.target.value)} rows={2}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-lime-400 transition resize-none"
                  placeholder="Cần thuê vợt, rổ bóng, nước uống..." />
              </div>

              {/* Preview */}
              <div className="bg-black/40 border border-lime-400/20 rounded-2xl p-4">
                <p className="text-lime-400 text-xs font-bold mb-2 flex items-center gap-2"><Bell className="size-3" /> XEM TRƯỚC TIN NHẮN GỬI VỀ QUẢN LÝ SÂN</p>
                <pre className="text-white/60 text-xs font-mono whitespace-pre-line leading-relaxed">{telegramPreview}</pre>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-lime-400 hover:bg-lime-300 text-black font-black text-lg py-4 rounded-2xl flex items-center justify-center gap-3 transition disabled:opacity-60">
                {loading ? (
                  <span className="animate-spin border-2 border-black/30 border-t-black rounded-full w-5 h-5" />
                ) : (
                  <><Send className="size-5" /> Xác Nhận Đặt Sân &amp; Gửi Thông Báo</>
                )}
              </button>

              <p className="text-center text-white/30 text-xs">Sau khi bấm, chuông Telegram sẽ nổ ngay đến ban quản lý Arena Sport để xác nhận sân cho bạn.</p>
            </form>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="py-16 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          {[
            { icon: <Zap className="size-8 text-lime-400" />, title: "Xác Nhận 1 Giây", desc: "Hệ thống nổ chuông tức thì về quản lý ngay khi bạn bấm đặt." },
            { icon: <Shield className="size-8 text-lime-400" />, title: "Không Trùng Sân", desc: "Lịch đặt được quản lý realtime, loại bỏ hoàn toàn trùng lịch thủ công." },
            { icon: <Star className="size-8 text-lime-400" />, title: "Sân Chuẩn Thi Đấu", desc: "Mặt sân đạt tiêu chuẩn quốc tế, đèn LED chuyên nghiệp, không chói mắt." },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-lime-400/10 border border-lime-400/20 rounded-2xl flex items-center justify-center">{item.icon}</div>
              <h3 className="font-black text-lg">{item.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-lime-400 flex items-center justify-center">
              <Dumbbell className="size-5 text-black" />
            </div>
            <div>
              <div className="font-black">ARENA <span className="text-lime-400">SPORT</span></div>
              <div className="text-white/30 text-xs">Pickleball & Cầu Lông Chuẩn Thi Đấu</div>
            </div>
          </div>
          <div className="text-white/30 text-xs text-center">
            📍 123 Đường Thể Thao, Quận 7, TP.HCM &nbsp;|&nbsp; 📞 0909 123 456 &nbsp;|&nbsp; ⏰ 06:00 – 22:00 Hàng Ngày
          </div>
          <Link href="/home-booking" className="text-lime-400 text-sm font-bold hover:underline">
            Powered by 1Booking.Asia →
          </Link>
        </div>
      </footer>
    </div>
  );
}
