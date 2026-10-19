#!/usr/bin/env node
/**
 * Công cụ Quản Lý & Thanh Lọc Dữ Liệu Demo (1Booking.Asia / 1Beauty.Asia)
 * 
 * Cách dùng:
 *   1. Xem trạng thái dữ liệu (Thật vs Demo):
 *      node scripts/manage_demo_data.js status
 * 
 *   2. Ẩn toàn bộ quán tiệc demo khỏi bản đồ & trang công cộng (không mất dữ liệu):
 *      node scripts/manage_demo_data.js hide
 * 
 *   3. Bật lại quán demo (khi cần trình chiếu cho đối tác xem demo):
 *      node scripts/manage_demo_data.js show
 * 
 *   4. Xóa vĩnh viễn dữ liệu demo (chỉ chạy khi đã có đủ nhà hàng thật):
 *      node scripts/manage_demo_data.js purge --confirm
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { Client } = require('pg');

const command = process.argv[2] || 'status';
const flag = process.argv[3];

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ Thiếu DATABASE_URL trong .env.local');
    process.exit(1);
  }

  const client = new Client({ connectionString });
  await client.connect();

  try {
    switch (command.toLowerCase()) {
      case 'status': {
        console.log('\n📊 === BÁO CÁO DỮ LIỆU ĐANG HOẠT ĐỘNG TRÊN HỆ THỐNG ===\n');

        const partyRes = await client.query(`
          SELECT 
            b.slug, 
            b.name, 
            COALESCE(p.is_demo, b.is_demo, false) as is_demo, 
            p.is_active, 
            p.is_vip,
            b.owner_id
          FROM business_party_profiles p
          JOIN businesses b ON b.id = p.business_id
          ORDER BY is_demo ASC, p.is_vip DESC, b.name ASC;
        `);

        console.log(`🎉 Hồ sơ tiệc tất niên (Tổng cộng: ${partyRes.rows.length} quán):`);
        console.table(partyRes.rows.map(r => ({
          'Tên Nhà Hàng': r.name,
          'Slug': r.slug,
          'Loại Dữ Liệu': r.is_demo ? '🧪 DEMO / SEED' : '🏢 QUÁN THẬT',
          'Hiển Thị': r.is_active ? '✅ Đang Hiện' : '⛔ Đã Ẩn',
          'VIP Pin': r.is_vip ? '⭐ VIP' : 'Thường',
          'Chủ Sở Hữu': r.owner_id ? 'Đã có chủ' : 'Chưa nhận'
        })));

        const realCount = partyRes.rows.filter(r => !r.is_demo).length;
        const demoCount = partyRes.rows.filter(r => r.is_demo).length;
        const activeCount = partyRes.rows.filter(r => r.is_active).length;

        console.log(`\n📌 Tổng kết tiệc:`);
        console.log(`   - Quán thật: ${realCount}`);
        console.log(`   - Quán demo: ${demoCount}`);
        console.log(`   - Đang hiển thị trên bản đồ (/tat-nien): ${activeCount}`);

        const bizSummary = await client.query(`
          SELECT 
            is_demo, 
            status, 
            count(*) as count 
          FROM businesses 
          GROUP BY is_demo, status 
          ORDER BY is_demo, status;
        `);
        console.log('\n🏢 Toàn bộ doanh nghiệp trên sàn:');
        console.table(bizSummary.rows.map(r => ({
          'Loại': r.is_demo ? '🧪 DEMO' : '🏢 THẬT',
          'Trạng thái': r.status,
          'Số lượng': r.count
        })));
        break;
      }

      case 'hide': {
        console.log('\n⏳ Đang ẩn toàn bộ dữ liệu demo khỏi trang tiệc công cộng...');
        const updateRes = await client.query(`
          UPDATE business_party_profiles
          SET is_active = false, updated_at = NOW()
          WHERE is_demo = true;
        `);
        console.log(`✅ Đã ẩn ${updateRes.rowCount} quán demo!`);
        console.log('💡 Lưu ý: Dữ liệu vẫn được giữ nguyên trong cơ sở dữ liệu. Trang /tat-nien hiện chỉ hiển thị các quán thật có is_demo = false.');
        break;
      }

      case 'show': {
        console.log('\n⏳ Đang kích hoạt lại dữ liệu demo để trình chiếu/thử nghiệm...');
        const updateRes = await client.query(`
          UPDATE business_party_profiles
          SET is_active = true, updated_at = NOW()
          WHERE is_demo = true;
        `);
        console.log(`✅ Đã kích hoạt lại ${updateRes.rowCount} quán demo để phục vụ trình chiếu.`);
        break;
      }

      case 'purge': {
        if (flag !== '--confirm') {
          console.warn('\n⚠️ CẢNH BÁO BẢO VỆ DỮ LIỆU:');
          console.warn('Hành động này sẽ XÓA VĨNH VIỄN các hồ sơ tiệc và doanh nghiệp demo.');
          console.warn('Để xác nhận xóa an toàn, vui lòng chạy lệnh:');
          console.warn('   node scripts/manage_demo_data.js purge --confirm\n');
          break;
        }

        console.log('\n⏳ Bắt đầu dọn sạch dữ liệu demo an toàn...');
        
        // 1. Xóa hồ sơ tiệc demo
        const delPartyRes = await client.query(`
          DELETE FROM business_party_profiles
          WHERE is_demo = true;
        `);
        console.log(`🧹 Đã xóa ${delPartyRes.rowCount} hồ sơ tiệc demo.`);

        // 2. Xóa các doanh nghiệp test demo (không có chủ thật)
        const delBizRes = await client.query(`
          DELETE FROM businesses
          WHERE is_demo = true 
            AND owner_id IS NULL
            AND slug LIKE 'test-biz-%';
        `);
        console.log(`🧹 Đã xóa ${delBizRes.rowCount} doanh nghiệp test thử nghiệm.`);

        console.log('🎉 Hoàn tất dọn dẹp an toàn! Không có bất kỳ dữ liệu thật nào của khách hàng bị ảnh hưởng.');
        break;
      }

      default:
        console.log('Lệnh không hợp lệ. Các lệnh hỗ trợ: status | hide | show | purge');
    }
  } catch (err) {
    console.error('❌ Lỗi xử lý:', err);
  } finally {
    await client.end();
  }
}

main();
