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
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { BusinessPartyProfile, PARTY_SPACES, PARTY_CUISINES, PARTY_PERKS } from '@/types/party';
import { useSiteConfig } from '@/components/site/Layout';

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

  // Active space tags
  const activeSpaces = PARTY_SPACES.filter((s) => (partyProfile.spaces_and_amenities || []).includes(s.id));
  const activeCuisines = PARTY_CUISINES.filter((c) => (partyProfile.cuisines || []).includes(c.id));
  const activePerks = PARTY_PERKS.filter((p) => (partyProfile.party_perks || []).includes(p.id));
  const rawPartyMenuUrl = partyProfile.party_menu_url || b.page_content?.menu_url || null;
  const partyMenuLink = rawPartyMenuUrl && /^https?:\/\//.test(rawPartyMenuUrl) ? rawPartyMenuUrl : null;

  return (
    <div className="min-h-screen bg-[#070b16] text-slate-100 selection:bg-amber-500 selection:text-black">
      {/* 1. Header Bar: Navigation between Main Promo Page & Party Page */}
      <header className="sticky top-0 z-40 bg-[#091024]/90 backdrop-blur-md border-b border-amber-500/20 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href={`/${b.slug}`}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-zinc-300 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về Trang Ưu Đãi Chính</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/tat-nien"
              className="text-xs text-amber-300 hover:text-amber-200 font-bold hidden sm:inline-flex items-center gap-1 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bản Đồ Phố Tiệc Tất Niên</span>
            </Link>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 transition-colors border border-zinc-700"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{copiedShare ? 'Đã sao chép' : 'Chia sẻ sảnh'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section: Festive Dark Blue & Gold Banner */}
      <section className="relative overflow-hidden border-b border-amber-500/30">
        <div className="absolute inset-0 bg-cover bg-center filter brightness-[0.35]" style={{ backgroundImage: `url(${heroImage})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070b16] via-[#070b16]/70 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 pt-12 pb-16 relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5">
              <PartyPopper className="w-3.5 h-3.5" /> Sảnh Tiệc Tất Niên & Sự Kiện VIP
            </span>
            {partyProfile.is_vip && (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                ⭐ Điểm Tiệc Đề Xuất TOP 1
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-3">
            {b.name}
          </h1>

          <p className="text-zinc-300 text-xs sm:text-sm flex items-center gap-1.5 max-w-2xl mb-6">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{b.address || 'Đang cập nhật địa chỉ'}</span>
          </p>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mb-8">
            <div className="bg-[#0e172e]/80 border border-amber-500/20 rounded-2xl p-3.5 backdrop-blur-md">
              <div className="text-[11px] text-zinc-400 flex items-center gap-1 mb-1">
                <Users className="w-3.5 h-3.5 text-amber-400" /> Sức chứa tiệc
              </div>
              <div className="text-base sm:text-lg font-black text-white">
                {partyProfile.min_guests} - {partyProfile.max_guests} <span className="text-xs font-normal text-zinc-400">khách</span>
              </div>
            </div>

            <div className="bg-[#0e172e]/80 border border-amber-500/20 rounded-2xl p-3.5 backdrop-blur-md">
              <div className="text-[11px] text-zinc-400 flex items-center gap-1 mb-1">
                <Coins className="w-3.5 h-3.5 text-emerald-400" /> Ngân sách dự kiến
              </div>
              <div className="text-base sm:text-lg font-black text-emerald-400">
                {priceMinFormatted} - {priceMaxFormatted} <span className="text-xs font-normal text-zinc-400">đ/pax</span>
              </div>
            </div>

            <div className="bg-[#0e172e]/80 border border-amber-500/20 rounded-2xl p-3.5 backdrop-blur-md">
              <div className="text-[11px] text-zinc-400 flex items-center gap-1 mb-1">
                <Wine className="w-3.5 h-3.5 text-amber-400" /> Phòng VIP riêng
              </div>
              <div className="text-base sm:text-lg font-black text-white">
                {partyProfile.num_vip_rooms || 2} <span className="text-xs font-normal text-zinc-400">phòng</span>
              </div>
            </div>

            <div className="bg-[#0e172e]/80 border border-amber-500/20 rounded-2xl p-3.5 backdrop-blur-md">
              <div className="text-[11px] text-zinc-400 flex items-center gap-1 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Trạng thái
              </div>
              <div className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Đang nhận tiệc
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setSelectedSetMenu('');
                setIsBookingOpen(true);
              }}
              className="px-6 py-3.5 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-black text-sm shadow-xl shadow-amber-950/50 transition-all hover:scale-105 flex items-center gap-2"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>ĐẶT BÀN TIỆC &amp; GIỮ CHỖ VIP</span>
            </button>

            {partyMenuLink && (
              <a
                href={partyMenuLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/30 hover:from-amber-500/30 hover:to-amber-600/40 text-amber-300 hover:text-white font-bold text-sm border border-amber-500/50 transition-all hover:scale-105 flex items-center gap-2 shadow-lg"
              >
                <Wine className="w-4 h-4 text-amber-400" />
                <span>Thực Đơn Chi Tiết (Google Drive)</span>
              </a>
            )}

            {b.phone && (
              <a
                href={`tel:${b.phone.replace(/\D/g, '')}`}
                className="px-5 py-3.5 rounded-full bg-[#131f3d] hover:bg-[#1a2b54] text-white font-bold text-sm border border-amber-500/30 transition-colors flex items-center gap-2"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Gọi Hotline: {b.phone}</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* 3. Main Content: Sảnh tiệc, Ưu đãi, Thực đơn & Tiện ích */}
      <main className="max-w-6xl mx-auto px-4 py-10 pb-24 md:pb-12 space-y-10">
        {/* Ưu đãi tiệc đặc quyền nổi bật */}
        {partyProfile.party_deal_highlight && (
          <div className="bg-gradient-to-r from-amber-500/15 via-yellow-500/20 to-amber-500/15 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 relative overflow-hidden backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-black uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5" /> GÓI ƯU ĐÃI TIỆC ĐẶC QUYỀN
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {partyProfile.party_deal_highlight}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
                  Áp dụng cho các đoàn khách công ty và gia đình đặt tiệc tất niên, họp mặt cuối năm sớm qua hệ thống 1Booking.asia.
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedSetMenu(partyProfile.party_deal_highlight || '');
                  setIsBookingOpen(true);
                }}
                className="shrink-0 px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs uppercase shadow-lg shadow-amber-950/40 transition-all self-start sm:self-auto"
              >
                Nhận Ưu Đãi Tiệc Này
              </button>
            </div>
          </div>
        )}

        {/* Giới thiệu không gian tiệc */}
        {partyProfile.party_description && (
          <div className="bg-[#0b1329] border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-amber-400" /> Không Gian & Phong Cách Sảnh Tiệc
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
              {partyProfile.party_description}
            </p>
          </div>
        )}

        {/* Thực Đơn Set Menu Tiệc */}
        {Array.isArray(partyProfile.set_menus) && partyProfile.set_menus.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Wine className="w-5 h-5 text-amber-400" /> Thực Đơn Set Menu Tất Niên
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Thực đơn phong phú được thiết kế chuẩn cho bàn tiệc 10 người
                </p>
              </div>

              {partyMenuLink && (
                <a
                  href={partyMenuLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-white border border-amber-500/40 text-xs font-bold transition-all w-fit shrink-0"
                >
                  <Wine className="w-4 h-4 text-amber-400" />
                  <span>Xem File Thực Đơn Đầy Đủ (Google Drive) ↗</span>
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {partyProfile.set_menus.map((menu: any, idx: number) => {
                const menuPrice = typeof menu.price === 'number' ? menu.price : parseInt(String(menu.price || 0), 10);
                return (
                  <div
                    key={idx}
                    className="bg-[#0d1733] border border-zinc-800 hover:border-amber-500/40 rounded-2xl p-5 transition-all hover:bg-[#101c3d] flex flex-col justify-between space-y-4 group"
                  >
                    <div>
                      {menu.image_url && (
                        <div className="w-full aspect-[16/9] rounded-xl overflow-hidden mb-3 bg-zinc-950">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={menu.image_url}
                            alt={menu.name || 'Set menu'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h4 className="font-bold text-base text-white group-hover:text-amber-400 transition-colors">
                          {menu.name || `Set Tiệc #${idx + 1}`}
                        </h4>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-semibold shrink-0">
                          {menu.pax || 10} người
                        </span>
                      </div>
                      <div className="text-lg font-black text-amber-400">
                        {menuPrice > 0 ? `${menuPrice.toLocaleString('vi-VN')} đ` : 'Liên hệ báo giá'}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedSetMenu(menu.name || `Set Tiệc #${idx + 1}`);
                        setIsBookingOpen(true);
                      }}
                      className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-amber-500 hover:text-black text-white font-bold text-xs transition-colors text-center"
                    >
                      Chọn & Giữ Chỗ Set Này
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Thực đơn tiệc trên Google Drive nếu quán chưa cấu hình từng món lẻ */}
        {(!Array.isArray(partyProfile.set_menus) || partyProfile.set_menus.length === 0) && partyMenuLink && (
          <div className="bg-gradient-to-r from-[#0d1733] to-[#121f45] border border-amber-500/30 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                <Wine className="w-3.5 h-3.5 text-amber-400" /> THỰC ĐƠN TIỆC TRỌN GÓI
              </div>
              <h3 className="text-xl font-black text-white">
                Thực Đơn &amp; Báo Giá Tiệc Chi Tiết (Google Drive)
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
                Nhà hàng đã cập nhật file brochure thực đơn tiệc, gói đồ uống và dịch vụ chi tiết trên Google Drive để quý khách và quý công ty thuận tiện lựa chọn.
              </p>
            </div>
            <a
              href={partyMenuLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase shadow-lg shadow-amber-950/50 hover:scale-105 active:scale-95 transition-all shrink-0 w-full sm:w-auto text-center"
            >
              Mở Thực Đơn Trên Google Drive ↗
            </a>
          </div>
        )}

        {/* Thư viện hình ảnh Sảnh Tiệc & Phòng VIP */}
        {Array.isArray(partyProfile.party_gallery) && partyProfile.party_gallery.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> Không Gian Sảnh Tiệc & Phòng VIP
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {partyProfile.party_gallery.map((imgUrl, idx) => (
                <div key={idx} className="aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 group">
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
          <div className="bg-[#0b1329] border border-zinc-800 rounded-3xl p-6 space-y-3">
            <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Tiện Ích Sảnh Tiệc
            </h4>
            <div className="flex flex-wrap gap-2">
              {activeSpaces.length > 0 ? (
                activeSpaces.map((s) => (
                  <span
                    key={s.id}
                    className="text-xs px-3 py-1.5 rounded-xl bg-zinc-800/80 text-zinc-200 border border-zinc-700"
                  >
                    ✓ {s.label}
                  </span>
                ))
              ) : (
                <span className="text-xs text-zinc-500">Phòng VIP, Karaoke, Sân khấu...</span>
              )}
            </div>
          </div>

          {/* Phong cách ẩm thực */}
          <div className="bg-[#0b1329] border border-zinc-800 rounded-3xl p-6 space-y-3">
            <h4 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4" /> Phong Cách Ẩm Thực
            </h4>
            <div className="flex flex-wrap gap-2">
              {activeCuisines.length > 0 ? (
                activeCuisines.map((c) => (
                  <span
                    key={c.id}
                    className="text-xs px-3 py-1.5 rounded-xl bg-rose-950/40 text-rose-200 border border-rose-800/50"
                  >
                    ✓ {c.label}
                  </span>
                ))
              ) : (
                <span className="text-xs text-zinc-500">Ẩm thực Việt truyền thống, Hải sản...</span>
              )}
            </div>
          </div>

          {/* Quà tặng đặc quyền */}
          <div className="bg-[#0b1329] border border-zinc-800 rounded-3xl p-6 space-y-3">
            <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <PartyPopper className="w-4 h-4" /> Đặc Quyền Khách Tiệc
            </h4>
            <div className="flex flex-wrap gap-2">
              {activePerks.length > 0 ? (
                activePerks.map((p) => (
                  <span
                    key={p.id}
                    className="text-xs px-3 py-1.5 rounded-xl bg-emerald-950/40 text-emerald-200 border border-emerald-800/50"
                  >
                    🎁 {p.label}
                  </span>
                ))
              ) : (
                <span className="text-xs text-zinc-500">Tặng bia, Miễn phí karaoke...</span>
              )}
            </div>
          </div>
        </div>

        {/* Liên kết quay về trang ưu đãi chính */}
        <div className="pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h4 className="text-sm font-bold text-white">Bạn muốn xem ưu đãi thường ngày và bảng giá dịch vụ?</h4>
            <p className="text-xs text-zinc-400">Xem gian hàng chính thức của {b.name} trên nền tảng 1Booking.asia</p>
          </div>
          <Link
            href={`/${b.slug}`}
            className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-colors inline-flex items-center gap-2"
          >
            <span>Vào Trang Ưu Đãi Thường Ngày</span>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </Link>
        </div>
      </main>

      {/* 4. Booking Dialog Modal */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="sm:max-w-md bg-[#0a1126] border border-amber-500/40 text-white rounded-3xl p-6 shadow-2xl">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl font-black text-amber-400 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-amber-400" />
              Đặt Bàn Tiệc & Giữ Chỗ VIP
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-300">
              Điền thông tin nhận ngay xác nhận tiệc từ <strong>{b.name}</strong>. Chuông thông báo sẽ gửi ngay đến quản lý nhà hàng!
            </DialogDescription>
          </DialogHeader>

          {successVoucher ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Gửi Yêu Cầu Thành Công!</h3>
              <p className="text-xs text-zinc-300 max-w-sm mx-auto">
                Mã xác nhận giữ chỗ của bạn: <strong className="text-amber-400 font-mono text-sm">{successVoucher}</strong>. Quản lý sảnh tiệc sẽ gọi xác nhận trong 5 phút!
              </p>
              <button
                type="button"
                onClick={() => {
                  setSuccessVoucher(null);
                  setIsBookingOpen(false);
                }}
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs uppercase transition-all"
              >
                Đã hiểu & Đóng
              </button>
            </div>
          ) : (
            <form onSubmit={handleBookingSubmit} className="space-y-4 pt-2">
              {selectedSetMenu && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                  Đã chọn: {selectedSetMenu}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Họ tên người liên hệ / Đại diện công ty <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="VD: Anh Tuấn (Công ty ABC)"
                  className="w-full bg-[#060b19] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Số điện thoại nhận xác nhận & Voucher <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="VD: 0901234567"
                  className="w-full bg-[#060b19] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Số khách dự kiến</label>
                  <input
                    type="number"
                    min="1"
                    max="5000"
                    value={partyGuests}
                    onChange={(e) => setPartyGuests(e.target.value)}
                    className="w-full bg-[#060b19] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Ngày & Giờ dự kiến</label>
                  <input
                    type="text"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    placeholder="VD: 18:30 ngày 25/01"
                    className="w-full bg-[#060b19] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Yêu cầu đặc biệt (Karaoke, Sân khấu, Phòng VIP...)</label>
                <textarea
                  rows={2}
                  value={partyNotes}
                  onChange={(e) => setPartyNotes(e.target.value)}
                  placeholder="VD: Cần 1 phòng VIP riêng, chuẩn bị sẵn hoa chúc mừng..."
                  className="w-full bg-[#060b19] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black text-xs uppercase shadow-xl transition-all disabled:opacity-50"
              >
                {loading ? 'Đang gửi thông tin...' : 'GỬI YÊU CẦU & NHẬN ƯU ĐÃI NGAY'}
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* 🌟 NÚT BẤM DÍNH ĐÁY MÀN HÌNH (FIXED BOTTOM CTA CHO MOBILE) */}
      {!isBookingOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#091024]/95 backdrop-blur-md border-t border-amber-500/20 p-3 flex gap-2 md:hidden">
          {partyMenuLink && (
            <a
              href={partyMenuLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-3 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center justify-center gap-1.5 shrink-0"
              title="Xem thực đơn tiệc chi tiết trên Google Drive"
            >
              <Wine className="w-4 h-4 text-amber-400" />
              <span>Menu</span>
            </a>
          )}
          <button
            onClick={() => {
              setSelectedSetMenu('');
              setIsBookingOpen(true);
            }}
            className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs py-3 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 uppercase"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Đặt Bàn Tiệc VIP</span>
          </button>
          {b.phone && (
            <a
              href={`tel:${b.phone.replace(/\D/g, '')}`}
              className="px-3.5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shrink-0"
              title="Gọi hotline"
            >
              <Phone className="w-4 h-4" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
