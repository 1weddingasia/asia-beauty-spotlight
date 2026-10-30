import { notFound } from 'next/navigation';
import { createAdminClient } from '@/utils/supabase/server';
import { ExpoCrmClient } from './ExpoCrmClient';
import type { Metadata } from 'next';
import type { ExpoLanguage } from '@/types/expo';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ lang?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Quản Lý Lead Trực Tiếp | ${slug} - 1Booking Expo Pass`,
    description: 'Trang quản trị thu thập danh sách khách hàng và đối tác B2B theo thời gian thực.',
  };
}

export default async function ExpoCrmPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = searchParams ? await searchParams : {};
  const requestedLang = sp.lang && ['vi', 'en', 'ko', 'zh'].includes(sp.lang) ? (sp.lang as ExpoLanguage) : null;

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

  // 2. Lấy hồ sơ Expo (bảo mật: không select access_pin gửi về client)
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
  };

  // 3. Kiểm tra trạng thái kích hoạt bản quyền
  const { data: expoMembership } = await supabase
    .from('memberships')
    .select('id, status, expires_at, plans!inner(plan_type, code)')
    .eq('business_id', business.id)
    .eq('plans.plan_type', 'expo')
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .limit(1)
    .maybeSingle();

  const isActivated = Boolean(expoProfile?.is_active || expoMembership || (business as any).plan_tier === 'vip');

  return (
    <ExpoCrmClient
      business={business}
      profile={profile}
      initialIsActivated={isActivated}
    />
  );
}
