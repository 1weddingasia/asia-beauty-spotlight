import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const gemma = {
    name: "GEMMA CLOTHING",
    slug: "gemma-fashion",
    address: "123 Đường Thời Trang, Quận 1, TP.HCM",
    phone: "0938123456",
    description: "Thời Trang Xu Hướng & Phụ Kiện. Tiết kiệm hơn mua qua sàn thương mại điện tử! Đặt giữ size, nhận freeship.",
    status: "published",
    plan_tier: "premium",
    is_featured: true,
    page_content: {
      logo_url: "/gemma_logo.png",
      banners: ["/gemma_hero.png"],
      gallery: ["/gemma_product1.png", "/gemma_product2.png"],
      brand_colors: { primary: "#1A1A1A", secondary: "#FF9B82", accent: "#FFDAB9" },
      theme: "minimal",
      services: [
        { id: "sp1", name: "Set Váy Linen Trắng", desc: "Thanh lịch, trẻ trung, chất liệu thoáng mát cho mùa hè.", price: 550000, compareAtPrice: 650000, tag: "BEST SELLER", image_url: "/gemma_product1.png" },
        { id: "sp2", name: "Túi Tote Gemma Canvas Base", desc: "Form dáng chuẩn, vừa vặn laptop, đi kèm móc khóa xinh xắn.", price: 299000, compareAtPrice: 350000, tag: "MỚI", image_url: "/gemma_product2.png" }
      ],
      deals: [
        { id: "d1", title: "Nhận Mã Giảm 50.000đ", promo_price: "0đ", original_price: "", note: "Áp dụng cho đơn từ 299k. Mã gửi Zalo.", badge: "HOT", cross_sells: [] },
        { id: "d2", title: "Đặt Hàng & Giữ Size Ưu Tiên", promo_price: "0đ phí giữ", note: "Shop giữ size và gọi xác nhận ship COD.", badge: "GIỮ HÀNG" },
        { id: "d3", title: "Freeship Toàn Quốc + Tặng Tote", promo_price: "Quà tặng", note: "Cho đơn từ 499k trực tiếp qua web.", badge: "ĐỘC QUYỀN" },
        { id: "d4", title: "Thành Viên VIP (Hoàn tiền 5%)", promo_price: "Miễn phí", note: "Tích điểm bằng SĐT mỗi lần mua sắm.", badge: "VIP" }
      ],
      telegram_chat_id: process.env.TELEGRAM_ADMIN_CHAT_ID || process.env.TELEGRAM_CHAT_ID
    }
  };

  const arena = {
    name: "CLB THỂ THAO ARENA",
    slug: "san-the-thao",
    address: "Khu Phức Hợp Thể Thao Arena, Quận 2, TP.HCM",
    phone: "0909123456",
    description: "Cụm sân Thể Thao Đa Năng (Bóng đá, Pickleball, Cầu Lông, Tennis). Đặt sân online 1-chạm không lo trùng lịch.",
    status: "published",
    plan_tier: "premium",
    is_featured: true,
    page_content: {
      logo_url: "/arena_sport_logo.png",
      banners: ["/arena_hero_pickleball.png", "/arena_night_court.png"],
      gallery: ["/arena_badminton_court.png", "/arena_pickleball_equipment.png"],
      brand_colors: { primary: "#0a0a0a", secondary: "#a3e635", accent: "#3f6212" }, // Lime/black
      theme: "dark",
      services: [
        { id: "s1", name: "Sân Bóng Đá Mini (5-7 người)", desc: "Mặt cỏ nhân tạo mới tinh, đèn LED chuẩn quốc tế.", price: 250000, tag: "BÓNG ĐÁ", image_url: "/arena_night_court.png" },
        { id: "s2", name: "Sân Pickleball Cao Cấp", desc: "Mặt sân chuẩn, quạt mát, có sẵn nước suối lạnh.", price: 150000, tag: "PICKLEBALL", image_url: "/arena_hero_pickleball.png" },
        { id: "s3", name: "Sân Cầu Lông Thảm Yonex", desc: "Thảm Yonex bám dính tốt, không chói mắt.", price: 90000, tag: "CẦU LÔNG", image_url: "/arena_badminton_court.png" },
        { id: "s4", name: "Sân Tennis Ngoài Trời", desc: "Sân tiêu chuẩn, cho thuê vợt bóng đầy đủ.", price: 200000, tag: "TENNIS" }
      ],
      deals: [
        { id: "d1", title: "Khung Giờ Vàng Thể Thao (17h - 22h)", promo_price: "Liên hệ", note: "Tặng kèm nước suối và khăn lạnh cho mỗi trận.", badge: "Giờ Vàng" },
        { id: "d2", title: "Đăng Ký Thành Viên CLB (Giảm 10%)", promo_price: "Miễn phí", note: "Mỗi lần thuê sân sẽ được giảm giá.", badge: "VIP" },
        { id: "d3", title: "Thuê Trọn Gói Sân + Vợt (2 giờ)", promo_price: "299.000đ", note: "Bao gồm sân, 4 vợt Pickleball/Cầu Lông và bóng/cầu.", badge: "COMBO" }
      ],
      telegram_chat_id: process.env.TELEGRAM_ADMIN_CHAT_ID || process.env.TELEGRAM_CHAT_ID
    }
  };

  for (const biz of [gemma, arena]) {
    // Check if exists
    const { data: existing } = await supabase.from('businesses').select('id').eq('slug', biz.slug).single();
    if (existing) {
      console.log(`Updating ${biz.slug}...`);
      await supabase.from('businesses').update(biz).eq('id', existing.id);
    } else {
      console.log(`Inserting ${biz.slug}...`);
      await supabase.from('businesses').insert(biz);
    }
  }

  // Also remove the old arena-sport if it was in the DB
  const { data: oldArena } = await supabase.from('businesses').select('id').eq('slug', 'arena-sport').single();
  if (oldArena) {
    console.log("Removing old arena-sport slug from DB...");
    await supabase.from('businesses').delete().eq('id', oldArena.id);
  }

  console.log("Done seeding!");
}

run();
