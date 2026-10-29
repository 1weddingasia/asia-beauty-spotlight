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
    title: `In Standee QR | ${slug} - 1Booking Expo Pass`,
    description: 'Bản in Standee mã QR để bàn cho gian hàng triển lãm.',
  };
}

export default async function ExpoQrPrintPage({ params }: Props) {
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

  // 2. Lấy hồ sơ Expo
  const { data: expoProfile } = await supabase
    .from('business_expo_profiles')
    .select('*')
    .eq('business_id', business.id)
    .maybeSingle();

  const profile = expoProfile || {
    event_name: 'Hội Chợ Triển Lãm Quốc Tế',
    booth_number: 'Gian Hàng Tiêu Chuẩn',
    access_pin: '123456',
  };

  return (
    <ExpoStandeeClient
      business={normalizedBusiness}
      profile={profile}
    />
  );
}
