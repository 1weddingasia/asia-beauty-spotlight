const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: existing } = await supabase.from('businesses').select('page_content').eq('slug', 'luxury-spa-demo').single();
  if (!existing) return;
  const content = existing.page_content;

  // Fix the encoding
  content.deals[0].title = 'Combo Gội Đầu Dưỡng Sinh Hoàng Gia';
  content.deals[0].note = '90 phút thư giãn toàn diện';
  content.deals[0].badge = 'Hot Nhất';

  content.deals[1].title = 'Massage Body Tinh Dầu Trị Liệu';
  content.deals[1].note = 'Trị đau mỏi vai gáy';
  content.deals[1].badge = 'Thư giãn';

  content.services[0].title = 'Chăm sóc da mặt chuyên sâu';
  content.services[1].title = 'Triệt lông vĩnh viễn (Nách)';
  content.services[2].title = 'Tẩy Tế Bào Chết Toàn Thân';

  content.cross_sells = [
    'Đắp mặt nạ vàng 24k (+99K)',
    'Ngâm chân thảo dược (+50K)',
    'Tẩy tế bào chết toàn thân (+150K)'
  ];

  content.tagline = 'Đánh Thức Vẻ Đẹp Hoàng Gia';
  content.working_hours_text = 'Thứ 2 - Chủ Nhật: 08:00 - 22:00';
  content.standee_tagline = 'GIẢM 50% DỊCH VỤ';

  const payload = {
    short_description: 'Không gian thư giãn đẳng cấp hoàng gia, đánh thức vẻ đẹp tự nhiên của bạn.',
    description: 'LUXURY CLINIC & SPA tự hào là điểm đến chăm sóc sức khỏe và sắc đẹp hàng đầu. Với không gian thiết kế sang trọng, tinh tế cùng đội ngũ chuyên gia giàu kinh nghiệm, chúng tôi cam kết mang lại những trải nghiệm thư giãn tuyệt vời nhất.\n\nSứ mệnh của chúng tôi là đánh thức vẻ đẹp tự nhiên và tái tạo năng lượng cho mọi khách hàng thông qua các liệu pháp spa cao cấp, kết hợp hài hòa giữa y học cổ truyền và công nghệ thẩm mỹ hiện đại.',
    page_content: content
  };

  await supabase.from('businesses').update(payload).eq('slug', 'luxury-spa-demo');
  console.log('Fixed encoding successfully!');
}
run();
