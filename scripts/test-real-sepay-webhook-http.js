require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runRealSepayTest() {
  console.log('=== BẮT ĐẦU TEST TOÀN DIỆN WEBHOOK SEPAY THẬT VÀ KÍCH HOẠT GÓI THÀNH VIÊN ===\n');

  const timestamp = Date.now();
  const testSlug = `test-sepay-${timestamp}`;
  const secret = process.env.SEPAY_WEBHOOK_SECRET?.replace(/['"]/g, '').trim();

  try {
    // 1. Tạo doanh nghiệp test trong database
    console.log(`1. Tạo doanh nghiệp kiểm thử với slug "${testSlug}"...`);
    const { data: biz, error: bizErr } = await supabase
      .from('businesses')
      .insert({
        name: `Nhà Hàng Test SePay ${timestamp}`,
        slug: testSlug,
        category_slug: 'nha-hang-am-thuc',
        phone: '0988776655',
        status: 'published',
        plan_tier: 'free',
      })
      .select('id, name, slug')
      .single();

    if (bizErr) throw new Error(`Lỗi tạo business: ${bizErr.message}`);
    console.log(`✓ Doanh nghiệp test đã được tạo (ID: ${biz.id})\n`);

    // Tạo luôn party profile
    await supabase.from('business_party_profiles').insert({
      business_id: biz.id,
      is_active: false,
      is_vip: false,
    });

    // 2. Gửi Webhook SePay mô phỏng thanh toán GÓI TIỆC VIP NEON (700.000 đ)
    console.log('2. Gửi Webhook SePay thật: Kích hoạt Gói Tiệc VIP Neon (700.000 đ)...');
    const sepayTxId1 = Math.floor(Math.random() * 8999999) + 1000000;
    const payload1 = {
      id: sepayTxId1,
      gateway: 'TPBank',
      transactionDate: new Date().toISOString(),
      accountNumber: '00003554020',
      content: `TIECVIP ${testSlug.toUpperCase()}`,
      transferType: 'in',
      transferAmount: 700000,
      accumulated: 700000,
      referenceCode: `REF_${sepayTxId1}`,
    };

    const res1 = await fetch('http://localhost:3000/api/webhooks/sepay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${secret}`,
      },
      body: JSON.stringify(payload1),
    });

    const res1Json = await res1.json();
    console.log(`   HTTP Status: ${res1.status}`, res1Json);
    if (!res1.ok || !res1Json.success) {
      throw new Error(`Webhook SePay thất bại: ${JSON.stringify(res1Json)}`);
    }
    console.log('✓ SePay Webhook đã xử lý thành công giao dịch 700k!\n');

    // 3. Kiểm tra Database sau thanh toán gói tiệc
    console.log('3. Kiểm tra quyền lợi trong Database...');
    const { data: mems1 } = await supabase
      .from('memberships')
      .select('id, status, expires_at, plans(code, plan_type, tier, name)')
      .eq('business_id', biz.id);

    console.log('   Danh sách gói trong DB:', mems1);
    const partyMem = mems1?.find(m => m.plans?.plan_type === 'party');
    if (!partyMem || partyMem.plans?.tier !== 'vip') {
      throw new Error('Gói tiệc VIP chưa được kích hoạt đúng trong DB');
    }
    console.log(`✓ Đã kích hoạt gói: ${partyMem.plans.name} (Hết hạn: ${new Date(partyMem.expires_at).toLocaleDateString('vi-VN')})`);

    const { data: partyProfile } = await supabase
      .from('business_party_profiles')
      .select('is_active, is_vip')
      .eq('business_id', biz.id)
      .single();

    if (!partyProfile?.is_vip) {
      throw new Error('is_vip chưa được bật trên business_party_profiles');
    }
    console.log('✓ Chức năng Đèn Neon trên logo bản đồ (/tat-nien) đã BẬT: is_vip = true\n');

    // 4. Kiểm tra endpoint check-status
    console.log('4. Kiểm tra API check-status (/api/payment/check-status)...');
    const checkRes1 = await fetch('http://localhost:3000/api/payment/check-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: testSlug }),
    });
    const checkJson1 = await checkRes1.json();
    console.log('   Kết quả check-status:', checkJson1);
    if (!checkJson1.business?.is_party_vip) {
      throw new Error('Check status không trả về is_party_vip = true');
    }
    console.log('✓ API check-status nhận diện chính xác gói VIP Neon!\n');

    // 5. Gửi tiếp Webhook SePay thanh toán GÓI ƯU ĐÃI VIP CHÌA KHÓA TRAO TAY (1.500.000 đ)
    console.log('5. Gửi Webhook SePay tiếp theo: Kích hoạt Gói Ưu Đãi VIP Trao Tay (1.500.000 đ)...');
    const sepayTxId2 = Math.floor(Math.random() * 8999999) + 1000000;
    const payload2 = {
      id: sepayTxId2,
      gateway: 'TPBank',
      transactionDate: new Date().toISOString(),
      accountNumber: '00003554020',
      content: `UDAIVIP ${testSlug.toUpperCase()}`,
      transferType: 'in',
      transferAmount: 1500000,
      accumulated: 2200000,
      referenceCode: `REF_${sepayTxId2}`,
    };

    const res2 = await fetch('http://localhost:3000/api/webhooks/sepay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${secret}`,
      },
      body: JSON.stringify(payload2),
    });

    const res2Json = await res2.json();
    console.log(`   HTTP Status: ${res2.status}`, res2Json);
    if (!res2.ok || !res2Json.success) {
      throw new Error(`Webhook SePay lần 2 thất bại: ${JSON.stringify(res2Json)}`);
    }
    console.log('✓ SePay Webhook đã xử lý thành công giao dịch 1.5tr!\n');

    // 6. Kiểm tra cả 2 gói đang hoạt động đồng thời
    console.log('6. Kiểm tra tổng số gói đang dùng của doanh nghiệp...');
    const { data: allMems } = await supabase
      .from('memberships')
      .select('id, status, expires_at, plans(code, plan_type, tier, name)')
      .eq('business_id', biz.id);

    console.log(`   Tổng số gói đang hoạt động: ${allMems.length} / 2 gói`);
    allMems.forEach(m => {
      console.log(`   - Gói [${m.plans.code}]: ${m.plans.name} (Hết hạn: ${new Date(m.expires_at).toLocaleDateString('vi-VN')})`);
    });

    if (allMems.length !== 2) {
      throw new Error(`Kỳ vọng 2 gói nhưng tìm thấy ${allMems.length} gói`);
    }

    console.log('\n=============================================================');
    console.log('🎉 XÁC NHẬN: LUỒNG WEBHOOK SEPAY VÀ KÍCH HOẠT HOẠT ĐỘNG CHUẨN XÁC 100%!');
    console.log('=============================================================\n');

    // Dọn dẹp dữ liệu test
    console.log('Đang dọn dẹp dữ liệu test...');
    await supabase.from('transactions').delete().in('transaction_id', [sepayTxId1.toString(), sepayTxId2.toString()]);
    await supabase.from('memberships').delete().eq('business_id', biz.id);
    await supabase.from('business_party_profiles').delete().eq('business_id', biz.id);
    await supabase.from('businesses').delete().eq('id', biz.id);
    console.log('✓ Đã dọn dẹp xong dữ liệu test sạch sẽ.');

  } catch (err) {
    console.error('❌ LỖI TRONG QUÁ TRÌNH TEST:', err);
    process.exit(1);
  }
}

runRealSepayTest();
