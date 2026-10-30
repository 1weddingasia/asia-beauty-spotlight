'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import {
  BeautyFilterState,
  BEAUTY_CATEGORIES,
  BEAUTY_AMENITIES,
} from '@/types/beauty';
import { SlidersHorizontal, Sparkles, Send, CheckCircle2, RotateCcw } from 'lucide-react';

interface BeautyFilterWidgetProps {
  filter: BeautyFilterState;
  onFilterChange: (newFilter: BeautyFilterState) => void;
  totalVenues: number;
  matchedCount: number;
}

export default function BeautyFilterWidget({
  filter,
  onFilterChange,
  totalVenues,
  matchedCount,
}: BeautyFilterWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSentSuccess, setIsSentSuccess] = useState(false);

  const toggleAmenity = (id: string) => {
    const next = filter.amenities.includes(id)
      ? filter.amenities.filter((a) => a !== id)
      : [...filter.amenities, id];
    onFilterChange({ ...filter, amenities: next });
  };

  const handleReset = () => {
    onFilterChange({
      category: 'all',
      priceMax: 0,
      amenities: [],
      onlyVip: false,
    });
  };

  const handleSendConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone && !note) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: name || 'Khách tìm Spa / Clinic',
          customer_phone: phone,
          deal_name: `Tư vấn chọn Spa/Clinic phù hợp: ${filter.category !== 'all' ? filter.category : 'Tổng quát'}`,
          cross_sell_items: note ? `Nhu cầu làm đẹp: ${note}` : 'Khảo sát dịch vụ làm đẹp từ Bản Đồ 1Beauty',
        }),
      });

      if (res.ok) {
        setIsSentSuccess(true);
      }
    } catch (err) {
      console.error('Lỗi gửi yêu cầu tư vấn làm đẹp:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    if (!isSentSuccess) return;
    const timer = setTimeout(() => setIsSentSuccess(false), 6000);
    return () => clearTimeout(timer);
  }, [isSentSuccess]);

  const hasActiveFilter =
    filter.category !== 'all' ||
    filter.priceMax > 0 ||
    filter.amenities.length > 0 ||
    filter.onlyVip;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/95 hover:bg-rose-50/80 border-2 border-rose-400 text-slate-900 shadow-xl shadow-rose-950/15 backdrop-blur-md transition-all active:scale-95 group select-none"
          >
            <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </div>
            <div className="text-left leading-none">
              <div className="text-xs font-black text-slate-900 group-hover:text-rose-800">
                Lọc Cơ Sở Làm Đẹp
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {matchedCount}/{totalVenues} địa chỉ uy tín
              </div>
            </div>
            {hasActiveFilter && (
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping ml-1" />
            )}
          </button>
        </DialogTrigger>

        <DialogContent className="bg-[#FCFAF7] border border-rose-200 text-slate-900 max-w-lg max-h-[90dvh] overflow-y-auto p-5 rounded-3xl shadow-2xl">
          <DialogHeader className="text-left pb-3 border-b border-rose-100">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-600" />
                Bộ Lọc Tìm Spa, Clinic &amp; Làm Đẹp
              </DialogTitle>
              {hasActiveFilter && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-rose-700 font-bold transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Đặt lại
                </button>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-5 py-3 text-left">
            {/* 1. Danh mục dịch vụ làm đẹp */}
            <div>
              <label className="block text-xs font-black uppercase text-slate-800 tracking-wider mb-2">
                1. Dịch Vụ / Chuyên Khoa Làm Đẹp
              </label>
              <div className="flex flex-wrap gap-1.5">
                {BEAUTY_CATEGORIES.map((cat) => {
                  const isActive = filter.category === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => onFilterChange({ ...filter, category: cat.slug })}
                      className={`text-xs px-3 py-1.5 rounded-xl border flex items-center gap-1 transition-all ${
                        isActive
                          ? 'bg-rose-600 text-white font-black border-rose-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300 hover:bg-rose-50/50'
                      }`}
                    >
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Tiêu chuẩn & Tiện ích */}
            <div>
              <label className="block text-xs font-black uppercase text-slate-800 tracking-wider mb-2">
                2. Tiêu Chuẩn &amp; Dịch Vụ Đi Kèm
              </label>
              <div className="flex flex-wrap gap-1.5">
                {BEAUTY_AMENITIES.map((amenity) => {
                  const isActive = filter.amenities.includes(amenity.id);
                  return (
                    <button
                      key={amenity.id}
                      type="button"
                      onClick={() => toggleAmenity(amenity.id)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                        isActive
                          ? 'bg-rose-100 border-rose-400 text-rose-900 font-bold'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300 hover:bg-rose-50/50'
                      }`}
                    >
                      {isActive ? '✓ ' : '+ '}
                      {amenity.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Đăng ký nhận tư vấn spa phù hợp */}
            <div className="pt-3 border-t border-rose-100">
              <div className="bg-white rounded-2xl p-4 border border-rose-200/90 shadow-xs">
                <div className="text-xs font-black text-rose-800 mb-1 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-rose-600" />
                  Bạn Cần Tìm Spa / Bác Sĩ Chuẩn Nhu Cầu?
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  Để lại tình trạng da hoặc dịch vụ quan tâm, chuyên viên 1Beauty sẽ hỗ trợ kết nối địa chỉ uy tín có ưu đãi tốt nhất.
                </p>

                {isSentSuccess ? (
                  <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Đã gửi thông tin! Đội ngũ tư vấn 1Beauty sẽ kết nối địa chỉ làm đẹp chất lượng cho bạn.
                    </span>
                  </div>
                ) : (
                  <form onSubmit={handleSendConsultation} className="space-y-2.5">
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="VD: Cần tìm clinic trị mụn chuẩn y khoa tại Quận 1 có bác sĩ khám trực tiếp..."
                      className="w-full bg-[#FAF8F5] border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-colors"
                      rows={2}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Tên của bạn"
                        className="bg-[#FAF8F5] border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500"
                      />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Số điện thoại nhận ưu đãi *"
                        required
                        className="bg-[#FAF8F5] border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-xs shadow-sm shadow-rose-900/15 transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Đang gửi thông tin...</span>
                      ) : (
                        <>
                          <span>Nhận Gợi Ý &amp; Báo Giá Ưu Đãi</span>
                          <Send className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full py-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-black text-rose-900 transition-colors"
            >
              Xem {matchedCount} Cơ Sở Phù Hợp
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
