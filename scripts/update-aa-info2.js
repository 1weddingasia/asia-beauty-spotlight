import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const slug = "vien-tham-my-quoc-te-aa";

  const { data: existingBiz, error: fetchErr } = await supabase.from('businesses').select('*').eq('slug', slug).maybeSingle();

  if (!existingBiz) {
    console.log("Business not found!");
    return;
  }

  const page_content = existingBiz.page_content || {};
  
  // Thông tin cập nhật (Story & Tagline)
  const short_description = "Phòng khám chuyên khoa thẩm mỹ và da liễu hàng đầu tại trung tâm TP.HCM.";
  const description = `Viện Thẩm Mỹ Quốc Tế AA (AA Clinic) là một phòng khám chuyên khoa thẩm mỹ và da liễu cao cấp nằm tại trung tâm Thành phố Hồ Chí Minh, được dẫn dắt bởi ThS.BS. Trần Ngọc Sĩ. Với nhiều năm kinh nghiệm và chuyên môn sâu rộng, ThS.BS. Trần Ngọc Sĩ cùng đội ngũ y bác sĩ tại AA Clinic luôn tận tâm mang đến những giải pháp làm đẹp toàn diện, an toàn và chuẩn y khoa nhất cho từng khách hàng.

Chúng tôi hiểu rằng mỗi làn da, mỗi đường nét đều mang một vẻ đẹp riêng biệt. Do đó, AA Clinic không ngừng cập nhật các công nghệ tiên tiến nhất trên thế giới như Ultherapy PRIME, Thermage FLX, cùng các phác đồ chăm sóc điều trị chuyên biệt như MCT Exosomes hay Hydra Peel 2.0 Pro. Mọi liệu trình đều được cá nhân hóa nhằm đánh thức và nuôi dưỡng vẻ đẹp tự nhiên của bạn từ sâu bên trong.

Sứ mệnh của Viện Thẩm Mỹ Quốc Tế AA là đồng hành cùng bạn trên hành trình chăm sóc sắc đẹp, không chỉ mang lại sự tự tin với diện mạo hoàn hảo mà còn đảm bảo trải nghiệm dịch vụ đẳng cấp, tinh tế và an tâm tuyệt đối.`;

  const amenities = [
    "Công nghệ chuyển giao chuẩn quốc tế",
    "ThS.BS. Trần Ngọc Sĩ trực tiếp thăm khám",
    "Không gian riêng tư, đẳng cấp",
    "Bảo mật thông tin khách hàng",
    "Có chỗ đậu xe hơi miễn phí"
  ];

  const working_hours = [
    { day: "Thứ 2", hours: "09:00 - 19:00" },
    { day: "Thứ 3", hours: "09:00 - 19:00" },
    { day: "Thứ 4", hours: "09:00 - 19:00" },
    { day: "Thứ 5", hours: "09:00 - 19:00" },
    { day: "Thứ 6", hours: "09:00 - 19:00" },
    { day: "Thứ 7", hours: "09:00 - 19:00" },
    { day: "Chủ nhật", hours: "09:00 - 19:00" }
  ];

  page_content.description = description;
  page_content.amenities = amenities;
  page_content.working_hours = working_hours;

  console.log("Updating AA Clinic with Story & Working Hours...");
  const { error } = await supabase.from('businesses').update({
    short_description: short_description,
    description: description,
    page_content: page_content
  }).eq('id', existingBiz.id);

  if (error) {
    console.error("Update error:", error);
  } else {
    console.log("Success updated AA Clinic!");
  }
}

run();
