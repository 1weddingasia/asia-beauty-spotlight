'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Check,
  ShieldCheck,
  Zap,
  Star,
  Copy,
  Phone,
  QrCode,
  ArrowRight,
  Utensils,
  Building2,
  RefreshCw,
  PartyPopper,
  Flame,
  Store,
  ExternalLink,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export interface PricingPlanItem {
  id: string;
  code: string;
  name: string;
  tagline: string;
  price: number;
  period: string;
  badge?: string;
  isPopular?: boolean;
  pageType: 'deal' | 'party';
  tier: 'standard' | 'vip';
  features: string[];
  ctaText: string;
}

// 4 gói chính thức chia làm 2 dòng sản phẩm độc lập
const DEFAULT_DEAL_PLANS: PricingPlanItem[] = [
  {
    id: 'udai_standard',
    code: 'udai_standard',
    name: 'Gói Trang Ưu Đãi (Chuẩn)',
    tagline: 'Kích hoạt trang ưu đãi chính của doanh nghiệp hoạt động chính thức 1 năm',
    price: 500000,
    period: '/ năm',
    pageType: 'deal',
    tier: 'standard',
    features: [
      'Kích hoạt Trang Ưu Đãi chính thức 1 năm (1booking.asia/ten-tiem)',
      'Đăng tải deal ưu đãi, dịch vụ & bảng giá không giới hạn',
      'Tích hợp số điện thoại gọi trực tiếp & liên kết Zalo đón khách',
      'Tài khoản quản trị chủ động cập nhật hình ảnh & thông tin',
    ],
    ctaText: 'Đăng Ký Gói Chuẩn (500k)',
  },
  {
    id: 'udai_vip',
    code: 'udai_vip',
    name: 'Gói Trang Ưu Đãi (VIP Trao Tay)',
    tagline: 'Gói chìa khóa trao tay: Setup toàn bộ trang vận hành & kích hoạt chuông Telegram',
    price: 1500000,
    period: '/ năm',
    badge: 'CHÌA KHÓA TRAO TAY ⭐',
    isPopular: true,
    pageType: 'deal',
    tier: 'vip',
    features: [
      'Trọn bộ quyền lợi Gói Trang Ưu Đãi Chuẩn trong vòng 1 năm',
      'Đội ngũ kỹ thuật hỗ trợ setup toàn bộ nội dung & hình ảnh gian hàng',
      'Cấu hình & kích hoạt nổ chuông thông báo qua Telegram khi có khách đặt hẹn',
      'Hỗ trợ kỹ thuật ưu tiên trong suốt 1 năm hoạt động',
    ],
    ctaText: 'Đăng Ký Gói VIP Trao Tay (1.5tr)',
  },
];

const DEFAULT_PARTY_PLANS: PricingPlanItem[] = [
  {
    id: 'tiec_standard',
    code: 'tiec_standard',
    name: 'Gói Trang Đặt Tiệc (Chuẩn)',
    tagline: 'Kích hoạt trang nhận tiệc tất niên riêng biệt, tiếp nhận đoàn đông & tiệc công ty 1 năm',
    price: 500000,
    period: '/ năm',
    pageType: 'party',
    tier: 'standard',
    features: [
      'Kích hoạt Trang Nhận Tiệc riêng biệt 1 năm (1booking.asia/ten-tiem/tiec)',
      'Hiển thị vị trí quán trên Bản Đồ Phố Tiệc & Danh Sách Tìm Kiếm',
      'Đăng tải thực đơn set menu tiệc, sức chứa bàn & phòng VIP kín đáo',
      'Tiếp nhận yêu cầu đặt bàn tiệc đoàn và khách công ty trực tiếp',
    ],
    ctaText: 'Kích Hoạt Trang Đặt Tiệc (500k)',
  },
  {
    id: 'tiec_vip',
    code: 'tiec_vip',
    name: 'Gói Trang Đặt Tiệc (VIP Neon)',
    tagline: 'Thêm chức năng đèn Neon phát sáng rực rỡ trên logo trên Bản Đồ Tiệc Tất Niên',
    price: 700000,
    period: '/ năm',
    badge: 'ĐÈN NEON NỔI BẬT BẢN ĐỒ 🔥',
    isPopular: true,
    pageType: 'party',
    tier: 'vip',
    features: [
      'Trọn bộ quyền lợi Gói Trang Đặt Tiệc Chuẩn trong vòng 1 năm',
      'Hiệu ứng Đèn Neon phát sáng rực rỡ trên Logo quán trên Bản Đồ Tiệc',
      'Huy hiệu VIP nổi bật, thu hút khách công ty & đoàn đông ưu tiên chọn',
      'Ưu tiên vị trí hiển thị hàng đầu trong danh sách tìm kiếm sảnh tiệc',
    ],
    ctaText: 'Kích Hoạt VIP Neon (700k)',
  },
];

interface BangGiaClientProps {
  initialPlans?: any[];
}

export default function BangGiaClient({ initialPlans = [] }: BangGiaClientProps) {
  const [selectedPlan, setSelectedPlan] = useState<PricingPlanItem | null>(null);

  const [userBusiness, setUserBusiness] = useState<{ id: string; name: string; slug: string } | null>(null);
  const [targetSlug, setTargetSlug] = useState('');
  const [phone, setPhone] = useState('');
  const [isCopiedContent, setIsCopiedContent] = useState(false);
  const [isCopiedAcc, setIsCopiedAcc] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [checkMessage, setCheckMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(async ({ data: { user } }) => {
        if (user) {
          const { data: biz } = await supabase
            .from('businesses')
            .select('id, name, slug')
            .eq('owner_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (biz) {
            setUserBusiness(biz);
            setTargetSlug(biz.slug);
          }
        }
      });
    } catch (e) {
      console.error('Error fetching user business in BangGiaClient:', e);
    }
  }, []);

  // Map plans từ database nếu có, fallback an toàn về danh sách mặc định nếu chưa có
  const mappedDeal = initialPlans.length > 0
    ? initialPlans
        .filter((p) => p.plan_type === 'deal' || p.name.includes('Ưu Đãi'))
        .map((p) => {
          const isVip = p.tier === 'vip' || p.code === 'udai_vip' || Number(p.price_yearly) >= 1000000;
          return {
            id: p.id,
            code: p.code || (isVip ? 'udai_vip' : 'udai_standard'),
            name: p.name,
            tagline: p.description || (isVip ? 'Gói chìa khóa trao tay: Setup toàn bộ trang vận hành & chuông Telegram' : 'Kích hoạt trang ưu đãi chính hoạt động 1 năm'),
            price: Number(p.price_yearly) || (isVip ? 1500000 : 500000),
            period: '/ năm',
            badge: isVip ? 'CHÌA KHÓA TRAO TAY ⭐' : undefined,
            isPopular: isVip,
            pageType: 'deal' as const,
            tier: isVip ? 'vip' as const : 'standard' as const,
            features: Array.isArray(p.features) && p.features.length > 0 ? p.features : (isVip ? DEFAULT_DEAL_PLANS[1].features : DEFAULT_DEAL_PLANS[0].features),
            ctaText: isVip ? 'Đăng Ký Gói VIP Trao Tay (1.5tr)' : 'Đăng Ký Gói Chuẩn (500k)',
          };
        })
    : [];
  const dealPlans = mappedDeal.length > 0 ? mappedDeal : DEFAULT_DEAL_PLANS;

  const mappedParty = initialPlans.length > 0
    ? initialPlans
        .filter((p) => p.plan_type === 'party' || p.name.includes('Tiệc'))
        .map((p) => {
          const isVip = p.tier === 'vip' || p.code === 'tiec_vip' || Number(p.price_yearly) >= 700000;
          return {
            id: p.id,
            code: p.code || (isVip ? 'tiec_vip' : 'tiec_standard'),
            name: p.name,
            tagline: p.description || (isVip ? 'Thêm chức năng đèn Neon sáng trên logo trên bản đồ tiệc tất niên' : 'Kích hoạt trang nhận tiệc riêng biệt trong vòng 1 năm'),
            price: Number(p.price_yearly) || (isVip ? 700000 : 500000),
            period: '/ năm',
            badge: isVip ? 'ĐÈN NEON NỔI BẬT BẢN ĐỒ 🔥' : undefined,
            isPopular: isVip,
            pageType: 'party' as const,
            tier: isVip ? 'vip' as const : 'standard' as const,
            features: Array.isArray(p.features) && p.features.length > 0 ? p.features : (isVip ? DEFAULT_PARTY_PLANS[1].features : DEFAULT_PARTY_PLANS[0].features),
            ctaText: isVip ? 'Kích Hoạt VIP Neon (700k)' : 'Kích Hoạt Trang Đặt Tiệc (500k)',
          };
        })
    : [];
  const partyPlans = mappedParty.length > 0 ? mappedParty : DEFAULT_PARTY_PLANS;

  // Ngân hàng SePay
  const BANK_ACC = '00003554020';
  const BANK_NAME = 'TPBank';
  const BANK_OWNER = '1BOOKING.ASIA';

  const getSyntaxPrefix = (plan: PricingPlanItem) => {
    if (plan.pageType === 'party') {
      return plan.tier === 'vip' ? 'TIECVIP' : 'TIEC';
    }
    return plan.tier === 'vip' ? 'UDAIVIP' : 'UDAI';
  };

  const planPrefix = selectedPlan ? getSyntaxPrefix(selectedPlan) : 'UDAI';
  const effectiveSlug = (userBusiness?.slug || targetSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'));
  const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
  const transferCode = effectiveSlug 
    ? `${planPrefix} ${effectiveSlug.toUpperCase()}` 
    : cleanPhone 
    ? `${planPrefix} ${cleanPhone}` 
    : `${planPrefix} BIZ`;

  const qrUrl = selectedPlan
    ? `https://qr.sepay.vn/img?acc=${BANK_ACC}&bank=${BANK_NAME}&amount=${selectedPlan.price}&des=${encodeURIComponent(
        transferCode
      )}`
    : '';

  const handleOpenPayment = (plan: PricingPlanItem) => {
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
    if (!effectiveSlug && !cleanPhone) {
      setCheckMessage('Vui lòng nhập đường link slug quán của bạn để hệ thống kiểm tra tự động!');
      return;
    }

    setIsCheckingPayment(true);
    setCheckMessage(null);

    try {
      const res = await fetch('/api/payment/check-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: effectiveSlug, phone: cleanPhone }),
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

  return (
    <div className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto select-none">
      {/* 1. Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-4">
          <Sparkles className="w-3.5 h-3.5" /> BẢNG GIÁ KÍCH HOẠT THEO TỪNG LOẠI TRANG
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
          Bảng Giá Gói Thành Viên{' '}
          <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">
            Chính Thức
          </span>
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
          Hệ thống gồm <strong>2 loại trang độc lập</strong>: <strong>Trang Ưu Đãi</strong> (hiển thị gian hàng quanh năm) và <strong>Trang Đặt Tiệc</strong> (hiển thị trên Bản Đồ Tiệc Tất Niên). Quý đối tác có thể kích hoạt từng trang hoặc cả 2 trang tùy theo nhu cầu vận hành.
        </p>
      </div>

      {/* 2. DÒNG 1: DÀNH CHO TRANG ƯU ĐÃI & GIAN HÀNG SỐ */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-zinc-800">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                DÒNG 1
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                DÀNH CHO TRANG ƯU ĐÃI & GIAN HÀNG SỐ
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Địa chỉ: <code className="text-amber-300 font-mono">1booking.asia/[slug]</code> — Dành cho mọi ngành nghề (Spa, Salon, Phòng khám, Dịch vụ, Ẩm thực) hiển thị deal quanh năm.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {dealPlans.map((plan) => {
            const isVip = plan.tier === 'vip';
            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 border ${
                  isVip
                    ? 'bg-gradient-to-b from-amber-950/40 via-zinc-950 to-zinc-950 border-amber-500/60 shadow-2xl shadow-amber-950/40'
                    : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-[11px] font-black px-4 py-1 rounded-full shadow-lg shadow-amber-950/60 whitespace-nowrap">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="mb-4">
                    <h3 className="text-xl sm:text-2xl font-black text-white">{plan.name}</h3>
                    <p className="text-xs text-zinc-400 mt-1 min-h-[36px]">{plan.tagline}</p>
                  </div>

                  <div className="flex items-baseline gap-1 my-5 pb-5 border-b border-zinc-800">
                    <span className="text-3xl sm:text-4xl font-extrabold text-amber-300 font-mono">
                      {plan.price.toLocaleString('vi-VN')} đ
                    </span>
                    <span className="text-xs text-zinc-400 font-semibold">{plan.period}</span>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Quyền lợi bao gồm:
                    </div>
                    {plan.features.map((feat: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-200">
                        <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="leading-relaxed">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenPayment(plan)}
                  className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                    isVip
                      ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black shadow-lg shadow-amber-950'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
                  }`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. DÒNG 2: DÀNH CHO TRANG ĐẶT TIỆC TẤT NIÊN */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-zinc-800">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                DÒNG 2
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                DÀNH CHO TRANG ĐẶT TIỆC TẤT NIÊN
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Địa chỉ: <code className="text-blue-300 font-mono">1booking.asia/[slug]/tiec</code> & Bản Đồ Tiệc: <code className="text-blue-300 font-mono">/tat-nien</code> — Đón khách công ty & đặt tiệc đoàn đông.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {partyPlans.map((plan) => {
            const isVip = plan.tier === 'vip';
            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 border ${
                  isVip
                    ? 'bg-gradient-to-b from-blue-950/50 via-zinc-950 to-zinc-950 border-blue-500/60 shadow-2xl shadow-blue-950/50 ring-1 ring-blue-500/30'
                    : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[11px] font-black px-4 py-1 rounded-full shadow-lg shadow-blue-950/60 whitespace-nowrap flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-300" />
                    <span>{plan.badge}</span>
                  </div>
                )}

                <div>
                  <div className="mb-4">
                    <h3 className="text-xl sm:text-2xl font-black text-white">{plan.name}</h3>
                    <p className="text-xs text-zinc-400 mt-1 min-h-[36px]">{plan.tagline}</p>
                  </div>

                  <div className="flex items-baseline gap-1 my-5 pb-5 border-b border-zinc-800">
                    <span className={`text-3xl sm:text-4xl font-extrabold font-mono ${isVip ? 'text-blue-300' : 'text-zinc-100'}`}>
                      {plan.price.toLocaleString('vi-VN')} đ
                    </span>
                    <span className="text-xs text-zinc-400 font-semibold">{plan.period}</span>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Quyền lợi bao gồm:
                    </div>
                    {plan.features.map((feat: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-200">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isVip ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-800 text-zinc-300'}`}>
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="leading-relaxed">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenPayment(plan)}
                  className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                    isVip
                      ? 'bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 hover:from-blue-400 hover:to-indigo-400 text-white shadow-lg shadow-blue-950'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
                  }`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Banner Cam Kết Minh Bạch */}
      <div className="max-w-4xl mx-auto rounded-3xl bg-zinc-900/60 border border-zinc-800 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left mb-12">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <h4 className="text-base font-bold text-white mb-1">
            Cam kết kích hoạt tự động & đúng thỏa thuận
          </h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Hệ thống thanh toán qua cổng VietQR SePay ghi nhận tự động 24/7. Đúng quyền lợi niêm yết, không phát sinh chi phí ẩn. Hỗ trợ giải đáp & hướng dẫn quản trị qua Zalo / Hotline.
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
              Kích hoạt ngay: <strong>{selectedPlan?.name}</strong> ({selectedPlan?.price.toLocaleString('vi-VN')} đ / năm)
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
                  href={selectedPlan?.pageType === 'party' ? '/tat-nien' : '/danh-cho-doanh-nghiep'}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs text-center shadow-lg shadow-amber-950"
                >
                  {selectedPlan?.pageType === 'party' ? 'Xem Quán Trên Bản Đồ Phố Tiệc' : 'Đến Bảng Điều Khiển'}
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
              {/* Thẻ nhận diện Quán */}
              {userBusiness ? (
                <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <Store className="w-4 h-4" /> Đã nhận diện quán của bạn:
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded text-[10px]">
                      Đã đăng nhập
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-white pt-0.5">
                    <span className="font-bold text-sm">{userBusiness.name}</span>
                    <Link
                      href={`/${userBusiness.slug}/upgrade`}
                      className="text-amber-400 hover:underline flex items-center gap-1 font-bold text-xs"
                    >
                      Mở trong Quản lý quán <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Mã QR bên dưới đã được điền sẵn định danh quán (<code className="text-amber-300">/{userBusiness.slug}</code>). Bạn chỉ cần quét mã trên App ngân hàng là kích hoạt tự động!
                  </p>
                </div>
              ) : (
                <div className="bg-zinc-900 border border-amber-500/30 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                    <Sparkles className="w-3.5 h-3.5" /> Khuyên dùng để kích hoạt tự động 100%:
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    Quý đối tác hãy <strong>Đăng nhập vào Quán của mình</strong>. Khi đó mã QR sẽ tự động điền sẵn mọi thông tin, quý khách <strong>không cần phải gõ bất kỳ chữ nào</strong>!
                  </p>
                  <div className="flex gap-2 pt-1">
                    <Button asChild size="sm" className="bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs h-8 flex-1">
                      <Link href="/login?redirect=/bang-gia">Đăng Nhập Quán</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="text-zinc-300 border-zinc-700 text-xs h-8 flex-1">
                      <Link href="/danh-cho-doanh-nghiep">Đăng Ký Quán Mới (30N Thử)</Link>
                    </Button>
                  </div>
                  <div className="pt-2 border-t border-zinc-800 space-y-1">
                    <label className="block text-[11px] font-bold text-zinc-300 uppercase">
                      Hoặc nhập đường link slug quán của bạn để tạo mã QR ngay:
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-zinc-500 font-mono">1booking.asia/</span>
                      <input
                        type="text"
                        value={targetSlug}
                        onChange={(e) => setTargetSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                        placeholder="vd: nha-hang-que-nha"
                        className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>
              )}

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
                <div className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full text-center mt-2 flex items-center justify-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> App ngân hàng tự động điền Số tiền & Mã quán, không cần nhập tay!
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
