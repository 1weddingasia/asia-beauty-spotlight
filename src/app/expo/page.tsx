import { createAdminClient } from '@/utils/supabase/server';
import { ExpoHubClient } from './ExpoHubClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '1Booking Expo Pass | Danh Bạ Số Hóa Doanh Nghiệp B2B - SECC',
  description: 'Nền tảng danh bạ số hóa và giải pháp kết nối B2B độc lập tại SECC TP.HCM. Tra cứu vị trí gian hàng, quét mã kết nối, Standee để bàn và CRM Live.',
};

export default async function ExpoHubPage() {
  const supabase = await createAdminClient();

  // 1. Lấy danh sách gian hàng có hồ sơ Expo THẬT (không nạp dữ liệu giả)
  const { data: expoProfiles } = await supabase
    .from('business_expo_profiles')
    .select(`
      id,
      event_name,
      event_name_en,
      booth_number,
      access_pin,
      company_name_vi,
      company_name_en,
      is_active,
      businesses!inner (
        id,
        name,
        slug,
        phone,
        address,
        page_content,
        status,
        is_demo
      )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const expoList: Array<{
    id: string;
    name: string;
    name_vi?: string | null;
    name_en?: string | null;
    slug: string;
    phone: string;
    address?: string | null;
    logo_url?: string | null;
    event_name: string;
    event_name_en?: string | null;
    booth_number: string;
    product_info?: string | null;
    is_demo?: boolean;
  }> = [];

  const seenIds = new Set<string>();

  if (expoProfiles && expoProfiles.length > 0) {
    for (const p of expoProfiles) {
      const b: any = p.businesses;
      if (b && !seenIds.has(b.id)) {
        seenIds.add(b.id);
        expoList.push({
          id: b.id,
          name: b.name,
          name_vi: p.company_name_vi || b.page_content?.name_vi || b.name,
          name_en: p.company_name_en || b.page_content?.name_en || null,
          slug: b.slug,
          phone: b.phone,
          address: b.address,
          logo_url: b.page_content?.logo_url || b.page_content?.logo || null,
          event_name: p.event_name,
          event_name_en: p.event_name_en || null,
          booth_number: p.booth_number,
          product_info: b.page_content?.product_info || b.page_content?.description_vi || b.page_content?.description_en || null,
          is_demo: Boolean(b.is_demo || b.slug === 'deoproce-korea'),
        });
      }
    }
  }

  return <ExpoHubClient initialBooths={expoList} />;
}
