import { notFound } from 'next/navigation';
import { createAdminClient } from '@/utils/supabase/server';
import { ExpoStandeeClient } from './ExpoStandeeClient';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Tải Standee QR | ${slug} - 1Booking Expo Pass`,
    description: 'Tải ảnh Standee mã QR để bàn dạng file PNG độ nét cao cho gian hàng doanh nghiệp.',
  };
}

export default async function ExpoQrStandeePage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createAdminClient();

  // 1. Lấy thông tin gian hàng
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, slug, phone, address, page_content')
    .eq('slug', slug)
    .maybeSingle();

  if (!business) {
    notFound();
  }

  const normalizedBusiness = {
    ...business,
    logo_url: business.page_content?.logo_url || business.page_content?.logo || null,
  };

  // 2. Lấy hồ sơ Expo (bảo mật: không select access_pin gửi về client)
  const { data: expoProfile } = await supabase
    .from('business_expo_profiles')
    .select('id, business_id, event_name, event_name_en, booth_number, company_name_vi, company_name_en')
    .eq('business_id', business.id)
    .maybeSingle();

  const profile = expoProfile || {
    event_name: '1Booking Expo Pass',
    event_name_en: '1Booking Expo Pass',
    booth_number: 'Gian Hàng Tiêu Chuẩn',
  };

  return (
    <ExpoStandeeClient
      business={normalizedBusiness}
      profile={profile}
    />
  );
}
