"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle, Send, MapPin, Tag, ShoppingBag, Star, Crown, Gift, Truck } from "lucide-react";

interface Props {
  heroImage: string;
  product1: string;
  product2: string;
}

const OFFERS = [
  {
    icon: <Tag className="size-6 text-[#FF9B82]" />,
    title: "Nhận Mã Giảm 50.000đ",
    desc: "Áp dụng cho đơn từ 299k khi mua trực tiếp tại tiệm hoặc giao hàng tận nơi. Mã gửi thẳng về Zalo/SMS.",
    price: "0đ",
    tag: "HOT",
  },
  {
    icon: <ShoppingBag className="size-6 text-[#FF9B82]" />,
    title: "Đặt Hàng & Giữ Size Ưu Tiên",
    desc: "Thích mẫu nào chỉ cần bấm chọn, shop giữ đúng size và gọi xác nhận ship COD toàn quốc.",
    price: "0đ",
    tag: "GIỮ HÀNG",
  },
  {
    icon: <Truck className="size-6 text-[#FF9B82]" />,
    title: "Freeship Toàn Quốc + Tặng Tote",
    desc: "Đặc quyền dành riêng cho khách đặt qua web chính thức của shop (Đơn từ 499k).",
    price: "QUÀ TẶNG",
    tag: "",
  },
  {
    icon: <Crown className="size-6 text-[#FF9B82]" />,
    title: "Đăng Ký Thành Viên VIP",
    desc: "Tích lũy điểm thưởng qua SĐT mỗi lần ghé tiệm/đặt hàng, hoàn tiền 5% trọn đời.",
    price: "MIỄN PHÍ",
    tag: "VIP",
  },
];

const SIZES = ["S", "M", "L", "XL", "Freesize"];
const DELIVERY_METHODS = ["Ship COD Tận Nơi", "Ghé Shop Thử Đồ"];

export default function FashionClient({ heroImage, product1, product2 }: Props) {
  const [form, setForm] = useState({
    name: "", phone: "", delivery: "Ship COD Tận Nơi", product: "Set Váy Linen Trắng", size: "M", note: "", offer: "Nhận Mã Giảm 50.000đ"
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const telegramPreview = `🛒 CÓ ĐƠN ĐẶT HÀNG / NHẬN ƯU ĐÃI MỚI - GEMMA CLOTHING
• Khách hàng: ${form.name || "Chưa nhập"} (${form.phone || "---"})
• Nhu cầu: ${form.product} (Size: ${form.size})
• Hình thức: ${form.delivery}
• Ưu đãi áp dụng: ${form.offer}
• Ghi chú: ${form.note || "Không có"}
👉 Nhân viên gọi xác nhận địa chỉ và đóng gói gửi hàng ngay!`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      alert("Vui lòng điền đầy đủ Tên và Số điện thoại!");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/demo-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: telegramPreview }),
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
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-[#FFDAB9]/30">
          <div className="w-20 h-20 rounded-full bg-[#FFDAB9]/50 border-2 border-[#FF9B82] flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="size-10 text-[#FF9B82]" />
          </div>
          <h2 className="text-3xl font-display font-bold text-[#1A1A1A] mb-3">Thành Công!</h2>
          <p className="text-[#1A1A1A]/70 mb-2">Yêu cầu của bạn đã được Gemma ghi nhận.</p>
          <p className="text-[#FF9B82] font-semibold mb-6">Nhân viên sẽ gọi điện/Zalo xác nhận trong vòng 5 phút nữa nhé!</p>
          
          <div className="bg-[#FDFBF7] border border-[#FFDAB9]/50 rounded-2xl p-4 text-left text-sm text-[#1A1A1A]/80 font-mono whitespace-pre-line mb-8 shadow-inner">
            <div className="text-xs text-[#FF9B82] font-bold mb-2 uppercase flex items-center gap-2"><Send className="size-3" /> Preview Tin nhắn Telegram Chủ Shop</div>
            {telegramPreview}
          </div>
          
          <button onClick={() => setSubmitted(false)} className="w-full bg-[#1A1A1A] text-white font-bold px-8 py-3.5 rounded-full hover:bg-black transition shadow-lg">
            Gửi Yêu Cầu Khác
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] overflow-x-hidden font-sans">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 py-4 bg-white/90 backdrop-blur-md border-b border-[#FFDAB9]/30">
        <div className="flex items-center gap-2">
          <span className="font-display font-black text-xl tracking-widest uppercase">GEMMA</span>
        </div>
        <a href="#booking" className="bg-[#FF9B82] text-white text-sm font-bold px-5 py-2.5 rounded-full hover:bg-[#FF8566] transition shadow-md">
          Nhận Ưu Đãi
        </a>
      </nav>

      {/* HERO */}
      <section className="pt-24 pb-12 px-4 md:px-8 lg:px-16 flex flex-col lg:flex-row items-center gap-10 max-w-7xl mx-auto">
        <div className="flex-1 space-y-6 z-10 text-center lg:text-left pt-10 lg:pt-0">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFDAB9]/40 border border-[#FF9B82]/30 text-[#FF6B4A] text-sm font-bold shadow-sm">
            <Gift className="size-4" /> Ưu Đãi Độc Quyền Khi Đặt Trực Tiếp Web
          </div>
          <h1 className="text-5xl lg:text-6xl font-display font-bold leading-[1.1] text-[#1A1A1A] tracking-tight">
            Săn Voucher Giảm 20% <br className="hidden lg:block"/> & Đặt Hàng 1-Chạm.
          </h1>
          <p className="text-lg text-[#1A1A1A]/70 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Tiết kiệm hơn mua qua sàn thương mại điện tử! Nhận ngay mã giảm giá, giữ size yêu thích trong 30 giây mà không cần tạo tài khoản rườm rà.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center lg:justify-start">
            <a href="#booking" className="w-full sm:w-auto bg-[#1A1A1A] text-white font-bold px-8 py-4 rounded-full hover:bg-black transition shadow-xl text-center">
              Nhận Mã Ưu Đãi 50K
            </a>
            <a href="#offers" className="w-full sm:w-auto bg-white text-[#1A1A1A] border border-[#1A1A1A]/20 font-bold px-8 py-4 rounded-full hover:bg-gray-50 transition text-center shadow-sm">
              Xem Bộ Sưu Tập Mới
            </a>
          </div>
        </div>
        <div className="flex-1 relative w-full max-w-lg lg:max-w-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#FFDAB9] to-transparent rounded-[3rem] rotate-3 scale-105 opacity-50 blur-lg"></div>
          <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
            <Image src={heroImage} alt="Gemma Fashion" fill className="object-cover" />
          </div>
          
          <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4 animate-bounce">
            <div className="w-12 h-12 bg-[#FFDAB9] rounded-full flex items-center justify-center">
              <Star className="size-6 text-[#FF9B82] fill-[#FF9B82]" />
            </div>
            <div>
              <p className="font-bold text-[#1A1A1A]">Hơn 5,000+</p>
              <p className="text-xs text-gray-500">Khách hàng tin chọn</p>
            </div>
          </div>
        </div>
      </section>

      {/* OFFERS */}
      <section id="offers" className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Đặc Quyền Từ Gemma</h2>
            <p className="text-gray-500">Chỉ áp dụng khi đặt trực tiếp qua website</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {OFFERS.map((offer, i) => (
              <div key={i} className="bg-[#FDFBF7] p-6 rounded-3xl border border-[#FFDAB9]/40 hover:shadow-xl transition-shadow relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#FFDAB9]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-[4rem]"></div>
                
                {offer.tag && (
                  <div className="absolute top-4 right-4 bg-[#FF9B82] text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                    {offer.tag}
                  </div>
                )}
                
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 border border-gray-100">
                  {offer.icon}
                </div>
                <h3 className="text-lg font-bold mb-3">{offer.title}</h3>
                <p className="text-sm text-gray-600 mb-6 line-clamp-3">{offer.desc}</p>
                <div className="font-display font-bold text-xl text-[#FF6B4A] mt-auto">
                  {offer.price}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY/PRODUCTS */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">Sản Phẩm Nổi Bật</h2>
            <p className="text-gray-500">Những items được yêu thích nhất tháng này</p>
          </div>
          <a href="#booking" className="text-[#FF9B82] font-bold hover:underline">Xem tất cả →</a>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="group cursor-pointer">
            <div className="relative aspect-square rounded-[2rem] overflow-hidden mb-4 border border-gray-100">
              <Image src={product1} alt="Product 1" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <h3 className="font-bold text-lg">Set Váy Linen Trắng Thanh Lịch</h3>
            <p className="text-[#FF6B4A] font-bold">550.000đ</p>
          </div>
          <div className="group cursor-pointer">
            <div className="relative aspect-square rounded-[2rem] overflow-hidden mb-4 border border-gray-100">
              <Image src={product2} alt="Product 2" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <h3 className="font-bold text-lg">Túi Tote Gemma Canvas Base</h3>
            <p className="text-[#FF6B4A] font-bold">299.000đ</p>
          </div>
        </div>
      </section>

      {/* BOOKING FORM */}
      <section id="booking" className="py-20 bg-[#1A1A1A] text-white">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFDAB9]/20 text-[#FFDAB9] text-sm font-bold">
                <Send className="size-4" /> Nhanh chóng & Tiện lợi
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight">
                Nhận Ưu Đãi <br/> Hoặc Đặt Hàng Ngay!
              </h2>
              <p className="text-gray-400 text-lg">
                Điền thông tin bên dưới, Gemma sẽ liên hệ bạn qua Zalo/SĐT để xác nhận giữ size hoặc gửi mã giảm giá lập tức.
              </p>
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 font-mono text-sm text-gray-300">
                <div className="text-[#FFDAB9] font-bold mb-2">💡 Demo Telegram:</div>
                Hệ thống 1Booking được tích hợp sẵn mini-CRM. Bất kỳ khi nào khách hàng điền form này, dữ liệu sẽ bắn trực tiếp về Telegram cá nhân của chủ shop trong chưa tới 1 giây!
              </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white text-[#1A1A1A] p-6 md:p-8 rounded-[2rem] shadow-2xl space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFDAB9]/30 rounded-bl-[100px] pointer-events-none"></div>
              
              <h3 className="text-2xl font-bold font-display mb-6">Thông Tin Của Bạn</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Gói Ưu Đãi / Dịch Vụ</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {OFFERS.map(o => (
                    <div 
                      key={o.title}
                      onClick={() => handle("offer", o.title)}
                      className={`p-3 rounded-xl border text-sm font-medium cursor-pointer transition ${form.offer === o.title ? 'bg-[#FFDAB9]/30 border-[#FF9B82] text-[#FF6B4A]' : 'hover:bg-gray-50 border-gray-200'}`}
                    >
                      {o.title}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Họ Tên</label>
                  <input required value={form.name} onChange={e => handle("name", e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF9B82]/50 transition" placeholder="Tên của bạn" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">SĐT / Zalo</label>
                  <input required value={form.phone} onChange={e => handle("phone", e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF9B82]/50 transition" placeholder="Số điện thoại" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Sản Phẩm Quan Tâm</label>
                  <input value={form.product} onChange={e => handle("product", e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF9B82]/50 transition" placeholder="Tên sản phẩm..." />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Size Yêu Thích</label>
                  <select value={form.size} onChange={e => handle("size", e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF9B82]/50 transition appearance-none">
                    {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Hình thức nhận hàng</label>
                <div className="flex gap-3">
                  {DELIVERY_METHODS.map(m => (
                    <div 
                      key={m}
                      onClick={() => handle("delivery", m)}
                      className={`flex-1 py-3 text-center rounded-xl border text-sm font-bold cursor-pointer transition ${form.delivery === m ? 'bg-[#1A1A1A] text-white border-black' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
                    >
                      {m}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Ghi chú thêm</label>
                <input value={form.note} onChange={e => handle("note", e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF9B82]/50 transition" placeholder="Địa chỉ giao hàng, thời gian..." />
              </div>

              <button type="submit" disabled={loading} className="w-full bg-[#FF9B82] text-white font-bold text-lg py-4 rounded-xl hover:bg-[#FF8566] transition shadow-lg shadow-[#FF9B82]/30 flex items-center justify-center gap-2 mt-4">
                {loading ? "Đang gửi..." : "Hoàn Tất Đăng Ký"}
              </button>
            </form>
          </div>
        </div>
      </section>
      
      <footer className="bg-black text-white/50 text-center py-6 text-sm">
        <p>© 2026 GEMMA CLOTHING. Powered by 1Booking.asia Demo System.</p>
      </footer>
    </div>
  );
}
