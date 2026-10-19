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

    const { data: business, error } = await query
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

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

    // 2. Kiểm tra trạng thái kích hoạt gói từ bảng memberships và party profiles
    const { data: activeMems } = await supabase
      .from('memberships')
      .select('id, status, starts_at, expires_at, plans(code, plan_type, tier, name)')
      .eq('business_id', business.id)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString());

    const partyProfile = Array.isArray(business.business_party_profiles)
      ? business.business_party_profiles[0]
      : business.business_party_profiles;

    const isPartyActive = Boolean(partyProfile?.is_active) || activeMems?.some((m: any) => m.plans?.plan_type === 'party');
    const isPartyVip = Boolean(partyProfile?.is_vip) || activeMems?.some((m: any) => m.plans?.plan_type === 'party' && m.plans?.tier === 'vip');
    const isDealActive = activeMems?.some((m: any) => m.plans?.plan_type === 'deal');
    const isPremium = business.plan_tier === 'premium';
    const isActivated = Boolean((activeMems && activeMems.length > 0) || isPartyActive || isPremium);

    return NextResponse.json({
      success: true,
      activated: isActivated,
      membershipsCount: activeMems?.length || 0,
      business: {
        id: business.id,
        name: business.name,
        slug: business.slug,
        plan_tier: business.plan_tier,
        is_deal_active: isDealActive,
        is_party_active: isPartyActive,
        is_party_vip: isPartyVip,
      },
    });
  } catch (err: any) {
    console.error('[CheckPaymentStatus] Exception:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
