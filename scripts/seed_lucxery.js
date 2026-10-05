const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedLucxery() {
  const slug = 'lucxery';
  const name = 'Lucxery Beauty & Spa';
  const passcode = '888888';
  
  const page_content = {
    banners: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=2070&auto=format&fit=crop"
    ],
    gallery: [
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2070&auto=format&fit=crop"
    ],
    deals: [
      {
        id: "deal_1",
        title: "Combo Gội Đầu Dưỡng Sinh Hoàng Gia",
        original_price: "500000",
        promo_price: "299000",
        badge: "Hot Nhất",
        note: "90 phút thư giãn toàn diện",
        status: "active"
      },
      {
        id: "deal_2",
        title: "Massage Body Tinh Dầu Trị Liệu",
        original_price: "800000",
        promo_price: "499000",
        badge: "Thư giãn",
        note: "Trị đau mỏi vai gáy",
        status: "active"
      }
    ],
    services: [
      {
        id: "srv_1",
        title: "Chăm sóc da mặt chuyên sâu",
        price: "350000",
        image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=200&auto=format&fit=crop"
      },
      {
        id: "srv_2",
        title: "Triệt lông vĩnh viễn (Nách)",
        price: "199000",
        image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=200&auto=format&fit=crop"
      }
    ],
    cross_sells: [
      "Đắp mặt nạ vàng 24k (+99K)",
      "Ngâm chân thảo dược (+50K)",
      "Tẩy tế bào chết toàn thân (+150K)"
    ],
    standee_tagline: "GIẢM 50% DỊCH VỤ",
    phone: "0901234567",
    address: "Số 1, Phố Sang Trọng, Quận 1, TP. HCM",
    telegram_chat_id: "-4596395568"
  };

  // Check if it exists
  const { data: existing, error: lookupError } = await supabase.from('businesses').select('*').eq('slug', slug).maybeSingle();
  if (lookupError) {
    console.error("Error looking up business:", lookupError);
    return;
  }

  let res;
  if (existing) {
    console.log("Updating existing lucxery business...");
    res = await supabase.from('businesses').update({
      name,
      page_content,
      chatbot_passcode: passcode,
      zalo: '0901234567'
    }).eq('id', existing.id);
  } else {
    console.log("Creating new lucxery business...");
    // Just use a dummy user_id or existing owner_id if we have one. 
    // Let's get the first user to be the owner
    const { data: users } = await supabase.auth.admin.listUsers();
    const owner_id = users.users[0]?.id || null;

    res = await supabase.from('businesses').insert({
      slug,
      name,
      page_content,
      chatbot_passcode: passcode,
      zalo: '0901234567',
      owner_id,
      status: 'published'
    });
  }

  if (res.error) {
    console.error("Error:", res.error);
  } else {
    console.log("Success! Lucxery business is ready.");
  }
}

seedLucxery().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
