import { notFound } from 'next/navigation';
import { createAdminClient } from '@/utils/supabase/server';
import { ExpoCrmClient } from './ExpoCrmClient';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Quản Lý Lead Trực Tiếp | ${slug} - 1Booking Expo Pass`,
    description: 'Trang quản trị thu thập danh sách khách tham quan triển lãm theo thời gian thực.',
  };
}

export default async function ExpoCrmPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createAdminClient();

  // 1. Lấy thông tin gian hàng
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, slug, phone, email, address, page_content, is_demo')
    .eq('slug', slug)
    .maybeSingle();

  if (!business) {
    notFound();
  }

  // 2. Lấy hồ sơ Expo
  const { data: expoProfile } = await supabase
    .from('business_expo_profiles')
    .select('*')
    .eq('business_id', business.id)
    .maybeSingle();

  const profile = expoProfile || {
    id: 'default',
    business_id: business.id,
    event_name: '1Booking Expo Pass • Triển Lãm Quốc Tế',
    event_name_en: '1Booking Expo Pass • International Expo',
    booth_number: 'Gian Hàng Tiêu Chuẩn',
    access_pin: '123456',
  };

  return (
    <ExpoCrmClient
      business={business}
      profile={profile}
    />
  );
}
