import React from 'react';
import type { Metadata } from 'next';
import { SiteHeader, SiteFooter } from '@/components/site/Layout';
import BangGiaClient from './BangGiaClient';

export const metadata: Metadata = {
  title: 'Bảng Giá Dịch Vụ & Gói Hội Viên Điểm Tiệc VIP 2026 — 1Booking.Asia',
  description:
    'Bảng giá gói thành viên doanh nghiệp và điểm tiệc Tất Niên VIP trên 1Booking.asia. Đăng ký hiển thị top 1, nhận lead tự động qua Telegram, thanh toán quét mã QR kích hoạt tức thời.',
  openGraph: {
    title: 'Bảng Giá & Gói Hội Viên Điểm Tiệc VIP 2026 — 1Booking.Asia',
    description:
      'Gói Tiệc Chuẩn (500k) & Gói VIP Neon (1.000k). Đưa nhà hàng lên Phố Tiệc Tất Niên, quét mã QR kích hoạt tự động 24/7.',
    url: 'https://1booking.asia/bang-gia',
    siteName: '1Booking.asia',
    images: [
      {
        url: 'https://1booking.asia/images/tat-nien-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Bảng Giá Gói Thành Viên 1Booking.Asia',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
};

export default function BangGiaPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <SiteHeader solid={true} />
      <main className="flex-1">
        <BangGiaClient />
      </main>
      <SiteFooter />
    </div>
  );
}
