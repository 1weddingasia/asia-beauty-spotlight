import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN_1BOOKING || process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || '584207194';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function run() {
  console.log('--- KHỞI TẠO 2 GIAN HÀNG THỰC TẾ & BẮN TELEGRAM ---');

  // 1. TẠO TÀI KHOẢN VÀ GIAN HÀNG ƯU ĐÃI (SPA)
  const spaEmail = 'chutiem.thaomoc@1booking.asia';
  const spaPassword = 'MatKhauSpa2026!';
  const spaManager = 'Nguyễn Thị Kim Ngân';
  const spaPhone = '0918731411';
  const spaAddress = '188 Hai Bà Trưng, Phường Tân Định, Quận 1, TP. Hồ Chí Minh';
  const spaSlug = 'spa-thao-moc-luxury';

  let spaUserId;
  const { data: spaUserCheck } = await supabase.auth.admin.listUsers();
  const existingSpaUser = spaUserCheck?.users?.find(u => u.email === spaEmail);

  if (existingSpaUser) {
    spaUserId = existingSpaUser.id;
  } else {
    const { data: newSpaUser } = await supabase.auth.admin.createUser({
      email: spaEmail,
      password: spaPassword,
      email_confirm: true,
      user_metadata: { full_name: spaManager, role: 'owner' }
    });
    spaUserId = newSpaUser.user.id;
  }

  await supabase.from('profiles').upsert({
    id: spaUserId,
    email: spaEmail,
    full_name: spaManager,
    role: 'owner'
  }, { onConflict: 'id' });

  // Xóa cũ nếu có slug trùng để tạo mới tinh
  await supabase.from('businesses').delete().eq('slug', spaSlug);

  const spaPageContent = {
    tagline: 'Spa Thảo Mộc Luxury – Tinh hoa thư giãn, nâng tầm sắc đẹp Á Đông.',
    description: `Tọa lạc tại ${spaAddress}, Spa Thảo Mộc Luxury mang đến liệu trình chăm sóc da chuẩn y khoa và thư giãn chuyên sâu trong không gian thảo mộc thanh tịnh.`,
    address: spaAddress,
    phone: spaPhone,
    zalo: spaPhone,
    hours: '09:00 - 21:30 hàng ngày',
    logo_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=300&auto=format&fit=crop&q=80',
    banners: ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&auto=format&fit=crop&q=80'],
    gallery: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop&q=80'
    ],
    amenities: ['Phòng VIP riêng tư', 'Trà thảo mộc dưỡng nhan', 'Bãi đỗ ô tô miễn phí', 'Wifi tốc độ cao'],
    deals: [
      {
        id: `deal-spa-1`,
        title: 'Liệu Trình Chăm Sóc Da Chuyên Sâu 9 Bước Phục Hồi Sinh Học',
        promo_price: '299.000đ',
        original_price: '750.000đ',
        note: 'Áp dụng cho khách hàng đăng ký nhận mã ưu đãi trên 1Booking / 1Beauty.',
        badge: 'ƯU ĐÃI ĐỘC QUYỀN',
      }
    ],
    services: [
      { id: 'srv-1', name: 'Gội đầu dưỡng sinh thảo dược 60 phút', price: 150000, desc: 'Giảm đau đầu, đã thông kinh lạc' },
      { id: 'srv-2', name: 'Massage body tinh dầu đá nóng 75 phút', price: 350000, desc: 'Thư giãn toàn thân xua tan mệt mỏi' },
      { id: 'srv-3', name: 'Cấy tế bào tươi căng bóng da', price: 650000, desc: 'Cấp ẩm và phục hồi da tổn thương' }
    ]
  };

  const { data: spaBiz } = await supabase.from('businesses').insert({
    name: 'Spa Thảo Mộc Sài Gòn Luxury',
    slug: spaSlug,
    category_slug: 'spa-thu-gian',
    address: spaAddress,
    phone: spaPhone,
    email: spaEmail,
    zalo: spaPhone,
    status: 'draft', // Chờ duyệt
    owner_id: spaUserId,
    is_featured: false,
    location_slug: 'ho-chi-minh',
    map_coordinates: { lat: 10.7891, lng: 106.6917 },
    page_content: spaPageContent
  }).select('id, name, slug').single();

  await supabase.from('business_members').upsert({
    business_id: spaBiz.id,
    user_id: spaUserId,
    role: 'owner'
  }, { onConflict: 'business_id,user_id' });

  await supabase.from('onboarding_submissions').insert({
    business_id: spaBiz.id,
    type: 'deal',
    contact_name: spaManager,
    contact_phone: spaPhone,
    contact_email: spaEmail,
    status: 'pending'
  });

  console.log('✅ Đã tạo Spa Draft:', spaBiz.name, 'ID:', spaBiz.id);

  // 2. TẠO TÀI KHOẢN VÀ GIAN HÀNG ĐẶT TIỆC (NHÀ HÀNG)
  const partyEmail = 'quanly.songtrang@1booking.asia';
  const partyPassword = 'MatKhauTiec2026!';
  const partyManager = 'Trần Văn Hưng';
  const partyPhone = '0918731411';
  const partyAddress = '360 Bến Vân Đồn, Phường 1, Quận 4, TP. Hồ Chí Minh';
  const partySlug = 'nha-hang-tiec-song-trang';

  let partyUserId;
  const existingPartyUser = spaUserCheck?.users?.find(u => u.email === partyEmail);

  if (existingPartyUser) {
    partyUserId = existingPartyUser.id;
  } else {
    const { data: newPartyUser } = await supabase.auth.admin.createUser({
      email: partyEmail,
      password: partyPassword,
      email_confirm: true,
      user_metadata: { full_name: partyManager, role: 'owner' }
    });
    partyUserId = newPartyUser.user.id;
  }

  await supabase.from('profiles').upsert({
    id: partyUserId,
    email: partyEmail,
    full_name: partyManager,
    role: 'owner'
  }, { onConflict: 'id' });

  // Xóa cũ nếu có slug trùng
  await supabase.from('businesses').delete().eq('slug', partySlug);

  const partyPageContent = {
    tagline: 'Sảnh Tiệc Sông Trăng – Không gian ven sông đẳng cấp, ẩm thực tinh hoa.',
    description: `Tọa lạc bên bờ sông Sài Gòn lộng gió tại ${partyAddress}, Sảnh Tiệc Sông Trăng là địa điểm hoàn hảo cho các buổi tiệc tất niên công ty, hội nghị và họp mặt gia đình cuối năm.`,
    address: partyAddress,
    phone: partyPhone,
    zalo: partyPhone,
    logo_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&auto=format&fit=crop&q=80',
    banners: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80'],
    gallery: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&auto=format&fit=crop&q=80'
    ],
    amenities: ['Phòng VIP riêng', 'Sân khấu & Backdrop', 'Âm thanh - Ánh sáng chuyên nghiệp', 'Màn hình LED cực lớn', 'Bãi đỗ ô tô', 'Hát Karaoke'],
    deals: [
      {
        id: `deal-party-1`,
        title: 'Tặng trọn gói Âm thanh - Ánh sáng sân khấu & Bia tươi cho đoàn từ 5 bàn',
        promo_price: 'Từ 2.800.000đ/bàn',
        original_price: 'Đến 6.500.000đ/bàn',
        note: 'Áp dụng cho tiệc tất niên, họp mặt công ty cuối năm.',
        badge: 'TIỆC TẤT NIÊN',
      }
    ]
  };

  const { data: partyBiz } = await supabase.from('businesses').insert({
    name: 'Trung Tâm Hội Nghị & Sảnh Tiệc Sông Trăng',
    slug: partySlug,
    category_slug: 'nha-hang-am-thuc',
    address: partyAddress,
    phone: partyPhone,
    email: partyEmail,
    zalo: partyPhone,
    status: 'draft', // Chờ duyệt
    owner_id: partyUserId,
    is_featured: false,
    location_slug: 'ho-chi-minh',
    map_coordinates: { lat: 10.7612, lng: 106.6985 },
    page_content: partyPageContent
  }).select('id, name, slug').single();

  await supabase.from('business_party_profiles').upsert({
    business_id: partyBiz.id,
    min_guests: 15,
    max_guests: 450,
    num_vip_rooms: 6,
    price_min: 280000,
    price_max: 650000,
    party_deal_highlight: 'Tặng trọn gói Âm thanh - Ánh sáng sân khấu & Bia tươi cho đoàn từ 5 bàn',
    party_description: 'Không gian tiệc ven sông đẳng cấp, view trực diện hoàng hôn lãng mạn. Thực đơn đa dạng chuẩn phong vị Á - Âu với đội ngũ đầu bếp 5 sao.',
    party_banner_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
    party_gallery: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80'
    ],
    spaces_and_amenities: ['Phòng VIP riêng', 'Sân khấu & Backdrop', 'Âm thanh ánh sáng', 'Bãi đỗ ô tô', 'Hát Karaoke'],
    cuisines: ['Ẩm thực Việt Nam', 'Hải sản cao cấp', 'Món Hoa truyền thống'],
    party_perks: ['Tặng hoa tươi để bàn', 'Miễn phí màn hình LED sảnh chính'],
    set_menus: [
      {
        name: 'Set Tiệc Phúc Lộc Thọ',
        price: 2800000,
        dishes: ['Khai vị 3 món thượng hạng', 'Gỏi tôm thịt ngó sen', 'Gà hấp lá chúc miền Tây', 'Cá chẽm sốt chanh leo', 'Lẩu riêu cua bắp bò', 'Tráng miệng chè hạt sen']
      },
      {
        name: 'Set Tiệc Thịnh Vượng Hoàng Gia',
        price: 4500000,
        dishes: ['Súp vi cá bào ngư', 'Bồ câu quay da giòn Hong Kong', 'Heo sữa quay bánh bao', 'Cá tầm nướng muối ớt Tây Bắc', 'Lẩu hải sản chua cay', 'Chè yến hoa hồng']
      }
    ],
    is_active: true,
    is_vip: false,
  }, { onConflict: 'business_id' });

  await supabase.from('business_members').upsert({
    business_id: partyBiz.id,
    user_id: partyUserId,
    role: 'owner'
  }, { onConflict: 'business_id,user_id' });

  await supabase.from('onboarding_submissions').insert({
    business_id: partyBiz.id,
    type: 'party',
    contact_name: partyManager,
    contact_phone: partyPhone,
    contact_email: partyEmail,
    status: 'pending'
  });

  console.log('✅ Đã tạo Nhà hàng Tiệc Draft:', partyBiz.name, 'ID:', partyBiz.id);

  // 3. BẮN TIN NHẮN TELEGRAM MỚI VỚI NÚT BẤM CHO ADMIN
  // Tin 1: Spa
  const spaDemoUrl = `https://1booking.asia/${spaBiz.slug}`;
  const msg1 = `
<b>🛎️ [1BOOKING/1BEAUTY] HỒ SƠ GIAN HÀNG ƯU ĐÃI MỚI!</b>
━━━━━━━━━━━━━━━━━━━━
📌 <b>Loại trang:</b> 🎁 HỒ SƠ GIAN HÀNG ƯU ĐÃI
🏛️ <b>Tên quán:</b> <b>${spaBiz.name}</b>
🔗 <b>Link xem trước:</b> <code>/${spaBiz.slug}</code>
📍 <b>Địa chỉ:</b> ${spaAddress}
👤 <b>Đại diện:</b> ${spaManager}
📞 <b>SĐT:</b> <code>${spaPhone}</code>
✉️ <b>Email TK Chính Thức:</b> <code>${spaEmail}</code>
🔑 <b>Mật Khẩu Tạo Sẵn:</b> <code>${spaPassword}</code>

🤖 <b>AI ĐÃ TRAU CHUỐT NỘI DUNG:</b>
• <i>Slogan:</i> "${spaPageContent.tagline}"
• <i>Gói ưu đãi:</i> Liệu Trình Chăm Sóc Da Chuyên Sâu 9 Bước Phục Hồi Sinh Học
━━━━━━━━━━━━━━━━━━━━
👉 <i>Trang đang ở DRAFT (vẫn xem được demo). Anh bấm nút bên dưới để duyệt công khai:</i>
`.trim();

  const keyboard1 = {
    inline_keyboard: [
      [
        { text: '👁️ Xem Trang Demo', url: spaDemoUrl },
        { text: '✅ Duyệt & Bật Public', callback_data: `pub:${spaBiz.id}` },
      ],
      [
        { text: '🔄 Nhờ AI Viết Lại', callback_data: `ai:${spaBiz.id}` },
        { text: '⛔ Tạm Ngưng', callback_data: `sus:${spaBiz.id}` },
      ],
    ],
  };

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text: msg1, parse_mode: 'HTML', reply_markup: keyboard1 }),
  });
  console.log('✅ Đã gửi thông báo Spa vào Telegram Admin!');

  // Tin 2: Tiệc
  const partyDemoUrl = `https://1booking.asia/${partyBiz.slug}/tiec`;
  const msg2 = `
<b>🛎️ [1BOOKING] HỒ SƠ ĐẶT TIỆC TẤT NIÊN MỚI!</b>
━━━━━━━━━━━━━━━━━━━━
📌 <b>Loại trang:</b> 🏮 HỒ SƠ ĐẶT TIỆC TẤT NIÊN & SỰ KIỆN
🏛️ <b>Tên nhà hàng:</b> <b>${partyBiz.name}</b>
🔗 <b>Link trang tiệc:</b> <code>/${partyBiz.slug}/tiec</code>
📍 <b>Địa chỉ:</b> ${partyAddress}
👤 <b>Quản lý sảnh:</b> ${partyManager}
📞 <b>Hotline tiệc:</b> <code>${partyPhone}</code>
✉️ <b>Email TK Chính Thức:</b> <code>${partyEmail}</code>
🔑 <b>Mật Khẩu Tạo Sẵn:</b> <code>${partyPassword}</code>
👥 <b>Sức chứa:</b> 15 - 450 khách | 6 phòng VIP
💰 <b>Giá bàn:</b> 2.800.000đ - 6.500.000đ/bàn

🤖 <b>AI ĐÃ BIÊN TẬP NỘI DUNG:</b>
• <i>Slogan:</i> "${partyPageContent.tagline}"
• <i>Ưu đãi tiệc:</i> Tặng trọn gói Âm thanh - Ánh sáng sân khấu & Bia tươi cho đoàn từ 5 bàn
━━━━━━━━━━━━━━━━━━━━
👉 <i>Trang tiệc đang ở DRAFT (vẫn xem được demo). Anh bấm nút bên dưới để duyệt công khai:</i>
`.trim();

  const keyboard2 = {
    inline_keyboard: [
      [
        { text: '🏮 Xem Trang Tiệc Demo', url: partyDemoUrl },
        { text: '✅ Duyệt & Bật Public', callback_data: `pub:${partyBiz.id}` },
      ],
      [
        { text: '🔄 Nhờ AI Viết Lại', callback_data: `ai:${partyBiz.id}` },
        { text: '⛔ Tạm Ngưng', callback_data: `sus:${partyBiz.id}` },
      ],
    ],
  };

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text: msg2, parse_mode: 'HTML', reply_markup: keyboard2 }),
  });
  console.log('✅ Đã gửi thông báo Tiệc vào Telegram Admin!');

  console.log('🎉 TOÀN BỘ 2 GIAN HÀNG ĐÃ ĐƯỢC LƯU VĨNH VIỄN TRÊN CSDL THẬT!');
}

run().catch(console.error);
