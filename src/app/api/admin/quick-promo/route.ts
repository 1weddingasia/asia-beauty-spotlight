import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const { businessId } = await req.json();
    const supabase = await createAdminClient();

    // Lấy thông tin business
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single();

    if (bizError || !business) {
      return NextResponse.json({ error: "Không tìm thấy doanh nghiệp" }, { status: 404 });
    }

    if (business.owner_id) {
      return NextResponse.json({ error: "Doanh nghiệp này đã có chủ sở hữu" }, { status: 400 });
    }

    // Tạo email & pass
    const suffix = Math.floor(100 + Math.random() * 900);
    const email = `${business.slug.substring(0, 15)}_${suffix}@1beauty.asia`;
    const password = Math.random().toString(36).slice(-8) + "1B!";

    // Tạo user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'owner', name: business.name }
    });

    if (authError) {
      return NextResponse.json({ error: "Lỗi tạo tài khoản: " + authError.message }, { status: 500 });
    }

    const userId = authData.user.id;

    // Cập nhật businesses: thêm deal mẫu nếu chưa có
    let page_content = business.page_content || {};
    if (!page_content.deals || page_content.deals.length === 0) {
      page_content.deals = [
        {
          id: `deal-${Date.now()}`,
          title: "Voucher trải nghiệm dịch vụ giảm 50%",
          original_price: "1000000",
          promo_price: "500000",
          badge: "HOT DEAL",
          note: "Áp dụng cho khách hàng mới đến tiệm lần đầu. Vui lòng đặt hẹn trước.",
          status: "active"
        }
      ];
    }

    const { error: updateError } = await supabase
      .from('businesses')
      .update({ owner_id: userId, page_content, status: 'published' })
      .eq('id', businessId);

    if (updateError) {
      return NextResponse.json({ error: "Lỗi cập nhật business: " + updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      account: { email, password },
      promoLink: `/uu-dai/${business.slug}`
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
