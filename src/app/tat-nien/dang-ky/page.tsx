import React from 'react';
import type { Metadata } from 'next';
import DangKyClient from './DangKyClient';

export const metadata: Metadata = {
  title: 'Đăng Ký Điểm Tiệc Tất Niên 2026 — Phủ Sóng Nhà Hàng Trên Bản Đồ VIP | 1Booking.Asia',
  description:
    'Đăng ký điểm tiệc siêu tốc chỉ 500k: Ghim quán tiệc lên Bản đồ 2.5D Phố Tiệc Tất Niên 2026, nhận chuông Telegram tự động khi khách đặt bàn, tiếp cận hàng nghìn công ty tại TP.HCM.',
  alternates: {
    canonical: 'https://1booking.asia/tat-nien/dang-ky',
  },
  openGraph: {
    title: 'Đăng Ký Điểm Tiệc Tất Niên 2026 | 1Booking.Asia',
    description:
      'Ghim quán tiệc lên Bản đồ 2.5D Phố Tiệc Tất Niên 2026 chỉ với 500.000đ. Nhận khách đặt tiệc công ty tự động qua Telegram!',
    url: 'https://1booking.asia/tat-nien/dang-ky',
    type: 'website',
    images: [
      {
        url: 'https://1booking.asia/images/demo/nha-hang/que-nha-banquet-luxury.jpg',
        width: 1200,
        height: 630,
        alt: 'Đăng Ký Điểm Tiệc Tất Niên 2026',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function DangKyPage() {
  return <DangKyClient />;
}
