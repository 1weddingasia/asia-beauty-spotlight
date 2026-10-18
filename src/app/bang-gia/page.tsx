import React from 'react';
import type { Metadata } from 'next';
import { SiteHeader, SiteFooter } from '@/components/site/Layout';
import BangGiaClient from './BangGiaClient';
import { createStaticClient } from '@/utils/supabase/server';

export const revalidate = 60; // Luôn làm mới sau 60s để cập nhật ngay khi Superadmin đổi giá trong /admin/plans

export const metadata: Metadata = {
  title: 'Bảng Giá Gói Thành Viên: Trang Ưu Đãi & Trang Đặt Tiệc — 1Booking.Asia',
  description:
    'Bảng giá 2 gói hội viên chính thức trên 1Booking.asia: Gói Trang Ưu Đãi (1.5tr/năm) giao diện chuẩn sang trọng toàn nền tảng và Gói Trang Đặt Tiệc (500k/năm) phong cách xanh dương tối trên Bản Đồ Phố Tiệc.',
  openGraph: {
    title: 'Bảng Giá Gói Thành Viên Doanh Nghiệp — 1Booking.Asia',
    description:
      'Gói Trang Ưu Đãi (1.500k/năm) & Gói Trang Đặt Tiệc (500k/năm). Tự động kích hoạt bằng mã VietQR 24/7.',
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

export default async function BangGiaPage() {
  const supabase = createStaticClient();
  let plans: any[] = [];
  try {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('price_yearly', { ascending: false });

    if (error) {
      console.error('[BangGiaPage] Lỗi lấy gói từ DB:', error);
      plans = [];
    } else {
      plans = data || [];
    }
  } catch (err) {
    console.error('[BangGiaPage] Ngoại lệ kết nối DB:', err);
    plans = [];
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <SiteHeader solid={true} />
      <main className="flex-1">
        <BangGiaClient initialPlans={plans} />
      </main>
      <SiteFooter />
    </div>
  );
}
