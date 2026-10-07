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
    slug: 'the-golden-plate',
    name: 'Nhà Hàng The Golden Plate',
    status: 'published',
    category_slug: 'nha-hang', // industry tag
    owner_id: null,
    is_featured: true,
    short_description: 'Giữ Bàn Đẹp Giờ Cao Điểm, Nhận Ngay Ưu Đãi Giảm 10%',
    address: '68 Phố Ẩm Thực, Quận 1, TP.HCM',
    phone: '0987654321',
    description: 'The Golden Plate mang đến trải nghiệm Fine Dining và BBQ đỉnh cao. Với thiết kế không gian sang trọng mang tông màu cam đất, đỏ rượu và nâu gỗ ấm cúng, nhà hàng là lựa chọn hoàn hảo cho các buổi tiệc gia đình, gặp gỡ đối tác hay sinh nhật kỷ niệm. Nguyên liệu thực phẩm thượng hạng, đội ngũ đầu bếp 5 sao chuẩn quốc tế hứa hẹn đánh thức mọi giác quan của bạn.',
    socials: {
      facebook: 'https://facebook.com/thegoldenplate',
      tiktok: 'https://tiktok.com/@goldenplate',
      zalo: 'https://zalo.me/0987654321'
    },
    page_content: {
      tagline: 'Giữ Bàn Đẹp Giờ Cao Điểm, Nhận Ngay Ưu Đãi Giảm 10%',
      working_hours: '10:00 - 23:00 (Thứ 2 - Chủ Nhật)',
      logo_url: '/images/demo/nha-hang/logo.png',
      banners: [
        '/images/demo/nha-hang/banner1.jpg',
        '/images/demo/nha-hang/banner2.jpg'
      ],
      services: [
        {
          name: 'Đặt bàn tiệc gia đình / Sinh nhật',
          desc: 'Tặng ngay gói trang trí cơ bản (bóng bay, bảng tên) khi đặt bàn tiệc gia đình hoặc sinh nhật từ 10 người trở lên. Không gian ấm cúng, phục vụ chu đáo tận tình.',
          price: 0,
          original_price: 0,
          duration: 'Miễn phí giữ chỗ',
          image_url: '/images/demo/nha-hang/service1.jpg'
        },
        {
          name: 'Combo Nướng Lẩu Đặc Biệt',
          desc: 'Set nướng lẩu thượng hạng dành cho 4 người bao gồm bò Mỹ vân cẩm thạch, hải sản tươi sống và 2 loại nước lẩu tinh túy. Tặng kèm rau nấm thả lẩu không giới hạn.',
          price: 599000,
          original_price: 899000,
          duration: 'Dành cho 4 người',
          image_url: '/images/demo/nha-hang/service2.jpg'
        },
        {
          name: 'Đặt chỗ liên hoan công ty',
          desc: 'Phòng VIP riêng tư với sức chứa từ 20-50 khách. Hỗ trợ hệ thống âm thanh ánh sáng chuyên nghiệp, menu thiết kế riêng theo ngân sách của doanh nghiệp.',
          price: 0,
          duration: 'Giữ chỗ 1-chạm',
          image_url: '/images/demo/nha-hang/service3.jpg'
        }
      ],
      deals: [
        {
          id: 'deal-nhahang-1',
          title: 'Giảm 10% Tổng Bill Giờ Cao Điểm',
          promo_price: '-10%',
          original_price: 'Giá Gốc',
          valid_until: 'Hết tuần này',
          desc: 'Áp dụng cho khách hàng đặt bàn qua 1Booking.Asia trước 18h00 mỗi ngày. Tiết kiệm chi phí, không lo hết bàn.'
        }
      ],
      gallery: [
        '/images/demo/nha-hang/banner1.jpg',
        '/images/demo/nha-hang/banner2.jpg',
        '/images/demo/nha-hang/service1.jpg',
        '/images/demo/nha-hang/service2.jpg',
        '/images/demo/nha-hang/service3.jpg'
      ],
      reviews: [
        {
          author: 'Lê Hoàng Anh',
          rating: 5,
          comment: 'Đồ ăn cực kỳ xuất sắc. Không gian sang trọng và riêng tư. Đặc biệt là book bàn trên web rất tiện, đến nơi là có nhân viên mời vào tận bàn luôn không phải chờ đợi.'
        },
        {
          author: 'Phạm Thanh Tâm',
          rating: 5,
          comment: 'Hôm qua mình vừa tổ chức sinh nhật cho mẹ ở đây. Nhà hàng chuẩn bị bóng bay dễ thương lắm. Thịt nướng mềm ngọt, lẩu Thái chua cay đậm vị. Sẽ ủng hộ dài dài!'
        }
      ]
    }
  };

  // Insert or update
  const { data: existing } = await supabase.from('businesses').select('id').eq('slug', business.slug).maybeSingle();
  if (existing) {
    const { error } = await supabase.from('businesses').update(business).eq('id', existing.id);
    if (error) console.error("Lỗi update:", error);
    else console.log("Cập nhật thành công demo Nhà Hàng!");
  } else {
    const { error } = await supabase.from('businesses').insert(business);
    if (error) console.error("Lỗi insert:", error);
    else console.log("Thêm mới thành công demo Nhà Hàng!");
  }
}

seed().catch((err) => {
  console.error("Seed thất bại:", err);
  process.exit(1);
});
