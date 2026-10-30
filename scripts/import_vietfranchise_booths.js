import XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Thiếu Supabase credentials trong .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const EXCEL_PATH = 'c:/Users/Dell/Desktop/GITHUB CODE/1BEAUTY.ASIA 19092026/Danh_Sach_Gian_Hang_VietFranchise_SECC_Thuc_Te.xlsx';
const EVENT_NAME_VI = '1Booking Expo Pass';
const EVENT_NAME_EN = '1Booking Expo Pass';

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
  } else {
    nameVi = trimmed;
    nameEn = trimmed
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .trim();
  }
  return { nameVi, nameEn };
}

async function scrapeExhibitor(btcUrl) {
  if (!btcUrl || !btcUrl.startsWith('http')) return {};
  try {
    const res = await fetch(btcUrl, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return {};
    const html = await res.text();

    const regex = /<p[^>]*class="productdt_info-title"[^>]*>([\s\S]*?)<\/p>[\s\S]*?<div[^>]*class="productdt_info-desc[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
    let match;
    const fields = {};
    while ((match = regex.exec(html)) !== null) {
      const title = match[1].trim();
      const desc = match[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      fields[title] = desc;
    }

    // Website detection
    let website = fields['Website'] || '';
    if (!website || website === '#') {
      const webMatch = html.match(/<a\s+href="(https?:\/\/[^"]+)"[^>]*target="_blank">/i);
      if (webMatch && !webMatch[1].includes('vietfranchise.vn') && !webMatch[1].includes('facebook.com/sharer')) {
        website = webMatch[1];
      }
    }

    const description = fields['Company Information'] || Object.values(fields).find(v => v.length > 50) || '';
    const address = fields['Address'] || '';
    const productInfo = fields['Product Information'] || '';

    return {
      website: website && website !== '#' ? website : '',
      description,
      address,
      productInfo,
    };
  } catch (err) {
    return {};
  }
}

async function main() {
  console.log('========================================================');
  console.log('🚀 BẮT ĐẦU NẠP 85 GIAN HÀNG THỰC TẾ VIETFRANCHISE 2026');
  console.log(`📁 File Excel: ${EXCEL_PATH}`);
  console.log('========================================================');

  const workbook = XLSX.readFile(EXCEL_PATH);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { range: 2 });

  const booths = rawRows.filter(r => r['Số Booth'] && r['Tên Doanh Nghiệp / Thương Hiệu']);
  console.log(`📊 Tìm thấy tổng cộng: ${booths.length} gian hàng hợp lệ.`);

  // Cập nhật gian hàng demo deoproce-korea cho khớp tên triển lãm
  await supabase
    .from('business_expo_profiles')
    .update({
      event_name: EVENT_NAME_VI,
      event_name_en: EVENT_NAME_EN,
    })
    .eq('booth_number', 'A-12');

  let successCount = 0;
  let errorCount = 0;

  // Xử lý từng lô 5 gian hàng để cào chi tiết và nạp vào DB
  const BATCH_SIZE = 5;
  for (let i = 0; i < booths.length; i += BATCH_SIZE) {
    const chunk = booths.slice(i, i + BATCH_SIZE);
    
    await Promise.all(
      chunk.map(async (b, idx) => {
        const index = i + idx + 1;
        const rawName = b['Tên Doanh Nghiệp / Thương Hiệu'].trim();
        const boothNumber = b['Số Booth'].trim();
        const btcUrl = b['Link Chi Tiết Ban Tổ Chức'] ? b['Link Chi Tiết Ban Tổ Chức'].trim() : '';
        const logoUrl = b['Link Ảnh Logo Thật (100% Verified)'] ? b['Link Ảnh Logo Thật (100% Verified)'].trim() : '';

        const { nameVi, nameEn } = deriveNames(rawName);
        const slug = generateSlug(rawName, `vietfranchise-booth-${boothNumber.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);

        // Cào thêm chi tiết từ trang ban tổ chức
        const details = await scrapeExhibitor(btcUrl);

        const companyDesc = details.description || 
          `Hồ sơ số hóa kết nối doanh nghiệp của ${rawName} trên hệ thống 1Booking Expo Pass.`;
        
        const companyDescEn = details.description ||
          `Official digitized business profile of ${nameEn || rawName} on 1Booking Expo Pass.`;

        const companyAddress = details.address || 'TP. Hồ Chí Minh';
        const companyWebsite = details.website || (btcUrl && !btcUrl.includes('vietfranchise.vn') ? btcUrl : '');

        const pageContent = {
          name_vi: nameVi,
          name_en: nameEn,
          logo_url: logoUrl,
          booth_number: boothNumber,
          event_name: '1Booking Expo Pass • Triển Lãm Quốc Tế',
          event_name_en: '1Booking Expo Pass • International Expo',
          venue: 'TP. Hồ Chí Minh',
          event_date: '29 – 31 Tháng 10, 2026',
          btc_url: btcUrl,
          description: companyDesc,
          description_vi: companyDesc,
          description_en: companyDescEn,
          product_info: details.productInfo || '',
        };

        try {
          // 1. Kiểm tra hoặc Insert vào businesses
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
                name: rawName,
                address: companyAddress,
                website: companyWebsite || null,
                status: 'published',
                is_featured: true,
                category_slug: 'expo',
                page_content: pageContent,
              })
              .eq('id', businessId);
          } else {
            const { data: newBiz, error: insErr } = await supabase
              .from('businesses')
              .insert({
                name: rawName,
                slug: slug,
                phone: '',
                address: companyAddress,
                website: companyWebsite || null,
                status: 'published',
                is_featured: true,
                category_slug: 'expo',
                page_content: pageContent,
              })
              .select('id')
              .single();

            if (insErr) throw insErr;
            businessId = newBiz.id;
          }

          // 2. Upsert vào business_expo_profiles
          const { error: profErr } = await supabase
            .from('business_expo_profiles')
            .upsert({
              business_id: businessId,
              event_name: EVENT_NAME_VI,
              event_name_en: EVENT_NAME_EN,
              booth_number: boothNumber,
              company_name_vi: nameVi,
              company_name_en: nameEn,
              access_pin: '123456', // Mã PIN chuẩn để anh mở khóa dễ dàng khi chào hàng
              languages_enabled: ['vi', 'en', 'ko', 'zh'],
              default_language: 'vi',
              is_active: true,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'business_id' });

          if (profErr) throw profErr;

          console.log(`✅ [${index}/${booths.length}] Đã nạp: [Booth ${boothNumber}] ${rawName}`);
          successCount++;
        } catch (err) {
          console.error(`❌ [${index}/${booths.length}] Lỗi nạp booth ${boothNumber} (${rawName}):`, err.message);
          errorCount++;
        }
      })
    );
  }

  console.log('========================================================');
  console.log(`🎉 HOÀN THÀNH NẠP DỮ LIỆU THỰC TẾ!`);
  console.log(`• Thành công: ${successCount} gian hàng`);
  console.log(`• Lỗi: ${errorCount} gian hàng`);
  console.log('========================================================');
}

main().catch(console.error);
