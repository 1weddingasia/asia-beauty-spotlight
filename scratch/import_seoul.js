
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ejlltaigohemjagfzxxh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqbGx0YWlnb2hlbWphZ2Z6eHhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTgwNzE0NiwiZXhwIjoyMTA1MzgzMTQ2fQ.R_Q4p01oU5gg9GUpn3TL2SPt7L2brq2kqwy6SnR9row'
);

async function main() {
  const business = {
    name: "Seoul Center",
    slug: "seoul-center-spa",
    short_description: "Seoul Center là địa chỉ thẩm mỹ viện uy tín hàng đầu, cung cấp các dịch vụ làm đẹp công nghệ cao chuẩn quốc tế.",
    description: "Thẩm Mỹ Viện Seoul Center tự hào là một trong những hệ thống làm đẹp lớn nhất tại Việt Nam. Với sứ mệnh 'Phụng sự từ tâm', chúng tôi mang đến cho khách hàng trải nghiệm làm đẹp đẳng cấp với công nghệ tiên tiến nhất, đội ngũ bác sĩ chuyên khoa giàu kinh nghiệm và cơ sở vật chất sang trọng.",
    category_slug: "tham-my-vien", // matching schema
    location_slug: "ho-chi-minh",  // matching schema
    address: "375 Nguyễn Thượng Hiền, Phường 11, Quận 10, TP. Hồ Chí Minh", // Extracted via web context
    phone: "1800 3333",
    website: "https://seoulcenter.vn/",
    status: "draft",
    is_featured: true,
    plan_tier: "standard",
    page_content: {
      tagline: "Đánh thức vẻ đẹp tiềm ẩn",
      hero_image: "https://cdn.diemnhangroup.com/seoulcenter/2025/02/banner-pc.webp",
      logo_url: "https://cdn.diemnhangroup.com/seoulcenter/2025/02/logo-T2.webp",
      gallery: [
        "https://cdn.diemnhangroup.com/seoulcenter/2025/02/banner-pc.webp"
      ],
      services_list: [
        {
          name: "Chăm sóc da chuyên sâu",
          description: "Phục hồi làn da trắng sáng mịn màng với công nghệ tế bào gốc.",
          price_min: 500000,
          price_max: 2000000,
          duration: "60 phút"
        },
        {
          name: "Phun xăm thẩm mỹ",
          description: "Điêu khắc chân mày, phun môi collagen công nghệ Hàn Quốc.",
          price_min: 1500000,
          price_max: 5000000,
          duration: "90 phút"
        }
      ],
      working_hours_text: "08:30 - 20:00 (Tất cả các ngày trong tuần)",
      amenities: ["Wi-Fi miễn phí", "Bãi đậu xe ô tô", "Phòng VIP riêng tư"]
    }
  };

  // The businesses table has `category_slug`, `location_slug` not `category`, `location` based on what the initial script used. Actually let's check what the table expects exactly by doing an upsert.
  
  // Wait, I will just do a standard insert and ignore if duplicate.
  const { data, error } = await supabase.from('businesses').insert([business]).select();
  
  if (error) {
    console.error("Error inserting:", error);
    // Try with alternative column names if it failed
    if (error.message.includes('category_slug')) {
       business.category = business.category_slug;
       business.location = business.location_slug;
       delete business.category_slug;
       delete business.location_slug;
       const retry = await supabase.from('businesses').insert([business]).select();
       console.log("Retry result:", retry);
    }
  } else {
    console.log("Successfully inserted business!", data[0].name);
  }
}

main();
