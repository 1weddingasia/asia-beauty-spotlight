import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const businessData = {
    name: "LUNA Beauty Spa",
    slug: "luna-beauty-spa-q10",
    address: "366 Đường 3/2, P.12, Q.10, TP.HCM",
    phone: "0909.123.456",
    email: "luna@1booking.asia",
    website: "facebook.com/lunabeautyspa",
    short_description: "Không gian làm đẹp thư giãn và sang trọng bậc nhất tại trung tâm Quận 10, nơi đánh thức vẻ đẹp tự nhiên của bạn.",
    description: `
      <h2>Chào mừng đến với LUNA Beauty Spa</h2>
      <p>Tọa lạc tại vị trí đắc địa <b>366 Đường 3/2, Quận 10</b>, <b>LUNA Beauty Spa</b> tự hào là điểm đến lý tưởng cho những ai đang tìm kiếm một không gian thư giãn hoàn hảo và dịch vụ chăm sóc sắc đẹp cao cấp.</p>
      <p>Với thiết kế sang trọng, ánh sáng ấm áp cùng hương tinh dầu thoang thoảng, LUNA mang đến cho bạn cảm giác bình yên ngay từ giây phút đầu tiên bước chân vào. Chúng tôi sử dụng các dòng mỹ phẩm cao cấp kết hợp cùng công nghệ làm đẹp tiên tiến nhất hiện nay.</p>
      <br>
      <h3>Giá trị cốt lõi của LUNA</h3>
      <p>Đội ngũ chuyên viên tại LUNA được đào tạo bài bản, tận tâm và luôn thấu hiểu từng nhu cầu nhỏ nhất của khách hàng. Chúng tôi cam kết mang lại hiệu quả rõ rệt sau mỗi liệu trình: từ <b>chăm sóc da mặt chuyên sâu</b>, <b>massage trị liệu body</b> giúp giải tỏa căng thẳng, cho đến dịch vụ <b>triệt lông công nghệ cao</b> an toàn tuyệt đối.</p>
      <p><i>Hãy để LUNA Beauty Spa chăm sóc và nuôi dưỡng sắc đẹp của bạn mỗi ngày!</i></p>
    `,
    seo_title: "LUNA Beauty Spa - Chăm Sóc Da & Massage Thư Giãn Quận 10",
    seo_description: "Trải nghiệm dịch vụ chăm sóc da mặt, massage body và triệt lông chuyên nghiệp tại LUNA Beauty Spa Quận 10. Không gian sang trọng, thư giãn tuyệt đối.",
    status: 'draft',
    is_featured: false,
    plan_tier: 'premium',
    page_content: {
      logo_url: '/images/luna/logo.png',
      banners: [
        '/images/luna/banner1.png',
        '/images/luna/banner2.png'
      ],
      services: [
        { id: "s1", name: "Chăm sóc da mặt cao cấp", price: "400k - 1.5 triệu", status: "active", description: "Liệu trình làm sạch sâu, cấp ẩm và phục hồi da tươi trẻ." },
        { id: "s2", name: "Massage Body Trị Liệu", price: "500k - 1.5 triệu", status: "active", description: "Giải tỏa căng thẳng cơ bắp, lưu thông khí huyết với đá nóng." },
        { id: "s3", name: "Triệt lông Diode Laser", price: "300k - 1 triệu", status: "active", description: "Triệt lông vĩnh viễn, an toàn không đau rát, se khít lỗ chân lông." }
      ],
      deals: [
        { id: "d1", title: "Giảm 30% Gói Chăm Sóc Da Lần Đầu", original_price: "1.000.000đ", promo_price: "700.000đ", status: "active", note: "Chỉ áp dụng cho khách hàng đặt lịch qua 1Booking.Asia", badge: "HOT" }
      ],
      gallery: []
    }
  };

  console.log("Seeding to Supabase...");
  let { data: users } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  let user = users?.users?.find(u => u.email === businessData.email);
  if (!user) {
    const { data: newUser, error } = await supabase.auth.admin.createUser({
      email: businessData.email,
      password: '123456',
      email_confirm: true,
      user_metadata: { name: businessData.name }
    });
    if (!error && newUser) user = newUser.user;
  }
  if (user) businessData.owner_id = user.id;

  const { error: upsertError } = await supabase.from('businesses').upsert(businessData, { onConflict: 'slug' });
  if (upsertError) {
    console.log("Error:", upsertError);
  } else {
    console.log(`Success! Created visually rich draft for ${businessData.name}`);
  }
}

run();
