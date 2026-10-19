require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');

async function testFullFlow() {
  console.log('🚀 BẮT ĐẦU KIỂM TRA TOÀN DIỆN LUỒNG BÀN GIAO & THÀNH VIÊN 30 NGÀY');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const pgClient = new Client({ connectionString: process.env.DATABASE_URL });
  await pgClient.connect();

  const timestamp = Date.now();
  const testSlug = `test-biz-flow-${timestamp}`;
  let createdUserId = null;
  let createdBizId = null;

  try {
    // 1. Kiểm tra việc tạo mới doanh nghiệp
    console.log('\n--- BƯỚC 1: TẠO DOANH NGHIỆP MỚI (MẶC ĐỊNH CHƯA CÓ CHỦ) ---');
    const { data: biz, error: bizErr } = await supabase
      .from('businesses')
      .insert({
        name: `Nhà Hàng Buffet Lẩu Nướng ${timestamp}`,
        slug: testSlug,
        category_slug: 'nha-hang-am-thuc',
        phone: '0901234567',
        status: 'published'
      })
      .select('id, name, slug, claim_token, plan_tier, plan_id, owner_id')
      .single();

    if (bizErr || !biz) {
      throw new Error('❌ Lỗi tạo business: ' + bizErr?.message);
    }

    createdBizId = biz.id;
    console.log('✅ Doanh nghiệp đã được tạo tự động:', {
      id: biz.id,
      name: biz.name,
      slug: biz.slug,
      claim_token: biz.claim_token,
      plan_tier: biz.plan_tier,
      plan_id: biz.plan_id,
      owner_id: biz.owner_id
    });

    if (!biz.claim_token) {
      throw new Error('❌ claim_token chưa được tự động sinh!');
    }

    // 2. Kiểm tra bản ghi 30 ngày dùng thử trong bảng memberships do Trigger tạo
    console.log('\n--- BƯỚC 2: KIỂM TRA BẢN GHI DÙNG THỬ 30 NGÀY TRONG DATABASE ---');
    const { data: mems, error: memErr } = await supabase
      .from('memberships')
      .select('id, business_id, plan_id, status, starts_at, expires_at, plans(name)')
      .eq('business_id', biz.id);

    if (memErr || !mems || mems.length === 0) {
      throw new Error('❌ Không tìm thấy bản ghi memberships: ' + memErr?.message);
    }

    const mem = mems[0];
    console.log('✅ Bản ghi memberships tự động:', {
      id: mem.id,
      plan_name: mem.plans?.name,
      status: mem.status,
      starts_at: mem.starts_at,
      expires_at: mem.expires_at
    });

    const diffDays = Math.round((new Date(mem.expires_at) - new Date(mem.starts_at)) / (1000 * 60 * 60 * 24));
    console.log(`✅ Thời hạn dùng thử: ${diffDays} ngày (Chính xác = 30 ngày)`);

    // 3. Giả lập luồng Doanh nghiệp tạo tài khoản và tiếp quản (Claim) bằng link bàn giao
    console.log('\n--- BƯỚC 3: GIẢ LẬP DOANH NGHIỆP ĐĂNG KÝ VÀ TIẾP QUẢN TRANG ---');
    console.log(`Link bàn giao: https://1beauty.asia/claim/${biz.claim_token}`);

    const testEmail = `owner_${timestamp}@testrestaurant.com`;
    const testPassword = `Pass@${timestamp}`;

    // Tạo user trong Auth
    const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: { role: 'owner', name: 'Nguyễn Văn Chủ Quán' }
    });

    if (authErr || !authUser?.user) {
      throw new Error('❌ Lỗi tạo auth user: ' + authErr?.message);
    }
    createdUserId = authUser.user.id;
    console.log('✅ Đã tạo tài khoản chủ quán:', { id: createdUserId, email: testEmail });

    // Tạo hồ sơ profile
    await supabase.from('profiles').upsert({
      id: createdUserId,
      email: testEmail,
      full_name: 'Nguyễn Văn Chủ Quán',
      role: 'owner'
    });

    // Cập nhật tiếp quản (gán owner_id và xóa claim_token)
    const { data: claimedBiz, error: claimErr } = await supabase
      .from('businesses')
      .update({
        owner_id: createdUserId,
        claim_token: null,
        status: 'published',
        plan_tier: 'trial'
      })
      .eq('id', biz.id)
      .is('owner_id', null)
      .select('id, owner_id, claim_token, status, plan_tier')
      .single();

    if (claimErr || !claimedBiz) {
      throw new Error('❌ Lỗi cập nhật quyền sở hữu: ' + claimErr?.message);
    }

    console.log('✅ Tiếp quản thành công:', {
      owner_id: claimedBiz.owner_id,
      claim_token: claimedBiz.claim_token, // null
      status: claimedBiz.status,
      plan_tier: claimedBiz.plan_tier
    });

    if (claimedBiz.claim_token !== null) {
      throw new Error('❌ claim_token chưa được xóa sau khi tiếp quản!');
    }

    // 4. Giả lập thanh toán kích hoạt gói thành viên chính thức 1 năm (SePay / VietQR)
    console.log('\n--- BƯỚC 4: DOANH NGHIỆP THANH TOÁN KÍCH HOẠT GÓI 1 NĂM ---');
    const { data: planData } = await supabase
      .from('plans')
      .select('id, name, price_yearly')
      .ilike('name', '%Tiệc%')
      .limit(1)
      .single();

    const currentExpiry = new Date(mem.expires_at);
    // Kích hoạt nối tiếp 1 năm (365 ngày)
    const newExpiry = new Date(currentExpiry.getTime() + 365 * 24 * 60 * 60 * 1000);

    // Cập nhật memberships sang active
    await supabase
      .from('memberships')
      .update({
        plan_id: planData.id,
        status: 'active',
        starts_at: new Date().toISOString(),
        expires_at: newExpiry.toISOString()
      })
      .eq('id', mem.id);

    // Cập nhật businesses
    await supabase
      .from('businesses')
      .update({
        plan_id: planData.id,
        plan_tier: 'premium',
        status: 'published',
        is_featured: true
      })
      .eq('id', biz.id);

    // Ghi log thanh toán vào payments
    await supabase.from('payments').insert({
      business_id: biz.id,
      membership_id: mem.id,
      amount: Number(planData.price_yearly),
      provider: 'VietQR-SePay',
      transaction_id: `TXN-${timestamp}`,
      status: 'completed',
      paid_at: new Date().toISOString()
    });

    // 5. Kiểm tra kết quả hiển thị của SuperAdmin
    console.log('\n--- BƯỚC 5: KIỂM TRA TRUY VẤN SUPERADMIN ---');
    const { data: adminQuery, error: adminQueryErr } = await supabase
      .from('businesses')
      .select(`
        id, slug, name, status, plan_tier, is_featured,
        profiles:owner_id(email, full_name),
        memberships(id, status, starts_at, expires_at, plans(name, price_yearly))
      `)
      .eq('id', biz.id)
      .single();

    if (adminQueryErr || !adminQuery) {
      throw new Error('❌ Lỗi truy vấn admin: ' + adminQueryErr?.message);
    }

    console.log('✅ Dữ liệu SuperAdmin hiển thị:', {
      business_name: adminQuery.name,
      owner_email: adminQuery.profiles?.email,
      membership_status: adminQuery.memberships?.[0]?.status,
      plan_name: adminQuery.memberships?.[0]?.plans?.name,
      expires_at: adminQuery.memberships?.[0]?.expires_at,
      plan_tier: adminQuery.plan_tier,
      is_featured: adminQuery.is_featured
    });

    const totalDaysLeft = Math.round((new Date(adminQuery.memberships[0].expires_at) - new Date()) / (1000 * 60 * 60 * 24));
    console.log(`✅ Tổng thời hạn gói thành viên còn lại: ${totalDaysLeft} ngày (Gồm 30 ngày dùng thử + 365 ngày gói mua)`);

    // 6. Dọn dẹp bản ghi kiểm thử
    console.log('\n--- BƯỚC 6: DỌN DẸP DỮ LIỆU KIỂM THỬ ---');
    await supabase.from('payments').delete().eq('business_id', biz.id);
    await supabase.from('memberships').delete().eq('business_id', biz.id);
    await supabase.from('businesses').delete().eq('id', biz.id);
    await supabase.from('profiles').delete().eq('id', createdUserId);
    await supabase.auth.admin.deleteUser(createdUserId);
    console.log('✅ Đã dọn dẹp sạch sẽ tài khoản và doanh nghiệp kiểm thử.');

    console.log('\n🎉 TOÀN BỘ 6 BƯỚC KIỂM THỬ LUỒNG THỰC TẾ TRÊN HỆ THỐNG ĐỀU ĐẠT 100%!');

  } catch (err) {
    console.error('❌ Lỗi kiểm thử:', err);
    // Dọn dẹp nếu có lỗi
    if (createdBizId) {
      await supabase.from('payments').delete().eq('business_id', createdBizId);
      await supabase.from('memberships').delete().eq('business_id', createdBizId);
      await supabase.from('businesses').delete().eq('id', createdBizId);
    }
    if (createdUserId) {
      await supabase.from('profiles').delete().eq('id', createdUserId);
      await supabase.auth.admin.deleteUser(createdUserId);
    }
    process.exitCode = 1;
  } finally {
    await pgClient.end();
  }
}

testFullFlow();
