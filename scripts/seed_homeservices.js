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
    slug: 'dien-lanh-nhanh',
    name: 'Điện Lạnh Nhanh & Sửa Nhà 24/7',
    status: 'published',
    category_slug: 'sua-chua-tai-nha', // industry tag (mapped in frontend)
    owner_id: null,
    is_featured: true,
    short_description: 'Thợ Có Mặt Sau 30 Phút, Báo Giá Minh Bạch',
    address: '88 Nguyễn Khắc Viện, Tân Phú, TP.HCM',
    phone: '19008899',
    description: 'Dịch vụ sửa chữa, vệ sinh điện lạnh và bảo trì nhà cửa trọn gói số 1 TPHCM. Với triết lý "Nhanh Chóng - Minh Bạch - Uy Tín", đội ngũ kỹ thuật viên của chúng tôi luôn sẵn sàng có mặt sau 30 phút. Báo giá công khai trên hệ thống trước khi làm, tuyệt đối không vẽ bệnh hay phát sinh chi phí. Bảo hành điện tử minh bạch qua ứng dụng.',
    socials: {
      facebook: 'https://facebook.com/dienlanhnhanh',
      tiktok: 'https://tiktok.com/@dienlanhnhanh',
      zalo: 'https://zalo.me/19008899'
    },
    page_content: {
      tagline: 'Thợ Có Mặt Sau 30 Phút, Báo Giá Minh Bạch, Không Phát Sinh',
      working_hours: '24/7 (Phục vụ cả ngày Lễ, Tết)',
      logo_url: '/images/demo/homeservices/logo.svg',
      banners: [
        '/images/demo/homeservices/banner1.jpg',
        '/images/demo/homeservices/banner2.jpg'
      ],
      services: [
        {
          name: 'Vệ sinh máy lạnh Inverter tận nhà',
          description: 'Quy trình rửa máy lạnh 6 bước chuẩn y khoa, vệ sinh sạch dàn nóng & dàn lạnh, thông ống thoát nước. Đo và châm thêm gas nếu thiếu. Bảo hành chảy nước 3 tháng.',
          price: 150000,
          original_price: 200000,
          duration: '30-45 Phút/Máy',
          image_url: '/images/demo/homeservices/service1.jpg'
        },
        {
          name: 'Giặt nệm, sofa & rèm bằng hơi nước nóng',
          description: 'Sử dụng công nghệ hút sâu bụi mịn và phun hút hơi nước nóng diệt khuẩn 99.9%. Tẩy sạch vết bẩn ố vàng, khử mùi hôi thú cưng trên nệm Kymdan, Sofa nỉ/da.',
          price: 350000,
          original_price: 500000,
          duration: '1-2 Giờ',
          image_url: '/images/demo/homeservices/service2.jpg'
        },
        {
          name: 'Khảo sát sửa điện nước & chống thấm',
          description: 'Thợ kỹ thuật xuống tận nhà kiểm tra tình trạng chập cháy điện, rò rỉ nước, thấm dột trần tường. Đưa ra phương án và báo giá chi tiết, không làm không sao.',
          price: 0,
          original_price: 150000,
          duration: '30 Phút',
          image_url: '/images/demo/homeservices/service3.jpg'
        }
      ],
      deals: [
        {
          id: 'deal-home-1',
          title: 'Combo Vệ Sinh 3 Máy Lạnh Chỉ 400K',
          promo_price: '400K',
          original_price: '600K',
          valid_until: 'Hết tuần này',
          note: 'Chương trình tri ân khách hàng. Khi vệ sinh từ 3 máy lạnh trở lên, giá chỉ còn 400K (Bao châm thêm gas R32/R410A).'
        }
      ],
      gallery: [
        '/images/demo/homeservices/banner1.jpg',
        '/images/demo/homeservices/banner2.jpg',
        '/images/demo/homeservices/service1.jpg',
        '/images/demo/homeservices/service2.jpg',
        '/images/demo/homeservices/service3.jpg'
      ],
      reviews: [
        {
          author: 'Cô Hoa (Q7)',
          rating: 5,
          comment: 'Thợ làm rất kỹ và gọn gàng, rửa xong máy lạnh chạy êm ru và mát lạnh. Báo giá bao nhiêu là thu bấy nhiêu, không xin thêm tiền cà phê. Tuyệt vời!'
        },
        {
          author: 'Anh Hưng',
          rating: 5,
          comment: 'Dịch vụ giặt sofa rất tốt. Ghế nhà mình bị cún tè ố màu mà thợ giặt bằng hơi nước nóng xong sạch boong như mới, lại còn thơm nữa.'
        }
      ]
    }
  };

  const { data: existing, error: lookupError } = await supabase.from('businesses').select('id').eq('slug', business.slug).maybeSingle();
  if (lookupError) throw lookupError;
  
  if (existing) {
    const { error } = await supabase.from('businesses').update(business).eq('id', existing.id);
    if (error) throw error;
    console.log("Cập nhật thành công demo Home Services!");
  } else {
    const { error } = await supabase.from('businesses').insert(business);
    if (error) throw error;
    console.log("Thêm mới thành công demo Home Services!");
  }
}

seed().catch((err) => {
  console.error("Seed thất bại:", err);
  process.exit(1);
});
