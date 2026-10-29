import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, pin } = body;

    if (!slug || !pin) {
      return NextResponse.json({ error: 'Thiếu thông tin slug hoặc mã PIN' }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // 1. Tìm doanh nghiệp theo slug
    const { data: business } = await supabase
      .from('businesses')
      .select('id, name, slug, phone, email, logo_url')
      .eq('slug', slug)
      .maybeSingle();

    if (!business) {
      return NextResponse.json({ error: 'Không tìm thấy gian hàng này' }, { status: 404 });
    }

    // 2. Kiểm tra hồ sơ expo & PIN
    const { data: profile } = await supabase
      .from('business_expo_profiles')
      .select('*')
      .eq('business_id', business.id)
      .maybeSingle();

    // Nếu chưa có profile expo, tự động khởi tạo mặc định với PIN = 123456
    let expoProfile = profile;
    if (!expoProfile) {
      const { data: newProfile, error: createErr } = await supabase
        .from('business_expo_profiles')
        .insert({
          business_id: business.id,
          event_name: 'Hội Chợ Triển Lãm Quốc Tế',
          booth_number: 'B01',
          access_pin: '123456',
        })
        .select('*')
        .single();

      if (createErr || !newProfile) {
        return NextResponse.json({ error: 'Không thể khởi tạo hồ sơ triển lãm' }, { status: 500 });
      }
      expoProfile = newProfile;
    }

    // So sánh PIN (hỗ trợ PIN mặc định '123456' hoặc PIN từ CSDL)
    if (expoProfile.access_pin !== pin.trim()) {
      return NextResponse.json({ error: 'Mã PIN không đúng. Vui lòng thử lại!' }, { status: 401 });
    }

    // 3. Lấy danh sách leads
    const { data: leads, error: leadsErr } = await supabase
      .from('business_expo_leads')
      .select('*')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false });

    if (leadsErr) {
      return NextResponse.json({ error: 'Lỗi tải danh sách khách hàng' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      business,
      expoProfile,
      leads: leads || [],
    });
  } catch (err: any) {
    console.error('[Expo CRM Route Error]:', err);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
