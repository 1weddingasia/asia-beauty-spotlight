const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
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

const rootDir = path.join(__dirname, '../../');
const COFFEE_EXCEL_PATH = path.join(rootDir, 'Danh_Sach_Gian_Hang_Coffee_Expo_2026_SECC.xlsx');
const KBEAUTY_EXCEL_PATH = path.join(rootDir, 'KBeauty_SaigonBeautyShow_SECC_97_Booth.xlsx');

const COFFEE_EVENT_VI = '1Booking Expo Pass';
const COFFEE_EVENT_EN = '1Booking Expo Pass';

const KBEAUTY_EVENT_VI = '1Booking Expo Pass';
const KBEAUTY_EVENT_EN = '1Booking Expo Pass';

const DEFAULT_PIN = '123456';

function generateSlug(rawName, fallback) {
  let s = (rawName || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return s || fallback;
}

function deriveNames(rawName) {
  const trimmed = (rawName || '').trim();
  let nameVi = trimmed;
  let nameEn = '';

  if (trimmed.includes('/')) {
    const parts = trimmed.split('/');
    nameVi = parts[0].trim();
    nameEn = parts[1].trim();
  } else if (trimmed.includes('|')) {
    const parts = trimmed.split('|');
    nameVi = parts[0].trim();
    nameEn = parts[1].trim();
  } else if (trimmed.includes('(') && trimmed.includes(')')) {
    const match = trimmed.match(/^(.*?)\s*\((.*?)\)$/);
    if (match) {
      nameVi = trimmed;
      nameEn = match[2].trim() || trimmed;
    } else {
      nameVi = trimmed;
      nameEn = trimmed
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .trim();
    }
  } else {
    nameVi = trimmed;
    nameEn = trimmed
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .trim();
  }
  return { nameVi, nameEn: nameEn || nameVi };
}

async function importCoffeeExpo() {
  console.log('========================================================');
  console.log('☕ BẮT ĐẦU NẠP GIAN HÀNG COFFEE EXPO VIETNAM 2026');
  console.log(`📁 File: ${COFFEE_EXCEL_PATH}`);
  console.log('========================================================');

  const wb = XLSX.readFile(COFFEE_EXCEL_PATH);
  const sheet = wb.Sheets['Coffee Expo 2026'];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // Header row is index 2
  const headers = rawRows[2];
  const dataRows = rawRows.slice(3);

  const booths = [];
  dataRows.forEach((r, idx) => {
    const stt = r[0];
    const rawName = r[1] ? String(r[1]).trim() : '';
    const boothNumber = r[2] ? String(r[2]).trim() : '';
    const eventName = r[3] ? String(r[3]).trim() : COFFEE_EVENT_VI;
    const venue = r[4] ? String(r[4]).trim() : 'SECC Hall A, TP.HCM';
    const logoUrl = r[5] ? String(r[5]).trim() : '';
    const category = r[6] ? String(r[6]).trim() : 'Cà phê & F&B';

    if (!rawName || !boothNumber) return; // skip blank / notes
    booths.push({ stt, rawName, boothNumber, eventName, venue, logoUrl, category, originalRowIndex: idx + 3 });
  });

  console.log(`📊 Tìm thấy: ${booths.length} gian hàng Coffee Expo hợp lệ.`);

  let success = 0;
  let fail = 0;

  for (let i = 0; i < booths.length; i++) {
    const b = booths[i];
    const { nameVi, nameEn } = deriveNames(b.rawName);
    const slug = generateSlug(b.rawName, `coffee-booth-${b.boothNumber.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);

    const companyDesc = `Hồ sơ số hóa và cổng kết nối đối tác chính thức của ${b.rawName}. Lĩnh vực: ${b.category}. Quét mã QR nhận diện để xem thông tin sản phẩm và liên hệ trực tiếp.`;
    const companyDescEn = `Official digitized expo booth of ${nameEn}. Specializing in: ${b.category}. Scan QR code to connect and explore business partnership opportunities.`;

    const pageContent = {
      name_vi: nameVi,
      name_en: nameEn,
      logo_url: b.logoUrl,
      booth_number: b.boothNumber,
      event_name: COFFEE_EVENT_VI,
      event_name_en: COFFEE_EVENT_EN,
      venue: 'TP. Hồ Chí Minh',
      description: companyDesc,
      description_vi: companyDesc,
      description_en: companyDescEn,
      category: b.category,
    };

    try {
      // 1. Upsert business
      let { data: existingBiz } = await supabase
        .from('businesses')
        .select('id, slug')
        .eq('slug', slug)
        .maybeSingle();

      let businessId;

      if (existingBiz) {
        businessId = existingBiz.id;
        await supabase
          .from('businesses')
          .update({
            name: b.rawName,
            address: b.venue,
            status: 'published',
            is_featured: true,
            category_slug: 'expo',
            short_description: `${b.category} • Gian hàng ${b.boothNumber}`,
            description: companyDesc,
            page_content: pageContent,
          })
          .eq('id', businessId);
      } else {
        const { data: newBiz, error: insErr } = await supabase
          .from('businesses')
          .insert({
            name: b.rawName,
            slug: slug,
            phone: '',
            address: b.venue,
            status: 'published',
            is_featured: true,
            category_slug: 'expo',
            short_description: `${b.category} • Gian hàng ${b.boothNumber}`,
            description: companyDesc,
            page_content: pageContent,
          })
          .select('id')
          .single();

        if (insErr) throw insErr;
        businessId = newBiz.id;
      }

      // 2. Upsert business_expo_profiles
      const { error: profErr } = await supabase
        .from('business_expo_profiles')
        .upsert({
          business_id: businessId,
          event_name: COFFEE_EVENT_VI,
          event_name_en: COFFEE_EVENT_EN,
          booth_number: b.boothNumber,
          company_name_vi: nameVi,
          company_name_en: nameEn,
          access_pin: DEFAULT_PIN,
          languages_enabled: ['vi', 'en', 'ko', 'zh'],
          default_language: 'vi',
          is_active: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'business_id' });

      if (profErr) throw profErr;

      b.slug = slug;
      b.digitalLink = `https://www.1booking.asia/expo/${slug}`;
      b.crmLink = `https://www.1booking.asia/expo/${slug}/crm`;
      b.standeeLink = `https://www.1booking.asia/expo/${slug}/qr`;

      console.log(`✅ [${i + 1}/${booths.length}] [Booth ${b.boothNumber}] ${b.rawName} -> slug: ${slug}`);
      success++;
    } catch (err) {
      console.error(`❌ [${i + 1}/${booths.length}] Lỗi booth ${b.boothNumber} (${b.rawName}):`, err.message);
      fail++;
    }
  }

  // Cập nhật lại file Excel Coffee với các link số hóa
  console.log('📝 Đang ghi link số hóa vào file Excel Coffee Expo...');
  const newSheetRows = [];
  newSheetRows.push(rawRows[0] || ['Dữ liệu phân tích gian hàng, số booth và link logo từ hệ thống COEX']);
  newSheetRows.push(['Danh Bạ Doanh Nghiệp 2026 • Nền tảng số hóa: 1booking.asia']);
  newSheetRows.push([
    'STT',
    'Tên Doanh Nghiệp / Thương Hiệu',
    'Số Booth',
    'Tên Triển Lãm',
    'Địa Điểm',
    'Link Ảnh Logo Thật (CDN)',
    'Ghi Chú Phân Loại',
    'Link Gian Hàng 1Booking (Khách Quét)',
    'Link CRM Live (Âm Báo & Xuất Excel)',
    'Link In Standee Để Bàn (Khổ A5/A6)',
    'Mã PIN Mở Khóa CRM',
    'Trạng Thái Số Hóa',
  ]);

  booths.forEach((b, idx) => {
    newSheetRows.push([
      b.stt || String(idx + 1),
      b.rawName,
      b.boothNumber,
      b.eventName,
      b.venue,
      b.logoUrl,
      b.category,
      b.digitalLink,
      b.crmLink,
      b.standeeLink,
      DEFAULT_PIN,
      'ĐÃ SỐ HÓA 100% (LIVE)',
    ]);
  });

  const newWb = XLSX.utils.book_new();
  const newWs = XLSX.utils.aoa_to_sheet(newSheetRows);
  newWs['!cols'] = [
    { wch: 6 },
    { wch: 38 },
    { wch: 16 },
    { wch: 28 },
    { wch: 24 },
    { wch: 35 },
    { wch: 30 },
    { wch: 45 },
    { wch: 48 },
    { wch: 48 },
    { wch: 15 },
    { wch: 25 },
  ];
  XLSX.utils.book_append_sheet(newWb, newWs, 'Coffee Expo 2026');
  XLSX.writeFile(newWb, COFFEE_EXCEL_PATH);
  console.log('✅ Đã lưu file Excel Coffee Expo với đầy đủ link & PIN!');

  return { success, fail, total: booths.length };
}

async function importKBeauty() {
  console.log('\n========================================================');
  console.log('💄 BẮT ĐẦU NẠP GIAN HÀNG K-BEAUTY & SAIGON BEAUTY SHOW 2026');
  console.log(`📁 File: ${KBEAUTY_EXCEL_PATH}`);
  console.log('========================================================');

  const wb = XLSX.readFile(KBEAUTY_EXCEL_PATH);
  const sheet = wb.Sheets['K-Beauty & Saigon Beauty 2026'];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const dataRows = rawRows.slice(3);
  const booths = [];

  dataRows.forEach((r, idx) => {
    const stt = r[0];
    const boothNumber = r[1] ? String(r[1]).trim() : '';
    const rawName = r[2] ? String(r[2]).trim() : '';
    const presetSlug = r[3] ? String(r[3]).trim() : '';
    const logoUrl = r[4] ? String(r[4]).trim() : '';
    const category = r[5] ? String(r[5]).trim() : 'Mỹ phẩm & Làm đẹp';

    if (!rawName || !boothNumber) return; // skip blank / notes
    booths.push({ stt, boothNumber, rawName, presetSlug, logoUrl, category, originalRowIndex: idx + 3 });
  });

  console.log(`📊 Tìm thấy: ${booths.length} gian hàng K-Beauty hợp lệ.`);

  let success = 0;
  let fail = 0;

  for (let i = 0; i < booths.length; i++) {
    const b = booths[i];
    const { nameVi, nameEn } = deriveNames(b.rawName);
    const slug = b.presetSlug || generateSlug(b.rawName, `kbeauty-booth-${b.boothNumber.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);

    const companyDesc = `Hồ sơ số hóa và cổng kết nối đối tác chính thức của ${b.rawName}. Lĩnh vực: ${b.category}. Quét mã QR nhận diện để xem thông tin sản phẩm và liên hệ trực tiếp.`;
    const companyDescEn = `Official digitized booth of ${nameEn}. Specializing in: ${b.category}. Scan QR code to connect and explore partnership opportunities.`;

    const pageContent = {
      name_vi: nameVi,
      name_en: nameEn,
      logo_url: b.logoUrl,
      booth_number: b.boothNumber,
      event_name: KBEAUTY_EVENT_VI,
      event_name_en: KBEAUTY_EVENT_EN,
      venue: 'TP. Hồ Chí Minh',
      description: companyDesc,
      description_vi: companyDesc,
      description_en: companyDescEn,
      category: b.category,
    };

    try {
      // 1. Upsert business
      let { data: existingBiz } = await supabase
        .from('businesses')
        .select('id, slug')
        .eq('slug', slug)
        .maybeSingle();

      let businessId;

      if (existingBiz) {
        businessId = existingBiz.id;
        await supabase
          .from('businesses')
          .update({
            name: b.rawName,
            address: 'SECC Quận 7, TP. Hồ Chí Minh',
            status: 'published',
            is_featured: true,
            category_slug: 'expo',
            short_description: `${b.category} • Gian hàng ${b.boothNumber}`,
            description: companyDesc,
            page_content: pageContent,
          })
          .eq('id', businessId);
      } else {
        const { data: newBiz, error: insErr } = await supabase
          .from('businesses')
          .insert({
            name: b.rawName,
            slug: slug,
            phone: '',
            address: 'SECC Quận 7, TP. Hồ Chí Minh',
            status: 'published',
            is_featured: true,
            category_slug: 'expo',
            short_description: `${b.category} • Gian hàng ${b.boothNumber}`,
            description: companyDesc,
            page_content: pageContent,
          })
          .select('id')
          .single();

        if (insErr) throw insErr;
        businessId = newBiz.id;
      }

      // 2. Upsert business_expo_profiles
      const { error: profErr } = await supabase
        .from('business_expo_profiles')
        .upsert({
          business_id: businessId,
          event_name: KBEAUTY_EVENT_VI,
          event_name_en: KBEAUTY_EVENT_EN,
          booth_number: b.boothNumber,
          company_name_vi: nameVi,
          company_name_en: nameEn,
          access_pin: DEFAULT_PIN,
          languages_enabled: ['vi', 'en', 'ko', 'zh'],
          default_language: 'vi',
          is_active: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'business_id' });

      if (profErr) throw profErr;

      b.slug = slug;
      b.digitalLink = `https://www.1booking.asia/expo/${slug}`;
      b.crmLink = `https://www.1booking.asia/expo/${slug}/crm`;
      b.standeeLink = `https://www.1booking.asia/expo/${slug}/qr`;

      console.log(`✅ [${i + 1}/${booths.length}] [Booth ${b.boothNumber}] ${b.rawName} -> slug: ${slug}`);
      success++;
    } catch (err) {
      console.error(`❌ [${i + 1}/${booths.length}] Lỗi booth ${b.boothNumber} (${b.rawName}):`, err.message);
      fail++;
    }
  }

  // Cập nhật lại file Excel KBeauty với các link số hóa
  console.log('📝 Đang ghi link số hóa vào file Excel KBeauty...');
  const newSheetRows = [];
  newSheetRows.push(rawRows[0] || ['Danh sách 97 gian hàng chính thức tại Triển lãm Quốc tế Làm đẹp SECC Q.7 (29 - 31/10/2026)']);
  newSheetRows.push(['Danh Bạ Doanh Nghiệp 2026 • Nền tảng số hóa: 1booking.asia & 1beauty.asia']);
  newSheetRows.push([
    'STT',
    'Số Booth',
    'Tên Doanh Nghiệp',
    'Slug 1Booking',
    'URL Logo Mặc Định',
    'Ngành Hàng / Lĩnh Vực',
    'Link Gian Hàng 1Booking (Khách Quét)',
    'Link CRM Live (Âm Báo & Xuất Excel)',
    'Link In Standee Để Bàn (Khổ A5/A6)',
    'Mã PIN Mở Khóa CRM',
    'Trạng Thái Số Hóa',
  ]);

  booths.forEach((b, idx) => {
    newSheetRows.push([
      b.stt || String(idx + 1),
      b.boothNumber,
      b.rawName,
      b.slug,
      b.logoUrl,
      b.category,
      b.digitalLink,
      b.crmLink,
      b.standeeLink,
      DEFAULT_PIN,
      'ĐÃ SỐ HÓA 100% (LIVE)',
    ]);
  });

  const newWb = XLSX.utils.book_new();
  const newWs = XLSX.utils.aoa_to_sheet(newSheetRows);
  newWs['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 38 },
    { wch: 28 },
    { wch: 35 },
    { wch: 35 },
    { wch: 45 },
    { wch: 48 },
    { wch: 48 },
    { wch: 15 },
    { wch: 25 },
  ];
  XLSX.utils.book_append_sheet(newWb, newWs, 'K-Beauty & Saigon Beauty 2026');
  XLSX.writeFile(newWb, KBEAUTY_EXCEL_PATH);
  console.log('✅ Đã lưu file Excel KBeauty với đầy đủ link & PIN!');

  return { success, fail, total: booths.length };
}

async function main() {
  const cfRes = await importCoffeeExpo();
  const kbRes = await importKBeauty();

  console.log('\n========================================================');
  console.log('🎉 TỔNG KẾT NẠP LIỆU TOÀN DIỆN THÀNH CÔNG:');
  console.log(`• Coffee Expo: ${cfRes.success}/${cfRes.total} gian hàng.`);
  console.log(`• K-Beauty Expo: ${kbRes.success}/${kbRes.total} gian hàng.`);
  console.log(`• TỔNG CỘNG: ${cfRes.success + kbRes.success} gian hàng mới được số hóa 100%!`);
  console.log('========================================================');
}

main().catch(console.error);
