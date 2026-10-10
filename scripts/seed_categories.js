const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function seedCategories() {
  const client = new Client({ connectionString: process.env.DIRECT_URL });
  await client.connect();

  const categories = [
    { slug: 'beauty', name: 'Làm Đẹp & Spa', description: 'Spa, Thẩm mỹ viện, Chăm sóc da' },
    { slug: 'salon', name: 'Salon Tóc & Nail', description: 'Cắt tóc, Làm móng, Nối mi' },
    { slug: 'dining', name: 'Nhà hàng & Ẩm thực', description: 'Nhà hàng, Quán ăn, Cafe, Bar' },
    { slug: 'travel', name: 'Du lịch & Khách sạn', description: 'Khách sạn, Resort, Homestay, Tour' },
    { slug: 'education', name: 'Giáo dục & Đào tạo', description: 'Trung tâm ngoại ngữ, Kỹ năng mềm, Dạy nghề' },
    { slug: 'health', name: 'Y tế & Sức khỏe', description: 'Phòng khám, Nha khoa, Chăm sóc sức khỏe' },
    { slug: 'fitness', name: 'Thể hình & Yoga', description: 'Phòng Gym, Yoga, Pilates' },
    { slug: 'studio', name: 'Chụp ảnh & Studio', description: 'Studio chụp ảnh cưới, Kỷ yếu, Sự kiện' },
    { slug: 'wedding', name: 'Cưới hỏi & Sự kiện', description: 'Nhà hàng tiệc cưới, Trang trí tiệc cưới, Cho thuê đồ cưới' },
    { slug: 'realestate', name: 'Bất động sản', description: 'Mua bán nhà đất, Cho thuê mặt bằng, Căn hộ' },
    { slug: 'booking', name: 'Dịch vụ Đặt hẹn', description: 'Các dịch vụ đặt hẹn khác' }
  ];

  try {
    for (const cat of categories) {
      await client.query(`
        INSERT INTO categories (slug, name, description)
        VALUES ($1, $2, $3)
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
      `, [cat.slug, cat.name, cat.description]);
      console.log(`Upserted category: ${cat.slug}`);
    }
    
    // Also, update existing businesses to use these valid slugs if possible
    // like 'spa' -> 'beauty', 'other' -> 'booking'
    await client.query(`UPDATE businesses SET category_slug = 'beauty' WHERE category_slug = 'spa';`);
    await client.query(`UPDATE businesses SET category_slug = 'booking' WHERE category_slug = 'other' OR category_slug = 'dich-vu';`);
    
  } catch (error) {
    console.error('Error seeding categories:', error);
  } finally {
    await client.end();
  }
}

seedCategories();
