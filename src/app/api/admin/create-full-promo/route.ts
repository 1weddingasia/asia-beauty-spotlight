import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      email, 
      password, 
      name, 
      slug, 
      address, 
      phone, 
      logo_url, 
      banners, 
      deals, 
      services,
      short_description,
      facebook,
      hours
    } = body;

    if (!email || !password || !name || !slug) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc (Email, Password, Tên, Đường dẫn)" }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // 1. Kiểm tra slug đã tồn tại chưa
    const { data: existingBiz } = await supabase
      .from('businesses')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingBiz) {
      return NextResponse.json({ error: "Đường dẫn (slug) này đã tồn tại, vui lòng chọn đường dẫn khác." }, { status: 400 });
    }

    // 2. Tạo User Account
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'owner', name }
    });

    if (authError) {
      return NextResponse.json({ error: "Lỗi tạo tài khoản: " + authError.message }, { status: 500 });
    }

    const userId = authData.user.id;

    // 3. Chuẩn bị page_content
    const page_content = {
      phone,
      logo_url,
      banners: Array.isArray(banners) ? banners : [],
      deals: deals || [],
      services: services || []
    };

    // Chuẩn bị socials
    const socials = facebook ? { facebook } : {};

    // 4. Tạo Business Record
    const { data: newBiz, error: createError } = await supabase
      .from('businesses')
      .insert({
        name,
        slug,
        address,
        phone, // Ensure phone is saved to root
        logo_url,
        short_description: short_description || '',
        description: short_description || '', // Fallback description to short_description for quick builder
        hours: hours || '9:00 - 20:00 (T2-CN)',
        socials,
        owner_id: userId,
        page_content,
        status: 'published'
      })
      .select()
      .single();

    if (createError) {
      // Nếu lỗi tạo business, cân nhắc việc xóa user vừa tạo (rollback)
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: "Lỗi tạo thông tin doanh nghiệp: " + createError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      business: newBiz,
      promoLink: `/${slug}`
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
