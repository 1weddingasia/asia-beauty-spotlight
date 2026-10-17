require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { Client } = require('pg');

const venues = [
  {
    slug: 'que-nha-thanh-thai',
    coordinates: { lat: 10.7725, lng: 106.6631 },
    profile: {
      min_guests: 15,
      max_guests: 250,
      num_vip_rooms: 6,
      price_min: 280000,
      price_max: 550000,
      spaces_and_amenities: ['phong_vip', 'san_khau', 'karaoke', 'sanh_lon'],
      cuisines: ['viet_truyen_thong', 'hai_san', 'bia_thu_cong'],
      party_perks: ['tang_bia', 'free_karaoke', 'free_gui_xe', 'free_backdrop'],
      party_deal_highlight: 'Tặng 2 thùng bia + Miễn phí dàn Karaoke VIP',
      party_description: 'Không gian ẩm thực Nam Bộ ấm cúng, 6 phòng VIP riêng biệt sức chứa từ 15 đến 80 khách, sảnh tiệc lớn có sân khấu biểu diễn.',
      is_vip: true,
      is_active: true,
      set_menus: [
        { name: 'Set Đoàn Viên', price: 2800000, pax: 10 },
        { name: 'Set Phú Quý', price: 3800000, pax: 10 },
        { name: 'Set Hoàng Kim', price: 5200000, pax: 10 }
      ]
    }
  },
  {
    slug: 'que-nha-pham-ngoc-thach',
    coordinates: { lat: 10.7842, lng: 106.6961 },
    profile: {
      min_guests: 20,
      max_guests: 350,
      num_vip_rooms: 8,
      price_min: 320000,
      price_max: 680000,
      spaces_and_amenities: ['phong_vip', 'ngoai_troi', 'rooftop', 'karaoke', 'man_chieu_led'],
      cuisines: ['viet_truyen_thong', 'hai_san', 'lau_nuong'],
      party_perks: ['free_karaoke', 'free_backdrop', 'tang_bia', 'cho_mang_ruou_vao'],
      party_deal_highlight: 'Tặng gói Backdrop trang trí + Tặng vang đón khách',
      party_description: 'Tọa lạc tại trung tâm Quận 3 với sân vườn thoáng mát, rooftop ngắm cảnh thành phố và phòng tiệc sang trọng phục vụ tiệc công ty đẳng cấp.',
      is_vip: true,
      is_active: true,
      set_menus: [
        { name: 'Set Hương Quê', price: 3200000, pax: 10 },
        { name: 'Set Thịnh Vượng', price: 4500000, pax: 10 }
      ]
    }
  },
  {
    slug: 'que-nha-nguyen-thai-binh',
    coordinates: { lat: 10.7963, lng: 106.6548 },
    profile: {
      min_guests: 10,
      max_guests: 180,
      num_vip_rooms: 4,
      price_min: 250000,
      price_max: 480000,
      spaces_and_amenities: ['phong_vip', 'sanh_lon', 'karaoke'],
      cuisines: ['viet_truyen_thong', 'lau_nuong'],
      party_perks: ['tang_bia', 'free_gui_xe', 'giam_gia_menu'],
      party_deal_highlight: 'Giảm 10% tổng hóa đơn bàn tiệc + Miễn phí gửi xe',
      party_description: 'Vị trí gần sân bay Tân Sơn Nhất, sảnh tiệc rộng rãi thuận tiện họp mặt phòng ban và tất niên cuối năm.',
      is_vip: false,
      is_active: true,
      set_menus: [
        { name: 'Set Sum Vầy', price: 2500000, pax: 10 },
        { name: 'Set Phát Tài', price: 3500000, pax: 10 }
      ]
    }
  },
  {
    slug: 'the-golden-plate',
    coordinates: { lat: 10.7758, lng: 106.7009 },
    profile: {
      min_guests: 12,
      max_guests: 120,
      num_vip_rooms: 3,
      price_min: 450000,
      price_max: 950000,
      spaces_and_amenities: ['phong_vip', 'rooftop', 'man_chieu_led'],
      cuisines: ['mon_au_steak', 'mon_hoa', 'bia_thu_cong'],
      party_perks: ['tang_bia', 'cho_mang_ruou_vao', 'free_backdrop'],
      party_deal_highlight: 'Miễn phí mở rượu vang + Tặng tráng miệng thượng hạng',
      party_description: 'Không gian tiệc Fine Dining đẳng cấp trung tâm Quận 1, hầm rượu vang và thực đơn Âu Á tinh tế cho tiệc tri ân VIP và đối tác cấp cao.',
      is_vip: true,
      is_active: true,
      set_menus: [
        { name: 'Set Golden Elegance', price: 4500000, pax: 10 },
        { name: 'Set Royal Diamond', price: 7500000, pax: 10 }
      ]
    }
  },
  {
    slug: 'am-thuc-que-nha',
    coordinates: { lat: 10.7845, lng: 106.6965 },
    profile: {
      min_guests: 15,
      max_guests: 200,
      num_vip_rooms: 5,
      price_min: 290000,
      price_max: 520000,
      spaces_and_amenities: ['phong_vip', 'ngoai_troi', 'san_khau'],
      cuisines: ['viet_truyen_thong', 'hai_san'],
      party_perks: ['tang_bia', 'free_karaoke', 'free_gui_xe'],
      party_deal_highlight: 'Tặng gói âm thanh biểu diễn + Tặng 1 thùng bia Sài Gòn',
      party_description: 'Gợi nhớ hương vị đồng quê mộc mạc giữa lòng phố thị, chuyên nhận đặt tiệc công ty và liên hoan gia đình trọn gói.',
      is_vip: false,
      is_active: true,
      set_menus: [
        { name: 'Set Bình An', price: 2900000, pax: 10 },
        { name: 'Set Đại Cát', price: 4200000, pax: 10 }
      ]
    }
  }
];

async function seed() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('🔗 Connected to Database for party seed');

  for (const item of venues) {
    const bizRes = await client.query('SELECT id, name FROM businesses WHERE slug = $1', [item.slug]);
    if (bizRes.rows.length === 0) {
      console.log(`⚠️ Business ${item.slug} not found!`);
      continue;
    }
    const businessId = bizRes.rows[0].id;
    const businessName = bizRes.rows[0].name;

    // 1. Update coordinates if null or update to exact location
    await client.query(
      'UPDATE businesses SET map_coordinates = $1 WHERE id = $2',
      [JSON.stringify(item.coordinates), businessId]
    );
    console.log(`📍 Updated coordinates for ${businessName} (${item.slug})`);

    // 2. Upsert business_party_profiles
    const p = item.profile;
    await client.query(`
      INSERT INTO business_party_profiles (
        business_id,
        min_guests,
        max_guests,
        num_vip_rooms,
        price_min,
        price_max,
        spaces_and_amenities,
        cuisines,
        party_perks,
        party_deal_highlight,
        party_description,
        set_menus,
        is_vip,
        is_active,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
      ON CONFLICT (business_id) DO UPDATE SET
        min_guests = EXCLUDED.min_guests,
        max_guests = EXCLUDED.max_guests,
        num_vip_rooms = EXCLUDED.num_vip_rooms,
        price_min = EXCLUDED.price_min,
        price_max = EXCLUDED.price_max,
        spaces_and_amenities = EXCLUDED.spaces_and_amenities,
        cuisines = EXCLUDED.cuisines,
        party_perks = EXCLUDED.party_perks,
        party_deal_highlight = EXCLUDED.party_deal_highlight,
        party_description = EXCLUDED.party_description,
        set_menus = EXCLUDED.set_menus,
        is_vip = EXCLUDED.is_vip,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    `, [
      businessId,
      p.min_guests,
      p.max_guests,
      p.num_vip_rooms,
      p.price_min,
      p.price_max,
      p.spaces_and_amenities,
      p.cuisines,
      p.party_perks,
      p.party_deal_highlight,
      p.party_description,
      JSON.stringify(p.set_menus),
      p.is_vip,
      p.is_active
    ]);

    console.log(`✅ Seeded party profile for ${businessName}`);
  }

  // Verify
  const checkRes = await client.query(`
    SELECT b.name, b.slug, b.map_coordinates, p.min_guests, p.max_guests, p.price_min, p.price_max, p.party_deal_highlight, p.is_vip, p.is_active
    FROM business_party_profiles p
    JOIN businesses b ON b.id = p.business_id
    WHERE p.is_active = true
    ORDER BY p.is_vip DESC, b.name ASC;
  `);

  console.log('\n🌟 Total active party venues in DB:', checkRes.rows.length);
  console.table(checkRes.rows.map(r => ({
    name: r.name,
    slug: r.slug,
    coords: JSON.stringify(r.map_coordinates),
    price: `${r.price_min?.toLocaleString()} - ${r.price_max?.toLocaleString()}`,
    is_vip: r.is_vip
  })));

  await client.end();
}

seed().catch(console.error);
