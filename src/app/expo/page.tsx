import { createAdminClient } from '@/utils/supabase/server';
import { ExpoHubClient } from './ExpoHubClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Danh Bạ Gian Hàng Triển Lãm | 1Booking Expo Pass',
  description: 'Khám phá và kết nối trực tiếp với các thương hiệu, gian hàng tại các kỳ triển lãm quốc tế hàng đầu.',
};

export default async function ExpoHubPage() {
  const supabase = await createAdminClient();

  // 1. Lấy danh sách gian hàng có hồ sơ Expo
  const { data: expoProfiles } = await supabase
    .from('business_expo_profiles')
    .select(`
      id,
      event_name,
      booth_number,
      access_pin,
      is_active,
      businesses!inner (
        id,
        name,
        slug,
        phone,
        address,
        page_content,
        status
      )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  // 2. Lấy thêm một số gian hàng mẫu nếu danh sách expo còn ít để anh demo phong phú
  const { data: sampleBusinesses } = await supabase
    .from('businesses')
    .select('id, name, slug, phone, address, page_content, status')
    .eq('status', 'published')
    .limit(12);

  // Gộp danh sách và tránh trùng lặp
  const expoList: Array<{
    id: string;
    name: string;
    slug: string;
    phone: string;
    address?: string | null;
    logo_url?: string | null;
    event_name: string;
    booth_number: string;
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
          slug: b.slug,
          phone: b.phone,
          address: b.address,
          logo_url: b.page_content?.logo_url || b.page_content?.logo || null,
          event_name: p.event_name,
          booth_number: p.booth_number,
        });
      }
    }
  }

  // Bổ sung sample businesses gán mặc định profile expo
  if (sampleBusinesses) {
    let index = 1;
    for (const b of sampleBusinesses) {
      if (!seenIds.has(b.id)) {
        seenIds.add(b.id);
        expoList.push({
          id: b.id,
          name: b.name,
          slug: b.slug,
          phone: b.phone,
          address: b.address,
          logo_url: b.page_content?.logo_url || b.page_content?.logo || null,
          event_name: 'Triển Lãm Quốc Tế 2026',
          booth_number: `A-${String(index).padStart(2, '0')}`,
        });
        index++;
      }
    }
  }

  return <ExpoHubClient initialBooths={expoList} />;
}
