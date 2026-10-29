"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer, ArrowLeft, BarChart3, ExternalLink, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
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
  const [isDownloading, setIsDownloading] = useState(false);
  const standeeRef = useRef<HTMLDivElement>(null);

  const nameVi = getExpoBrandName(business, profile, 'vi');
  const nameEn = getExpoBrandName(business, profile, 'en');

  const boothUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/expo/${business.slug}`
    : `https://1booking.asia/expo/${business.slug}`;

  const triggerDownload = (dataUrl: string) => {
    const fileName = `Standee-${business.slug || 'expo'}-1booking-pass.png`;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Tải ảnh Standee độ phân giải cao để mang đi in ấn
  const handleDownloadImage = async () => {
    if (!standeeRef.current) return;
    setIsDownloading(true);
    const toastId = toast.loading('Đang xử lý xuất ảnh Standee độ nét cao (A4/A5)...');

    try {
      // 1. Thử dùng html-to-image (pixelRatio 4 cho độ phân giải siêu nét chuẩn in ấn 300 DPI)
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(standeeRef.current, {
        quality: 1,
        pixelRatio: 4,
        cacheBust: true,
        backgroundColor: '#ffffff',
      });

      triggerDownload(dataUrl);
      toast.success('Đã tải ảnh Standee thành công! Bạn có thể mang file này đi in.', {
        id: toastId,
      });
    } catch {
      try {
        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(standeeRef.current, {
          scale: 4,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
        });

        triggerDownload(canvas.toDataURL('image/png'));
        toast.success('Đã tải ảnh Standee thành công! Bạn có thể mang file này đi in.', {
          id: toastId,
        });
      } catch {
        toast.error('Không thể xuất ảnh tự động. Vui lòng thử lại hoặc chụp màn hình.', {
          id: toastId,
        });
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start py-8 px-4 font-sans print:p-0 print:bg-white print:text-black">
      {/* ACTION BAR (Ẩn khi in ấn) */}
      <div className="max-w-xl w-full flex items-center justify-between mb-8 print:hidden gap-2">
        <div className="flex items-center gap-2">
          <Link
            href="/expo"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Về Expo</span>
          </Link>
          <Link
            href={`/expo/${business.slug}/crm`}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">CRM Gian Hàng</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/expo/${business.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Trang Khách Quét</span>
          </Link>

          {/* Nút chính: TẢI ẢNH STANDEE ĐỂ MANG ĐI IN */}
          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-60"
            title="Tải ảnh Standee chất lượng cao để mang đi in ấn"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xử lý ảnh...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>TẢI ẢNH STANDEE (ĐỂ IN)</span>
              </>
            )}
          </button>

          {/* Nút phụ: In trực tiếp nếu có máy in kết nối sẵn */}
          <button
            type="button"
            onClick={() => window.print()}
            title="In trực tiếp ra máy in"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">In ngay</span>
          </button>
        </div>
      </div>

      {/* STANDEE BOARD CANVAS (Khung bảng Standee để bàn hoặc in decal/mica) */}
      <div 
        ref={standeeRef}
        className="w-full max-w-[420px] bg-white text-slate-900 rounded-3xl p-8 shadow-2xl border-4 border-amber-500 flex flex-col items-center text-center relative overflow-hidden print:border-none print:shadow-none print:max-w-full print:w-[148mm] print:h-[210mm] print:p-6 print:m-0 print:rounded-none"
      >
        
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
      <div className="max-w-md text-center mt-6 text-xs text-slate-400 space-y-1 print:hidden">
        <p>
          💡 <b>Mẹo in ấn:</b> Bấm nút <b>Tải Ảnh Standee (Để In)</b> để lưu file ảnh chất lượng cao (300 DPI).
        </p>
        <p className="text-slate-500 text-[11px]">
          Bạn có thể gửi file ảnh qua Zalo/Email cho xưởng in chọn in màu khổ <b>A5 (chuẩn để bàn)</b> hoặc <b>A4</b>, sau đó lồng vào khung mica đặt tại quầy lễ tân gian hàng.
        </p>
      </div>
    </div>
  );
}
