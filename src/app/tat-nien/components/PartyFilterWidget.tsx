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
import { PartyFilterState, PARTY_SPACES, PARTY_CUISINES, PARTY_PERKS } from '@/types/party';
import { SlidersHorizontal, Sparkles, Send, CheckCircle2, RotateCcw } from 'lucide-react';

interface PartyFilterWidgetProps {
  filter: PartyFilterState;
  onFilterChange: (newFilter: PartyFilterState) => void;
  totalVenues: number;
  matchedCount: number;
}

export default function PartyFilterWidget({
  filter,
  onFilterChange,
  totalVenues,
  matchedCount,
}: PartyFilterWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
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
        setTimeout(() => setIsSentSuccess(false), 8000);
      }
    } catch (err) {
      console.error('Lỗi gửi yêu cầu tiệc:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasActiveFilter =
    filter.guests > 0 ||
    filter.priceMax > 0 ||
    filter.spaces.length > 0 ||
    filter.cuisines.length > 0 ||
    filter.onlyVip;

  return (
    <>
      {/* Floating Pill Button Trigger */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-zinc-900/95 hover:bg-zinc-800 border border-amber-500/50 text-white shadow-2xl shadow-black/80 backdrop-blur-md transition-all active:scale-95 group select-none"
          >
            <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-black transition-colors">
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </div>
            <div className="text-left leading-none">
              <div className="text-xs font-bold text-amber-300">
                Tìm Sảnh Tiệc
              </div>
              <div className="text-[10px] text-zinc-400">
                {matchedCount}/{totalVenues} quán phù hợp
              </div>
            </div>
            {hasActiveFilter && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping ml-1" />
            )}
          </button>
        </DialogTrigger>

        <DialogContent className="bg-zinc-950 border border-amber-500/30 text-zinc-100 max-w-lg max-h-[90dvh] overflow-y-auto p-5 rounded-3xl shadow-2xl">
          <DialogHeader className="text-left pb-3 border-b border-zinc-800">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Bộ Lọc Tìm Sảnh Tiệc Tất Niên
              </DialogTitle>
              {hasActiveFilter && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-amber-300 transition-colors"
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
                <label className="text-xs font-bold uppercase text-zinc-300 tracking-wider">
                  1. Số Lượng Khách Tiệc
                </label>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
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
                  { label: '15-30 khách', val: 20 },
                  { label: '30-50 khách', val: 40 },
                  { label: '50-100 khách', val: 60 },
                  { label: '100+ khách', val: 120 },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onFilterChange({ ...filter, guests: item.val })}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                      filter.guests === item.val
                        ? 'bg-amber-500 text-black font-bold border-amber-400'
                        : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Ngân sách tối đa/người */}
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-300 tracking-wider mb-2">
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
                        ? 'bg-amber-500 text-black font-bold border-amber-400 shadow-md shadow-amber-950/50'
                        : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Không gian & Tiện ích bắt buộc */}
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-300 tracking-wider mb-2">
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
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
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
              <label className="block text-xs font-bold uppercase text-zinc-300 tracking-wider mb-2">
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
                          ? 'bg-rose-950/60 border-rose-500 text-rose-200 font-bold'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
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
            <div className="pt-3 border-t border-zinc-800/80">
              <div className="bg-zinc-900/80 rounded-2xl p-4 border border-zinc-800">
                <div className="text-xs font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5" />
                  Bạn Cần Tìm Sảnh Tiệc Theo Yêu Cầu Riêng?
                </div>
                <p className="text-[11px] text-zinc-400 mb-3">
                  Nhập yêu cầu đặc biệt và số điện thoại, hệ thống sẽ gợi ý sảnh tiệc chuẩn gu và bắn thông báo trực tiếp cho đội ngũ hỗ trợ.
                </p>

                {isSentSuccess ? (
                  <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-xl p-3 text-emerald-200 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
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
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
                      rows={2}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Tên của bạn (hoặc công ty)"
                        className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                      />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Số điện thoại nhận báo giá *"
                        required
                        className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs shadow-lg shadow-amber-950 transition-all flex items-center justify-center gap-1.5 active:scale-98 disabled:opacity-50"
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
              className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-200 transition-colors"
            >
              Xem {matchedCount} Nhà Hàng Phù Hợp
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
