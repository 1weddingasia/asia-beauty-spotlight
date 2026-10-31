'use client';

import React from 'react';
import Link from 'next/link';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import {
  PartyVenue,
  getSpaceLabel,
  getCuisineLabel,
  getPerkLabel,
  formatShortPartyPrice,
} from '@/types/party';
import {
  Users,
  Phone,
  ExternalLink,
  Sparkles,
  MapPin,
  Wine,
  Utensils,
  Award,
  Share2,
  Check,
  CalendarCheck,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Building2,
  Send,
  X,
  MessageCircle,
  Eye,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { getStableViews, formatViews } from '@/lib/views-counter';
import { resolveZaloContact } from '@/lib/zalo-contact';

interface VenueBottomSheetProps {
  venue: PartyVenue | null;
  onClose: () => void;
}

export default function VenueBottomSheet({ venue, onClose }: VenueBottomSheetProps) {
  const isMobile = useIsMobile();
  const [copiedShare, setCopiedShare] = React.useState(false);
  const [showBookingForm, setShowBookingForm] = React.useState(false);
  const [bookingName, setBookingName] = React.useState('');
  const [bookingPhone, setBookingPhone] = React.useState('');
  const [bookingGuests, setBookingGuests] = React.useState<number | ''>(20);
  const [bookingDate, setBookingDate] = React.useState('');
  const [bookingNotes, setBookingNotes] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [submitError, setSubmitError] = React.useState('');

  const [activeHero, setActiveHero] = React.useState<string | null>(null);

  // Reset form & active hero image when venue changes
  React.useEffect(() => {
    setActiveHero(null);
    setShowBookingForm(false);
    setSubmitSuccess(false);
    setSubmitError('');
    setIsSubmitting(false);
    setBookingName('');
    setBookingPhone('');
    setBookingGuests(venue?.min_guests || 20);
    setBookingDate('');
    setBookingNotes('');
  }, [venue]);

  // Thư viện ảnh thật để hiển thị thumbnail chọn ảnh (Hook phải khai báo vô điều kiện trước early return)
  const galleryImages = React.useMemo(() => {
    if (!venue) return [];
    const list: string[] = [];
    if (venue.party_banner_url) list.push(venue.party_banner_url);
    if (Array.isArray(venue.party_gallery)) {
      venue.party_gallery.forEach((img) => {
        if (typeof img === 'string' && img && !list.includes(img)) list.push(img);
      });
    }
    if (Array.isArray(venue.page_content?.gallery)) {
      venue.page_content.gallery.forEach((item) => {
        const url = typeof item === 'string' ? item : (item as any)?.url;
        if (url && !list.includes(url)) list.push(url);
      });
    }
    if (venue.page_content?.hero_image && !list.includes(venue.page_content.hero_image)) {
      list.push(venue.page_content.hero_image);
    }
    const banners = venue.page_content?.banners || [];
    if (banners[0] && !list.includes(banners[0])) {
      list.push(banners[0]);
    }
    return list;
  }, [venue]);

  const handleShareZalo = async () => {
    if (!venue) return;
    const shareUrl = `https://1booking.asia/${venue.slug}/tiec`;
    const shareText = `📋 [THÔNG TIN THAM KHẢO TIỆC TẤT NIÊN 2026]\n🏛️ Nhà hàng: ${venue.name}\n📍 Địa chỉ: ${venue.address || 'TP.HCM'}\n👥 Sức chứa: ${venue.min_guests} - ${venue.max_guests} khách${venue.num_vip_rooms ? ` (${venue.num_vip_rooms} phòng VIP)` : ''}\n💰 Ngân sách tham khảo: Từ ${venue.price_min?.toLocaleString('vi-VN')} đ/người\n🎁 Ưu đãi tiệc: ${venue.party_deal_highlight || 'Tặng bia, âm thanh & backdrop'}\n👉 Xem chi tiết sảnh tiệc & menu để bình chọn: ${shareUrl}\n(Gửi nhóm công ty / phòng ban tham khảo & bình chọn)`;

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: `Thông tin tham khảo tiệc Tất Niên: ${venue.name}`,
          text: shareText,
          url: shareUrl,
        });
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 3500);
        window.open(`https://zalo.me/share?url=${encodeURIComponent(shareUrl)}`, '_blank');
      }
    } catch {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 3500);
      }
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!venue || isSubmitting) return;

    const cleanPhone = bookingPhone.trim().replace(/\D/g, '');
    if (!cleanPhone || !/^(03|05|07|08|09)\d{8}$/.test(cleanPhone)) {
      setSubmitError('Vui lòng nhập số điện thoại Việt Nam hợp lệ (10 chữ số).');
      return;
    }

    if (!bookingName.trim()) {
      setSubmitError('Vui lòng nhập tên người liên hệ.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const partyDateStr = bookingDate.trim();
      const guestsCount = Number(bookingGuests) || venue.min_guests || 20;

      const bookingInfo = partyDateStr
        ? `Ngày tổ chức: ${partyDateStr} (${guestsCount} khách)`
        : `Số lượng: ${guestsCount} khách`;

      const requestNotes = [
        `Yêu cầu tiệc: ${guestsCount} khách`,
        partyDateStr ? `Ngày tổ chức: ${partyDateStr}` : '',
        bookingNotes.trim() ? `Ghi chú: ${bookingNotes.trim()}` : ''
      ].filter(Boolean).join('. ').slice(0, 480);

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: venue.id,
          customer_name: bookingName.trim().slice(0, 95),
          customer_phone: cleanPhone,
          deal_name: `Đặt tiệc Tất Niên 2026: ${venue.name} (${guestsCount} khách)`.slice(0, 190),
          deal_value: (venue.price_min || 300000) * guestsCount,
          booking_time: bookingInfo,
          cross_sell_items: requestNotes,
          party_details: {
            venue_id: venue.id,
            venue_name: venue.name,
            venue_slug: venue.slug,
            guests: guestsCount,
            party_date: partyDateStr || null,
            notes: bookingNotes.trim() || null,
            source: 'map_year_end_party_vip',
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi gửi thông tin. Vui lòng thử lại.');
      }

      setSubmitSuccess(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Lỗi gửi yêu cầu');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!venue) return null;

  // Banner image resolution
  const banners = venue.page_content?.banners || [];
  const rawGallery = venue.page_content?.gallery || [];
  const defaultHeroImage =
    venue.party_banner_url ||
    banners[0] ||
    (typeof rawGallery[0] === 'string' ? rawGallery[0] : (rawGallery[0] as any)?.url) ||
    venue.page_content?.hero_image ||
    '/images/categories/nha-hang-am-thuc.jpg';

  const displayHeroImage = activeHero || defaultHeroImage;

  const zaloContact = resolveZaloContact(venue);
  const venueZaloUrl = zaloContact.venueZaloUrl;
  const venueZaloDisplay = zaloContact.venueZaloDisplay;
  const supportZaloUrl = zaloContact.supportZaloUrl;
  const priceFormatted = `${venue.price_min?.toLocaleString('vi-VN')} - ${venue.price_max?.toLocaleString('vi-VN')} đ`;
  const shortPriceFormatted = formatShortPartyPrice(venue.price_min, venue.price_max);

  // Look up labels
  const spaceLabels = (venue.spaces_and_amenities || []).map(getSpaceLabel).filter(Boolean);
  const cuisineLabels = (venue.cuisines || []).map(getCuisineLabel).filter(Boolean);
  const perkLabels = (venue.party_perks || []).map(getPerkLabel).filter(Boolean);

  const rawMenuUrl = venue.party_menu_url || venue.page_content?.menu_url || null;
  const venueMenuUrl = rawMenuUrl && /^https?:\/\//.test(rawMenuUrl) ? rawMenuUrl : null;
  const venueViews = getStableViews(venue.slug || venue.id || venue.name, 1800, 4800);

  // Shared inner content for both Desktop Side Panel and Mobile Drawer
  const renderDetailBody = () => (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white text-slate-900">
      {/* Scrollable Main Area */}
      <div
        onTouchMove={(e) => e.stopPropagation()}
        className="flex-1 overflow-y-auto px-4 pb-6 pt-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-200"
      >
        {/* Cover Photo with Lightened Overlay */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-100 aspect-[16/9] shadow-sm group">
          <img
            src={displayHeroImage}
            alt={venue.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/categories/nha-hang-am-thuc.jpg';
            }}
          />
          {/* Subtle bottom vignette: top and center are 100% natural, crisp and bright */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent pointer-events-none" />

          {/* Badges on image */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 pointer-events-none">
            {venue.is_vip && (
              <span className="flex items-center gap-1 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 text-white font-black text-[11px] px-2.5 py-1 rounded-full shadow-md">
                <Sparkles className="w-3 h-3" /> VIP VENUE
              </span>
            )}
            {venue.num_vip_rooms > 0 && (
              <span className="bg-white/95 text-slate-900 border border-slate-200 text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md shadow-xs">
                {venue.num_vip_rooms} Phòng VIP
              </span>
            )}
            <span className="bg-black/65 text-amber-300 border border-white/20 text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md shadow-xs flex items-center gap-1">
              <Eye className="w-3 h-3 text-amber-400" />
              <span>{formatViews(venueViews)} xem</span>
            </span>
          </div>

          {/* Close button on desktop top-right of image */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all backdrop-blur-md shadow-md active:scale-95"
            title="Đóng chi tiết"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Title and Address at bottom of image with high-contrast text shadow */}
          <div className="absolute bottom-3 left-3 right-3 text-left pointer-events-none">
            <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] leading-tight">
              {venue.name}
            </h2>
            {venue.address && (
              <p className="flex items-center gap-1.5 text-xs text-white/95 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] line-clamp-1 mt-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                {venue.address}
              </p>
            )}
          </div>
        </div>

        {/* Gallery Thumbnails: Xem ảnh thực tế sảnh tiệc */}
        {galleryImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar pt-0.5">
            {galleryImages.map((img, idx) => {
              const isSelected = activeHero ? activeHero === img : (displayHeroImage === img || idx === 0);
              return (
                <button
                  key={img}
                  type="button"
                  aria-label={`Xem ảnh sảnh ${idx + 1}`}
                  aria-pressed={isSelected}
                  onClick={() => setActiveHero(img)}
                  className={`relative aspect-[16/9] w-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-500 ring-2 ring-amber-400/40 shadow-xs scale-[1.02]'
                      : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-400'
                  }`}
                  title={`Xem góc ảnh ${idx + 1}`}
                >
                  <img src={img} alt={`Ảnh sảnh ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              );
            })}
          </div>
        )}

        {/* Highlight Festive Deal Banner */}
        {venue.party_deal_highlight && (
          <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50 border border-rose-200/90 rounded-2xl p-3.5 flex items-start gap-3 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center text-base shrink-0 shadow-xs">
              🎁
            </div>
            <div>
              <div className="text-[11px] font-black text-rose-700 uppercase tracking-wider">
                Ưu Đãi Tiệc Tất Niên Độc Quyền
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 leading-snug">
                {venue.party_deal_highlight}
              </div>
            </div>
          </div>
        )}

        {/* Chốt chặn an toàn (Disclaimer) */}
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-3 flex items-start gap-2.5 shadow-2xs text-left">
          <span className="text-sm shrink-0 mt-0.5">⚠️</span>
          <div className="text-[11px] sm:text-xs text-slate-700 leading-relaxed">
            <strong className="text-amber-950 font-bold">Lưu ý:</strong> Chính sách ưu đãi (tặng bia, phòng VIP, karaoke, màn LED, âm thanh...) áp dụng tùy theo quy mô số lượng bàn và thời điểm đặt cọc của từng nhà hàng. Vui lòng liên hệ Hotline/Zalo của quán để nhận xác nhận chính thức cho đoàn.
          </div>
        </div>

        {/* Quick Metrics Grid (High-contrast Slate & Accent) */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 flex flex-col justify-center text-left shadow-xs">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              <Users className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-[10px] font-semibold">Quy mô</span>
            </div>
            <div className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
              {venue.min_guests} - {venue.max_guests} <span className="text-[10px] font-medium text-slate-500">khách</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 flex flex-col justify-center text-left shadow-xs">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              <Wine className="w-3.5 h-3.5 text-rose-600" />
              <span className="text-[10px] font-semibold">Giá tham khảo</span>
            </div>
            <div className="text-xs sm:text-sm font-black text-rose-600 leading-tight truncate" title={priceFormatted}>
              {shortPriceFormatted}
            </div>
          </div>

          {/* Nút Zalo Nhà Hàng liên kết trực tiếp database */}
          <a
            href={venueZaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-50/90 hover:bg-blue-100 border border-blue-200/90 rounded-2xl p-2.5 flex flex-col justify-center text-left shadow-xs transition-colors group cursor-pointer"
            title="Bấm để mở Zalo trò chuyện trực tiếp với nhà hàng"
          >
            <div className="flex items-center gap-1.5 text-[#0068FF] mb-1">
              <MessageCircle className="w-3.5 h-3.5 text-[#0068FF] fill-[#0068FF] group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold">Zalo Nhà Hàng</span>
            </div>
            <div className="text-xs sm:text-sm font-black text-[#0047b3] tracking-tight truncate group-hover:underline">
              Chat Trực Tiếp
            </div>
          </a>
        </div>

        {/* Form liên hệ đặt tiệc HOẶC Chi tiết quán */}
        {showBookingForm ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-200 text-left">
            {submitSuccess ? (
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 text-center space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center mx-auto text-emerald-700">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 mb-1">
                    Đã Gửi Yêu Cầu Đặt Tiệc Thành Công! 🎉
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Thông tin liên hệ của bạn đã được chuyển tới chuông báo nhà hàng{' '}
                    <strong className="text-slate-900">{venue.name}</strong>.
                  </p>
                  <div className="mt-3 p-3 bg-white rounded-xl border border-emerald-200 text-xs text-slate-700 text-left space-y-1 shadow-xs">
                    <div>🏛️ Nhà hàng: <strong className="text-slate-900">{venue.name}</strong></div>
                    <div>💬 Zalo: <strong className="text-[#0068FF]">Sẵn sàng trao đổi</strong></div>
                    <div>👤 Khách liên hệ: <strong>{bookingName}</strong> ({bookingPhone})</div>
                    <div>👥 Số lượng: <strong className="text-rose-600">{bookingGuests} khách</strong></div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                  <a
                    href={venueZaloUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-[#0068FF] hover:bg-[#0054cc] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                    title="Mở Zalo trao đổi thực đơn & giữ sảnh ngay"
                  >
                    <MessageCircle className="w-4 h-4 fill-white shrink-0" />
                    <span>Mở Zalo Nhà Hàng</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all"
                  >
                    Quay lại
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-3.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowBookingForm(false)}
                      className="p-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <div>
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                        <CalendarCheck className="w-4 h-4 text-emerald-600" />
                        Nhận Báo Giá Tiệc Tất Niên
                      </h3>
                      <p className="text-[10px] text-slate-500">
                        Nhà hàng sẽ liên hệ tư vấn thực đơn chi tiết trong 15 phút
                      </p>
                    </div>
                  </div>
                </div>

                {submitError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs">
                    {submitError}
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Họ &amp; Tên người liên hệ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={bookingName}
                      onChange={(e) => setBookingName(e.target.value)}
                      placeholder="VD: Nguyễn Văn A (Trưởng nhóm / HR)"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-colors shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Số điện thoại nhận tư vấn <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={bookingPhone}
                      onChange={(e) => setBookingPhone(e.target.value)}
                      placeholder="VD: 0912 345 678"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-colors shadow-xs font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Số lượng khách ({venue.min_guests || 20} - {venue.max_guests || 500})
                      </label>
                      <input
                        type="number"
                        min={venue.min_guests || 20}
                        max={venue.max_guests || 500}
                        value={bookingGuests}
                        onChange={(e) => setBookingGuests(e.target.value ? Number(e.target.value) : '')}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500 transition-colors shadow-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Ngày dự kiến
                      </label>
                      <input
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500 transition-colors shadow-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Yêu cầu đặc biệt (Karaoke, máy chiếu, sảnh riêng...)
                    </label>
                    <textarea
                      rows={2}
                      maxLength={400}
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      placeholder="VD: Cần phòng VIP 30 khách, có dàn hát karaoke, thực đơn hải sản..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-colors shadow-xs resize-none"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex flex-col gap-2">
                  <a
                    href={venueZaloUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-xl bg-[#0068FF] hover:bg-[#0054cc] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
                    title="Mở Zalo nhắn tin trực tiếp với nhà hàng"
                  >
                    <MessageCircle className="w-4 h-4 fill-white shrink-0" />
                    <span>💬 Nhắn Zalo Nhà Hàng</span>
                  </a>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowBookingForm(false)}
                      className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-xs"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-black shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Đang gửi...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Gửi Báo Giá & Nhận Zalo</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        ) : (
          <>
            {/* Description */}
            {venue.party_description && (
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 text-xs text-slate-700 leading-relaxed text-left shadow-xs">
                {venue.party_description}
              </div>
            )}

            {/* Space & Amenities */}
            {spaceLabels.length > 0 && (
              <div className="text-left">
                <div className="text-[11px] font-black text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-600" /> Không gian &amp; Tiện ích
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {spaceLabels.map((s, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-50 text-slate-800 border border-slate-200 text-[11px] px-2.5 py-1 rounded-lg font-medium shadow-2xs"
                    >
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Cuisines */}
            {cuisineLabels.length > 0 && (
              <div className="text-left">
                <div className="text-[11px] font-black text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-amber-600" /> Phong cách ẩm thực
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cuisineLabels.map((c, idx) => (
                    <span
                      key={idx}
                      className="bg-amber-50 text-amber-900 border border-amber-200 text-[11px] px-2.5 py-1 rounded-lg font-bold"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Perks */}
            {perkLabels.length > 0 && (
              <div className="text-left">
                <div className="text-[11px] font-black text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-rose-600" /> Quà tặng &amp; Đặc quyền
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {perkLabels.map((p, idx) => (
                    <span
                      key={idx}
                      className="bg-rose-50 text-rose-800 border border-rose-200 text-[11px] px-2.5 py-1 rounded-lg font-bold"
                    >
                      ★ {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Sảnh tiệc & Phòng VIP */}
            {venue.party_halls && venue.party_halls.length > 0 && (
              <div className="text-left">
                <div className="text-[11px] font-black text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-600" /> Sảnh Tiệc &amp; Không Gian Riêng
                </div>
                <div className="space-y-1.5">
                  {venue.party_halls.map((h, idx) => (
                    <div
                      key={h.id || idx}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between shadow-2xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{h.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {h.capacity ? `Sức chứa: ${h.capacity} khách` : 'Sức chứa: Linh hoạt'}
                        </div>
                      </div>
                      {h.price_min ? (
                        <div className="text-[11px] font-bold text-rose-600">
                          Tối thiểu {h.price_min.toLocaleString('vi-VN')} đ
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Thực đơn tiệc tham khảo */}
            {venue.set_menus && venue.set_menus.length > 0 && (
              <div className="text-left">
                <div className="text-[11px] font-black text-slate-800 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-rose-600" /> Thực Đơn Tiệc Tiêu Biểu
                  </span>
                  {venueMenuUrl && (
                    <a
                      href={venueMenuUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10.5px] text-rose-600 hover:text-rose-700 font-bold flex items-center gap-0.5 normal-case"
                    >
                      Xem toàn bộ <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
                <div className="space-y-2">
                  {venue.set_menus.map((m, idx) => (
                    <div
                      key={m.id || idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs shadow-2xs hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 text-xs">{m.name}</span>
                        <span className="font-black text-rose-600 text-xs">
                          {m.price ? `${m.price.toLocaleString('vi-VN')} đ` : 'Liên hệ'}
                          {m.pax ? ` / bàn ${m.pax} người` : ''}
                        </span>
                      </div>
                      {m.dishes && m.dishes.length > 0 && (
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                          {m.dishes.join(' • ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Fixed Bottom Action Bar */}
      {/* Fixed Bottom Action Bar: 2 Nút Zalo (Nhà Hàng + CSKH) + Nút Đặt Báo Giá */}
      {!showBookingForm && (
        <div className="shrink-0 px-2.5 sm:px-3 pt-2.5 pb-6 sm:pb-3 bg-white border-t border-slate-200 flex items-center gap-1.5 sm:gap-2 z-20 shadow-md">
          {/* Nút 1: Chat Zalo Nhà Hàng */}
          <a
            href={venueZaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl bg-[#0068FF] hover:bg-[#0054cc] text-white text-xs font-bold transition-all shrink-0 active:scale-95 shadow-xs"
            title={`Nhắn tin Zalo trực tiếp với nhà hàng (${venueZaloDisplay})`}
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white text-white shrink-0" />
            <span>Zalo Quán</span>
          </a>

          {/* Nút 2: Chat Zalo Trợ Lý 1Booking */}
          <a
            href={supportZaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 px-2.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black transition-all shrink-0 active:scale-95 shadow-xs"
            title="Chat Zalo Trợ lý đặt tiệc 1Booking (0918.731.411)"
          >
            <Sparkles className="w-3.5 h-3.5 text-black shrink-0" />
            <span className="hidden sm:inline">Zalo</span>
            <span>1Booking</span>
          </a>

          {/* Primary CTA: Form Nhận Báo Giá Tiệc */}
          <button
            type="button"
            onClick={() => setShowBookingForm(true)}
            className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-2.5 px-2.5 sm:px-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-black shadow-md shadow-rose-950/20 transition-all active:scale-[0.98]"
          >
            <CalendarCheck className="w-4 h-4 text-white shrink-0" />
            <span className="truncate">🎉 Nhận Báo Giá</span>
          </button>

          {/* Zalo Share */}
          <button
            type="button"
            onClick={handleShareZalo}
            className={`flex items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all shrink-0 active:scale-95 ${
              copiedShare
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
            }`}
            title="Gửi thông tin quán vào nhóm Zalo để bình chọn"
          >
            {copiedShare ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Share2 className="w-3.5 h-3.5 text-slate-600" />
            )}
          </button>

          {/* Direct Profile Link */}
          <Link
            href={`/${venue.slug}/tiec`}
            onClick={onClose}
            className="flex items-center justify-center p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold transition-all shrink-0 active:scale-95"
            title="Xem chi tiết sảnh tiệc của nhà hàng"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
          </Link>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={!!venue} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="bg-white border-t border-slate-200 text-slate-900 max-h-[88dvh] rounded-t-3xl overflow-hidden shadow-2xl flex flex-col md:hidden">
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-slate-300 mt-2.5 mb-1" />
          <DrawerHeader className="sr-only">
            <DrawerTitle>{venue.name}</DrawerTitle>
            <DrawerDescription>Hồ sơ đặt tiệc tất niên của {venue.name}</DrawerDescription>
          </DrawerHeader>
          {renderDetailBody()}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <aside
      className="hidden md:flex absolute inset-y-0 left-0 z-40 w-[420px] lg:w-[460px] bg-white shadow-2xl border-r border-slate-200 flex-col overflow-hidden animate-in slide-in-from-left duration-300"
      aria-label={`Chi tiết sảnh tiệc ${venue.name}`}
    >
      {renderDetailBody()}
    </aside>
  );
}
