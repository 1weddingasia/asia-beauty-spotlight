'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  Users,
  Wine,
  MapPin,
  Phone,
  MessageCircle,
  Share2,
  CalendarCheck,
  CheckCircle2,
  PartyPopper,
  Clock,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Check,
  UtensilsCrossed,
  Flame,
  BadgeCheck,
  AlertCircle,
  Coins,
  Building2,
  FileText,
  CheckCircle,
  Info,
  Eye,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  BusinessPartyProfile,
  PARTY_SPACES,
  PARTY_CUISINES,
  PARTY_PERKS,
  getSpaceLabel,
  getCuisineLabel,
  getPerkLabel,
} from '@/types/party';
import { useSiteConfig } from '@/components/site/Layout';
import { resolveZaloContact } from '@/lib/zalo-contact';

interface PartyVenueClientProps {
  business: any;
  partyProfile: BusinessPartyProfile;
  bannerImg: string | null;
  avatar: string;
}

export default function PartyVenueClient({
  business,
  partyProfile,
  bannerImg,
  avatar,
}: PartyVenueClientProps) {
  const siteConfig = useSiteConfig();
  const b = business;
  const isDemo = Boolean(partyProfile.is_demo || (b as any).is_demo);

  // Dynamic Zalo URL & Contact linking directly to real database data
  const zaloContact = resolveZaloContact(b);
  const venueZaloUrl = zaloContact.venueZaloUrl;
  const venueZaloDisplay = zaloContact.venueZaloDisplay;
  const supportZaloUrl = zaloContact.supportZaloUrl;

  // Lượt xem thật từ DB + Lượt random dao động 5-20 mỗi ngày (đồng bộ chuẩn với trang ưu đãi chính)
  const initialTotalViews = (Number(b.page_views) || 0) + (Number(b.random_views) || 0);
  const [totalViews, setTotalViews] = useState<number>(initialTotalViews > 0 ? initialTotalViews : 12);

  useEffect(() => {
    if (!b?.slug) return;
    (async () => {
      try {
        const res = await fetch(`/api/businesses/${b.slug}/view`, { method: 'POST' });
        const data = await res.json();
        if (typeof data?.total_views === 'number' && data.total_views > 0) {
          setTotalViews(data.total_views);
        }
      } catch (err) {
        console.error('[PartyVenue] View count tracking error:', err);
      }
    })();
  }, [b?.slug]);

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedSetMenu, setSelectedSetMenu] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [partyGuests, setPartyGuests] = useState(String(partyProfile.min_guests || 20));
  const [bookingTime, setBookingTime] = useState('');
  const [partyNotes, setPartyNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [successVoucher, setSuccessVoucher] = useState<string | null>(null);

  const [copiedShare, setCopiedShare] = useState(false);
  const shareTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (shareTimerRef.current) clearTimeout(shareTimerRef.current);
    };
  }, []);

  const handleShare = async () => {
    const url = `https://${siteConfig.domain}/${b.slug}/tiec`;
    const shareText = `🎉 Sảnh Tiệc Tất Niên & Sự Kiện tại ${b.name}!\n📍 Địa chỉ: ${b.address || ''}\n🎁 Ưu đãi: ${partyProfile.party_deal_highlight || 'Nhiều ưu đãi tiệc đặc quyền'}\n👉 Xem thực đơn & giữ chỗ: ${url}`;

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareText);
        setCopiedShare(true);
        toast.success('Đã sao chép đường dẫn & thông tin sảnh tiệc!');
        shareTimerRef.current = setTimeout(() => setCopiedShare(false), 3000);
        return;
      } catch {
        // fallback
      }
    }
    toast.info('Vui lòng chia sẻ đường dẫn trên thanh địa chỉ trình duyệt.');
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (!/^(03|05|07|08|09)\d{8}$/.test(cleanPhone)) {
      toast.error('Vui lòng nhập số điện thoại Việt Nam hợp lệ (10 chữ số)');
      return;
    }

    const guestsNum = parseInt(partyGuests, 10);
    if (isNaN(guestsNum) || guestsNum <= 0) {
      toast.error('Vui lòng nhập số lượng khách hợp lệ');
      return;
    }

    setLoading(true);
    try {
      const dealTitle = selectedSetMenu
        ? `[TIỆC TẤT NIÊN] ${selectedSetMenu}`
        : `[TIỆC TẤT NIÊN] ${partyProfile.party_deal_highlight || 'Đặt Bàn Tiệc & Giữ Chỗ VIP'}`;

      const bookingInfo = bookingTime.trim()
        ? `${bookingTime.trim()} • Quy mô: ${guestsNum} khách`
        : `Quy mô: ${guestsNum} khách`;

      const notesCombined = [
        partyNotes ? `Ghi chú: ${partyNotes}` : '',
        selectedSetMenu ? `Set menu chọn: ${selectedSetMenu}` : '',
      ]
        .filter(Boolean)
        .join(' | ')
        .slice(0, 450);

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: b.id,
          customer_name: customerName.trim() || 'Khách đặt tiệc',
          customer_phone: cleanPhone,
          deal_name: dealTitle,
          cross_sell_items: notesCombined || null,
          booking_time: bookingInfo,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Có lỗi xảy ra khi gửi yêu cầu đặt tiệc.');
      } else {
        setSuccessVoucher(data.voucher_code || 'TN-OK');
        toast.success('Gửi yêu cầu đặt tiệc thành công! Quán sẽ gọi xác nhận trong 5 phút.');
      }
    } catch {
      toast.error('Lỗi kết nối. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const heroImage = bannerImg || '/images/categories/nha-hang-am-thuc.jpg';

  // Format price
  const priceMinFormatted = partyProfile.price_min ? Number(partyProfile.price_min).toLocaleString('vi-VN') : '250.000';
  const priceMaxFormatted = partyProfile.price_max ? Number(partyProfile.price_max).toLocaleString('vi-VN') : '650.000';

  // Active space tags (resolves both standard presets and custom tags)
  const activeSpaces = (partyProfile.spaces_and_amenities || []).map(getSpaceLabel).filter(Boolean);
  const activeCuisines = (partyProfile.cuisines || []).map(getCuisineLabel).filter(Boolean);
  const activePerks = (partyProfile.party_perks || []).map(getPerkLabel).filter(Boolean);
  const rawPartyMenuUrl = partyProfile.party_menu_url || b.page_content?.menu_url || null;
  const partyMenuLink = rawPartyMenuUrl && /^https?:\/\//.test(rawPartyMenuUrl) ? rawPartyMenuUrl : null;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-slate-900 selection:bg-amber-300 selection:text-slate-950 font-sans w-full max-w-full overflow-x-hidden">
      {/* 1. Header Festive Bar: Navigation between Main Promo Page & Party Page (Champagne Gold Luxury) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/90 px-4 py-3 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href={`/${b.slug}`}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-amber-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-amber-700" />
            <span>Về Trang Ưu Đãi Chính</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/tat-nien"
              className="text-xs text-amber-900 hover:text-amber-950 font-bold hidden sm:inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-100 to-amber-200/80 px-3.5 py-1.5 rounded-full border border-amber-300/80 shadow-xs hover:border-amber-400 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Bản Đồ Phố Tiệc Tất Niên</span>
            </Link>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-xs text-slate-700 hover:text-slate-900 transition-colors border border-amber-200/90 shadow-xs cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-600" />
              <span>{copiedShare ? 'Đã sao chép' : 'Chia sẻ sảnh'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section: Grand Ballroom Champagne Gold Banner */}
      <section className="relative overflow-hidden border-b border-amber-900/30 bg-slate-950">
        <div
          className="absolute inset-0 bg-cover bg-center filter brightness-[0.90] contrast-[1.05]"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        {/* Dark cinematic gradient: NO white fog, restaurant interior is crisp, rich, and visible */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/45 to-slate-950/65 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 pt-12 pb-16 relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3.5 py-1 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Sảnh Tiệc Tất Niên &amp; Sự Kiện VIP
            </span>
            <span className="px-3.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-100 border border-amber-400/25 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>{totalViews.toLocaleString('vi-VN')} lượt xem</span>
            </span>
            {partyProfile.is_vip && (
              <span className="px-3.5 py-1 rounded-full bg-amber-950/70 backdrop-blur-md text-amber-200 border border-amber-400/30 text-xs font-bold shadow-xs">
                ⭐ Điểm Tiệc Đề Xuất
              </span>
            )}
            {isDemo && (
              <span className="px-3 py-1 rounded-full bg-sky-950/70 backdrop-blur-md text-sky-200 border border-sky-400/30 text-xs font-bold flex items-center gap-1 shadow-xs">
                <Info className="w-3.5 h-3.5 text-sky-400" /> Bản xem trước (Demo)
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-3 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
            {b.name}
          </h1>

          <p className="text-amber-100/90 text-xs sm:text-sm flex items-center gap-1.5 max-w-2xl mb-4 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] font-medium">
            <MapPin className="w-4 h-4 text-amber-300 shrink-0" />
            <span>{b.address || 'Đang cập nhật địa chỉ'}</span>
          </p>

          {isDemo && (
            <div className="bg-slate-900/85 backdrop-blur-md border border-amber-400/30 text-slate-200 text-xs px-4 py-3 rounded-2xl flex items-center gap-2.5 max-w-2xl mb-6 shadow-xl">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong className="text-amber-300 font-bold">Hồ sơ mẫu tham khảo:</strong> Dữ liệu thực đơn và thông số sảnh tiệc đang ở chế độ xem trước minh họa. Vui lòng liên hệ trực tiếp nhà hàng để nhận báo giá và tư vấn chính xác nhất.
              </span>
            </div>
          )}

          {/* Key Metrics Grid: Floating Champagne Glass Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mb-8">
            <div className="bg-slate-900/80 border border-amber-400/25 rounded-2xl p-3.5 backdrop-blur-md shadow-xl hover:border-amber-400/50 transition-all">
              <div className="text-[11px] text-amber-200/80 font-medium flex items-center gap-1 mb-1">
                <Users className="w-3.5 h-3.5 text-amber-400" /> Sức chứa tiệc
              </div>
              <div className="text-base sm:text-lg font-black text-white">
                {partyProfile.min_guests} - {partyProfile.max_guests} <span className="text-xs font-normal text-slate-400">khách</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-amber-400/25 rounded-2xl p-3.5 backdrop-blur-md shadow-xl hover:border-amber-400/50 transition-all">
              <div className="text-[11px] text-amber-200/80 font-medium flex items-center gap-1 mb-1">
                <Coins className="w-3.5 h-3.5 text-emerald-400" /> Ngân sách dự kiến
              </div>
              <div className="text-base sm:text-lg font-black text-amber-300">
                {priceMinFormatted} - {priceMaxFormatted} <span className="text-xs font-normal text-slate-400">đ/pax</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-amber-400/25 rounded-2xl p-3.5 backdrop-blur-md shadow-xl hover:border-amber-400/50 transition-all">
              <div className="text-[11px] text-amber-200/80 font-medium flex items-center gap-1 mb-1">
                <Wine className="w-3.5 h-3.5 text-amber-400" /> Phòng VIP riêng
              </div>
              <div className="text-base sm:text-lg font-black text-white">
                {partyProfile.num_vip_rooms || 2} <span className="text-xs font-normal text-slate-400">phòng</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-amber-400/25 rounded-2xl p-3.5 backdrop-blur-md shadow-xl hover:border-amber-400/50 transition-all">
              <div className="text-[11px] text-amber-200/80 font-medium flex items-center gap-1 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Trạng thái
              </div>
              <div className="text-xs sm:text-sm font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Đang nhận tiệc
              </div>
            </div>
          </div>

          {/* Action CTAs: Gala Gold Booking + Menu Link + 2 Nút Zalo Thực */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
            <button
              onClick={() => {
                setSelectedSetMenu('');
                setIsBookingOpen(true);
              }}
              className="px-6 py-3.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-950/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
            >
              <CalendarCheck className="w-4 h-4 text-slate-950" />
              <span>ĐẶT BÀN TIỆC &amp; GIỮ CHỖ VIP</span>
            </button>

            {partyMenuLink && (
              <a
                href={partyMenuLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 rounded-full bg-white/95 hover:bg-white text-amber-950 font-bold text-sm border border-amber-300/90 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-md shadow-amber-950/10 w-full sm:w-auto"
              >
                <Wine className="w-4 h-4 text-amber-700" />
                <span>Xem Thực Đơn Chi Tiết</span>
              </a>
            )}

            {/* Nút 1: Chat Zalo Nhà Hàng */}
            <a
              href={venueZaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3.5 rounded-full bg-[#0068FF] hover:bg-[#0054cc] text-white font-black text-sm shadow-xl shadow-blue-900/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
              title="Chat Zalo trực tiếp với nhà hàng"
            >
              <MessageCircle className="w-4 h-4 fill-white text-white shrink-0" />
              <span>Chat Zalo Nhà Hàng</span>
            </a>

            {/* Nút 2: Chat Tư Vấn Nhận Tiệc (vẫn nằm ở đây trong Hero, không đưa xuống đáy màn hình) */}
            <a
              href={supportZaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3.5 rounded-full bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300 hover:from-amber-300 hover:to-yellow-300 text-amber-950 font-extrabold text-sm shadow-lg shadow-amber-950/10 border border-amber-400/80 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
              title="Chat Tư Vấn Nhận Tiệc qua Zalo"
            >
              <MessageCircle className="w-4 h-4 text-amber-800 shrink-0" />
              <span>Chat Tư Vấn Nhận Tiệc</span>
            </a>
          </div>
        </div>
      </section>

      {/* 3. Main Content: Sảnh tiệc, Ưu đãi, Thực đơn & Tiện ích (Champagne Gold Silk Palette) */}
      <main className="max-w-6xl mx-auto px-4 py-10 pb-24 md:pb-12 space-y-10">
        {/* Ưu đãi tiệc đặc quyền nổi bật */}
        {partyProfile.party_deal_highlight && (
          <div className="bg-gradient-to-r from-amber-100/90 via-white to-amber-100/90 border-2 border-amber-300/90 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl shadow-amber-950/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm">
                  <Flame className="w-3.5 h-3.5" /> GÓI ƯU ĐÃI TIỆC ĐẶC QUYỀN
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {partyProfile.party_deal_highlight}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                  Áp dụng cho các đoàn khách công ty và gia đình đặt tiệc tất niên, họp mặt cuối năm sớm qua hệ thống 1Booking.asia.
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedSetMenu(partyProfile.party_deal_highlight || '');
                  setIsBookingOpen(true);
                }}
                className="shrink-0 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase shadow-md shadow-amber-950/20 transition-all self-start sm:self-auto cursor-pointer"
              >
                Nhận Ưu Đãi Tiệc Này
              </button>
            </div>
          </div>
        )}

        {/* Câu chốt chặn an toàn (Disclaimer) */}
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-3xl p-4 sm:p-5 flex items-start gap-3 shadow-xs">
          <span className="text-xl shrink-0 mt-0.5">⚠️</span>
          <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            <strong className="text-amber-900 font-bold">Lưu ý:</strong> Chính sách ưu đãi (tặng bia, phòng VIP, karaoke, màn LED, âm thanh...) áp dụng tùy theo quy mô số lượng bàn và thời điểm đặt cọc của từng nhà hàng. Vui lòng liên hệ Hotline/Zalo của quán để nhận xác nhận chính thức cho đoàn.
          </div>
        </div>

        {/* Giới thiệu không gian tiệc */}
        {partyProfile.party_description && (
          <div className="bg-white border border-amber-200/80 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-amber-600" /> Không Gian &amp; Phong Cách Sảnh Tiệc
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {partyProfile.party_description}
            </p>
          </div>
        )}

        {/* Danh Sách Sảnh Tiệc & Không Gian Riêng Độc Lập */}
        {Array.isArray(partyProfile.party_halls) && partyProfile.party_halls.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-600" /> Sảnh Tiệc &amp; Không Gian Riêng
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Đa dạng sảnh tiệc và phòng VIP đẳng cấp, phù hợp mọi quy mô từ ấm cúng đến đại tiệc công ty
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {partyProfile.party_halls.map((hall, idx) => {
                const normalizedPrice = typeof hall.price_min === 'number'
                  ? hall.price_min
                  : Number(String(hall.price_min ?? '').replace(/[^\d]/g, ''));
                const hallMinPrice = Number.isFinite(normalizedPrice) ? normalizedPrice : 0;
                return (
                  <div
                    key={hall.id || idx}
                    className="bg-white border border-amber-200/80 hover:border-amber-400 rounded-2xl p-5 transition-all hover:shadow-xl hover:shadow-amber-950/10 flex flex-col justify-between space-y-4 group shadow-xs"
                  >
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-base text-slate-900 group-hover:text-amber-800 transition-colors">
                          {hall.name || `Sảnh Tiệc #${idx + 1}`}
                        </h4>
                        <span className="text-[11px] px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200/90 font-bold shrink-0">
                          {hall.capacity ? `Tối đa ${hall.capacity} khách` : 'Linh hoạt'}
                        </span>
                      </div>

                      {hallMinPrice > 0 ? (
                        <div className="text-xs text-slate-600">
                          Mức chi tiêu tối thiểu:{' '}
                          <span className="font-bold text-amber-800 font-mono">
                            {hallMinPrice.toLocaleString('vi-VN')} đ
                          </span>
                        </div>
                      ) : (
                        <div className="text-xs text-emerald-700 font-semibold">
                          Không phụ thu chi tiêu tối thiểu
                        </div>
                      )}

                      {hall.features && (
                        <div className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-200/60 text-xs text-slate-700 leading-relaxed">
                          <span className="font-semibold text-amber-950 block mb-0.5">Trang bị &amp; Đặc điểm:</span>
                          {hall.features}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedSetMenu(`[Sảnh/Phòng] ${hall.name || `Sảnh #${idx + 1}`}`);
                        setIsBookingOpen(true);
                      }}
                      className="w-full py-2.5 rounded-xl bg-amber-50 hover:bg-gradient-to-r hover:from-amber-500 hover:to-yellow-400 text-amber-950 hover:text-slate-950 font-bold text-xs transition-all border border-amber-300 text-center flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <CalendarCheck className="w-3.5 h-3.5" />
                      <span>Giữ Chỗ Sảnh Này</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Thực Đơn Set Menu Tiệc */}
        {Array.isArray(partyProfile.set_menus) && partyProfile.set_menus.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Wine className="w-5 h-5 text-amber-600" /> Thực Đơn Set Menu Tất Niên
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Thực đơn phong phú được thiết kế chuẩn cho bàn tiệc tiêu chuẩn
                </p>
              </div>

              {partyMenuLink && (
                <a
                  href={partyMenuLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200/80 text-amber-950 border border-amber-300/80 text-xs font-bold transition-all w-fit shrink-0 shadow-xs"
                >
                  <Wine className="w-4 h-4 text-amber-700" />
                  <span>Xem Toàn Bộ Thực Đơn Tiệc ↗</span>
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {partyProfile.set_menus.map((menu: any, idx: number) => {
                const menuPrice = typeof menu.price === 'number' ? menu.price : parseInt(String(menu.price || 0), 10);
                return (
                  <div
                    key={idx}
                    className="bg-white border border-amber-200/80 hover:border-amber-400 rounded-2xl p-5 transition-all hover:shadow-xl hover:shadow-amber-950/10 flex flex-col justify-between space-y-4 group shadow-xs"
                  >
                    <div>
                      {menu.image_url && (
                        <div className="w-full aspect-[16/9] rounded-xl overflow-hidden mb-3 bg-amber-50 border border-amber-200/60">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={menu.image_url}
                            alt={menu.name || 'Set menu'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h4 className="font-bold text-base text-slate-900 group-hover:text-amber-800 transition-colors">
                          {menu.name || `Set Tiệc #${idx + 1}`}
                        </h4>
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 font-semibold shrink-0">
                          {menu.pax || 10} người
                        </span>
                      </div>
                      <div className="text-lg font-black text-rose-700 font-mono mb-2">
                        {menuPrice > 0 ? `${menuPrice.toLocaleString('vi-VN')} đ` : 'Liên hệ báo giá'}
                      </div>

                      {menu.description && (
                        <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                          {menu.description}
                        </p>
                      )}

                      {/* Danh sách món ăn trong Set */}
                      {Array.isArray(menu.dishes) && menu.dishes.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-amber-100 space-y-1.5">
                          <div className="text-[11px] font-bold text-amber-950 uppercase tracking-wider mb-1">
                            Các món trong set:
                          </div>
                          <ul className="space-y-1.5">
                            {menu.dishes.map((dish: string, dIdx: number) => (
                              <li key={dIdx} className="text-xs text-slate-700 flex items-start gap-2">
                                <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-amber-200">
                                  {dIdx + 1}
                                </span>
                                <span className="leading-tight">{dish}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedSetMenu(menu.name || `Set Tiệc #${idx + 1}`);
                        setIsBookingOpen(true);
                      }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs transition-all shadow-sm text-center cursor-pointer"
                    >
                      Chọn &amp; Giữ Chỗ Set Này
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Thực đơn tiệc nếu quán chưa cấu hình từng món lẻ */}
        {(!Array.isArray(partyProfile.set_menus) || partyProfile.set_menus.length === 0) && partyMenuLink && (
          <div className="bg-gradient-to-r from-amber-100/90 via-white to-amber-100/90 border border-amber-300/80 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md shadow-amber-950/5">
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-200/80 text-amber-950 border border-amber-300 text-xs font-bold">
                <Wine className="w-3.5 h-3.5 text-amber-700" /> THỰC ĐƠN TIỆC TRỌN GÓI
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Thực Đơn &amp; Báo Giá Tiệc Chi Tiết
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                Nhà hàng đã cập nhật bảng thực đơn tiệc, các gói set menu và bảng giá dịch vụ để quý khách và quý công ty thuận tiện lựa chọn.
              </p>
            </div>
            <a
              href={partyMenuLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase shadow-md shadow-amber-950/20 hover:scale-105 active:scale-95 transition-all shrink-0 w-full sm:w-auto text-center cursor-pointer"
            >
              Xem Thực Đơn Trực Tuyến ↗
            </a>
          </div>
        )}

        {/* Thư viện hình ảnh Sảnh Tiệc & Phòng VIP */}
        {Array.isArray(partyProfile.party_gallery) && partyProfile.party_gallery.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" /> Không Gian Sảnh Tiệc &amp; Phòng VIP
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {partyProfile.party_gallery.map((imgUrl, idx) => (
                <div key={idx} className="aspect-[4/3] rounded-2xl overflow-hidden border border-amber-200/90 bg-white shadow-xs group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgUrl}
                    alt={`Không gian sảnh tiệc ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tiện ích, Phong cách ẩm thực & Quà tặng */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tiện ích không gian */}
          <div className="bg-white border border-amber-200/80 rounded-3xl p-6 space-y-3 shadow-xs">
            <h4 className="text-sm font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" /> Tiện Ích Sảnh Tiệc
            </h4>
            <div className="flex flex-wrap gap-2">
              {activeSpaces.length > 0 ? (
                activeSpaces.map((s) => (
                  <span
                    key={s}
                    className="text-xs px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200"
                  >
                    ✓ {s}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">Phòng VIP, Karaoke, Sân khấu...</span>
              )}
            </div>
          </div>

          {/* Phong cách ẩm thực */}
          <div className="bg-white border border-amber-200/80 rounded-3xl p-6 space-y-3 shadow-xs">
            <h4 className="text-sm font-bold text-rose-900 uppercase tracking-wider flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-rose-600" /> Phong Cách Ẩm Thực
            </h4>
            <div className="flex flex-wrap gap-2">
              {activeCuisines.length > 0 ? (
                activeCuisines.map((c) => (
                  <span
                    key={c}
                    className="text-xs px-3 py-1.5 rounded-xl bg-rose-50 text-rose-900 border border-rose-200"
                  >
                    ✓ {c}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">Ẩm thực Việt truyền thống, Hải sản...</span>
              )}
            </div>
          </div>

          {/* Quà tặng đặc quyền */}
          <div className="bg-white border border-amber-200/80 rounded-3xl p-6 space-y-3 shadow-xs">
            <h4 className="text-sm font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-2">
              <PartyPopper className="w-4 h-4 text-emerald-600" /> Đặc Quyền Khách Tiệc
            </h4>
            <div className="flex flex-wrap gap-2">
              {activePerks.length > 0 ? (
                activePerks.map((p) => (
                  <span
                    key={p}
                    className="text-xs px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200"
                  >
                    🎁 {p}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">Tặng bia, Miễn phí karaoke...</span>
              )}
            </div>
          </div>
        </div>

        {/* Quy Cách & Chính Sách Phục Vụ Tiệc Độc Lập */}
        {Array.isArray(partyProfile.party_specifications) && partyProfile.party_specifications.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" /> Quy Cách &amp; Chính Sách Phục Vụ Tiệc
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {partyProfile.party_specifications.map((spec, idx) => (
                <div
                  key={spec.id || idx}
                  className="bg-white border border-amber-200/80 rounded-2xl p-5 space-y-2 hover:border-amber-400 transition-colors shadow-xs"
                >
                  <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{spec.title || `Quy định #${idx + 1}`}</span>
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line pl-6">
                    {spec.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Liên kết quay về trang ưu đãi chính */}
        <div className="pt-6 border-t border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Bạn muốn xem ưu đãi thường ngày và bảng giá dịch vụ?</h4>
            <p className="text-xs text-slate-600">Xem gian hàng chính thức của {b.name} trên nền tảng 1Booking.asia</p>
          </div>
          <Link
            href={`/${b.slug}`}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-amber-50 text-slate-800 hover:text-amber-950 border border-amber-300 font-bold text-xs transition-colors inline-flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <span>Vào Trang Ưu Đãi Thường Ngày</span>
            <ChevronRight className="w-4 h-4 text-amber-600" />
          </Link>
        </div>
      </main>

      {/* 4. Booking Dialog Modal (Champagne Gold Luxury) */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="sm:max-w-md bg-[#FAF7F2] border-2 border-amber-300 text-slate-900 rounded-3xl p-6 shadow-2xl">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl font-black text-amber-950 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-amber-600" />
              Đặt Bàn Tiệc &amp; Giữ Chỗ VIP
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600">
              Điền thông tin nhận ngay xác nhận tiệc từ <strong>{b.name}</strong>. Chuông thông báo sẽ gửi ngay đến quản lý nhà hàng!
            </DialogDescription>
          </DialogHeader>

          {successVoucher ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Gửi Yêu Cầu Thành Công!</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Mã xác nhận giữ chỗ của bạn: <strong className="text-amber-800 font-mono text-sm">{successVoucher}</strong>. Quản lý sảnh tiệc sẽ gọi xác nhận trong 5 phút!
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <a
                  href={venueZaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-[#0068FF] hover:bg-[#0054cc] text-white font-extrabold text-xs uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  title="Mở Zalo trao đổi thực đơn & giữ sảnh ngay"
                >
                  <MessageCircle className="w-4 h-4 fill-white shrink-0" />
                  <span>Mở Zalo Nhà Hàng Trao Đổi Ngay</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setSuccessVoucher(null);
                    setIsBookingOpen(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase transition-all border border-slate-200 cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleBookingSubmit} className="space-y-4 pt-2">
              {selectedSetMenu && (
                <div className="p-3 rounded-xl bg-amber-100/70 border border-amber-300 text-amber-950 text-xs font-semibold">
                  Đã chọn: {selectedSetMenu}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ tên người liên hệ / Đại diện công ty <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="VD: Anh Tuấn (Công ty ABC)"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Số điện thoại nhận xác nhận &amp; Voucher <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="VD: 0901234567"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số khách dự kiến</label>
                  <input
                    type="number"
                    min="1"
                    max="5000"
                    value={partyGuests}
                    onChange={(e) => setPartyGuests(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ngày &amp; Giờ dự kiến</label>
                  <input
                    type="text"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    placeholder="VD: 18:30 ngày 25/01"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Yêu cầu đặc biệt (Karaoke, Sân khấu, Phòng VIP...)</label>
                <textarea
                  rows={2}
                  value={partyNotes}
                  onChange={(e) => setPartyNotes(e.target.value)}
                  placeholder="VD: Cần 1 phòng VIP riêng, chuẩn bị sẵn hoa chúc mừng..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none"
                />
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <a
                  href={venueZaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-[#0068FF] hover:bg-[#0054cc] text-white font-black text-xs uppercase shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  title="Nhắn Zalo trực tiếp với nhà hàng"
                >
                  <MessageCircle className="w-4 h-4 fill-white shrink-0" />
                  <span>💬 Nhắn Zalo Nhà Hàng Ngay</span>
                </a>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Đang gửi thông tin...' : 'GỬI ĐẶT BÀN & NHẬN XÁC NHẬN'}
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* 🌟 NÚT BẤM DÍNH ĐÁY MÀN HÌNH (FIXED BOTTOM CTA CHO MOBILE): CHỈ 2 NÚT (Zalo Nhà Hàng + Đặt Bàn Tiệc VIP) */}
      {!isBookingOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-amber-200/90 p-2.5 flex items-center gap-2.5 md:hidden shadow-2xl">
          {/* Nút 1: Zalo Nhà Hàng */}
          <a
            href={venueZaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 px-3 rounded-xl bg-[#0068FF] hover:bg-[#0054cc] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 text-center cursor-pointer"
            title={`Nhắn Zalo Nhà Hàng (${venueZaloDisplay})`}
          >
            <MessageCircle className="w-4 h-4 fill-white shrink-0" />
            <span className="truncate">Zalo Nhà Hàng</span>
          </a>

          {/* Nút 2: Đặt Bàn Tiệc VIP */}
          <button
            onClick={() => {
              setSelectedSetMenu('');
              setIsBookingOpen(true);
            }}
            className="flex-1 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs py-3 px-3 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 uppercase truncate cursor-pointer"
          >
            <CalendarCheck className="w-4 h-4 text-slate-950 shrink-0" />
            <span className="truncate">Đặt Bàn Tiệc VIP</span>
          </button>
        </div>
      )}
    </div>
  );
}
