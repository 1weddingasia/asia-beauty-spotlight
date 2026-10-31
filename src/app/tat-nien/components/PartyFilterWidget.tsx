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
import { PartyFilterState, PARTY_SPACES, PARTY_CUISINES } from '@/types/party';
import { SlidersHorizontal, Sparkles, Send, CheckCircle2, RotateCcw } from 'lucide-react';

interface PartyFilterWidgetProps {
  filter: PartyFilterState;
  onFilterChange: (newFilter: PartyFilterState) => void;
  totalVenues: number;
  matchedCount: number;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

export default function PartyFilterWidget({
  filter,
  onFilterChange,
  totalVenues,
  matchedCount,
  isOpen: controlledIsOpen,
  onOpenChange: controlledOnOpenChange,
  showTrigger = true,
}: PartyFilterWidgetProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = controlledOnOpenChange || setInternalIsOpen;
  const [note, setNote] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSentSuccess, setIsSentSuccess] = useState(false);

  // Toggle Space Tag
  const toggleSpace = (id: string) => {
    const next = filter.spaces.includes(id)
      ? filter.spaces.filter((s) => s !== id)
      : [...filter.spaces, id];
    onFilterChange({ ...filter, spaces: next });
  };

  // Toggle Cuisine Tag
  const toggleCuisine = (id: string) => {
    const next = filter.cuisines.includes(id)
      ? filter.cuisines.filter((c) => c !== id)
      : [...filter.cuisines, id];
    onFilterChange({ ...filter, cuisines: next });
  };

  // Reset Filters
  const handleReset = () => {
    onFilterChange({
      guests: 0,
      priceMax: 0,
      spaces: [],
      cuisines: [],
      perks: [],
      onlyVip: false,
    });
  };

  // Send Custom Lead via /api/party/match
  const handleSendSpecialRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone && !note) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/party/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guests: filter.guests,
          priceMax: filter.priceMax,
          spaces: filter.spaces,
          cuisines: filter.cuisines,
          perks: filter.perks,
          note,
          customer_phone: phone,
          customer_name: name || 'Khách vãng lai',
        }),
      });

      if (res.ok) {
        setIsSentSuccess(true);
      }
    } catch (err) {
      console.error('Lỗi gửi yêu cầu tiệc:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tự động tắt thông báo gửi thành công sau 6s có cleanup
  React.useEffect(() => {
    if (!isSentSuccess) return;
    const timer = setTimeout(() => setIsSentSuccess(false), 6000);
    return () => clearTimeout(timer);
  }, [isSentSuccess]);

  const hasActiveFilter =
    filter.guests > 0 ||
    filter.priceMax > 0 ||
    filter.spaces.length > 0 ||
    filter.cuisines.length > 0 ||
    filter.perks.length > 0 ||
    filter.onlyVip;

  return (
    <>
      {/* Floating Pill Button Trigger (Warm Luxury Light) */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {showTrigger && (
          <DialogTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/95 hover:bg-amber-50/80 border-2 border-amber-500/80 text-slate-900 shadow-xl shadow-amber-950/15 backdrop-blur-md transition-all active:scale-95 group select-none"
            >
              <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </div>
              <div className="text-left leading-none">
                <div className="text-xs font-black text-slate-900 group-hover:text-amber-800">
                  Tìm Sảnh Tiệc
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Bộ lọc tiêu chí tiệc
                </div>
              </div>
              {hasActiveFilter && (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-ping ml-1" />
              )}
            </button>
          </DialogTrigger>
        )}

        <DialogContent className="bg-[#FCFAF7] border border-amber-200 text-slate-900 max-w-lg max-h-[90dvh] overflow-y-auto p-5 rounded-3xl shadow-2xl">
          <DialogHeader className="text-left pb-3 border-b border-amber-100">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Bộ Lọc Tìm Sảnh Tiệc Tất Niên
              </DialogTitle>
              {hasActiveFilter && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-amber-700 font-bold transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Đặt lại
                </button>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-5 py-3 text-left">
            {/* 1. Số lượng khách */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black uppercase text-slate-800 tracking-wider">
                  1. Số Lượng Khách Tiệc
                </label>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  {filter.guests > 0 ? `≥ ${filter.guests} khách` : 'Tất cả quy mô'}
                </span>
              </div>
              <Slider
                value={[filter.guests]}
                min={0}
                max={300}
                step={10}
                onValueChange={(val) =>
                  onFilterChange({ ...filter, guests: val[0] })
                }
                className="py-2"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  { label: 'Tất cả', val: 0 },
                  { label: '≥ 20 khách', val: 20 },
                  { label: '≥ 40 khách', val: 40 },
                  { label: '≥ 60 khách', val: 60 },
                  { label: '≥ 100 khách', val: 100 },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onFilterChange({ ...filter, guests: item.val })}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                      filter.guests === item.val
                        ? 'bg-amber-600 text-white font-bold border-amber-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:bg-amber-50/50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Ngân sách tối đa/người */}
            <div>
              <label className="block text-xs font-black uppercase text-slate-800 tracking-wider mb-2">
                2. Ngân Sách Dự Kiến (/người)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { label: 'Tất cả mức giá', val: 0 },
                  { label: '< 300.000 đ', val: 300000 },
                  { label: '< 500.000 đ', val: 500000 },
                  { label: '< 800.000 đ', val: 800000 },
                ].map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onFilterChange({ ...filter, priceMax: p.val })}
                    className={`text-xs py-2 px-2 rounded-xl border text-center transition-all ${
                      filter.priceMax === p.val
                        ? 'bg-amber-600 text-white font-bold border-amber-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:bg-amber-50/50'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Không gian & Tiện ích bắt buộc */}
            <div>
              <label className="block text-xs font-black uppercase text-slate-800 tracking-wider mb-2">
                3. Tiện Ích & Không Gian Mong Muốn
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PARTY_SPACES.map((space) => {
                  const isActive = filter.spaces.includes(space.id);
                  return (
                    <button
                      key={space.id}
                      type="button"
                      onClick={() => toggleSpace(space.id)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                        isActive
                          ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:bg-amber-50/50'
                      }`}
                    >
                      {isActive ? '✓ ' : '+ '}
                      {space.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Phong cách ẩm thực */}
            <div>
              <label className="block text-xs font-black uppercase text-slate-800 tracking-wider mb-2">
                4. Phong Cách Ẩm Thực
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PARTY_CUISINES.map((c) => {
                  const isActive = filter.cuisines.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCuisine(c.id)}
                      className={`text-xs px-2.5 py-1.5 rounded-xl border transition-all ${
                        isActive
                          ? 'bg-rose-100 border-rose-400 text-rose-900 font-bold'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:bg-amber-50/50'
                      }`}
                    >
                      {isActive ? '✓ ' : ''}
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Gửi yêu cầu riêng & nổ chuông Telegram */}
            <div className="pt-3 border-t border-amber-100">
              <div className="bg-white rounded-2xl p-4 border border-amber-200/90 shadow-xs">
                <div className="text-xs font-black text-amber-800 mb-1 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-amber-600" />
                  Bạn Cần Tìm Sảnh Tiệc Theo Yêu Cầu Riêng?
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  Nhập yêu cầu đặc biệt và số điện thoại, hệ thống sẽ gợi ý sảnh tiệc chuẩn gu và thông báo trực tiếp cho đội ngũ hỗ trợ.
                </p>

                {isSentSuccess ? (
                  <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Đã gửi yêu cầu thành công! Đội ngũ 1Booking sẽ liên hệ hỗ trợ bạn trong ít phút.
                    </span>
                  </div>
                ) : (
                  <form onSubmit={handleSendSpecialRequest} className="space-y-2.5">
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="VD: Cần phòng tiệc 40 người có karaoke riêng, cho mang rượu vang vào không tính phí..."
                      className="w-full bg-[#FAF8F5] border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors"
                      rows={2}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Tên của bạn (hoặc công ty)"
                        className="bg-[#FAF8F5] border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                      />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Số điện thoại nhận báo giá *"
                        required
                        className="bg-[#FAF8F5] border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-white font-black text-xs shadow-sm shadow-amber-900/15 transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Đang gửi thông tin...</span>
                      ) : (
                        <>
                          <span>Gửi Yêu Cầu & Báo Giá Nhanh</span>
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
              className="w-full py-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs font-black text-amber-900 transition-colors"
            >
              Áp Dụng Bộ Lọc
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
