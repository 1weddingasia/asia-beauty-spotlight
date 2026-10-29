"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Building2, ExternalLink, BarChart3, Printer, Sparkles, Send } from 'lucide-react';

interface BoothItem {
  id: string;
  name: string;
  name_vi?: string | null;
  name_en?: string | null;
  slug: string;
  phone: string;
  address?: string | null;
  logo_url?: string | null;
  event_name: string;
  event_name_en?: string | null;
  booth_number: string;
  is_demo?: boolean;
}

interface Props {
  initialBooths: BoothItem[];
}

export function ExpoHubClient({ initialBooths }: Props) {
  const [search, setSearch] = useState('');

  const filteredBooths = initialBooths.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      (item.name_vi && item.name_vi.toLowerCase().includes(q)) ||
      (item.name_en && item.name_en.toLowerCase().includes(q)) ||
      item.booth_number.toLowerCase().includes(q) ||
      item.event_name.toLowerCase().includes(q) ||
      (item.event_name_en && item.event_name_en.toLowerCase().includes(q)) ||
      (item.address && item.address.toLowerCase().includes(q)) ||
      (item.phone && item.phone.includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 pb-20">
      {/* 1. HERO HEADER */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border-b border-slate-800 px-4 pt-10 pb-8 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            1BOOKING EXPO PASS ECOSYSTEM
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
            Danh Bạ Gian Hàng Triển Lãm
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto mb-6 leading-relaxed">
            Nền tảng số hóa gian hàng hội chợ, hỗ trợ 4 ngôn ngữ, thu thập Lead real-time và xuất file Excel tức thì.
          </p>

          {/* SEARCH BAR CHÍNH */}
          <div className="relative max-w-lg mx-auto">
            <Search className="w-5 h-5 text-slate-500 absolute left-4 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm nhanh theo tên gian hàng, số booth (ví dụ: A-01), sự kiện..."
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 shadow-xl"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-4 top-3 text-xs text-slate-500 hover:text-slate-300"
              >
                Xóa
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. GRID GIAN HÀNG */}
      <main className="max-w-5xl mx-auto w-full px-4 py-8 flex-1">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">Danh sách gian hàng</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold">
              {filteredBooths.length} gian hàng
            </span>
          </div>

          <p className="text-xs text-slate-500 hidden sm:block">
            Bấm chọn để mở trang khách quét hoặc quản trị CRM
          </p>
        </div>

        {filteredBooths.length === 0 ? (
          <div className="text-center py-16 px-4 bg-slate-900/40 border border-slate-800 rounded-2xl">
            <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-300">Không tìm thấy gian hàng nào</h3>
            <p className="text-xs text-slate-500 mt-1">
              Thử tìm kiếm với từ khóa khác hoặc số booth.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBooths.map((booth) => (
              <div
                key={booth.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between group shadow-sm hover:shadow-xl hover:shadow-amber-500/5"
              >
                <div>
                  {/* Top Bar of Card */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        BOOTH: {booth.booth_number}
                      </span>
                      {booth.is_demo && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Mẫu Demo
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 truncate max-w-[130px]">
                      {booth.event_name}
                    </span>
                  </div>

                  {/* Logo + Name */}
                  <div className="flex items-center gap-3 mb-3">
                    {booth.logo_url ? (
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white p-1 border border-slate-700 shrink-0">
                        <Image
                          src={booth.logo_url}
                          alt={booth.name_vi || booth.name}
                          fill
                          unoptimized
                          className="object-contain"
                          sizes="48px"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shrink-0">
                        {(booth.name_vi || booth.name).slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                        {booth.name_vi || booth.name}
                      </h3>
                      {booth.name_en && booth.name_en.toLowerCase() !== (booth.name_vi || booth.name).toLowerCase() && (
                        <p className="text-[11px] text-amber-400/90 font-medium truncate mt-0.5">
                          {booth.name_en}
                        </p>
                      )}
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {booth.address || 'Hội chợ triển lãm'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3 Action Buttons */}
                <div className="pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-1.5 text-center">
                  <Link
                    href={`/expo/${booth.slug}`}
                    target="_blank"
                    className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors text-[10px] font-medium"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-blue-400 mb-1" />
                    <span>Quét Thử</span>
                  </Link>

                  <Link
                    href={`/expo/${booth.slug}/crm`}
                    className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors text-[10px] font-bold"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-amber-400 mb-1" />
                    <span>CRM Live</span>
                  </Link>

                  <Link
                    href={`/expo/${booth.slug}/qr`}
                    className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors text-[10px] font-medium"
                  >
                    <Printer className="w-3.5 h-3.5 text-emerald-400 mb-1" />
                    <span>In Standee</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. TELEGRAM FAST-CREATE TIP BOX */}
        <div className="mt-12 bg-gradient-to-r from-blue-950/40 via-slate-900 to-amber-950/30 border border-slate-800 rounded-3xl p-6 text-center sm:text-left sm:flex items-center justify-between gap-6">
          <div className="space-y-1 mb-4 sm:mb-0">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400">
              <Send className="w-3.5 h-3.5" />
              TẠO GIAN HÀNG NHANH QUA TELEGRAM BOT
            </span>
            <h4 className="text-base font-bold text-white">
              Cần tạo gian hàng gấp ngay tại hội trường?
            </h4>
            <p className="text-xs text-slate-400">
              Chỉ cần nhắn vào Telegram Bot cú pháp: <br className="sm:hidden" />
              <code className="text-amber-300 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                EXPO: Tên Gian Hàng | Số Booth | SĐT | Tên Triển Lãm
              </code>
            </p>
          </div>

          <a
            href="https://t.me/abs_booking_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>MỞ TELEGRAM BOT</span>
          </a>
        </div>
      </main>
    </div>
  );
}
