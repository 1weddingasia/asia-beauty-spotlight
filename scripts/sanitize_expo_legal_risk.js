const path = require('path');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Thiếu Supabase credentials trong .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const STANDARDIZED_EVENT = '1Booking Expo Pass';

async function sanitizeDatabase() {
  console.log('🛡️ BẮT ĐẦU CHUẨN HÓA DỮ LIỆU - LOẠI BỎ THÔNG TIN TRIỂN LÃM ĐỂ TRÁNH RỦI RO PHÁP LÝ');
  console.log('================================================================================');

  // 1. Chuẩn hóa bảng business_expo_profiles: Tất cả event_name -> '1Booking Expo Pass'
  console.log('1️⃣ Đang làm sạch bảng business_expo_profiles...');
  const { data: profiles, error: profErr } = await supabase
    .from('business_expo_profiles')
    .select('id, event_name, event_name_en, booth_number');

  if (profErr) {
    console.error('❌ Lỗi đọc business_expo_profiles:', profErr);
    process.exit(1);
  }

  let updatedProfiles = 0;
  for (const p of profiles) {
    if (p.event_name !== STANDARDIZED_EVENT || p.event_name_en !== STANDARDIZED_EVENT) {
      const { error: upErr } = await supabase
        .from('business_expo_profiles')
        .update({
          event_name: STANDARDIZED_EVENT,
          event_name_en: STANDARDIZED_EVENT,
          updated_at: new Date().toISOString(),
        })
        .eq('id', p.id);

      if (upErr) {
        console.error(`❌ Lỗi cập nhật profile ${p.id}:`, upErr);
      } else {
        updatedProfiles++;
      }
    }
  }
  console.log(`✅ Đã chuẩn hóa ${updatedProfiles}/${profiles.length} hồ sơ expo về '${STANDARDIZED_EVENT}'.`);

  // 2. Chuẩn hóa bảng businesses: Làm sạch description, address, page_content
  console.log('\n2️⃣ Đang làm sạch bảng businesses...');
  const { data: businesses, error: bizErr } = await supabase
    .from('businesses')
    .select('id, name, slug, address, description, page_content, category_slug');

  if (bizErr) {
    console.error('❌ Lỗi đọc businesses:', bizErr);
    process.exit(1);
  }

  const forbiddenTerms = [
    'coffee expo',
    'k-beauty',
    'saigon beauty',
    'vietfranchise',
    'secc',
    'triển lãm quốc tế',
    'triển lãm cà phê',
    'triển lãm làm đẹp',
    'triển lãm nhượng quyền',
  ];

  let updatedBusinesses = 0;

  for (const b of businesses) {
    let needsUpdate = false;
    const updates = {};

    // 2.1 Làm sạch address nếu chứa SECC hoặc tên hội chợ
    let cleanAddress = b.address;
    if (cleanAddress) {
      const lowerAddr = cleanAddress.toLowerCase();
      if (lowerAddr.includes('secc') || lowerAddr.includes('hall a') || lowerAddr.includes('hall b')) {
        cleanAddress = 'TP. Hồ Chí Minh';
        updates.address = cleanAddress;
        needsUpdate = true;
      }
    }

    // 2.2 Làm sạch description
    const currentDesc = (b.description || '').toLowerCase();
    const hasForbiddenInDesc = forbiddenTerms.some((term) => currentDesc.includes(term));
    
    // Lấy thông tin category hoặc booth
    const pc = b.page_content || {};
    const category = pc.category || 'Doanh nghiệp thương mại & Dịch vụ';
    const nameVi = pc.name_vi || b.name;
    const nameEn = pc.name_en || b.name;

    const safeDescVi = `Hồ sơ số hóa và cổng kết nối đối tác chính thức của ${nameVi}. Lĩnh vực: ${category}. Quét mã QR nhận diện để xem thông tin và liên hệ hợp tác trực tiếp.`;
    const safeDescEn = `Official digitized profile and business partner connection portal of ${nameEn}. Specializing in: ${category}. Scan QR code to connect and explore partnership opportunities.`;

    if (hasForbiddenInDesc) {
      updates.description = safeDescVi;
      needsUpdate = true;
    }

    // 2.3 Làm sạch page_content
    const newPc = { ...pc };
    let pcChanged = false;

    if (newPc.event_name !== STANDARDIZED_EVENT) {
      newPc.event_name = STANDARDIZED_EVENT;
      pcChanged = true;
    }
    if (newPc.event_name_en !== STANDARDIZED_EVENT) {
      newPc.event_name_en = STANDARDIZED_EVENT;
      pcChanged = true;
    }
    if (newPc.expo_name) {
      newPc.expo_name = STANDARDIZED_EVENT;
      pcChanged = true;
    }

    // Xóa bỏ hoặc làm sạch venue, event_date
    if (newPc.venue && (newPc.venue.toLowerCase().includes('secc') || newPc.venue.toLowerCase().includes('triển lãm'))) {
      newPc.venue = 'TP. Hồ Chí Minh';
      pcChanged = true;
    }
    if (newPc.event_date) {
      delete newPc.event_date;
      pcChanged = true;
    }

    // Kiểm tra description trong page_content
    const pcDesc = (newPc.description || '').toLowerCase();
    const pcDescVi = (newPc.description_vi || '').toLowerCase();
    const pcDescEn = (newPc.description_en || '').toLowerCase();

    if (forbiddenTerms.some((t) => pcDesc.includes(t) || pcDescVi.includes(t) || pcDescEn.includes(t))) {
      newPc.description = safeDescVi;
      newPc.description_vi = safeDescVi;
      newPc.description_en = safeDescEn;
      pcChanged = true;
    }

    if (pcChanged) {
      updates.page_content = newPc;
      needsUpdate = true;
    }

    if (needsUpdate) {
      const { error: upBizErr } = await supabase
        .from('businesses')
        .update(updates)
        .eq('id', b.id);

      if (upBizErr) {
        console.error(`❌ Lỗi cập nhật business ${b.slug}:`, upBizErr);
      } else {
        updatedBusinesses++;
      }
    }
  }

  console.log(`✅ Đã làm sạch ${updatedBusinesses}/${businesses.length} doanh nghiệp khỏi các thông tin hội chợ/SECC.`);

  console.log('\n================================================================================');
  console.log('🎉 HOÀN TẤT CHUẨN HÓA DỮ LIỆU! ỨNG DỤNG HOÀN TOÀN TRẮNG SẠCH THÔNG TIN BÊN THỨ BA.');
  console.log('================================================================================');
}

sanitizeDatabase().catch((err) => {
  console.error('❌ Lỗi nghiêm trọng:', err);
  process.exit(1);
});
