"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { Download, ArrowLeft, BarChart3, ExternalLink, Sparkles, Loader2, Printer, Share2, X } from 'lucide-react';
import { toast } from 'sonner';
import { getExpoBrandName, formatStandeeBrandName, getStoredExpoLanguage, type ExpoLanguage } from '@/types/expo';

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

function getTitleSizeClass(text: string): string {
  if (text.length > 30) return 'text-lg sm:text-xl';
  if (text.length > 18) return 'text-xl sm:text-2xl';
  return 'text-2xl sm:text-3xl';
}

export function ExpoStandeeClient({ business, profile }: Props) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lang, setLang] = useState<ExpoLanguage>('vi');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const standeeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const current = getStoredExpoLanguage('vi');
    setLang(current);
  }, []);

  const nameVi = getExpoBrandName(business, profile, 'vi');
  const nameEn = getExpoBrandName(business, profile, 'en');
  const brand = formatStandeeBrandName(nameVi, nameEn);
  const titleSizeClass = getTitleSizeClass(brand.primary);

  const boothUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/expo/${business.slug}`
    : `https://1booking.asia/expo/${business.slug}`;

  // Kích hoạt in ấn trực tiếp / Lưu PDF qua trình duyệt
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // Hàm chuyển Data URL sang Blob an toàn
  const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
    const res = await fetch(dataUrl);
    return await res.blob();
  };

  // Kích hoạt tải file bằng Blob URL (hoạt động tốt trên Chrome, Safari, Edge, Firefox)
  const triggerBlobDownload = (blob: Blob) => {
    const fileName = `Standee-${business.slug || 'expo'}-1booking.png`;
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  };

  // Tạo ảnh Standee chất lượng cao
  const generateImage = async (): Promise<{ dataUrl: string; blob: Blob; file: File } | null> => {
    const node = standeeRef.current;
    if (!node) return null;
    const fileName = `Standee-${business.slug || 'expo'}-1booking.png`;

    const pixelRatio = typeof window !== 'undefined' && window.devicePixelRatio && window.devicePixelRatio > 2 
      ? 2.5 
      : 3;

    try {
      // 1. Thử dùng html-to-image
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(node, {
        quality: 1,
        pixelRatio,
        cacheBust: true,
        backgroundColor: '#ffffff',
      });
      const blob = await dataUrlToBlob(dataUrl);
      const file = new File([blob], fileName, { type: 'image/png' });
      return { dataUrl, blob, file };
    } catch (err) {
      console.warn('[html-to-image failed, trying html2canvas fallback]:', err);
      try {
        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(node, {
          scale: pixelRatio,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
        });
        const dataUrl = canvas.toDataURL('image/png');
        const blob = await dataUrlToBlob(dataUrl);
        const file = new File([blob], fileName, { type: 'image/png' });
        return { dataUrl, blob, file };
      } catch (fallbackErr) {
        console.error('[html2canvas fallback failed]:', fallbackErr);
        return null;
      }
    }
  };

  // Xử lý nút: TẢI ẢNH STANDEE / CHIA SẺ
  const handleProcessStandee = async (action: 'download' | 'share') => {
    if (isProcessing) return;
    setIsProcessing(true);
    const toastId = toast.loading('Đang chuẩn bị ảnh Standee sắc nét...');

    try {
      const result = await generateImage();
      if (!result) {
        toast.error('Không thể tạo ảnh Standee. Bạn có thể dùng nút [In / Lưu PDF] để xuất file trực tiếp!', { id: toastId });
        return;
      }

      setPreviewUrl(result.dataUrl);
      setPreviewBlob(result.blob);

      // Nếu người dùng chọn chia sẻ và trình duyệt hỗ trợ Web Share API (đặc biệt trên iOS/Android)
      if (action === 'share' && typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [result.file] })) {
        try {
          await navigator.share({
            title: `Standee Doanh Nghiệp ${brand.primary}`,
            text: `Mã QR Standee ${brand.primary} - 1Booking Digital Pass`,
            files: [result.file],
          });
          toast.success('Đã mở menu chia sẻ!', { id: toastId });
          return;
        } catch (shareErr: any) {
          if (shareErr.name === 'AbortError') {
            toast.dismiss(toastId);
            return;
          }
          console.warn('[navigator.share error]:', shareErr);
        }
      }

      // Tự động kích hoạt tải về máy
      triggerBlobDownload(result.blob);
      toast.success('Đã tải ảnh Standee!', { id: toastId });

      // Mở modal xem trước để người dùng điện thoại chạm giữ lưu ảnh hoặc gửi Zalo
      setIsPreviewOpen(true);
    } catch (e: any) {
      console.error('[handleProcessStandee Error]:', e);
      toast.error('Có lỗi xảy ra. Vui lòng bấm [In / Lưu PDF] để in hoặc lưu file!', { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  // Chia sẻ từ trong Modal
  const handleShareFromModal = async () => {
    if (!previewBlob) return;
    const fileName = `Standee-${business.slug || 'expo'}-1booking.png`;
    const file = new File([previewBlob], fileName, { type: 'image/png' });

    if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: `Standee Doanh Nghiệp ${brand.primary}`,
          text: `Mã QR Standee ${brand.primary} - 1Booking Digital Pass`,
          files: [file],
        });
        return;
      } catch (shareErr: any) {
        if (shareErr.name === 'AbortError') return;
      }
    }

    // Fallback: Tải file
    triggerBlobDownload(previewBlob);
    toast.success('Đã lưu file Standee vào thiết bị!');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start py-8 px-4 font-sans print:p-0 print:bg-white print:text-black">
      {/* ACTION BAR (Ẩn khi in ấn) */}
      <div className="max-w-xl w-full flex flex-col sm:flex-row items-center justify-between mb-8 print:hidden gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <Link
            href={`/expo?lang=${lang}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Về Danh Bạ</span>
          </Link>
          <Link
            href={`/expo/${business.slug}/crm?lang=${lang}`}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Quản Trị CRM</span>
          </Link>
          <Link
            href={`/expo/${business.slug}?lang=${lang}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-300 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Trang Quét</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Nút: IN / LƯU PDF */}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-sm"
            title="In trực tiếp hoặc Lưu file PDF"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>In / Lưu PDF</span>
          </button>

          {/* Nút: CHIA SẺ */}
          <button
            type="button"
            onClick={() => handleProcessStandee('share')}
            disabled={isProcessing}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 px-3.5 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-60 shadow-sm"
            title="Chia sẻ qua Zalo, AirDrop hoặc mạng xã hội"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Chia Sẻ</span>
          </button>

          {/* Nút: TẢI ẢNH STANDEE */}
          <button
            type="button"
            onClick={() => handleProcessStandee('download')}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-60"
            title="Tải ảnh Standee chất lượng cao"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>TẢI ẢNH</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* STANDEE BOARD CANVAS (Khung bảng Standee để bàn hoặc in decal/mica) */}
      <div 
        ref={standeeRef}
        className="w-full max-w-[420px] bg-white text-slate-900 rounded-3xl p-7 sm:p-8 shadow-2xl border-4 border-amber-500 flex flex-col items-center text-center relative overflow-hidden print:border-none print:shadow-none print:max-w-full print:w-[148mm] print:h-[210mm] print:p-6 print:m-0 print:rounded-none"
      >
        
        {/* Decorative Top Accent */}
        <div className="w-20 h-1.5 bg-amber-500 rounded-full mb-3.5 print:mb-3" />

        {/* Brand Tag - Nhận diện chung vĩnh viễn, không gắn riêng hội chợ đơn lẻ */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 uppercase tracking-wider mb-4 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          1Booking Digital Pass
        </div>

        {/* Brand Logo & Name - Tách tên Brand chính & tên pháp nhân phụ, chống nhảy dòng thô */}
        <div className="flex flex-col items-center mb-5 w-full">
          {business.logo_url && !logoFailed ? (
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-white p-2 mb-3 border border-slate-200 shadow-sm flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={business.logo_url}
                alt={brand.primary}
                onError={() => setLogoFailed(true)}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 text-slate-950 font-black text-2xl flex items-center justify-center mb-3 shadow-md border-2 border-white ring-2 ring-amber-500/20">
              {brand.primary.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() || '1B'}
            </div>
          )}

          <h2 className={`${titleSizeClass} font-black text-slate-950 tracking-tight leading-snug [text-wrap:balance] max-w-[340px] mx-auto`}>
            {brand.primary}
          </h2>

          {brand.secondary && (
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1 [text-wrap:balance] max-w-[320px] mx-auto">
              {brand.secondary}
            </p>
          )}
        </div>

        {/* Large Crisp QR Code Frame */}
        <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-3xl shadow-inner mb-4 flex flex-col items-center">
          <QRCodeSVG
            value={boothUrl}
            size={220}
            level="H"
            includeMargin={true}
          />
          <div className="mt-2.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-[10px] text-slate-600 font-mono shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="font-semibold text-slate-800 tracking-wide">1booking.asia</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">Quét để kết nối</span>
          </div>
        </div>

        {/* 4-Language Call To Action - Tinh chỉnh câu chữ vừa khít 1 dòng, không bị ngắt dòng thô */}
        <div className="w-full bg-slate-50/90 border border-slate-200 rounded-2xl py-3 px-4 mb-4 text-center">
          <p className="text-sm font-black text-slate-950 tracking-tight [text-wrap:balance] uppercase">
            Quét Mã Để Kết Nối Trực Tiếp
          </p>
          <p className="text-xs font-semibold text-slate-700 tracking-normal mt-0.5 [text-wrap:balance]">
            Scan to Connect & Explore Products
          </p>
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-center gap-2 pt-2 border-t border-slate-200/80 mt-2 whitespace-nowrap">
            <span>비즈니스 연락처 교환</span>
            <span className="text-slate-300">•</span>
            <span>扫码交换名片与咨询</span>
          </div>
        </div>

        {/* Standee Footer - Không từ ngữ gian hàng, dùng vĩnh viễn mọi sự kiện */}
        <div className="mt-auto pt-3 border-t border-slate-200/80 w-full flex items-center justify-center gap-2 text-[10px] text-slate-500 font-medium whitespace-nowrap">
          <span className="font-bold text-slate-800 tracking-wider uppercase">1Booking</span>
          <span className="text-slate-300">•</span>
          <span>Nền Tảng Số Hóa Kết Nối Doanh Nghiệp</span>
        </div>
      </div>

      {/* PREVIEW & MOBILE SAVE MODAL */}
      {isPreviewOpen && previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 print:hidden">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">🖼️</span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Ảnh Standee Doanh Nghiệp</h3>
                  <p className="text-[11px] text-slate-400">Đã tạo xong file ảnh PNG độ nét cao</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsPreviewOpen(false);
                  setPreviewUrl(null);
                  setPreviewBlob(null);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Long Press Tip */}
            <div className="mb-3 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-center gap-2">
              <span className="text-base shrink-0">💡</span>
              <p className="leading-snug">
                <b>Trên điện thoại:</b> Chạm và giữ ngón tay vào ảnh bên dưới 1 giây để chọn <b>&ldquo;Lưu vào Ảnh&rdquo;</b> hoặc <b>&ldquo;Chia sẻ qua Zalo&rdquo;</b>.
              </p>
            </div>

            {/* Image Preview Container */}
            <div className="flex-1 overflow-y-auto min-h-0 flex items-center justify-center bg-slate-950/80 p-2 rounded-2xl border border-slate-800/80 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Standee Preview"
                className="max-h-[50vh] w-auto rounded-xl object-contain shadow-lg"
              />
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleShareFromModal}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Chia Sẻ / Lưu</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (previewBlob) triggerBlobDownload(previewBlob);
                }}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải File PNG</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>In / Lưu PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
