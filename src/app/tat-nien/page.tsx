import React from 'react';
import type { Metadata } from 'next';
import { createStaticClient } from '@/utils/supabase/server';
import { PartyVenue } from '@/types/party';
import { getHcmcPartyDistricts } from '@/lib/services/partyLocations';
import TatNienClient from './TatNienClient';

// 📱 TỐI ƯU OPENGRAPH HIỂN THỊ TRÊN ZALO & FACEBOOK (VIRAL MARKETING)
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Phố Tiệc Tất Niên 2026 — Bản Đồ Chọn Quán Tiệc Tất Niên & Year-End Party VIP',
    description:
      'Bản đồ trực quan khám phá các nhà hàng tiệc tất niên hàng đầu: Lọc phòng VIP riêng, sức chứa 15-500 khách, ưu đãi tặng bia & karaoke. Giữ chỗ tiệc công ty ngay!',
    keywords: [
      'tiệc tất niên',
      'đặt tiệc tất niên',
      'nhà hàng tất niên',
      'phòng vip tất niên',
      'year end party',
      'tiệc công ty cuối năm',
      '1booking',
    ],
    openGraph: {
      title: 'Phố Tiệc Tất Niên 2026 — Đặt Bàn Tiệc Công Ty & Gia Đình VIP',
      description:
        'Tìm quán tiệc tất niên trong 1 chạm: Phòng VIP kín đáo, tặng gói âm thanh & bia tiệc. Xem menu & nhận ưu đãi độc quyền ngay!',
      url: 'https://1booking.asia/tat-nien',
      siteName: '1Booking.asia',
      images: [
        {
          url: 'https://1booking.asia/images/tat-nien-og.jpg',
          width: 1200,
          height: 630,
          alt: 'Phố Tiệc Tất Niên 1Booking.asia',
        },
      ],
      locale: 'vi_VN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Phố Tiệc Tất Niên 2026 — 1Booking.asia',
      description: 'Bản đồ trực quan tìm sảnh tiệc tất niên sang trọng, ưu đãi bia và karaoke.',
    },
  };
}

// Tối ưu hóa tải trang cực nhanh với ISR revalidate 30 giây (phục vụ hàng nghìn lượt truy cập đồng thời trên di động mượt mà)
export const revalidate = 30;

export default async function TatNienPage() {
  const supabase = createStaticClient();

  // 1. 🔗 CÚ PHÁP POSTGREST JOIN CHUẨN: Dùng !inner để chỉ lấy quán ĐÃ CÓ hồ sơ tiệc đang active
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select(`
      id,
      slug,
      name,
      address,
      phone,
      zalo,
      map_coordinates,
      page_content,
      plan_tier,
      status,
      category_slug,
      location_slug,
      business_party_profiles!inner (
        min_guests,
        max_guests,
        num_vip_rooms,
        price_min,
        price_max,
        spaces_and_amenities,
        cuisines,
        party_perks,
        party_deal_highlight,
        party_description,
        party_banner_url,
        party_gallery,
        set_menus,
        party_menu_url,
        party_halls,
        party_specifications,
        is_vip,
        is_active
      )
    `)
    .in('status', ['published', 'active'])
    .eq('business_party_profiles.is_active', true);

  if (error) {
    console.error('[TatNienPage] Lỗi truy vấn danh sách tiệc:', error);
  }

  // 2. 📍 TRUY VẤN DANH SÁCH QUẬN / HUYỆN TỪ DATABASE THẬT (directory_locations)
  const districts = await getHcmcPartyDistricts(supabase);

  // Chuyển đổi dữ liệu chuẩn hóa
  const venues: PartyVenue[] = (businesses || []).map((b: any) => {
    const profile = Array.isArray(b.business_party_profiles)
      ? b.business_party_profiles[0]
      : b.business_party_profiles;

    return {
      id: b.id,
      slug: b.slug,
      name: b.name,
      address: b.address,
      phone: b.phone,
      zalo: b.zalo,
      map_coordinates: b.map_coordinates,
      page_content: b.page_content || {},
      plan_tier: b.plan_tier,
      status: b.status,
      category_slug: b.category_slug,
      location_slug: b.location_slug || null,
      min_guests: profile?.min_guests ?? 10,
      max_guests: profile?.max_guests ?? 200,
      num_vip_rooms: profile?.num_vip_rooms ?? 0,
      price_min: profile?.price_min ?? 200000,
      price_max: profile?.price_max ?? 1000000,
      spaces_and_amenities: profile?.spaces_and_amenities ?? [],
      cuisines: profile?.cuisines ?? [],
      party_perks: profile?.party_perks ?? [],
      party_description: profile?.party_description ?? null,
      party_deal_highlight: profile?.party_deal_highlight ?? null,
      party_banner_url: profile?.party_banner_url ?? null,
      party_gallery: profile?.party_gallery ?? [],
      set_menus: profile?.set_menus ?? [],
      party_menu_url: profile?.party_menu_url ?? null,
      party_halls: profile?.party_halls ?? [],
      party_specifications: profile?.party_specifications ?? [],
      is_vip: Boolean(profile?.is_vip),
      is_active: Boolean(profile?.is_active),
    };
  });

  return <TatNienClient initialVenues={venues} initialDistricts={districts} />;
}
