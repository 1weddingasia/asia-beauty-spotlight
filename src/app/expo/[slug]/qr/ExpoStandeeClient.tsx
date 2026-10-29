"use client";

import Image from 'next/image';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, ArrowLeft, BarChart3, ExternalLink, Sparkles } from 'lucide-react';
import { getExpoBrandName } from '@/types/expo';

interface Props {
  business: {
    id: string;
    name: string;
    slug: string;
    phone: string;
    logo_url?: string | null;
    page_content?: any;
  };
  profile: {
    event_name: string;
    booth_number: string;
    company_name_vi?: string | null;
    company_name_en?: string | null;
  };
}

export function ExpoStandeeClient({ business, profile }: Props) {
  const nameVi = getExpoBrandName(business, profile, 'vi');
  const nameEn = getExpoBrandName(business, profile, 'en');

  const boothUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/expo/${business.slug}`
    : `https://1booking.asia/expo/${business.slug}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start py-8 px-4 font-sans print:p-0 print:bg-white print:text-black">
      {/* ACTION BAR (Hidden when printing) */}
      <div className="max-w-xl w-full flex items-center justify-between mb-8 print:hidden">
        <div className="flex items-center gap-2">
          <Link
            href="/expo"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Về Expo</span>
          </Link>
          <Link
            href={`/expo/${business.slug}/crm`}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
            <span>CRM Gian Hàng</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/expo/${business.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Xem Trang Khách Quét</span>
          </Link>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-1.5 rounded-lg shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>IN STANDEE (A4 / A5)</span>
          </button>
        </div>
      </div>

      {/* STANDEE BOARD CANVAS (Optimized for table acrylic standee & paper print) */}
      <div className="w-full max-w-[420px] bg-white text-slate-900 rounded-3xl p-8 shadow-2xl border-4 border-amber-500 flex flex-col items-center text-center relative overflow-hidden print:border-none print:shadow-none print:max-w-full print:w-[148mm] print:h-[210mm] print:p-6 print:m-0 print:rounded-none">
        
        {/* Decorative Top Accent */}
        <div className="w-20 h-1.5 bg-amber-500 rounded-full mb-4 print:mb-3" />

        {/* Event Name Tag */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          {profile.event_name}
        </div>

        {/* Booth Location Number */}
        {profile.booth_number && (
          <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-lg text-sm font-mono font-black bg-amber-500/10 text-amber-700 border border-amber-500/30 uppercase tracking-widest mb-4">
            <span>{profile.booth_number}</span>
          </div>
        )}

        {/* Brand Logo & Name */}
        <div className="flex flex-col items-center mb-6">
          {business.logo_url ? (
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white p-1 mb-2 border border-slate-200 shadow-sm">
              <Image
                src={business.logo_url}
                alt={nameVi}
                fill
                unoptimized
                className="object-contain"
                sizes="80px"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-xl bg-amber-500 text-slate-950 font-black text-xl flex items-center justify-center mb-2 shadow-md">
              {nameVi.slice(0, 2).toUpperCase()}
            </div>
          )}
          <h2 className="text-2xl font-black text-slate-950 tracking-tight leading-tight">
            {nameVi}
          </h2>
          {nameEn && nameEn.toLowerCase() !== nameVi.toLowerCase() && (
            <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mt-1">
              {nameEn}
            </p>
          )}
        </div>

        {/* Large Crisp QR Code Frame */}
        <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl shadow-inner mb-6 flex flex-col items-center">
          <QRCodeSVG
            value={boothUrl}
            size={240}
            level="H"
            includeMargin={true}
          />
          <span className="text-[10px] text-slate-500 font-mono mt-1 tracking-wider">
            1booking.asia/expo/{business.slug}
          </span>
        </div>

        {/* 4-Language Call To Action */}
        <div className="space-y-1 w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 mb-4">
          <p className="text-sm font-black text-slate-950 tracking-tight">
            QUÉT MÃ ĐỂ KẾT NỐI & TRAO ĐỔI LIÊN HỆ
          </p>
          <p className="text-xs font-semibold text-slate-700">
            SCAN TO CONNECT & EXCHANGE CONTACT INFO
          </p>
          <div className="text-[11px] text-slate-600 flex items-center justify-center gap-3 pt-1 border-t border-slate-200 mt-1">
            <span>비즈니스 연락처 교환 스캔</span>
            <span>•</span>
            <span>扫码交换名片与商务咨询</span>
          </div>
        </div>

        {/* Standee Footer */}
        <div className="mt-auto pt-3 border-t border-slate-200 w-full flex items-center justify-between text-[10px] text-slate-500 font-medium">
          <span>1Booking Expo Pass</span>
          <span>Số Hóa Gian Hàng Triển Lãm</span>
        </div>
      </div>

      {/* Helpful Hint */}
      <p className="text-xs text-slate-500 mt-6 print:hidden">
        💡 Mẹo: Bấm <b>In Standee</b> và chọn khổ <b>A5 hoặc A4</b> rồi lồng vào mica để bàn tại quầy lễ tân.
      </p>
    </div>
  );
}
