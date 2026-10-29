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
    const { data: activeMems, error: memError } = await supabase
      .from('memberships')
      .select('id, status, starts_at, expires_at, plans(code, plan_type, tier, name)')
      .eq('business_id', business.id)
      .eq('status', 'active')
      .lte('starts_at', new Date().toISOString())
      .gt('expires_at', new Date().toISOString());

    if (memError) {
      console.error('[CheckPaymentStatus] Memberships query error:', memError);
      return NextResponse.json({ success: false, error: 'Lỗi truy vấn dữ liệu' }, { status: 500 });
    }

    const partyProfile = Array.isArray(business.business_party_profiles)
      ? business.business_party_profiles[0]
      : business.business_party_profiles;

    const getPlan = (m: any) => (Array.isArray(m.plans) ? m.plans[0] : m.plans);

    const isPartyActive = Boolean(partyProfile?.is_active) || Boolean(activeMems?.some((m: any) => {
      const p = getPlan(m);
      return p?.plan_type === 'party' || p?.name?.includes('Tiệc');
    }));

    const isPartyVip = Boolean(partyProfile?.is_vip) || Boolean(activeMems?.some((m: any) => {
      const p = getPlan(m);
      return (p?.plan_type === 'party' || p?.name?.includes('Tiệc')) && (p?.tier === 'vip' || p?.code === 'tiec_vip');
    }));

    const isDealActive = Boolean(activeMems?.some((m: any) => {
      const p = getPlan(m);
      return p?.plan_type === 'deal' || p?.name?.includes('Ưu Đãi');
    }));

    const isDealVip = Boolean(activeMems?.some((m: any) => {
      const p = getPlan(m);
      return (p?.plan_type === 'deal' || p?.name?.includes('Ưu Đãi')) && (p?.tier === 'vip' || p?.code === 'udai_vip');
    }));

    const isExpoActive = Boolean(activeMems?.some((m: any) => {
      const p = getPlan(m);
      return p?.plan_type === 'expo' || p?.code?.includes('expo');
    }));

    let isExpoYearly = Boolean(activeMems?.some((m: any) => {
      const p = getPlan(m);
      return p?.code === 'expo_pass_yearly';
    }));

    let hasExpoTx = false;
    if (!isExpoActive && business.slug) {
      try {
        const cleanSlug = business.slug.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const rawSlug = business.slug.toUpperCase();
        const { data: tx } = await supabase
          .from('transactions')
          .select('id, transfer_amount, content')
          .or(`content.ilike.%EXPO%${cleanSlug}%,content.ilike.%EXPO%${rawSlug}%`)
          .order('id', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (tx) {
          hasExpoTx = true;
          if (tx.transfer_amount >= 600000 || tx.content?.toUpperCase()?.includes('EXPO365')) {
            isExpoYearly = true;
          }
        }
      } catch (txErr) {
        console.warn('[CheckPaymentStatus] Expo transaction fallback error:', txErr);
      }
    }

    const isPremium = business.plan_tier === 'premium';
    const isActivated = Boolean((activeMems && activeMems.length > 0) || isPartyActive || isPremium || isExpoActive || hasExpoTx);

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
        is_deal_vip: isDealVip,
        is_party_active: isPartyActive,
        is_party_vip: isPartyVip,
        is_expo_active: isExpoActive || hasExpoTx,
        is_expo_yearly: isExpoYearly,
      },
    });
  } catch (err: any) {
    console.error('[CheckPaymentStatus] Exception:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
