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
    slug: 'may-homestay-dalat',
    name: 'Mây Homestay & Retreat Đà Lạt',
    status: 'published',
    category_slug: 'homestay', // industry tag (mapped in frontend)
    owner_id: null,
    is_featured: true,
    short_description: 'Đặt Phòng Trực Tiếp, Tiết Kiệm 20%',
    address: '123 Khe Sanh, Phường 10, Đà Lạt, Lâm Đồng',
    phone: '0988112233',
    description: 'Nằm tĩnh lặng bên sườn đồi thông với chiếc view ôm trọn thung lũng, Mây Homestay là chốn chữa lành mộc mạc dành cho những ai muốn rời xa thành thị. Thiết kế 100% gỗ thông tự nhiên mang đến sự ấm áp. Chúng tôi cung cấp đa dạng từ phòng đôi lãng mạn đến Villa nguyên căn cho đại gia đình, kèm theo các trải nghiệm thiên nhiên độc đáo.',
    socials: {
      facebook: 'https://facebook.com/mayhomestay',
      tiktok: 'https://tiktok.com/@mayhomestay',
      instagram: 'https://instagram.com/mayhomestay'
    },
    page_content: {
      tagline: 'Đặt Phòng Trực Tiếp, Tiết Kiệm 20% So Với Các Sàn Trung Gian',
      working_hours: 'Lễ tân 24/7 (Check-in 14:00 - Check-out 12:00)',
      logo_url: '/images/demo/homestay/logo.svg',
      banners: [
        '/images/demo/homestay/banner1.jpg',
        '/images/demo/homestay/banner2.jpg'
      ],
      services: [
        {
          name: 'Phòng đôi view thung lũng (Kèm ăn sáng)',
          description: 'Phòng 25m2 ốp gỗ thông toàn bộ. Cửa sổ kính chạm sàn view săn mây và đồi thông. Đã bao gồm buffet sáng nhẹ nhàng với bánh mì mứt thủ công và cà phê Đà Lạt.',
          price: 450000,
          original_price: 600000,
          duration: '1 Đêm',
          image_url: '/images/demo/homestay/service1.jpg'
        },
        {
          name: 'Villa nguyên căn sân vườn BBQ',
          description: 'Căn biệt thự gỗ 4 phòng ngủ dành cho nhóm 10-15 người. Có sẵn bếp đầy đủ tiện nghi, lò nướng than BBQ ngoài trời. Tự do ca hát đốt lửa trại (trước 22h).',
          price: 2500000,
          original_price: 3500000,
          duration: '1 Đêm',
          image_url: '/images/demo/homestay/service2.jpg'
        },
        {
          name: 'Tour chèo SUP ngắm bình minh Tuyền Lâm',
          description: 'Trải nghiệm đón bình minh trên mặt hồ Tuyền Lâm phẳng lặng. Có HDV hướng dẫn kỹ thuật chèo, hỗ trợ chụp ảnh flycam siêu đẹp. Kèm trà gừng nóng và snack.',
          price: 350000,
          original_price: 500000,
          duration: '3 Giờ (5h - 8h Sáng)',
          image_url: '/images/demo/homestay/service3.jpg'
        }
      ],
      deals: [
        {
          id: 'deal-home-1',
          title: 'Ở 3 Đêm Tính Tiền 2 Đêm',
          promo_price: '900K',
          original_price: '1.350K',
          valid_until: 'Hết tháng này',
          note: 'Dành riêng cho khách đặt hạng phòng đôi và check-in vào các ngày trong tuần (Thứ 2 - Thứ 5). Tận hưởng kì nghỉ dài hơn với giá siêu hời!'
        }
      ],
      gallery: [
        '/images/demo/homestay/banner1.jpg',
        '/images/demo/homestay/banner2.jpg',
        '/images/demo/homestay/service1.jpg',
        '/images/demo/homestay/service2.jpg',
        '/images/demo/homestay/service3.jpg'
      ],
      reviews: [
        {
          author: 'Minh Thư',
          rating: 5,
          comment: 'View phòng đẹp như tranh vẽ. Sáng dậy kéo rèm ra là mây ùa vào tận giường. Anh chị chủ vô cùng dễ thương, tối còn nướng khoai lang cho tụi mình ăn ké.'
        },
        {
          author: 'Gia đình Bác Hùng',
          rating: 5,
          comment: 'Chúng tôi thuê nguyên căn Villa cho cả nhà. Sân vườn rộng rãi, làm BBQ rất vui. Nhà vệ sinh sạch sẽ nước nóng lạnh đầy đủ. Nhất định sẽ quay lại.'
        }
      ]
    }
  };

  const { data: existing, error: lookupError } = await supabase.from('businesses').select('id').eq('slug', business.slug).maybeSingle();
  if (lookupError) throw lookupError;
  
  if (existing) {
    const { error } = await supabase.from('businesses').update(business).eq('id', existing.id);
    if (error) throw error;
    console.log("Cập nhật thành công demo Homestay!");
  } else {
    const { error } = await supabase.from('businesses').insert(business);
    if (error) throw error;
    console.log("Thêm mới thành công demo Homestay!");
  }
}

seed().catch((err) => {
  console.error("Seed thất bại:", err);
  process.exit(1);
});
