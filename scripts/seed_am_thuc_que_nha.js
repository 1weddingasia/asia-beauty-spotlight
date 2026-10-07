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
    slug: 'am-thuc-que-nha',
    name: 'Ẩm Thực Quê Nhà',
    status: 'published',
    category_slug: 'nha-hang', // industry tag
    owner_id: null,
    is_featured: true,
    short_description: 'Chốn bình yên, tĩnh lặng giữa nhịp sống náo nhiệt Sài Gòn. Tôn vinh ẩm thực truyền thống Việt Nam.',
    address: '28 Phạm Ngọc Thạch, Phường Võ Thị Sáu, Quận 3, TP.HCM',
    phone: '',
    description: 'Ẩm Thực Quê Nhà được định vị như một chốn bình yên, tĩnh lặng giữa nhịp sống náo nhiệt của Sài Gòn. Quán sở hữu không gian sân vườn rộng rãi, mang thiết kế bình dị, tinh tế và tôn vinh các giá trị ẩm thực truyền thống Việt Nam.\n\nHệ thống chi nhánh:\n- Quê Nhà Thành Thái: 5 Thành Thái, P.14, Q.10, TP.HCM.\n- Quê Nhà Phạm Ngọc Thạch: 28 Phạm Ngọc Thạch, P. Võ Thị Sáu, Q.3, TP.HCM.\n- Quê Nhà Nguyễn Thái Bình: 52A Nguyễn Thái Bình, P.4, Q.Tân Bình, TP.HCM.',
    socials: {
      facebook: '',
      tiktok: '',
      zalo: ''
    },
    page_content: {
      tagline: 'Chốn bình yên giữa Sài Gòn - Thêm món thêm bia, Thêm bạn thêm vui!',
      working_hours: '10:00 - 23:00 (Thứ 2 - Chủ Nhật)',
      logo_url: '/images/demo/nha-hang/logo.png',
      banners: [
        '/images/demo/nha-hang/banner1.png',
        '/images/demo/nha-hang/banner2.png'
      ],
      services: [
        {
          name: 'Đặt bàn Alacarte / Tụ tập',
          desc: 'Thực đơn gọi món đa dạng, đậm chất truyền thống. Các món nổi bật: Gà H\'Mong tiềm bí đỏ, Chả giò gánh Quê Nhà, Mì hấp tôm sú lá sen, Gỏi xoài khô cá sặc.',
          price: 0,
          original_price: 0,
          duration: 'Giữ chỗ miễn phí',
          image_url: '/images/demo/nha-hang/service1.png'
        },
        {
          name: 'Đặt Tiệc Tại Nhà Hàng',
          desc: 'Tổ chức các buổi tiệc liên hoan, tiệc sinh nhật, tiệc cuối năm trong không gian sân vườn rộng rãi, bình dị và tinh tế. "Thêm món thêm bia - Thêm bạn thêm vui" - hoá đơn càng lớn quà tặng càng hấp dẫn.',
          price: 0,
          original_price: 0,
          duration: 'Liên hệ tư vấn',
          image_url: '/images/demo/nha-hang/service2.png'
        },
        {
          name: 'Dịch vụ Catering Tận Nơi',
          desc: 'Tổ chức và phục vụ tiệc tận nơi theo yêu cầu. Thực đơn thượng hạng với Gà ác hầm bào ngư, Sò mai nướng mỡ hành, Lẩu cá linh bông điên điển.',
          price: 0,
          original_price: 0,
          duration: 'Báo giá theo menu',
          image_url: '/images/demo/nha-hang/service3.png'
        }
      ],
      deals: [
        {
          id: 'deal-quenha-1',
          title: 'Ưu Đãi Tiệc Catering',
          promo_price: 'Giảm 20%',
          original_price: 'Đồ uống',
          valid_until: 'Theo lịch đặt',
          desc: 'Giảm ngay 20% đồ uống, 5% thức ăn và tặng kèm voucher có giá trị lên đến 3.000.000 VNĐ khi đặt dịch vụ Catering.'
        },
        {
          id: 'deal-quenha-2',
          title: 'Bia Đồng Giá 15.000đ',
          promo_price: '15.000đ',
          original_price: '',
          valid_until: 'Sắp kết thúc',
          desc: 'Chương trình ưu đãi bia đồng giá 15.000đ dành cho các nhóm bạn tụ tập thưởng thức ẩm thực truyền thống.'
        }
      ],
      gallery: [
        '/images/demo/nha-hang/banner1.png',
        '/images/demo/nha-hang/banner2.png',
        '/images/demo/nha-hang/service1.png',
        '/images/demo/nha-hang/service2.png',
        '/images/demo/nha-hang/service3.png'
      ],
      reviews: [
        {
          author: 'Nguyễn Văn A',
          rating: 5,
          comment: 'Không gian sân vườn rất mát mẻ và yên tĩnh, trái ngược hoàn toàn với Sài Gòn ồn ào bên ngoài. Các món ăn truyền thống nêm nếm rất vừa miệng.'
        },
        {
          author: 'Trần Thị B',
          rating: 5,
          comment: 'Đã tổ chức tiệc sinh nhật ở chi nhánh Phạm Ngọc Thạch. Nhân viên phục vụ chu đáo, Gà ác hầm bào ngư cực kỳ ngon và bổ dưỡng!'
        }
      ]
    }
  };

  // Insert or update
  const { data: existing } = await supabase.from('businesses').select('id').eq('slug', business.slug).maybeSingle();
  if (existing) {
    const { error } = await supabase.from('businesses').update(business).eq('id', existing.id);
    if (error) console.error("Lỗi update:", error);
    else console.log("Cập nhật thành công nhà hàng Ẩm Thực Quê Nhà!");
  } else {
    const { error } = await supabase.from('businesses').insert(business);
    if (error) console.error("Lỗi insert:", error);
    else console.log("Thêm mới thành công nhà hàng Ẩm Thực Quê Nhà!");
  }
}

seed().catch((err) => {
  console.error("Seed thất bại:", err);
  process.exit(1);
});
