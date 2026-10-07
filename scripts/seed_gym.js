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
    slug: 'elite-fitness',
    name: 'Elite Fitness & Yoga',
    status: 'published',
    category_slug: 'the-hinh', // industry tag
    owner_id: null,
    is_featured: true,
    short_description: 'Đăng Ký Buổi Tập Thử 1:1 Cùng Master Trainer',
    address: 'Vinhomes Central Park, Bình Thạnh, TP.HCM',
    phone: '0933112233',
    description: 'Elite Fitness & Yoga mang đến không gian tập luyện đẳng cấp quốc tế với hệ thống máy móc tân tiến nhập khẩu 100%. Tông màu đen và xanh lá neon mạnh mẽ sẽ thắp lên ngọn lửa nhiệt huyết và ý chí thép trong mỗi buổi tập. Tại đây, đội ngũ Master Trainer luôn sẵn sàng đồng hành 1:1 cùng bạn, từ đánh giá thể lực, lên giáo án cá nhân hóa đến thiết kế thực đơn dinh dưỡng.',
    socials: {
      facebook: 'https://facebook.com/elitefitness',
      tiktok: 'https://tiktok.com/@elitefitness',
      zalo: 'https://zalo.me/0933112233'
    },
    page_content: {
      tagline: 'Đăng Ký Buổi Tập Thử 1:1 Cùng Master Trainer',
      working_hours: '05:30 - 22:00 (Thứ 2 - Chủ Nhật)',
      logo_url: '/images/demo/gym/logo.png',
      banners: [
        '/images/demo/gym/banner1.jpg',
        '/images/demo/gym/banner2.jpg'
      ],
      services: [
        {
          name: 'Buổi test thể lực & Tập thử 1:1 với PT',
          description: 'Phân tích chỉ số cơ thể InBody chuyên sâu. Master Trainer trực tiếp hướng dẫn 1 buổi tập mẫu để đánh giá form tập và tư vấn lộ trình tăng cơ giảm mỡ chuẩn khoa học.',
          price: 0,
          original_price: 500000,
          duration: '1 Buổi (90p)',
          image_url: '/images/demo/gym/service1.jpg'
        },
        {
          name: 'Khóa Yoga Phục Hồi & Trị Liệu Cổ Vai Gáy',
          description: 'Giáo án đặc biệt dành cho dân văn phòng, giúp giải phóng áp lực cột sống, trị liệu đau mỏi cổ vai gáy. Lớp học số lượng giới hạn, không gian thiền định thư thái.',
          price: 1500000,
          original_price: 2000000,
          duration: '12 Buổi',
          image_url: '/images/demo/gym/service2.jpg'
        },
        {
          name: 'Gói Huấn luyện Tăng cơ - Giảm mỡ cá nhân',
          description: 'Kèm sát 1:1 trong 1 tháng. Cam kết thay đổi hình thể rõ rệt. Bao gồm đánh giá định kỳ hàng tuần, thiết kế và điều chỉnh thực đơn dinh dưỡng (Meal Prep) theo từng giai đoạn.',
          price: 3600000,
          original_price: 4500000,
          duration: '1 Tháng',
          image_url: '/images/demo/gym/service3.jpg'
        }
      ],
      deals: [
        {
          id: 'deal-gym-1',
          title: 'Tặng Áo Tập & Bình Nước Thể Thao',
          promo_price: '0đ',
          original_price: '500K',
          valid_until: 'Tuần này',
          note: 'Đăng ký gói Huấn luyện cá nhân từ 3 tháng trở lên sẽ nhận ngay Set quà tặng Độc quyền trị giá 500.000đ.'
        }
      ],
      gallery: [
        '/images/demo/gym/banner1.jpg',
        '/images/demo/gym/banner2.jpg',
        '/images/demo/gym/service1.jpg',
        '/images/demo/gym/service2.jpg',
        '/images/demo/gym/service3.jpg'
      ],
      reviews: [
        {
          author: 'Linh Hoàng',
          rating: 5,
          comment: 'PT nhiệt tình và siêu có tâm. Chỉ sau 1 tháng theo giáo án mình đã giảm được 2kg mỡ thừa, cơ bắp săn chắc hơn hẳn. Phòng tập sạch sẽ, máy lạnh mát rượi.'
        },
        {
          author: 'Hoài Nam',
          rating: 5,
          comment: 'Gói Yoga trị liệu đỉnh thật sự. Cổ vai gáy mình đỡ hẳn đau nhức sau 12 buổi. Khuyên mọi người dân văn phòng nên thử nhé!'
        }
      ]
    }
  };

  const { data: existing, error: lookupError } = await supabase.from('businesses').select('id').eq('slug', business.slug).maybeSingle();
  if (lookupError) throw lookupError;
  
  if (existing) {
    const { error } = await supabase.from('businesses').update(business).eq('id', existing.id);
    if (error) throw error;
    console.log("Cập nhật thành công demo Gym!");
  } else {
    const { error } = await supabase.from('businesses').insert(business);
    if (error) throw error;
    console.log("Thêm mới thành công demo Gym!");
  }
}

seed().catch((err) => {
  console.error("Seed thất bại:", err);
  process.exit(1);
});
