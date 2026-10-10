const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function seedCategories() {
  const client = new Client({ connectionString: process.env.DIRECT_URL });
  try {
    await client.connect();

    const categories = [
      { slug: 'fashion', name: 'Thời Trang & Phụ Kiện', description: 'Săn mã giảm giá, đặt giữ size quần áo ưu tiên hoặc đăng ký VIP.' },
      { slug: 'sports', name: 'Sân Thể Thao Đa Năng', description: 'Đặt sân Bóng đá, Pickleball & Cầu Lông online tức thì.' },
      { slug: 'health', name: 'Nha Khoa & Phòng Khám', description: 'Đặt hẹn khám chữa răng, chọn bác sĩ chuyên khoa.' },
      { slug: 'dining', name: 'Nhà Hàng & Quán Ăn (F&B)', description: 'Đặt bàn tiệc trước giờ cao điểm, chọn trước set menu.' },
      { slug: 'auto', name: 'Chăm Sóc & Độ Xe Ô Tô', description: 'Đặt lịch rửa xe chi tiết, dán phim cách nhiệt, phủ ceramic.' },
      { slug: 'fitness', name: 'Thể Hình, Yoga & PT', description: 'Đăng ký buổi tập thử, chọn khung giờ 1:1 cùng huấn luyện viên.' },
      { slug: 'beauty', name: 'Spa & Thẩm Mỹ Viện', description: 'Trưng bày liệu trình làm đẹp, săn voucher giảm giá giờ vàng.' },
      { slug: 'studio', name: 'Studio Chụp Ảnh & Áo Cưới', description: 'Xem lookbook concept, đặt lịch thử váy cưới.' },
      { slug: 'pet', name: 'Spa & Khách Sạn Thú Cưng', description: 'Đặt hẹn tắm tỉa lông, đưa đón thú cưng.' },
      { slug: 'repair', name: 'Dịch Vụ Sửa Chữa Tại Nhà', description: 'Đặt thợ vệ sinh máy lạnh, sửa điện nước, giặt sofa tận nơi.' },
      { slug: 'travel', name: 'Homestay & Du Lịch', description: 'Đặt phòng nghỉ dưỡng cuối tuần, thuê tour trải nghiệm.' },
      { slug: 'consulting', name: 'Tư Vấn & Coaching 1:1', description: 'Đặt lịch tham vấn trực tuyến hoặc trực tiếp.' },
      { slug: 'other', name: 'Dịch Vụ Khác', description: 'Các loại hình hình kinh doanh, dịch vụ khác.' }
    ];

    for (const cat of categories) {
      await client.query(`
        INSERT INTO categories (slug, name, description)
        VALUES ($1, $2, $3)
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
      `, [cat.slug, cat.name, cat.description]);
      console.log(`Upserted category: ${cat.slug}`);
    }

    // Update existing businesses that might have used old slugs
    const legacyMap = {
      'spa': 'beauty',
      'salon': 'beauty',
      'nha-hang': 'dining',
      'homestay': 'travel',
      'nha-khoa': 'health',
      'the-hinh': 'fitness',
      'thu-cung': 'pet',
      'chup-anh-studio': 'studio',
      'cham-soc-xe': 'auto',
      'sua-chua-tai-nha': 'repair',
      'tu-van': 'consulting',
      'education': 'consulting',
      'wedding': 'studio',
      'realestate': 'other',
      'booking': 'other',
      'dich-vu': 'other'
    };

    for (const [oldSlug, newSlug] of Object.entries(legacyMap)) {
      const res = await client.query(`UPDATE businesses SET category_slug = $1 WHERE category_slug = $2;`, [newSlug, oldSlug]);
      if (res.rowCount > 0) {
        console.log(`Migrated ${res.rowCount} businesses from '${oldSlug}' to '${newSlug}'`);
      }
    }
    
    // Xóa các category cũ không dùng nữa nếu cần (tùy chọn)
    await client.query(`DELETE FROM categories WHERE slug NOT IN ('fashion', 'sports', 'health', 'dining', 'auto', 'fitness', 'beauty', 'studio', 'pet', 'repair', 'travel', 'consulting', 'other')`);

  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedCategories();
