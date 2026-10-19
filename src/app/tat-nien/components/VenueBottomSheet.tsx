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
  Send,
  Building2,
  FileText,
} from 'lucide-react';

interface VenueBottomSheetProps {
  venue: PartyVenue | null;
  onClose: () => void;
}

export default function VenueBottomSheet({ venue, onClose }: VenueBottomSheetProps) {
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

  // Reset form when venue changes
  React.useEffect(() => {
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

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: venue.id,
          customer_name: bookingName.trim(),
          customer_phone: cleanPhone,
          deal_name: `Yêu Cầu Đặt Tiệc Tất Niên (${guestsCount} khách)`,
          booking_time: partyDateStr || 'Khảo sát ngày tiệc',
          cross_sell_items: bookingNotes.trim() ? `Yêu cầu tiệc: ${bookingNotes.trim().slice(0, 450)}` : `Khảo sát tiệc tất niên từ Phố Tiệc 2026`,
        }),
      });

      const data = await res.json().catch(() => ({} as { error?: string }));
      if (!res.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.');
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
  const gallery = venue.page_content?.gallery || [];
  const heroImage =
    venue.party_banner_url ||
    banners[0] ||
    (typeof gallery[0] === 'string' ? gallery[0] : (gallery[0] as any)?.url) ||
    venue.page_content?.hero_image ||
    '/images/categories/nha-hang-am-thuc.jpg';

  const displayPhone = venue.phone || venue.page_content?.phone || 'Đang cập nhật';
  const priceFormatted = `${venue.price_min?.toLocaleString('vi-VN')} - ${venue.price_max?.toLocaleString('vi-VN')} đ`;

  // Look up labels (resolves both presets and custom tags)
  const spaceLabels = (venue.spaces_and_amenities || []).map(getSpaceLabel).filter(Boolean);
  const cuisineLabels = (venue.cuisines || []).map(getCuisineLabel).filter(Boolean);
  const perkLabels = (venue.party_perks || []).map(getPerkLabel).filter(Boolean);

  const rawMenuUrl = venue.party_menu_url || venue.page_content?.menu_url || null;
  const venueMenuUrl = rawMenuUrl && /^https?:\/\//.test(rawMenuUrl) ? rawMenuUrl : null;

  return (
    <Drawer open={!!venue} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-zinc-950/98 border-t border-amber-500/30 text-zinc-100 max-h-[88dvh] rounded-t-3xl overflow-hidden shadow-2xl flex flex-col backdrop-blur-xl">
        {/* 
          ⚠️ BẮT BUỘC THEO CHỈ DẪN KỸ THUẬT:
          onTouchMove e.stopPropagation() để việc vuốt xem menu trong Drawer không làm trượt bản đồ MapLibre bên dưới
        */}
        <div
          onTouchMove={(e) => e.stopPropagation()}
          className="flex-1 overflow-y-auto px-4 pb-8 pt-2 scrollbar-thin scrollbar-thumb-zinc-800"
        >
          {/* Header Info */}
          <div className="relative rounded-2xl overflow-hidden mb-4 border border-zinc-800 bg-zinc-900 aspect-[16/9] max-h-48 sm:max-h-56">
            <img
              src={heroImage}
              alt={venue.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback nếu ảnh lỗi
                (e.target as HTMLImageElement).src = '/images/categories/nha-hang-am-thuc.jpg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

            {/* Badges on image */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {venue.is_vip && (
                <span className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-700 text-black font-extrabold text-xs px-2.5 py-1 rounded-full shadow-lg vip-pin-glow">
                  <Sparkles className="w-3.5 h-3.5" /> VIP VENUE
                </span>
              )}
              {venue.num_vip_rooms > 0 && (
                <span className="bg-zinc-900/90 text-amber-300 border border-amber-500/40 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-md">
                  {venue.num_vip_rooms} Phòng VIP riêng
                </span>
              )}
            </div>

            <div className="absolute bottom-3 left-3 right-3 text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-white drop-shadow-md">
                {venue.name}
              </h2>
              {venue.address && (
                <p className="flex items-center gap-1 text-xs text-zinc-300 line-clamp-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                  {venue.address}
                </p>
              )}
            </div>
          </div>

          <DrawerHeader className="p-0 text-left mb-3">
            <DrawerTitle className="sr-only">{venue.name}</DrawerTitle>
            <DrawerDescription className="sr-only">Hồ sơ đặt tiệc tất niên của {venue.name}</DrawerDescription>

            {/* Highlight Banner Deal */}
            {venue.party_deal_highlight && (
              <div className="bg-gradient-to-r from-amber-950/80 via-rose-950/60 to-amber-950/80 border border-amber-500/40 rounded-xl p-3 flex items-start gap-2.5 shadow-inner">
                <span className="text-xl">🎁</span>
                <div>
                  <div className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                    Ưu Đãi Tiệc Tất Niên Độc Quyền
                  </div>
                  <div className="text-sm font-semibold text-white mt-0.5">
                    {venue.party_deal_highlight}
                  </div>
                </div>
              </div>
            )}
          </DrawerHeader>

          {/* Quick Metrics Grid - Hiển thị đầy đủ Sức chứa, Giá & Hotline quán */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-[11px] text-zinc-400 font-medium">Sức chứa tiệc</div>
                <div className="text-sm font-bold text-white">
                  {venue.min_guests} - {venue.max_guests} <span className="text-xs font-normal text-zinc-400">khách</span>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <Wine className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-[11px] text-zinc-400 font-medium">Mức giá ước tính</div>
                <div className="text-sm font-bold text-amber-300">
                  {priceFormatted}
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 flex items-center gap-3 col-span-2 sm:col-span-1">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-[11px] text-zinc-400 font-medium">Điện thoại liên hệ</div>
                <div className="text-sm font-bold text-emerald-400 font-mono tracking-wide">
                  {displayPhone}
                </div>
              </div>
            </div>
          </div>

          {/* Form điền thông tin liên hệ đặt tiệc HOẶC Chi tiết quán */}
          {showBookingForm ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-200 text-left pb-4">
              {submitSuccess ? (
                <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-6 text-center space-y-4 my-2">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      Đã Gửi Yêu Cầu Đặt Tiệc Thành Công! 🎉
                    </h3>
                    <p className="text-xs text-zinc-300 max-w-md mx-auto leading-relaxed">
                      Thông tin liên hệ của bạn đã được chuyển thẳng tới Telegram của{' '}
                      <span className="text-amber-300 font-bold">{venue.name}</span> và bộ phận hỗ trợ tiệc của 1Booking.Asia.
                    </p>
                    <div className="mt-3 p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 text-xs text-zinc-300 text-left space-y-1.5">
                      <div>🏛️ Nhà hàng: <span className="text-white font-semibold">{venue.name}</span></div>
                      <div>📞 Hotline quán: <span className="text-emerald-400 font-bold font-mono">{displayPhone}</span></div>
                      <div>👤 Khách liên hệ: <span className="text-white font-semibold">{bookingName}</span> ({bookingPhone})</div>
                      <div>👥 Quy mô dự kiến: <span className="text-amber-300 font-semibold">{bookingGuests} khách</span></div>
                      {bookingDate && <div>📅 Thời gian: <span className="text-zinc-200">{bookingDate}</span></div>}
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-2">
                      Đại diện nhà hàng sẽ chủ động liên hệ lại với bạn để tư vấn thực đơn chi tiết và giữ sảnh tiệc đẹp nhất.
                    </p>
                  </div>
                  <div className="flex gap-2 justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => setShowBookingForm(false)}
                      className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all"
                    >
                      Quay lại xem quán
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-4 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/80">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowBookingForm(false)}
                        className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                          <CalendarCheck className="w-4 h-4 text-emerald-400" />
                          Liên Hệ Đặt Tiệc — {venue.name}
                        </h3>
                        <p className="text-[11px] text-zinc-400">
                          Nhà hàng nhận thông báo Telegram tức thì và gọi lại tư vấn menu cho bạn
                        </p>
                      </div>
                    </div>
                  </div>

                  {submitError && (
                    <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs">
                      {submitError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Họ & Tên người liên hệ <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={bookingName}
                        onChange={(e) => setBookingName(e.target.value)}
                        placeholder="VD: Nguyễn Văn A (Trưởng nhóm / HR)"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Số điện thoại nhận tư vấn <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={bookingPhone}
                        onChange={(e) => setBookingPhone(e.target.value)}
                        placeholder="VD: 0901234567"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Số lượng khách dự kiến
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={venue.max_guests || 1000}
                        value={bookingGuests || ''}
                        onChange={(e) => {
                          const raw = e.target.value;
                          setBookingGuests(raw === '' ? '' : Number(raw));
                        }}
                        onBlur={() => {
                          if (!bookingGuests || Number(bookingGuests) < 1) {
                            setBookingGuests(venue.min_guests || 20);
                          }
                        }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Ngày & Giờ dự kiến tổ chức
                      </label>
                      <input
                        type="text"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        placeholder="VD: Tối 24/01/2026 (18:30)"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Nhu cầu chi tiết & Ghi chú thêm
                    </label>
                    <textarea
                      rows={3}
                      maxLength={450}
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      placeholder="VD: Cần phòng VIP riêng có karaoke, ngân sách khoảng 400.000đ/người, set menu hải sản..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowBookingForm(false)}
                      className="px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-bold transition-all"
                    >
                      Quay lại
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-950/60 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Đang gửi yêu cầu...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Gửi Yêu Cầu Đến Nhà Hàng</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <>
              {/* Space & Amenities */}
              {spaceLabels.length > 0 && (
                <div className="mb-3 text-left">
                  <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400" /> Không gian & Tiện ích
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {spaceLabels.map((s, idx) => (
                      <span
                        key={idx}
                        className="bg-zinc-900 text-zinc-200 border border-zinc-800 text-xs px-2.5 py-1 rounded-lg"
                      >
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Cuisines */}
              {cuisineLabels.length > 0 && (
                <div className="mb-3 text-left">
                  <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-amber-400" /> Phong cách ẩm thực
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {cuisineLabels.map((c, idx) => (
                      <span
                        key={idx}
                        className="bg-amber-950/40 text-amber-200 border border-amber-800/40 text-xs px-2.5 py-1 rounded-lg font-medium"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Perks */}
              {perkLabels.length > 0 && (
                <div className="mb-4 text-left">
                  <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-400" /> Quà tặng & Đặc quyền
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {perkLabels.map((p, idx) => (
                      <span
                        key={idx}
                        className="bg-rose-950/40 text-rose-200 border border-rose-800/40 text-xs px-2.5 py-1 rounded-lg font-medium"
                      >
                        ★ {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {venue.party_description && (
                <div className="bg-zinc-900/60 rounded-xl p-3 border border-zinc-800/80 text-xs text-zinc-300 leading-relaxed mb-4 text-left">
                  {venue.party_description}
                </div>
              )}

              {/* Sảnh tiệc & Phòng VIP */}
              {venue.party_halls && venue.party_halls.length > 0 && (
                <div className="mb-4 text-left">
                  <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" /> Sảnh Tiệc &amp; Không Gian Riêng
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {venue.party_halls.map((h, idx) => (
                      <div
                        key={h.id || idx}
                        className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs flex flex-col justify-between space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-xs">{h.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-semibold">
                            {h.capacity ? `Tới ${h.capacity} khách` : 'Linh hoạt'}
                          </span>
                        </div>
                        {h.features && (
                          <p className="text-[11px] text-zinc-400 line-clamp-1">{h.features}</p>
                        )}
                        {(() => {
                          const rawNum = typeof h.price_min === 'number'
                            ? h.price_min
                            : Number(String(h.price_min || '').replace(/[^\d]/g, ''));
                          const hallPrice = Number.isFinite(rawNum) ? rawNum : 0;
                          return hallPrice > 0 ? (
                            <span className="text-[11px] text-amber-400 font-mono">
                              Từ {hallPrice.toLocaleString('vi-VN')} đ
                            </span>
                          ) : null;
                        })()}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Liên kết thực đơn món ăn & tiệc chi tiết */}
              {venueMenuUrl && (
                <div className="mb-3.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-left">
                  <div className="flex items-center gap-2">
                    <Wine className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-xs font-bold text-white">Thực đơn &amp; Báo giá tiệc chi tiết</span>
                  </div>
                  <a
                    href={venueMenuUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shrink-0"
                  >
                    <span>Xem Thực Đơn</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Set menus */}
              {venue.set_menus && venue.set_menus.length > 0 && (
                <div className="mb-4 text-left">
                  <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Gợi ý Set Menu Tiệc
                  </div>
                  <div className="space-y-2">
                    {venue.set_menus.map((m, idx) => {
                      const rawPrice = typeof m.price === 'number'
                        ? m.price
                        : Number(String(m.price || '').replace(/[^\d]/g, ''));
                      const menuPrice = Number.isFinite(rawPrice) ? rawPrice : 0;
                      return (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-bold text-white text-xs sm:text-sm">{m.name}</span>
                              <span className="text-zinc-400 ml-2">({m.pax || 10} người/bàn)</span>
                            </div>
                            <span className="font-bold text-amber-300 font-mono text-xs sm:text-sm">
                              {menuPrice > 0 ? `${menuPrice.toLocaleString('vi-VN')} đ` : 'Liên hệ báo giá'}
                            </span>
                          </div>
                          {Array.isArray(m.dishes) && m.dishes.length > 0 && (
                            <div className="pt-1.5 border-t border-zinc-800/80">
                              <p className="text-[10px] text-zinc-400 font-semibold mb-1">Món ăn trong set:</p>
                              <div className="flex flex-wrap gap-1">
                                {m.dishes.map((dish: string, dIdx: number) => (
                                  <span key={dIdx} className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300">
                                    • {dish}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quy cách & Chính sách phục vụ */}
              {venue.party_specifications && venue.party_specifications.length > 0 && (
                <div className="mb-2 text-left">
                  <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-400" /> Quy Cách &amp; Chính Sách Tiệc
                  </div>
                  <div className="space-y-1.5">
                    {venue.party_specifications.map((spec, idx) => (
                      <div key={spec.id || idx} className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs">
                        <div className="font-bold text-amber-300 text-xs mb-0.5">{spec.title}</div>
                        <div className="text-[11px] text-zinc-300 leading-relaxed whitespace-pre-line">{spec.content}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* 🌟 NÚT BẤM DÍNH ĐÁY MÀN HÌNH (FIXED BOTTOM CTA) */}
        {!showBookingForm && (
          <div className="shrink-0 p-3 bg-zinc-950/98 border-t border-amber-500/30 backdrop-blur-md flex items-center gap-2 z-20">
            {/* 1. Nút Gửi nhóm Zalo / Bình chọn */}
            <button
              type="button"
              onClick={handleShareZalo}
              className={`flex items-center justify-center gap-1.5 px-3 py-2.5 sm:px-3.5 sm:py-3 rounded-xl border text-xs font-bold transition-all shrink-0 active:scale-95 ${
                copiedShare
                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                  : 'bg-blue-950/50 hover:bg-blue-900/60 border-blue-500/50 text-blue-200'
              }`}
              title="Chia sẻ thông tin tham khảo vào nhóm Zalo để cùng xem và bình chọn"
            >
              {copiedShare ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline">Đã chép!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-blue-400" />
                  <span>Gửi Zalo</span>
                </>
              )}
            </button>

            {/* 2. Nút Vàng Neon Dính Đáy: Nhận Ưu Đãi & Đặt Tiệc Ngay */}
            <button
              type="button"
              onClick={() => setShowBookingForm(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black text-xs sm:text-sm font-black shadow-lg shadow-amber-950/50 transition-all active:scale-[0.98]"
            >
              <CalendarCheck className="w-4 h-4 text-black" />
              <span>🎉 Nhận Ưu Đãi & Đặt Tiệc</span>
            </button>

            {/* 3. Nút Xem Menu & Chi tiết quán trên trang thật */}
            <Link
              href={`/${venue.slug}/tiec`}
              onClick={onClose}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold transition-all shrink-0 active:scale-95"
              title="Xem trang chi tiết sảnh tiệc của nhà hàng"
            >
              <span className="hidden sm:inline">Chi Tiết Sảnh Tiệc</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
            </Link>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
