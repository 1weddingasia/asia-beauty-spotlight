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
import { BeautyVenue } from '@/types/beauty';
import {
  Phone,
  ExternalLink,
  Sparkles,
  MapPin,
  Share2,
  Check,
  CalendarCheck,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Send,
  ShieldCheck,
  X,
} from 'lucide-react';

interface BeautyBottomSheetProps {
  venue: BeautyVenue | null;
  onClose: () => void;
}

export default function BeautyBottomSheet({ venue, onClose }: BeautyBottomSheetProps) {
  const [copiedShare, setCopiedShare] = React.useState(false);
  const [showBookingForm, setShowBookingForm] = React.useState(false);
  const [bookingName, setBookingName] = React.useState('');
  const [bookingPhone, setBookingPhone] = React.useState('');
  const [bookingService, setBookingService] = React.useState('');
  const [bookingDate, setBookingDate] = React.useState('');
  const [bookingNotes, setBookingNotes] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [submitError, setSubmitError] = React.useState('');

  React.useEffect(() => {
    setShowBookingForm(false);
    setSubmitSuccess(false);
    setSubmitError('');
    setIsSubmitting(false);
    setBookingName('');
    setBookingPhone('');
    setBookingService('');
    setBookingDate('');
    setBookingNotes('');
  }, [venue]);

  const handleShareZalo = async () => {
    if (!venue) return;
    const shareUrl = `https://1beauty.asia/${venue.slug}`;
    const shareText = `🌸 [GỢI Ý CƠ SỞ LÀM ĐẸP UY TÍN]\n🏛️ Cơ sở: ${venue.name}\n📍 Địa chỉ: ${venue.address || 'TP.HCM'}\n💰 Bảng giá: ${venue.price_min ? `Từ ${venue.price_min.toLocaleString('vi-VN')} đ` : 'Bảng giá niêm yết minh bạch'}\n✨ Ưu đãi: ${venue.deal_highlight || 'Tư vấn 1-1 & Soi da chuyên sâu'}\n👉 Xem chi tiết dịch vụ: ${shareUrl}`;

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: `Gợi ý cơ sở làm đẹp uy tín: ${venue.name}`,
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
      setSubmitError('Vui lòng nhập tên người đặt lịch.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: venue.id,
          customer_name: bookingName.trim(),
          customer_phone: cleanPhone,
          deal_name: `Đặt hẹn tư vấn làm đẹp: ${venue.name}`,
          deal_value: venue.price_min || 500000,
          booking_time: bookingDate || null,
          cross_sell_items: `Dịch vụ quan tâm: ${bookingService || 'Tư vấn tổng quát'}. ${bookingDate ? `Ngày hẹn: ${bookingDate}. ` : ''}${bookingNotes.trim() ? `Ghi chú: ${bookingNotes.trim()}` : ''}`,
          party_details: {
            venue_id: venue.id,
            venue_name: venue.name,
            venue_slug: venue.slug,
            service: bookingService || 'Tư vấn 1-1',
            appointment_date: bookingDate || null,
            notes: bookingNotes.trim() || null,
            source: 'map_beauty_spa_clinic',
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

  const banners = venue.page_content?.banners || [];
  const gallery = venue.page_content?.gallery || [];
  const heroImage =
    banners[0] ||
    (typeof gallery[0] === 'string' ? gallery[0] : (gallery[0] as any)?.url) ||
    venue.page_content?.hero_image ||
    '/images/categories/spa-thu-gian.jpg';

  const displayPhone = venue.phone || venue.page_content?.phone || 'Đang cập nhật';
  const priceFormatted = venue.price_min
    ? `Từ ${venue.price_min.toLocaleString('vi-VN')} đ`
    : 'Bảng giá niêm yết';

  const services = venue.services || venue.page_content?.services || [];

  const renderDetailBody = () => (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white text-slate-900">
      {/* Scrollable Main Area */}
      <div
        onTouchMove={(e) => e.stopPropagation()}
        className="flex-1 overflow-y-auto px-4 pb-6 pt-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-200"
      >
        {/* Cover Photo */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-100 aspect-[16/9] shadow-sm group">
          <img
            src={heroImage}
            alt={venue.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/categories/spa-thu-gian.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-black/20" />

          {/* Badges on image */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {venue.is_vip && (
              <span className="flex items-center gap-1 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 text-white font-black text-[11px] px-2.5 py-1 rounded-full shadow-md">
                <Sparkles className="w-3 h-3" /> TOP PRESTIGE
              </span>
            )}
            <span className="bg-white/95 text-slate-900 border border-slate-200 text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md shadow-xs">
              ⭐ {venue.rating || '4.9'} ({venue.review_count || 120}+ đánh giá)
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

          {/* Title and Address at bottom of image */}
          <div className="absolute bottom-3 left-3 right-3 text-left">
            <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-md leading-tight">
              {venue.name}
            </h2>
            {venue.address && (
              <p className="flex items-center gap-1.5 text-xs text-slate-200 line-clamp-1 mt-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                {venue.address}
              </p>
            )}
          </div>
        </div>

        {/* Highlight Deal Banner */}
        {venue.deal_highlight && (
          <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-rose-50 border border-rose-200/90 rounded-2xl p-3.5 flex items-start gap-3 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 text-white flex items-center justify-center text-base shrink-0 shadow-xs">
              ✨
            </div>
            <div>
              <div className="text-[11px] font-black text-rose-700 uppercase tracking-wider">
                Ưu Đãi Đặt Hẹn Độc Quyền
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 leading-snug">
                {venue.deal_highlight}
              </div>
            </div>
          </div>
        )}

        {/* Quick Metrics Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 flex flex-col justify-center text-left shadow-xs">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span className="text-[10px] font-semibold">Mức giá liệu trình</span>
            </div>
            <div className="text-xs sm:text-sm font-black text-rose-600 leading-tight truncate">
              {priceFormatted}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 flex flex-col justify-center text-left shadow-xs">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[10px] font-semibold">Hotline tư vấn</span>
            </div>
            <div className="text-xs sm:text-sm font-black text-slate-900 font-mono tracking-tight truncate">
              {displayPhone}
            </div>
          </div>
        </div>

        {/* Form đặt hẹn tư vấn HOẶC Chi tiết dịch vụ */}
        {showBookingForm ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-200 text-left">
            {submitSuccess ? (
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 text-center space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center mx-auto text-emerald-700">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 mb-1">
                    Đặt Lịch Hẹn Tư Vấn Thành Công! 🌸
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Chuyên viên của <strong className="text-slate-900">{venue.name}</strong> sẽ liên hệ xác nhận thời gian thăm khám với bạn sớm nhất.
                  </p>
                  <div className="mt-3 p-3 bg-white rounded-xl border border-emerald-200 text-xs text-slate-700 text-left space-y-1 shadow-xs">
                    <div>🏛️ Cơ sở: <strong className="text-slate-900">{venue.name}</strong></div>
                    <div>📞 Hotline: <strong className="text-emerald-700 font-mono">{displayPhone}</strong></div>
                    <div>👤 Khách hàng: <strong>{bookingName}</strong> ({bookingPhone})</div>
                    {bookingService && <div>💆 Dịch vụ: <strong className="text-rose-600">{bookingService}</strong></div>}
                  </div>
                </div>
                <div className="flex gap-2 justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all"
                  >
                    Xem lại cơ sở
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
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
                        <CalendarCheck className="w-4 h-4 text-rose-600" />
                        Đặt Lịch Hẹn Tư Vấn 1-1
                      </h3>
                      <p className="text-[10px] text-slate-500">
                        Đặt hẹn trước để được soi da 3D &amp; ưu tiên thăm khám
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
                      Họ &amp; Tên của bạn <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={bookingName}
                      onChange={(e) => setBookingName(e.target.value)}
                      placeholder="VD: Chị Mai Anh"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-colors shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Số điện thoại nhận tin xác nhận <span className="text-rose-500">*</span>
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
                        Dịch vụ quan tâm
                      </label>
                      <input
                        type="text"
                        value={bookingService}
                        onChange={(e) => setBookingService(e.target.value)}
                        placeholder="VD: Trị mụn, Nâng cơ..."
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
                      Tình trạng da / Ghi chú thêm
                    </label>
                    <textarea
                      rows={2}
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      placeholder="VD: Da nhạy cảm, muốn được bác sĩ da liễu soi da trực tiếp..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-colors shadow-xs resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
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
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-black shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang gửi...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Gửi Đến Cơ Sở</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <>
            {/* Tagline / Description */}
            {venue.page_content?.tagline && (
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 text-xs text-slate-700 leading-relaxed text-left shadow-xs">
                {venue.page_content.tagline}
              </div>
            )}

            {/* Dịch vụ tiêu biểu */}
            {services.length > 0 && (
              <div className="text-left">
                <div className="text-[11px] font-black text-slate-800 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-600" /> Bảng Giá &amp; Dịch Vụ Niêm Yết
                  </span>
                </div>
                <div className="space-y-2">
                  {services.map((s, idx) => (
                    <div
                      key={s.id || idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs shadow-2xs hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-slate-900 text-xs">{s.name}</span>
                        {s.price && (
                          <span className="font-black text-rose-600 text-xs">
                            {typeof s.price === 'number'
                              ? `${s.price.toLocaleString('vi-VN')} đ`
                              : String(s.price)}
                          </span>
                        )}
                      </div>
                      {s.description && (
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                          {s.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tiêu chuẩn & Tiện ích */}
            {venue.amenities && venue.amenities.length > 0 && (
              <div className="text-left">
                <div className="text-[11px] font-black text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-600" /> Tiêu Chuẩn &amp; Tiện Ích
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {venue.amenities.map((a, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-50 text-slate-800 border border-slate-200 text-[11px] px-2.5 py-1 rounded-lg font-medium shadow-2xs"
                    >
                      ✓ {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Fixed Bottom Action Bar */}
      {!showBookingForm && (
        <div className="shrink-0 p-3 bg-white border-t border-slate-200 flex items-center gap-2 z-20 shadow-md">
          {/* Zalo Share */}
          <button
            type="button"
            onClick={handleShareZalo}
            className={`flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all shrink-0 active:scale-95 ${
              copiedShare
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                : 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700'
            }`}
            title="Gửi thông tin vào nhóm Zalo để tham khảo"
          >
            {copiedShare ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Đã chép</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Zalo</span>
              </>
            )}
          </button>

          {/* Primary CTA */}
          <button
            type="button"
            onClick={() => setShowBookingForm(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-black shadow-md shadow-rose-950/20 transition-all active:scale-[0.98]"
          >
            <CalendarCheck className="w-4 h-4 text-white" />
            <span>🌸 Đặt Lịch Hẹn Tư Vấn 1-1</span>
          </button>

          {/* Direct Profile Link */}
          <Link
            href={`/${venue.slug}`}
            onClick={onClose}
            className="flex items-center justify-center p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold transition-all shrink-0 active:scale-95"
            title="Xem hồ sơ chi tiết của cơ sở"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* 1. DESKTOP VIEW: Sleek Left Slide-over Side Panel (Google Maps Luxury Style) */}
      <div className="hidden md:block">
        <aside
          className="fixed top-[52px] bottom-0 left-0 z-40 w-[420px] lg:w-[460px] bg-white shadow-2xl border-r border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-left duration-300"
          aria-label={`Chi tiết cơ sở ${venue.name}`}
        >
          {renderDetailBody()}
        </aside>
      </div>

      {/* 2. MOBILE VIEW: Native Bottom Sheet (Vaul Drawer) */}
      <div className="md:hidden">
        <Drawer open={!!venue} onOpenChange={(open) => !open && onClose()}>
          <DrawerContent className="bg-white border-t border-slate-200 text-slate-900 max-h-[88dvh] rounded-t-3xl overflow-hidden shadow-2xl flex flex-col">
            <DrawerHeader className="sr-only">
              <DrawerTitle>{venue.name}</DrawerTitle>
              <DrawerDescription>Hồ sơ làm đẹp của {venue.name}</DrawerDescription>
            </DrawerHeader>
            {renderDetailBody()}
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}
