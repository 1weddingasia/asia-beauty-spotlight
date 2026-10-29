import { notFound } from 'next/navigation';
import { createAdminClient } from '@/utils/supabase/server';
import { ExpoBoothClient } from './ExpoBoothClient';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createAdminClient();

  const { data: business } = await supabase
    .from('businesses')
    .select('name, address, page_content')
    .eq('slug', slug)
    .maybeSingle();

  if (!business) {
    return {
      title: '1Booking Expo Pass | Gian hàng số',
      description: 'Số hóa gian hàng triển lãm & Thu thập thông tin khách hàng thông minh.',
    };
  }

  const desc = business.page_content?.description || `Chào mừng quý khách đến với gian hàng ${business.name} tại triển lãm. Quét mã QR để nhận catalogue & ưu đãi.`;

  return {
    title: `${business.name} | 1Booking Expo Pass`,
    description: desc,
    openGraph: {
      title: `${business.name} | 1Booking Expo Pass`,
      description: desc,
      type: 'website',
    },
  };
}

export default async function ExpoBoothPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createAdminClient();

  // 1. Lấy thông tin gian hàng
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, slug, phone, email, address, website, page_content, category_slug')
    .eq('slug', slug)
    .maybeSingle();

  if (!business) {
    notFound();
  }

  const normalizedBusiness = {
    ...business,
    logo_url: business.page_content?.logo_url || business.page_content?.logo || null,
    banner_url: business.page_content?.banner_url || null,
  };

  // 2. Lấy thông tin hồ sơ Expo
  const { data: expoProfile } = await supabase
    .from('business_expo_profiles')
    .select('*')
    .eq('business_id', business.id)
    .maybeSingle();

  const profile = expoProfile || {
    id: 'default',
    business_id: business.id,
    event_name: 'Hội Chợ Triển Lãm Quốc Tế',
    booth_number: 'Gian Hàng Tiêu Chuẩn',
    access_pin: '123456',
    languages_enabled: ['vi', 'en', 'ko', 'zh'],
    default_language: 'vi',
    lead_gift_title: {
      vi: 'Nhận Catalogue & Ưu Đãi Gian Hàng',
      en: 'Get Catalogue & Booth Offers',
      ko: '카탈로그 및 부스 혜택 받기',
      zh: '获取产品目录与展位优惠',
    },
    is_active: true,
  };

  return (
    <ExpoBoothClient
      business={normalizedBusiness}
      profile={profile}
    />
  );
}
