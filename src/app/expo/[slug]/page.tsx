import { notFound } from 'next/navigation';
import { createAdminClient } from '@/utils/supabase/server';
import { ExpoBoothClient } from './ExpoBoothClient';
import type { Metadata } from 'next';

import type { ExpoLanguage } from '@/types/expo';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ lang?: string }>;
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

  const desc = business.page_content?.description || `Hồ sơ số hóa và kết nối trực tiếp với ${business.name}. Quét mã QR nhận diện để xem thông tin sản phẩm và liên hệ đối tác.`;

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

export default async function ExpoBoothPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = searchParams ? await searchParams : {};
  const requestedLang = sp.lang && ['vi', 'en', 'ko', 'zh'].includes(sp.lang) ? (sp.lang as ExpoLanguage) : null;

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

  // 2. Lấy thông tin hồ sơ Expo (bảo mật: không select access_pin gửi về client)
  const { data: expoProfile } = await supabase
    .from('business_expo_profiles')
    .select('id, business_id, event_name, event_name_en, booth_number, company_name_vi, company_name_en, languages_enabled, default_language, is_active')
    .eq('business_id', business.id)
    .maybeSingle();

  const profile = {
    id: expoProfile?.id || 'default',
    business_id: business.id,
    event_name: expoProfile?.event_name || '1Booking Expo Pass',
    event_name_en: expoProfile?.event_name_en || '1Booking Expo Pass',
    booth_number: expoProfile?.booth_number || 'Gian Hàng Tiêu Chuẩn',
    languages_enabled: (expoProfile?.languages_enabled as ExpoLanguage[]) || ['vi', 'en', 'ko', 'zh'],
    company_name_vi: expoProfile?.company_name_vi || null,
    company_name_en: expoProfile?.company_name_en || null,
    default_language: requestedLang || (expoProfile?.default_language as ExpoLanguage) || 'vi',
    is_active: expoProfile?.is_active ?? true,
  };

  return (
    <ExpoBoothClient
      business={normalizedBusiness}
      profile={profile}
    />
  );
}
