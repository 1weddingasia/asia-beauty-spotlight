require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { createClient } = require('@supabase/supabase-js');

async function runTest() {
  console.log("=== BẮT ĐẦU KIỂM TRA HỆ THỐNG 4 GÓI THÀNH VIÊN & LUỒNG BÀN GIAO CLAIM TÀI KHOẢN ===");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong môi trường");
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // 1. Kiểm tra 4 gói chính thức trong bảng plans
  console.log("\n1. Kiểm tra 4 gói chính thức trong database plans...");
  const { data: plans, error: plansErr } = await supabase
    .from('plans')
    .select('id, code, name, plan_type, tier, price_yearly, is_active')
    .eq('is_active', true)
    .order('price_yearly', { ascending: true });

  if (plansErr || !plans || plans.length < 4) {
    throw new Error("Lỗi tải plans: " + JSON.stringify(plansErr || plans));
  }

  console.log(`✓ Tìm thấy ${plans.length} gói đang hoạt động:`);
  plans.forEach(p => {
    console.log(`   - [${p.code}] ${p.name} | Loại: ${p.plan_type} | Hạng: ${p.tier} | Giá: ${p.price_yearly.toLocaleString('vi-VN')} đ/năm`);
  });

  const udaiStandard = plans.find(p => p.code === 'udai_standard');
  const udaiVip = plans.find(p => p.code === 'udai_vip');
  const tiecStandard = plans.find(p => p.code === 'tiec_standard');
  const tiecVip = plans.find(p => p.code === 'tiec_vip');

  if (!udaiStandard || !udaiVip || !tiecStandard || !tiecVip) {
    throw new Error("Thiếu một trong 4 gói chuẩn: udai_standard, udai_vip, tiec_standard, tiec_vip");
  }

  // 2. Tạo một doanh nghiệp mẫu để kiểm tra toàn bộ luồng
  const crypto = require('crypto');
  const testSlug = `test-biz-${Date.now()}`;
  const testClaimToken = crypto.randomUUID();
  console.log(`\n2. Khởi tạo doanh nghiệp kiểm thử với slug "${testSlug}"...`);

  const { data: testBiz, error: createBizErr } = await supabase
    .from('businesses')
    .insert({
      name: "Nhà Hàng Ẩm Thực Nam Bộ Test",
      slug: testSlug,
      phone: "0988776655",
      category_slug: "nha-hang-am-thuc",
      status: "published",
      plan_tier: "trial",
      claim_token: testClaimToken,
      is_featured: false,
    })
    .select()
    .single();

  if (createBizErr || !testBiz) {
    throw new Error("Lỗi tạo doanh nghiệp test: " + JSON.stringify(createBizErr));
  }
  console.log(`✓ Doanh nghiệp test đã được tạo (ID: ${testBiz.id})`);

  let authUser = null;
  try {
    // 3. Test Luồng Claim Bàn Giao Tài Khoản (Supabase Auth thật)
    console.log("\n3. Kiểm tra Luồng Bàn Giao (Claim) Tài Khoản với Auth User & Password...");
    const testEmail = `owner_${Date.now()}@testbooking.asia`;
    const testPassword = "Password123@#$";

    // 3.1. Tạo Auth User mới
    const authRes = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: { role: 'owner', full_name: 'Chủ Quán Test' },
    });
    authUser = authRes.data;

    if (authRes.error || !authUser.user) {
      throw new Error("Lỗi tạo Auth User: " + JSON.stringify(authRes.error));
    }
    console.log(`✓ Đã tạo Supabase Auth user thật (Email: ${testEmail}, UserID: ${authUser.user.id})`);

    // 3.2. Bàn giao doanh nghiệp: gán owner_id và xóa claim_token
    const { error: claimErr } = await supabase
      .from('businesses')
      .update({
        owner_id: authUser.user.id,
        claim_token: null,
      })
      .eq('id', testBiz.id);

    if (claimErr) {
      throw new Error("Lỗi bàn giao owner_id: " + JSON.stringify(claimErr));
    }
    console.log("✓ Bàn giao quyền sở hữu thành công, claim_token đã được xóa bảo mật!");

    // 4. Test Kích Hoạt Gói Trang Ưu Đãi (Chuẩn 500k)
    console.log("\n4. Kiểm tra Kích Hoạt Gói Trang Ưu Đãi Chuẩn (500k / năm)...");
    const now = new Date();
    const dealExpiry = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    const { data: memDeal, error: dealErr } = await supabase
      .from('memberships')
      .insert({
        business_id: testBiz.id,
        plan_id: udaiStandard.id,
        status: 'active',
        starts_at: now.toISOString(),
        expires_at: dealExpiry.toISOString(),
      })
      .select('id, status, expires_at, plan_id, plans(name, plan_type, tier)')
      .single();

    if (dealErr || !memDeal) {
      throw new Error("Lỗi kích hoạt Gói Trang Ưu Đãi: " + JSON.stringify(dealErr));
    }
    console.log(`✓ Kích hoạt thành công: ${memDeal.plans.name} (Hết hạn: ${new Date(memDeal.expires_at).toLocaleDateString('vi-VN')})`);

    // 5. Test Kích Hoạt Gói Trang Đặt Tiệc VIP Neon (700k)
    console.log("\n5. Kiểm tra Kích Hoạt Gói Trang Đặt Tiệc VIP Neon (700k / năm)...");
    const partyExpiry = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    const { data: memParty, error: partyErr } = await supabase
      .from('memberships')
      .insert({
        business_id: testBiz.id,
        plan_id: tiecVip.id,
        status: 'active',
        starts_at: now.toISOString(),
        expires_at: partyExpiry.toISOString(),
      })
      .select('id, status, expires_at, plan_id, plans(name, plan_type, tier)')
      .single();

    if (partyErr || !memParty) {
      throw new Error("Lỗi kích hoạt Gói Trang Đặt Tiệc: " + JSON.stringify(partyErr));
    }

    // Bật hiệu ứng Neon trên logo bản đồ trong business_party_profiles
    const { data: partyProfile, error: profileErr } = await supabase
      .from('business_party_profiles')
      .upsert({
        business_id: testBiz.id,
        min_guests: 10,
        max_guests: 200,
        num_vip_rooms: 4,
        price_min: 250000,
        price_max: 600000,
        is_vip: true, // Chức năng đèn Neon phát sáng trên logo trên bản đồ
        is_active: true,
        party_deal_highlight: "Tặng gói trang trí hoa tươi & tráng miệng",
        updated_at: new Date().toISOString(),
      }, { onConflict: 'business_id' })
      .select()
      .single();

    if (profileErr || !partyProfile?.is_vip) {
      throw new Error("Lỗi bật hiệu ứng VIP Neon trên bản đồ: " + JSON.stringify(profileErr));
    }
    console.log(`✓ Kích hoạt thành công: ${memParty.plans.name}`);
    console.log(`✓ Hiệu ứng VIP Neon trên logo bản đồ (/tat-nien) đã BẬT: is_vip = ${partyProfile.is_vip}`);

    // 6. Kiểm tra số lượng gói đồng thời của doanh nghiệp
    console.log("\n6. Kiểm tra tổng số gói đang kích hoạt của doanh nghiệp...");
    const { data: allMems } = await supabase
      .from('memberships')
      .select('id, status, expires_at, plan_id, plans(id, code, name, plan_type, tier)')
      .eq('business_id', testBiz.id);

    const activeDeal = allMems.find(m => m.plans.plan_type === 'deal' && m.status === 'active');
    const activeParty = allMems.find(m => m.plans.plan_type === 'party' && m.status === 'active');
    const totalActiveCount = (activeDeal ? 1 : 0) + (activeParty ? 1 : 0);

    console.log(`✓ Tổng số gói đang kích hoạt: ${totalActiveCount} / 2 gói`);
    console.log(`   - Trang Ưu Đãi: ${activeDeal ? activeDeal.plans.name : 'Chưa kích hoạt'}`);
    console.log(`   - Trang Đặt Tiệc: ${activeParty ? activeParty.plans.name : 'Chưa kích hoạt'}`);

    if (totalActiveCount !== 2) {
      throw new Error(`Kỳ vọng 2 gói đang dùng nhưng thực tế là ${totalActiveCount}`);
    }

    console.log("\n=======================================================");
    console.log("🎉 TOÀN BỘ CÁC BƯỚC KIỂM TRA ĐỀU THÀNH CÔNG VÀ CHÍNH XÁC 100%!");
    console.log("=======================================================");

  } finally {
    // Dọn dẹp dữ liệu kiểm thử
    console.log("\nĐang dọn dẹp dữ liệu kiểm thử...");
    await supabase.from('business_party_profiles').delete().eq('business_id', testBiz.id);
    await supabase.from('memberships').delete().eq('business_id', testBiz.id);
    await supabase.from('businesses').delete().eq('id', testBiz.id);
    if (typeof authUser !== 'undefined' && authUser?.user?.id) {
      await supabase.auth.admin.deleteUser(authUser.user.id);
    }
    console.log("✓ Đã dọn dẹp xong dữ liệu kiểm thử!");
  }
}

runTest().catch((err) => {
  console.error("Test Thất Bại:", err);
  process.exit(1);
});
