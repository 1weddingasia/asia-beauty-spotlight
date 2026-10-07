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
    slug: 'pro-detailing',
    name: 'Pro Detailing',
    status: 'published',
    category_slug: 'cham-soc-xe', // industry tag
    owner_id: null,
    is_featured: true,
    short_description: 'Chăm Sóc Xế Cưng Đạt Chuẩn, Đặt Lịch Tránh Chờ Cầu Nâng',
    address: '99 Speed Boulevard, Quận 7, TP.HCM',
    phone: '0912345678',
    description: 'Pro Detailing là trung tâm chăm sóc và nâng cấp xe chuyên nghiệp với hệ thống cầu nâng hiện đại, thiết bị công nghệ cao và đội ngũ kỹ thuật viên lành nghề. Chúng tôi cam kết mang đến diện mạo hoàn hảo nhất cho xế cưng của bạn bằng các sản phẩm chính hãng từ 3M, Meguiars và Ceramic Pro. Tone màu Đen nhám Carbon & Vàng Neon mạnh mẽ thể hiện sự nam tính và sắc sảo trong từng dịch vụ.',
    socials: {
      facebook: 'https://facebook.com/prodetailing',
      tiktok: 'https://tiktok.com/@prodetailing',
      zalo: 'https://zalo.me/0912345678'
    },
    page_content: {
      tagline: 'Chăm Sóc Xế Cưng Đạt Chuẩn, Đặt Lịch Tránh Chờ Cầu Nâng',
      working_hours: '07:30 - 18:30 (Thứ 2 - Thứ 7)',
      logo_url: '/images/demo/oto_logo.svg',
      banners: [
        'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?q=80&w=2000&auto=format&fit=crop'
      ],
      services: [
        {
          name: 'Rửa xe chi tiết gầm & Dưỡng khoang máy',
          description: 'Làm sạch toàn bộ khung gầm bằng dung dịch chuyên dụng. Rửa khoang máy và xịt dưỡng nhựa, cao su chống lão hóa, phục hồi màu đen nhám nguyên bản.',
          price: 250000,
          original_price: 350000,
          duration: '60 phút',
          image_url: 'https://images.unsplash.com/photo-1552930294-6b595f4c2974?q=80&w=1000&auto=format&fit=crop'
        },
        {
          name: 'Đánh bóng hiệu chỉnh bề mặt sơn & Phủ Ceramic',
          description: 'Hiệu chỉnh vết xước dăm, đánh bóng 3 bước tiêu chuẩn. Phủ Ceramic 9H siêu cứng bảo vệ lớp sơn khỏi ố nước, tia UV và tạo hiệu ứng lá sen kháng nước tuyệt đối.',
          price: 2500000,
          original_price: 3500000,
          duration: '1-2 Ngày',
          image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?q=80&w=1000&auto=format&fit=crop'
        },
        {
          name: 'Dán phim cách nhiệt 3M chính hãng (Gói xe 5 chỗ)',
          description: 'Gói dán full xe 5 chỗ bằng phim cách nhiệt 3M Crystalline cao cấp nhất. Chống tia UV 99%, giảm nhiệt độ cabin lên tới 60%, bảo hành điện tử 10 năm.',
          price: 4800000,
          original_price: 6000000,
          duration: '3 Giờ',
          image_url: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=1000&auto=format&fit=crop'
        }
      ],
      deals: [
        {
          id: 'deal-oto-1',
          title: 'Tặng Rửa Xe Chi Tiết Khi Phủ Ceramic',
          promo_price: '0đ',
          original_price: '250K',
          valid_until: 'Cuối tháng này',
          note: 'Đặt lịch phủ Ceramic trước qua website sẽ được tặng kèm 1 lượt Rửa xe chi tiết gầm & khoang máy.'
        }
      ],
      gallery: [
        'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1552930294-6b595f4c2974?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?q=80&w=1000&auto=format&fit=crop',
      ],
      reviews: [
        {
          author: 'Tuấn Cường',
          rating: 5,
          comment: 'Chất lượng quá ổn định. Thợ làm rất kỹ, khoang máy dọn xong nhìn như xe mới đập hộp. Đặt lịch trên web tiện cái là tới nơi là cầu nâng trống sẵn.'
        },
        {
          author: 'Hải Đăng',
          rating: 5,
          comment: 'Phủ ceramic ở đây bóng lộn luôn. Đi mưa về xịt nước cái là trôi tuột, không để lại giọt nước nào. 10 điểm cho dịch vụ.'
        }
      ]
    }
  };

  const { data: existing, error: lookupError } = await supabase.from('businesses').select('id').eq('slug', business.slug).maybeSingle();
  if (lookupError) throw lookupError;
  
  if (existing) {
    const { error } = await supabase.from('businesses').update(business).eq('id', existing.id);
    if (error) throw error;
    console.log("Cập nhật thành công demo Chăm sóc Ô tô!");
  } else {
    const { error } = await supabase.from('businesses').insert(business);
    if (error) throw error;
    console.log("Thêm mới thành công demo Chăm sóc Ô tô!");
  }
}

seed().catch((err) => {
  console.error("Seed thất bại:", err);
  process.exit(1);
});
