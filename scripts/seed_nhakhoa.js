import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Tải biến môi trường từ .env.local
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
    slug: 'nha-khoa-quoc-te',
    name: 'Nha Khoa Quốc Tế',
    status: 'published',
    category_slug: 'nha-khoa', // industry tag
    owner_id: null,
    is_featured: true,
    address: '99 Đại Lộ Răng Sứ, Quận Trung Tâm, TP.HCM',
    phone: '0901234567',
    description: 'Nha Khoa Quốc Tế tự hào là trung tâm chăm sóc răng miệng hàng đầu với trang thiết bị y tế hiện đại nhập khẩu 100% từ Đức và Mỹ. Không gian khám chữa bệnh được vô trùng tuyệt đối, tuân thủ nghiêm ngặt tiêu chuẩn của Bộ Y Tế. Đội ngũ y bác sĩ chuyên khoa Răng Hàm Mặt trên 10 năm kinh nghiệm luôn tận tâm, mang đến nụ cười rạng rỡ và sự an tâm tuyệt đối cho khách hàng.',
    socials: {
      facebook: 'https://facebook.com/nhakhoaquoc',
      tiktok: 'https://tiktok.com/@nhakhoaquoc',
      zalo: 'https://zalo.me/0901234567'
    },
    page_content: {
      tagline: 'Đặt Lịch Khám Ưu Tiên, Không Chờ Đợi, Không Xếp Hàng',
      working_hours: '08:00 - 20:00 (Thứ 2 - Chủ Nhật)',
      logo_url: '/images/demo/nha-khoa/logo.png',
      banners: ['/images/demo/nha-khoa/banner.jpg'],
      services: [
        {
          name: 'Cạo vôi răng sóng siêu âm & Đánh bóng',
          desc: 'Làm sạch mảng bám, cao răng cứng đầu dưới nướu bằng công nghệ siêu âm không ê buốt, không chảy máu. Kèm theo đánh bóng giúp răng sáng khỏe, ngăn ngừa viêm nha chu và mùi hôi miệng.',
          price: 150000,
          original_price: 300000,
          duration: '30 phút',
          image_url: '/images/demo/nha-khoa/service-1.jpg'
        },
        {
          name: 'Tẩy trắng răng công nghệ Laser Whitening',
          desc: 'Công nghệ ánh sáng Laser tiên tiến giúp phá vỡ các chuỗi peptide tạo màu, mang lại hàm răng trắng sáng bật 2-3 tông chỉ sau 1 liệu trình. An toàn tuyệt đối cho men răng, duy trì hiệu quả dài lâu.',
          price: 1200000,
          duration: '45 phút',
          image_url: '/images/demo/nha-khoa/service-2.jpg'
        },
        {
          name: 'Khám tổng quát & Chụp phim tư vấn niềng răng',
          desc: 'Gói khám toàn diện bao gồm chụp phim X-quang Panorama và Cephalo, lấy dấu hàm 3D và lập phác đồ điều trị chi tiết bởi bác sĩ chỉnh nha chuyên sâu.',
          price: 0,
          duration: '60 phút',
          image_url: '/images/demo/nha-khoa/service-3.jpg'
        }
      ],
      deals: [
        {
          id: 'deal-nhakhoa-1',
          title: 'Combo Cạo Vôi Đánh Bóng Chỉ 150k',
          promo_price: '150K',
          original_price: '300K',
          valid_until: 'Hết tháng này',
          desc: 'Áp dụng cho khách hàng lần đầu đặt lịch qua 1Booking.Asia. Không phát sinh chi phí.'
        }
      ],
      gallery: [
        '/images/demo/nha-khoa/banner.jpg',
        '/images/demo/nha-khoa/service-1.jpg',
        '/images/demo/nha-khoa/service-2.jpg',
        '/images/demo/nha-khoa/service-3.jpg'
      ],
      reviews: [
        {
          author: 'Nguyễn Văn Minh',
          rating: 5,
          comment: 'Phòng khám rất sạch sẽ và hiện đại. Bác sĩ cạo vôi răng cực kỳ nhẹ nhàng, không hề có cảm giác ê buốt. Sẽ giới thiệu cho người nhà.'
        },
        {
          author: 'Trần Thu Hà',
          rating: 5,
          comment: 'Mình mới tẩy trắng ở đây xong. Răng bật tông rõ rệt mà không bị nhạy cảm. Hệ thống đặt lịch nhanh, đến đúng giờ là được vào làm ngay không phải đợi.'
        }
      ]
    }
  };

  // Insert or update
  const { data: existing } = await supabase.from('businesses').select('id').eq('slug', business.slug).maybeSingle();
  if (existing) {
    const { error } = await supabase.from('businesses').update(business).eq('id', existing.id);
    if (error) console.error("Lỗi update:", error);
    else console.log("Cập nhật thành công demo Nha Khoa!");
  } else {
    const { error } = await supabase.from('businesses').insert(business);
    if (error) console.error("Lỗi insert:", error);
    else console.log("Thêm mới thành công demo Nha Khoa!");
  }
}

seed().catch((err) => {
  console.error("Seed thất bại:", err);
  process.exit(1);
});
