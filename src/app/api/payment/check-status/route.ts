import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, slug } = body;

    if (!phone && !slug) {
      return NextResponse.json({ success: false, error: 'Thiếu số điện thoại hoặc slug doanh nghiệp' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Tìm doanh nghiệp theo phone hoặc slug
    let query = supabase.from('businesses').select(`
      id,
      name,
      slug,
      phone,
      plan_tier,
      is_featured,
      business_party_profiles (
        is_active,
        is_vip
      )
    `);

    if (slug) {
      query = query.eq('slug', slug.toLowerCase().trim());
    } else if (phone) {
      query = query.eq('phone', phone.trim());
    }

    const { data: business, error } = await query.maybeSingle();

    if (error) {
      console.error('[CheckPaymentStatus] Query error:', error);
      return NextResponse.json({ success: false, error: 'Lỗi truy vấn dữ liệu' }, { status: 500 });
    }

    if (!business) {
      // Kiểm tra trong bảng transactions xem đã nhận tiền chưa
      const cleanPhone = phone?.trim();
      if (cleanPhone) {
        const { data: tx } = await supabase
          .from('transactions')
          .select('*')
          .ilike('content', `%${cleanPhone}%`)
          .order('id', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (tx) {
          return NextResponse.json({
            success: true,
            activated: true,
            hasTransaction: true,
            amount: tx.transfer_amount,
            message: 'Đã nhận thanh toán thành công!',
          });
        }
      }

      return NextResponse.json({
        success: true,
        activated: false,
        message: 'Chưa tìm thấy thông tin kích hoạt',
      });
    }

    // 2. Kiểm tra trạng thái kích hoạt gói
    const partyProfile = Array.isArray(business.business_party_profiles)
      ? business.business_party_profiles[0]
      : business.business_party_profiles;

    const isPartyActive = Boolean(partyProfile?.is_active);
    const isPartyVip = Boolean(partyProfile?.is_vip);
    const isPremium = business.plan_tier === 'premium';

    return NextResponse.json({
      success: true,
      activated: isPartyActive || isPremium,
      business: {
        id: business.id,
        name: business.name,
        slug: business.slug,
        plan_tier: business.plan_tier,
        is_party_active: isPartyActive,
        is_party_vip: isPartyVip,
      },
    });
  } catch (err: any) {
    console.error('[CheckPaymentStatus] Exception:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
