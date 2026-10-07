import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Thiếu biến môi trường Supabase.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  const business = {
    slug: 'paris-wedding',
    name: 'Paris Wedding & Studio',
    status: 'published',
    category_slug: 'chup-anh-studio', // industry tag (will be mapped in frontend)
    owner_id: null,
    is_featured: true,
    short_description: 'Lưu Giữ Khoảnh Khắc Hạnh Phúc, Đặt Hẹn Thử Váy Cưới VIP',
    address: '123 Hồ Văn Huê, Phú Nhuận, TP.HCM',
    phone: '0909445566',
    description: 'Paris Wedding Studio là không gian nghệ thuật mang đậm chất thơ và sự tinh tế. Với tông màu trắng ngà và hồng pastel lãng mạn, chúng tôi lưu giữ những khoảnh khắc hạnh phúc nhất của các cặp đôi. Từ những bộ váy cưới cao cấp thiết kế độc quyền đến các bộ ảnh Profile doanh nhân chuyên nghiệp, mọi dịch vụ đều được chăm chút tỉ mỉ với chất lượng hình ảnh đẳng cấp nhất.',
    socials: {
      facebook: 'https://facebook.com/pariswedding',
      tiktok: 'https://tiktok.com/@pariswedding',
      zalo: 'https://zalo.me/0909445566'
    },
    page_content: {
      tagline: 'Lưu Giữ Khoảnh Khắc Hạnh Phúc, Đặt Hẹn Thử Váy Cưới VIP',
      working_hours: '08:00 - 21:00 (Thứ 2 - Chủ Nhật)',
      logo_url: '/images/demo/studio/logo.png',
      banners: [
        '/images/demo/studio/banner1.jpg',
        '/images/demo/studio/banner2.jpg'
      ],
      services: [
        {
          name: 'Thử váy cưới cao cấp & Tư vấn Concept',
          description: 'Trải nghiệm mặc thử các bộ sưu tập váy cưới mới nhất trong phòng thử VIP. Chuyên viên sẽ tư vấn concept trang điểm và phong cách chụp ảnh phù hợp nhất với vóc dáng và sở thích.',
          price: 0,
          original_price: 1000000,
          duration: '1-2 Giờ',
          image_url: '/images/demo/studio/service1.jpg'
        },
        {
          name: 'Chụp ảnh chân dung Profile / Doanh nhân',
          description: 'Gói chụp chân dung cá nhân, profile công ty hoặc doanh nhân tại không gian Studio. Bao gồm makeup, làm tóc, hỗ trợ trang phục cơ bản và chỉnh sửa 10 file hình xuất sắc nhất.',
          price: 850000,
          original_price: 1500000,
          duration: '3 Giờ',
          image_url: '/images/demo/studio/service2.jpg'
        },
        {
          name: 'Gói chụp phóng sự cưới & Pre-wedding',
          description: 'Lưu giữ trọn vẹn cảm xúc ngày cưới với góc máy phóng sự nghệ thuật. Bao gồm chụp Pre-wedding ngoại cảnh hoặc phim trường, 2 váy cưới cao cấp, 1 vest chú rể và toàn bộ file gốc.',
          price: 6900000,
          original_price: 9000000,
          duration: 'Trọn Gói',
          image_url: '/images/demo/studio/service3.jpg'
        }
      ],
      deals: [
        {
          id: 'deal-studio-1',
          title: 'Tặng Phóng Sự Cưới Trị Giá 3 Triệu',
          promo_price: '0đ',
          original_price: '3.000.000đ',
          valid_until: 'Tháng này',
          note: 'Dành riêng cho 10 cặp đôi đầu tiên chốt lịch gói chụp Pre-wedding trong tháng. Tặng kèm gói quay phim phóng sự cưới rước dâu.'
        }
      ],
      gallery: [
        '/images/demo/studio/banner1.jpg',
        '/images/demo/studio/banner2.jpg',
        '/images/demo/studio/service1.jpg',
        '/images/demo/studio/service2.jpg',
        '/images/demo/studio/service3.jpg'
      ],
      reviews: [
        {
          author: 'Minh Thư',
          rating: 5,
          comment: 'Studio siêu đẹp và thơm. Các bạn tư vấn váy rất nhiệt tình, váy mới và lộng lẫy. Make-up tone Hàn Quốc nhìn rất trong trẻo, mình cực kỳ ưng ý!'
        },
        {
          author: 'Tuấn Trần',
          rating: 5,
          comment: 'Vừa chụp bộ ảnh Profile doanh nhân ở đây xong. Nhiếp ảnh gia bắt khoảnh khắc rất tốt, hình gốc đã đẹp rồi. Sẽ quay lại ủng hộ tiếp.'
        }
      ]
    }
  };

  const { data: existing, error: lookupError } = await supabase.from('businesses').select('id').eq('slug', business.slug).maybeSingle();
  if (lookupError) throw lookupError;
  
  if (existing) {
    const { error } = await supabase.from('businesses').update(business).eq('id', existing.id);
    if (error) throw error;
    console.log("Cập nhật thành công demo Studio!");
  } else {
    const { error } = await supabase.from('businesses').insert(business);
    if (error) throw error;
    console.log("Thêm mới thành công demo Studio!");
  }
}

seed().catch((err) => {
  console.error("Seed thất bại:", err);
  process.exit(1);
});
