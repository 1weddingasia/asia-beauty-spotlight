import React from 'react';
import type { Metadata } from 'next';
import { createStaticClient } from '@/utils/supabase/server';
import { PartyDistrictItem } from '@/types/party';
import { getHcmcPartyDistricts } from '@/lib/services/partyLocations';
import DangKyClient from './DangKyClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Đăng Ký Điểm Tiệc Tất Niên 2026 — Phủ Sóng Nhà Hàng Trên Bản Đồ VIP | 1Booking.Asia',
  description:
    'Đăng ký điểm tiệc nhanh chóng chỉ 500.000đ: Đưa nhà hàng lên Bản Đồ Phố Tiệc Tất Niên 2026, tiếp nhận khách đặt tiệc công ty và gia đình tự động tại TP.HCM.',
  alternates: {
    canonical: 'https://1booking.asia/tat-nien/dang-ky',
  },
  openGraph: {
    title: 'Đăng Ký Điểm Tiệc Tất Niên 2026 | 1Booking.Asia',
    description:
      'Ghim nhà hàng lên Bản Đồ Phố Tiệc Tất Niên 2026 với 500.000đ/năm. Đón sóng khách đặt tiệc công ty và đoàn đông cuối năm!',
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

export default async function DangKyPage() {
  const supabase = createStaticClient();
  let districts: PartyDistrictItem[] = [];
  try {
    districts = await getHcmcPartyDistricts(supabase);
  } catch (err) {
    console.error('[DangKyPage] Lỗi lấy danh sách quận:', err);
  }

  return <DangKyClient districts={districts} />;
}

