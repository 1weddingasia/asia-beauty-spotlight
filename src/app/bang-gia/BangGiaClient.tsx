'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  Check,
  ShieldCheck,
  Zap,
  Star,
  Copy,
  ExternalLink,
  Phone,
  QrCode,
  ArrowRight,
  Utensils,
  Building2,
  RefreshCw,
  PartyPopper,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface PricingPlan {
  id: string;
  name: string;
  tagline: string;
  price: number;
  period: string;
  badge?: string;
  isPopular?: boolean;
  category: 'fnb' | 'general';
  features: string[];
  ctaText: string;
}

const PLANS: PricingPlan[] = [
  // Nhóm F&B / Tiệc Tất Niên
  {
    id: 'fnb_standard',
    name: 'Gói Tiệc Chuẩn',
    tagline: 'Phủ điểm trên Phố Tiệc Tất Niên 2026, nhận khách tiệc tự động qua Telegram',
    price: 500000,
    period: '/ năm',
    category: 'fnb',
    features: [
      'Ghim điểm trên Bản Đồ 2.5D Phố Tiệc Tất Niên 2026',
      'Gian hàng số chuyên nghiệp chuẩn SEO (1booking.asia/slug)',
      'Hiển thị đầy đủ Menu, bảng giá set menu & ưu đãi tiệc',
      'Nổ chuông Telegram tức thì ngay khi khách đặt bàn',
      'Tích hợp nút gọi điện thoại & dẫn về nhóm Zalo',
      'Kích hoạt tự động ngay sau khi quét mã QR',
    ],
    ctaText: 'Đăng Ký Gói Chuẩn',
  },
  {
    id: 'fnb_vip_neon',
    name: 'Gói VIP Neon Tất Niên',
    tagline: 'Ghim hào quang Neon vàng kim độc quyền, thuật toán ưu tiên TOP 1 gợi ý sảnh tiệc',
    price: 1000000,
    period: '/ mùa tiệc',
    badge: 'ĐƯỢC ĐẶT NHIỀU NHẤT ⭐',
    isPopular: true,
    category: 'fnb',
    features: [
      'Ghim Hào Quang Vàng Neon (VIP Pulse Glow) phát sáng độc quyền',
      'Thuật toán ưu tiên đẩy lên TOP 1 khi khách tìm sảnh tiệc',
      'Huy hiệu "Ưu Đãi Tiệc Hot" rực rỡ trên bản đồ & danh sách',
      'Nổi bật không gian phòng VIP kín đáo & set menu thượng hạng',
      'Nổ chuông Telegram có gắn nhãn KHÁCH ĐẶT TIỆC VIP',
      'Hỗ trợ thiết kế hình ảnh banner & set menu tiệc cao cấp',
      'Hỗ trợ kỹ thuật & chăm sóc gian hàng 24/7',
    ],
    ctaText: 'Đăng Ký VIP Neon Ngay',
  },
  // Nhóm Doanh Nghiệp Đa Ngành
  {
    id: 'general_free',
    name: 'Gói Trải Nghiệm',
    tagline: 'Khởi đầu hiện diện số cho mọi cửa hàng, spa, salon & trung tâm dịch vụ',
    price: 0,
    period: '/ vĩnh viễn',
    category: 'general',
    features: [
      'Trang giới thiệu gian hàng chuẩn SEO cơ bản',
      'Hiển thị thông tin liên hệ, hotline & địa chỉ',
      'Xuất hiện trong danh bạ tìm kiếm địa phương',
      'Hỗ trợ tạo tài khoản miễn phí',
    ],
    ctaText: 'Tạo Gian Hàng Miễn Phí',
  },
  {
    id: 'general_premium',
    name: 'Doanh Nghiệp Premium',
    tagline: 'Tăng trưởng doanh thu vượt trội, ưu tiên hiển thị top tìm kiếm & chatbot AI 24/7',
    price: 500000,
    period: '/ năm',
    badge: 'TIẾT KIỆM 50% HÔM NAY',
    isPopular: true,
    category: 'general',
    features: [
      'Huy hiệu Doanh Nghiệp Đã Xác Minh (Tích xanh VIP)',
      'Ưu tiên Top 1 hiển thị danh mục ngành & địa phương',
      'Trợ lý Chatbot AI tư vấn & chốt lịch tự động 24/7',
      'Không giới hạn tiếp nhận Lead khách hàng qua Telegram',
      'Tích hợp form đặt lịch, mã ưu đãi & quà tặng khách',
      'Email báo cáo xác nhận thanh toán & bảo hành 1 năm',
    ],
    ctaText: 'Nâng Cấp Doanh Nghiệp VIP',
  },
];

export default function BangGiaClient() {
  const [activeTab, setActiveTab] = useState<'fnb' | 'general'>('fnb');
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);

  // Form thanh toán QR
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [isCopiedContent, setIsCopiedContent] = useState(false);
  const [isCopiedAcc, setIsCopiedAcc] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [checkMessage, setCheckMessage] = useState<string | null>(null);

  // Thông tin ngân hàng SePay
  const BANK_ACC = '00003554020';
  const BANK_NAME = 'TPBank';
  const BANK_OWNER = '1BOOKING.ASIA';

  const transferCode = phone
    ? `TIEC ${phone.replace(/\D/g, '')}`
    : selectedPlan?.id.includes('vip')
    ? 'VIP TIEC'
    : 'TIEC 1BOOKING';

  const qrUrl = selectedPlan
    ? `https://qr.sepay.vn/img?acc=${BANK_ACC}&bank=${BANK_NAME}&amount=${selectedPlan.price}&des=${encodeURIComponent(
        transferCode
      )}`
    : '';

  const handleOpenPayment = (plan: PricingPlan) => {
    if (plan.price === 0) {
      window.location.href = '/danh-cho-doanh-nghiep';
      return;
    }
    setSelectedPlan(plan);
    setPaymentSuccess(false);
    setCheckMessage(null);
  };

  const handleCopy = (text: string, type: 'content' | 'acc') => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      if (type === 'content') {
        setIsCopiedContent(true);
        setTimeout(() => setIsCopiedContent(false), 3000);
      } else {
        setIsCopiedAcc(true);
        setTimeout(() => setIsCopiedAcc(false), 3000);
      }
    }
  };

  const handleCheckStatus = async () => {
    if (!phone) {
      setCheckMessage('Vui lòng nhập số điện thoại quán để kiểm tra thanh toán!');
      return;
    }

    setIsCheckingPayment(true);
    setCheckMessage(null);

    try {
      const res = await fetch('/api/payment/check-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();

      if (data.activated) {
        setPaymentSuccess(true);
      } else {
        setCheckMessage(
          'Hệ thống đang chờ giao dịch từ ngân hàng. Nếu bạn vừa chuyển, vui lòng chờ 30-60 giây và bấm lại!'
        );
      }
    } catch {
      setCheckMessage('Có lỗi kết nối mạng. Vui lòng thử lại sau giây lát!');
    } finally {
      setIsCheckingPayment(false);
    }
  };

  const visiblePlans = PLANS.filter((p) => p.category === activeTab);

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto select-none">
      {/* 1. Header & Hero */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-4">
          <Sparkles className="w-3.5 h-3.5" /> BẢNG GIÁ DỊCH VỤ & GÓI HỘI VIÊN CHÍNH THỨC
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
          Đón Sóng Khách Tiệc & Doanh Thu{' '}
          <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">
            Mùa Lễ Hội 2026
          </span>
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
          Đưa nhà hàng lên <strong>Bản Đồ Phố Tiệc Tất Niên</strong> hoặc nâng cấp thương hiệu đa
          ngành. Thanh toán tự động 24/7 qua mã QR VietQR ngân hàng, kích hoạt ngay sau 30 giây.
        </p>
      </div>

      {/* 2. Switcher Category */}
      <div className="flex justify-center mb-12">
        <div className="p-1.5 bg-zinc-900/90 border border-zinc-800 rounded-2xl flex items-center gap-1.5 shadow-xl">
          <button
            type="button"
            onClick={() => setActiveTab('fnb')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'fnb'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-950 font-extrabold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>🍷 Phố Tiệc Tất Niên (F&B / Nhà Hàng)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'general'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-950 font-extrabold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>💼 Doanh Nghiệp Đa Ngành</span>
          </button>
        </div>
      </div>

      {/* 3. Cards Grid */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
        {visiblePlans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 border ${
              plan.isPopular
                ? 'bg-gradient-to-b from-amber-950/40 via-zinc-950 to-zinc-950 border-amber-500/60 shadow-2xl shadow-amber-950/50 hover:border-amber-400'
                : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            {/* Popular Badge */}
            {plan.badge && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-[11px] font-black px-4 py-1 rounded-full shadow-lg shadow-amber-950/60">
                {plan.badge}
              </div>
            )}

            <div>
              <div className="mb-4">
                <h3 className="text-xl sm:text-2xl font-black text-white">{plan.name}</h3>
                <p className="text-xs text-zinc-400 mt-1 min-h-[36px]">{plan.tagline}</p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1 my-6 pb-6 border-b border-zinc-800">
                <span className="text-3xl sm:text-4xl font-extrabold text-amber-300">
                  {plan.price === 0 ? 'Miễn Phí' : `${plan.price.toLocaleString('vi-VN')} đ`}
                </span>
                {plan.price > 0 && (
                  <span className="text-xs text-zinc-400 font-semibold">{plan.period}</span>
                )}
              </div>

              {/* Features List */}
              <div className="space-y-3 mb-8">
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Quyền lợi đặc quyền:
                </div>
                {plan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-200">
                    <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <button
              type="button"
              onClick={() => handleOpenPayment(plan)}
              className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                plan.isPopular
                  ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black shadow-lg shadow-amber-950'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
              }`}
            >
              <span>{plan.ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* 4. Banner Cam Kết An Tâm */}
      <div className="max-w-4xl mx-auto rounded-3xl bg-zinc-900/60 border border-zinc-800 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left mb-16">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <h4 className="text-base font-bold text-white mb-1">
            Cam kết kích hoạt tự động 100% & Bảo trợ truyền thông
          </h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Hệ thống thanh toán kết nối trực tiếp với cổng ngân hàng SePay. Giao dịch được bảo mật
            và nổ chuông kích hoạt tức thời. Đội ngũ kỹ thuật hỗ trợ hoàn thiện hình ảnh, banner và
            menu tiệc cho nhà hàng trong vòng 2 giờ.
          </p>
        </div>
        <a
          href="https://zalo.me/0901234567"
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-bold shrink-0 transition-colors flex items-center gap-2"
        >
          <Phone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Hotline / Zalo Hỗ Trợ</span>
        </a>
      </div>

      {/* 5. Dialog Quét Mã QR Thanh Toán */}
      <Dialog open={!!selectedPlan} onOpenChange={(open) => !open && setSelectedPlan(null)}>
        <DialogContent className="max-w-md bg-zinc-950 border border-amber-500/40 text-white p-6 rounded-3xl select-none">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-amber-400 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-amber-400" />
              Thanh Toán Quét Mã QR Tự Động
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              Kích hoạt ngay: <strong>{selectedPlan?.name}</strong> (
              {selectedPlan?.price.toLocaleString('vi-VN')} đ)
            </DialogDescription>
          </DialogHeader>

          {paymentSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                <PartyPopper className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Thanh Toán Thành Công!</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Hệ thống đã nhận được giao dịch và tự động kích hoạt gói thành công cho quán của bạn.
              </p>
              <div className="pt-4 flex flex-col gap-2">
                <Link
                  href="/tat-nien"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs text-center shadow-lg shadow-amber-950"
                >
                  Xem Quán Trên Bản Đồ Phố Tiệc
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedPlan(null)}
                  className="w-full py-2.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white text-xs font-medium"
                >
                  Đóng Hộp Thoại
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {/* Form nhập thông tin */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                    1. Tên Quán / Doanh Nghiệp:
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="VD: Quán Ẩm Thực Sài Gòn"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                    2. Số Điện Thoại Quán (Để tự động kích hoạt):
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="VD: 0901234567"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* QR Image */}
              <div className="bg-white p-4 rounded-2xl flex flex-col items-center justify-center shadow-inner">
                {qrUrl ? (
                  <img
                    src={qrUrl}
                    alt="Mã QR Chuyển Khoản Ngân Hàng"
                    className="w-56 h-56 object-contain"
                  />
                ) : (
                  <div className="w-56 h-56 bg-zinc-100 flex items-center justify-center text-zinc-400 text-xs">
                    Đang tạo mã QR...
                  </div>
                )}
                <div className="text-[11px] font-bold text-black mt-2">
                  Quét bằng App Ngân Hàng bất kỳ (VietQR 24/7)
                </div>
              </div>

              {/* Thông tin chuyển khoản */}
              <div className="bg-zinc-900 rounded-xl p-3 border border-zinc-800 space-y-2 text-xs">
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Ngân hàng:</span>
                  <span className="font-bold text-white">{BANK_NAME}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Số tài khoản:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-amber-300">
                    <span>{BANK_ACC}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(BANK_ACC, 'acc')}
                      className="text-zinc-400 hover:text-white"
                      title="Sao chép STK"
                    >
                      {isCopiedAcc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Chủ tài khoản:</span>
                  <span className="font-bold text-white">{BANK_OWNER}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Số tiền:</span>
                  <span className="font-bold text-amber-400 text-sm">
                    {selectedPlan?.price.toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="flex justify-between items-center text-zinc-400 pt-1 border-t border-zinc-800">
                  <span>Nội dung CK:</span>
                  <div className="flex items-center gap-1.5 font-mono font-black text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30">
                    <span>{transferCode}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(transferCode, 'content')}
                      className="text-zinc-400 hover:text-white"
                      title="Sao chép nội dung"
                    >
                      {isCopiedContent ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {checkMessage && (
                <div className="text-[11px] text-amber-300 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/30 text-center">
                  {checkMessage}
                </div>
              )}

              {/* Nút kiểm tra trạng thái */}
              <button
                type="button"
                onClick={handleCheckStatus}
                disabled={isCheckingPayment}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs shadow-lg shadow-amber-950 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isCheckingPayment ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang kiểm tra giao dịch từ ngân hàng...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Tôi Đã Chuyển Khoản — Kiểm Tra Kích Hoạt</span>
                  </>
                )}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
