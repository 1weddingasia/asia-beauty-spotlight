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
    slug: 'chuyen-gia-tu-van',
    name: 'Expert Coaching & Consulting',
    status: 'published',
    category_slug: 'tu-van', // industry tag (mapped in frontend)
    owner_id: null,
    is_featured: true,
    short_description: 'Tham Vấn 1:1 Cùng Chuyên Gia, Giải Quyết Tận Gốc Vấn Đề',
    address: 'Tầng 15, Vincom Center, Quận 1, TP.HCM',
    phone: '19001122',
    description: 'Tại Expert Coaching, chúng tôi đồng hành cùng cá nhân và doanh nghiệp bằng những phiên khai vấn chuyên sâu. Thay vì đưa ra lời khuyên sáo rỗng, các chuyên gia cấp cao (ICF Certified) sẽ ứng dụng phương pháp Coaching chuẩn quốc tế giúp bạn tự gỡ rối vấn đề tâm lý, định hướng sự nghiệp, và tái cấu trúc quy trình quản lý hiệu quả.',
    socials: {
      facebook: 'https://facebook.com/expertcoaching',
      linkedin: 'https://linkedin.com/company/expertcoaching',
      zalo: 'https://zalo.me/19001122'
    },
    page_content: {
      tagline: 'Tham Vấn 1:1 Cùng Chuyên Gia, Giải Quyết Tận Gốc Vấn Đề',
      working_hours: 'Booking theo lịch trống trên hệ thống',
      logo_url: '/images/demo/coaching/logo.svg',
      banners: [
        '/images/demo/coaching/banner1.jpg',
        '/images/demo/coaching/banner2.jpg'
      ],
      services: [
        {
          name: 'Thẩm định hồ sơ & Định hướng nghề nghiệp',
          description: '30 phút trao đổi trực tuyến (Google Meet). Chuyên gia sẽ review CV/Portfolio của bạn, đánh giá năng lực lõi và tư vấn lộ trình phát triển hoặc chuyển ngành phù hợp.',
          price: 0,
          original_price: 500000,
          duration: '30 Phút',
          image_url: '/images/demo/coaching/service1.jpg'
        },
        {
          name: 'Phiên Khai vấn Cá nhân 1:1',
          description: 'Coaching gỡ rối tâm lý, vượt qua khủng hoảng hoặc bế tắc trong công việc/mối quan hệ. Bảo mật thông tin tuyệt đối. Thực hiện trực tiếp tại phòng Coaching VIP.',
          price: 800000,
          original_price: 1200000,
          duration: '60 Phút',
          image_url: '/images/demo/coaching/service2.jpg'
        },
        {
          name: 'Tư vấn tái cấu trúc quy trình Doanh nghiệp',
          description: 'Dành cho các CEO/SME. Rà soát pháp lý, xây dựng và tối ưu hóa hệ thống quy trình vận hành phòng ban. Cam kết tăng 20% hiệu suất sau 3 tháng áp dụng.',
          price: 2000000,
          original_price: 3500000,
          duration: '1 Buổi (2 Giờ)',
          image_url: '/images/demo/coaching/service3.jpg'
        }
      ],
      deals: [
        {
          id: 'deal-coach-1',
          title: 'Tặng 1 Buổi Theo Dõi Sau Coaching',
          promo_price: 'Miễn phí',
          original_price: '800K',
          valid_until: 'Số lượng giới hạn',
          note: 'Khi mua gói 5 phiên Khai vấn Cá nhân, bạn sẽ được tặng 1 buổi Follow-up (đánh giá tiến độ) vào tháng kế tiếp.'
        }
      ],
      gallery: [
        '/images/demo/coaching/banner1.jpg',
        '/images/demo/coaching/banner2.jpg',
        '/images/demo/coaching/service1.jpg',
        '/images/demo/coaching/service2.jpg',
        '/images/demo/coaching/service3.jpg'
      ],
      reviews: [
        {
          author: 'Anh Tú (Trưởng phòng Marketing)',
          rating: 5,
          comment: 'Tôi từng bị burn-out rất nặng. Qua 3 phiên làm việc cùng chuyên gia, tôi đã tìm lại được điểm cân bằng và nhận ra cốt lõi vấn đề không nằm ở công việc, mà ở cách tôi quản lý kỳ vọng.'
        },
        {
          author: 'Chị Ngọc (CEO Startup)',
          rating: 5,
          comment: 'Dịch vụ tư vấn quy trình cực kỳ sắc bén. Nhờ áp dụng form biểu và KPI mới mà tháng này phòng Sales của công ty tôi đã hoạt động trơn tru hơn hẳn.'
        }
      ]
    }
  };

  const { data: existing, error: lookupError } = await supabase.from('businesses').select('id').eq('slug', business.slug).maybeSingle();
  if (lookupError) throw lookupError;
  
  if (existing) {
    const { error } = await supabase.from('businesses').update(business).eq('id', existing.id);
    if (error) throw error;
    console.log("Cập nhật thành công demo Coaching!");
  } else {
    const { error } = await supabase.from('businesses').insert(business);
    if (error) throw error;
    console.log("Thêm mới thành công demo Coaching!");
  }
}

seed().catch((err) => {
  console.error("Seed thất bại:", err);
  process.exit(1);
});
