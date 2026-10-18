require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  async function upsertPlan(name, description, priceMonthly, priceYearly, features) {
    const existing = await client.query('SELECT id FROM plans WHERE name = $1 LIMIT 1', [name]);
    if (existing.rows.length > 0) {
      const id = existing.rows[0].id;
      await client.query(`
        UPDATE plans SET
          description = $1,
          price_monthly = $2,
          price_yearly = $3,
          is_active = true,
          features = $4
        WHERE id = $5
      `, [description, priceMonthly, priceYearly, JSON.stringify(features), id]);
      console.log(`Updated plan: ${name} (${id})`);
    } else {
      const inserted = await client.query(`
        INSERT INTO plans (name, description, price_monthly, price_yearly, is_active, features)
        VALUES ($1, $2, $3, $4, true, $5)
        RETURNING id
      `, [name, description, priceMonthly, priceYearly, JSON.stringify(features)]);
      console.log(`Inserted plan: ${name} (${inserted.rows[0].id})`);
    }
  }

  // 1. Gói Trang Ưu Đãi (1.500.000 đ/năm, 150.000 đ/tháng)
  await upsertPlan(
    'Gói Trang Ưu Đãi',
    'Gian hàng số & trang ưu đãi thương hiệu hiển thị quanh năm theo giao diện chuẩn của nền tảng 1Booking.asia, chạy deal giảm giá, đón khách đặt hẹn.',
    150000,
    1500000,
    [
      'Trang Gian Hàng Số Chuyên Nghiệp (1booking.asia/slug)',
      'Giao diện chuẩn sang trọng toàn nền tảng',
      'Đăng tải không giới hạn ưu đãi & deal giảm giá',
      'Hệ thống đặt hẹn & thông báo khách hàng tức thì',
      'Tối ưu SEO Google địa phương & danh bạ dịch vụ',
      'Hỗ trợ kỹ thuật và chăm sóc gian hàng cả năm'
    ]
  );

  // 2. Gói Trang Đặt Tiệc (500.000 đ/năm, 50.000 đ/tháng)
  await upsertPlan(
    'Gói Trang Đặt Tiệc',
    'Kích hoạt Trang Sảnh Tiệc riêng biệt phong cách xanh dương tối, ghim phát sáng neon trên Bản Đồ Phố Tiệc 2026, nhận khách tiệc công ty tự động qua chuông Telegram.',
    50000,
    500000,
    [
      'Kích hoạt Trang Sảnh Tiệc Chuyên Biệt phong cách Xanh Dương Tối',
      'Ghim phát sáng Neon trên Bản Đồ Phố Tiệc Tất Niên 2026',
      'Đăng tải thực đơn set menu 10 người, sức chứa & phòng VIP',
      'Nổ chuông Telegram tức thì ngay khi có khách công ty đặt tiệc',
      'Tích hợp nút Đặt Bàn Tiệc & Giữ Chỗ VIP 1-chạm',
      'Hỗ trợ chăm sóc gian hàng mùa tiệc 24/7'
    ]
  );

  // 3. Ẩn gói cũ nếu không cần thiết
  await client.query(`
    UPDATE plans SET is_active = false WHERE name NOT IN ('Gói Trang Ưu Đãi', 'Gói Trang Đặt Tiệc');
  `);

  const finalCheck = await client.query(`SELECT id, name, price_yearly, price_monthly, is_active FROM plans ORDER BY price_yearly ASC;`);
  console.log('Final plans in DB:');
  console.log(finalCheck.rows);

  await client.end();
}

main().catch(console.error);
