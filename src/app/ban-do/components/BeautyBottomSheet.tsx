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
  Award,
  Share2,
  Check,
  CalendarCheck,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Send,
  Heart,
  ShieldCheck,
  Clock,
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
    const shareText = `🌸 [ĐỊA CHỈ LÀM ĐẸP UY TÍN TẠI TP.HCM]\n✨ ${venue.name}\n📍 Địa chỉ: ${venue.address || 'TP.HCM'}\n📞 Hotline: ${venue.phone || 'Liên hệ qua app'}\n🎁 Ưu đãi độc quyền: ${venue.deal_highlight || 'Tư vấn & soi da miễn phí'}\n👉 Xem dịch vụ & bảng giá: ${shareUrl}`;

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: `Cơ sở làm đẹp uy tín: ${venue.name}`,
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
      setSubmitError('Vui lòng nhập họ và tên của bạn.');
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
          deal_name: `Hẹn Tư Vấn / Đặt Lịch: ${bookingService || venue.name}`,
          booking_time: bookingDate.trim() || 'Hẹn giờ linh hoạt',
          cross_sell_items: bookingNotes.trim() ? `Ghi chú làm đẹp: ${bookingNotes.trim()}` : `Khảo sát từ Bản Đồ Làm Đẹp 1Beauty`,
        }),
      });

      const data = await res.json().catch(() => ({} as { error?: string }));
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

  return (
    <Drawer open={!!venue} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-[#FAF8F5] border-t-2 border-rose-400 text-slate-900 max-h-[88dvh] rounded-t-3xl overflow-hidden shadow-2xl flex flex-col backdrop-blur-xl">
        <div
          onTouchMove={(e) => e.stopPropagation()}
          className="flex-1 overflow-y-auto px-4 pb-8 pt-2 scrollbar-thin scrollbar-thumb-rose-200"
        >
          {/* Header Image */}
          <div className="relative rounded-2xl overflow-hidden mb-4 border border-rose-200/80 bg-slate-100 aspect-[16/9] max-h-48 sm:max-h-56 shadow-xs">
            <img
              src={heroImage}
              alt={venue.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/categories/spa-thu-gian.jpg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {venue.is_vip && (
                <span className="flex items-center gap-1 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 text-white font-black text-xs px-2.5 py-1 rounded-full shadow-lg">
                  <Sparkles className="w-3.5 h-3.5" /> TOP PRESTIGE
                </span>
              )}
              <span className="bg-white/95 text-rose-900 border border-rose-300 text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-md shadow-xs">
                ⭐ {venue.rating || '4.9'} ({venue.review_count || 120}+ đánh giá)
              </span>
            </div>

            <div className="absolute bottom-3 left-3 right-3 text-left">
              <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-md">
                {venue.name}
              </h2>
              {venue.address && (
                <p className="flex items-center gap-1 text-xs text-rose-100 line-clamp-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-rose-300 shrink-0" />
                  {venue.address}
                </p>
              )}
            </div>
          </div>

          <DrawerHeader className="p-0 text-left mb-3">
            <DrawerTitle className="sr-only">{venue.name}</DrawerTitle>
            <DrawerDescription className="sr-only">Hồ sơ làm đẹp của {venue.name}</DrawerDescription>

            {venue.deal_highlight && (
              <div className="bg-gradient-to-r from-rose-100/90 via-pink-50 to-rose-100/90 border border-rose-300 rounded-xl p-3 flex items-start gap-2.5 shadow-xs">
                <span className="text-xl">🎁</span>
                <div>
                  <div className="text-xs font-black text-rose-800 uppercase tracking-wide">
                    Ưu Đãi Độc Quyền Qua 1Beauty
                  </div>
                  <div className="text-sm font-bold text-rose-950 mt-0.5">
                    {venue.deal_highlight}
                  </div>
                </div>
              </div>
            )}
          </DrawerHeader>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            <div className="bg-white border border-rose-200/80 rounded-xl p-3 flex items-center gap-3 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-[11px] text-slate-500 font-medium">Bảng giá tham khảo</div>
                <div className="text-sm font-black text-rose-700">
                  {priceFormatted}
                </div>
              </div>
            </div>

            <div className="bg-white border border-rose-200/80 rounded-xl p-3 flex items-center gap-3 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-[11px] text-slate-500 font-medium">Hotline tư vấn</div>
                <div className="text-sm font-black text-emerald-700 font-mono tracking-wide">
                  {displayPhone}
                </div>
              </div>
            </div>
          </div>

          {/* Form Booking OR Details */}
          {showBookingForm ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-200 text-left pb-4">
              {submitSuccess ? (
                <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 text-center space-y-4 my-2 shadow-xs">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center mx-auto text-emerald-700">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 mb-1">
                      Đã Gửi Hẹn Tư Vấn Thành Công! 🌸
                    </h3>
                    <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                      Thông tin làm đẹp của bạn đã được gửi trực tiếp tới đội ngũ chuyên viên của{' '}
                      <span className="text-rose-700 font-bold">{venue.name}</span>.
                    </p>
                    <div className="mt-3 p-3 bg-white rounded-xl border border-rose-200 text-xs text-slate-700 text-left space-y-1.5 shadow-xs">
                      <div>🏛️ Cơ sở: <span className="text-slate-900 font-bold">{venue.name}</span></div>
                      <div>📞 Hotline: <span className="text-emerald-700 font-bold font-mono">{displayPhone}</span></div>
                      <div>👤 Khách hàng: <span className="text-slate-900 font-semibold">{bookingName}</span> ({bookingPhone})</div>
                      {bookingService && <div>✨ Dịch vụ quan tâm: <span className="text-rose-700 font-bold">{bookingService}</span></div>}
                    </div>
                  </div>
                  <div className="flex gap-2 justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => setShowBookingForm(false)}
                      className="px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-slate-700 text-xs font-bold transition-all"
                    >
                      Quay lại
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-4 bg-white p-4 rounded-2xl border border-rose-200 shadow-xs">
                  <div className="flex items-center justify-between border-b border-rose-100 pb-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowBookingForm(false)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-slate-600 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <div>
                        <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5">
                          <CalendarCheck className="w-4 h-4 text-rose-600" />
                          Hẹn Tư Vấn &amp; Giữ Chỗ — {venue.name}
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Nhận ưu đãi độc quyền 1Beauty &amp; chuyên viên liên hệ trong ít phút
                        </p>
                      </div>
                    </div>
                  </div>

                  {submitError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs">
                      {submitError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Họ &amp; Tên <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={bookingName}
                        onChange={(e) => setBookingName(e.target.value)}
                        placeholder="VD: Chị Mai Anh"
                        className="w-full bg-[#FAF8F5] border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Số điện thoại <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={bookingPhone}
                        onChange={(e) => setBookingPhone(e.target.value)}
                        placeholder="VD: 0901234567"
                        className="w-full bg-[#FAF8F5] border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-colors font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Dịch vụ quan tâm
                      </label>
                      <input
                        type="text"
                        value={bookingService}
                        onChange={(e) => setBookingService(e.target.value)}
                        placeholder="VD: Chăm sóc da chuyên sâu, Trị nám..."
                        className="w-full bg-[#FAF8F5] border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Thời gian mong muốn
                      </label>
                      <input
                        type="text"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        placeholder="VD: Chiều mai 15:00"
                        className="w-full bg-[#FAF8F5] border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tình trạng da &amp; Ghi chú thêm
                    </label>
                    <textarea
                      rows={2}
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      placeholder="VD: Da nhạy cảm, muốn soi da trước khi làm..."
                      className="w-full bg-[#FAF8F5] border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-colors resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowBookingForm(false)}
                      className="px-4 py-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-slate-700 text-xs font-bold transition-all"
                    >
                      Quay lại
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-black shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Đang gửi thông tin...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Gửi Yêu Cầu Hẹn Lịch</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <>
              {/* Services list */}
              {services.length > 0 && (
                <div className="mb-4 text-left">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-600" /> Dịch Vụ Nổi Bật
                  </div>
                  <div className="space-y-1.5">
                    {services.map((svc: any, idx: number) => {
                      const svcPrice = typeof svc.price === 'number'
                        ? `${svc.price.toLocaleString('vi-VN')} đ`
                        : (svc.price || 'Liên hệ');
                      return (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-white border border-rose-200/80 text-xs flex items-center justify-between shadow-xs"
                        >
                          <div>
                            <div className="font-bold text-slate-900">{svc.name}</div>
                            {svc.description && (
                              <div className="text-[10px] text-slate-500 line-clamp-1">{svc.description}</div>
                            )}
                          </div>
                          <span className="font-bold text-rose-600 font-mono text-xs shrink-0 ml-2">
                            {svcPrice}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Commitments & Trust */}
              <div className="mb-4 p-3 rounded-2xl bg-white border border-rose-200/80 text-xs text-left shadow-xs space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Cam Kết Chất Lượng 1Beauty
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Dụng cụ khử khuẩn chuẩn y khoa</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Mỹ phẩm chính hãng 100%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Tư vấn rõ ràng, không chèo kéo</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Bảo hành kết quả điều trị</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Fixed bottom CTA */}
        {!showBookingForm && (
          <div className="shrink-0 p-3 bg-white/98 border-t border-rose-200 backdrop-blur-md flex items-center gap-2 z-20 shadow-md">
            <button
              type="button"
              onClick={handleShareZalo}
              className={`flex items-center justify-center gap-1.5 px-3 py-2.5 sm:px-3.5 sm:py-3 rounded-xl border text-xs font-bold transition-all shrink-0 active:scale-95 ${
                copiedShare
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                  : 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700'
              }`}
              title="Chia sẻ vào Zalo"
            >
              {copiedShare ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline">Đã chép!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-blue-600" />
                  <span>Gửi Zalo</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowBookingForm(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs sm:text-sm font-black shadow-md shadow-rose-950/20 transition-all active:scale-[0.98]"
            >
              <CalendarCheck className="w-4 h-4 text-white" />
              <span>🌸 Hẹn Lịch &amp; Nhận Ưu Đãi</span>
            </button>

            <Link
              href={`/${venue.slug}`}
              onClick={onClose}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-slate-700 hover:text-rose-900 text-xs font-bold transition-all shrink-0 active:scale-95"
              title="Xem trang chi tiết spa"
            >
              <span className="hidden sm:inline">Chi Tiết</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </Link>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
