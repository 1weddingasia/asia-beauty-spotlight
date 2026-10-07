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
    slug: 'happy-pet',
    name: 'Happy Pet Spa & Hotel',
    status: 'published',
    category_slug: 'thu-cung', // industry tag (mapped in frontend)
    owner_id: null,
    is_featured: true,
    short_description: 'Spa Làm Đẹp & Nghỉ Dưỡng 5 Sao Cho Boss Cưng',
    address: '456 Thảo Điền, Quận 2, TP.HCM',
    phone: '0988776655',
    description: 'Chào mừng các Boss đến với Happy Pet - Thiên đường Spa & Nghỉ dưỡng 5 sao. Với tông màu Vàng Bơ và Nâu Caramel ấm áp, không gian của chúng tôi mang lại sự thân thiện, an toàn tuyệt đối. Đội ngũ Groomer chuyên nghiệp, tận tâm sẽ mang lại vẻ ngoài hoàn hảo nhất cho thú cưng. Ngoài ra, hệ thống khách sạn phòng lạnh khử mùi 24/7 giúp các bé có kỳ nghỉ dưỡng thoải mái khi sen đi vắng.',
    socials: {
      facebook: 'https://facebook.com/happypet',
      tiktok: 'https://tiktok.com/@happypet',
      zalo: 'https://zalo.me/0988776655'
    },
    page_content: {
      tagline: 'Spa Làm Đẹp & Nghỉ Dưỡng 5 Sao Cho Boss Cưng',
      working_hours: '08:30 - 20:00 (Thứ 2 - Chủ Nhật)',
      logo_url: '/images/demo/pet/logo.svg',
      banners: [
        '/images/demo/pet/banner1.jpg',
        '/images/demo/pet/banner2.jpg'
      ],
      services: [
        {
          name: 'Combo Tắm vệ sinh, cắt móng & Vắt tuyến hôi',
          description: 'Combo làm sạch toàn diện bao gồm: Tắm massage sữa tắm dịu nhẹ, sấy chải lông, cắt mài móng, vệ sinh tai và vắt tuyến hôi. Giúp bé sạch sẽ, thơm tho suốt cả tuần.',
          price: 120000,
          original_price: 200000,
          duration: '60 Phút',
          image_url: '/images/demo/pet/service1.jpg'
        },
        {
          name: 'Cắt tỉa lông tạo kiểu theo yêu cầu',
          description: 'Master Groomer sẽ tư vấn và cắt tạo kiểu Teddy, Boo, Poodle chuẩn form... tùy theo giống chó/mèo. Đã bao gồm trọn gói Combo tắm vệ sinh cơ bản.',
          price: 250000,
          original_price: 400000,
          duration: '2 Giờ',
          image_url: '/images/demo/pet/service2.jpg'
        },
        {
          name: 'Khách sạn trông giữ thú cưng',
          description: 'Phòng VIP lưu chuồng cá nhân. Không gian 100% máy lạnh, hệ thống lọc không khí và camera giám sát 24/24. Chế độ ăn uống hạt Royal Canin và dắt đi dạo mỗi ngày.',
          price: 180000,
          original_price: 250000,
          duration: '1 Ngày Đêm',
          image_url: '/images/demo/pet/service3.jpg'
        }
      ],
      deals: [
        {
          id: 'deal-pet-1',
          title: 'Giảm 50% Gói Tỉa Lông Lần Đầu',
          promo_price: '125K',
          original_price: '250K',
          valid_until: 'Hôm nay',
          note: 'Dành riêng cho khách hàng lần đầu đặt lịch qua hệ thống. Boss sạch sẽ, sen vui vẻ!'
        }
      ],
      gallery: [
        '/images/demo/pet/banner1.jpg',
        '/images/demo/pet/banner2.jpg',
        '/images/demo/pet/service1.jpg',
        '/images/demo/pet/service2.jpg',
        '/images/demo/pet/service3.jpg'
      ],
      reviews: [
        {
          author: 'Lan Anh',
          rating: 5,
          comment: 'Bé Poodle nhà mình khá nhát nhưng đến đây các bạn nhân viên dỗ ngọt siêu giỏi. Cắt kiểu gấu siêu đáng yêu luôn. 10 điểm!'
        },
        {
          author: 'Quốc Đạt',
          rating: 5,
          comment: 'Chỗ gửi mèo yên tâm nhất Quận 2. Chuồng rộng rãi, sạch sẽ không có mùi hôi. Ngày nào các bạn cũng update video bé ăn ngủ cho mình xem.'
        }
      ]
    }
  };

  const { data: existing, error: lookupError } = await supabase.from('businesses').select('id').eq('slug', business.slug).maybeSingle();
  if (lookupError) throw lookupError;
  
  if (existing) {
    const { error } = await supabase.from('businesses').update(business).eq('id', existing.id);
    if (error) throw error;
    console.log("Cập nhật thành công demo Pet Care!");
  } else {
    const { error } = await supabase.from('businesses').insert(business);
    if (error) throw error;
    console.log("Thêm mới thành công demo Pet Care!");
  }
}

seed().catch((err) => {
  console.error("Seed thất bại:", err);
  process.exit(1);
});
