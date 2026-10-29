import { createAdminClient } from '@/utils/supabase/server';
import { OpenAI } from 'openai';

export type OnboardingDealItem = {
  id?: string;
  title: string;
  originalPrice?: string;
  promoPrice?: string;
  note?: string;
  badge?: string;
};

export type OnboardingDealPayload = {
  type: 'deal';
  brandName: string;
  categorySlug: string;
  phone: string;
  zalo?: string;
  email: string;
  password: string;
  managerName: string;
  address: string;
  website?: string;
  facebook?: string;
  hours?: string;
  amenities?: string[];
  logoUrl?: string;
  bannerUrls?: string[];
  galleryUrls?: string[];
  deals?: OnboardingDealItem[];
  mainDeal?: OnboardingDealItem;
  services?: Array<{
    name: string;
    price?: number | string;
    desc?: string;
  }>;
};

export type OnboardingPartyPayload = {
  type: 'party';
  brandName: string;
  phone: string;
  zalo?: string;
  email: string;
  password: string;
  managerName: string;
  address: string;
  website?: string;
  facebook?: string;
  menuDriveUrl?: string;
  logoUrl?: string;
  bannerUrls?: string[];
  galleryUrls?: string[];
  capacity: {
    minGuests: number;
    maxGuests: number;
    vipRooms: number;
  };
  priceRange: {
    min: number;
    max: number;
  };
  partyPerks?: string[];
  partyDealHighlight?: string;
  partyDeals?: OnboardingDealItem[];
  setMenus?: Array<{
    name: string;
    price: number;
    pax?: number;
    dishes?: string[];
  }>;
  spacesAndAmenities?: string[];
  cuisines?: string[];
};

export type OnboardingInput = OnboardingDealPayload | OnboardingPartyPayload;

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Sinh slug không trùng lặp trong cơ sở dữ liệu
 */
export async function generateUniqueSlug(name: string, supabase: any): Promise<string> {
  const baseSlug = slugify(name) || 'doanh-nghiep';
  let candidateSlug = baseSlug;

  for (let counter = 1; counter <= 50; counter++) {
    const { data } = await supabase
      .from('businesses')
      .select('id')
      .eq('slug', candidateSlug)
      .maybeSingle();

    if (!data) {
      return candidateSlug;
    }

    candidateSlug = `${baseSlug}-${counter}`;
  }

  return `${baseSlug}-${Date.now().toString().slice(-4)}`;
}

/**
 * Gọi DeepSeek AI chuẩn hóa nội dung, viết tagline và trau chuốt câu từ
 */
export async function enhanceCopywritingWithAI(payload: OnboardingInput): Promise<{
  tagline: string;
  description: string;
  dealHighlight?: string;
  deals?: any[];
  services?: any[];
  partyDescription?: string;
}> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    // Fallback nếu thiếu API Key
    return {
      tagline: payload.type === 'party' 
        ? 'Địa điểm đặt tiệc & tất niên uy tín, không gian sang trọng'
        : 'Địa chỉ chăm sóc & làm đẹp uy tín, chất lượng hàng đầu',
      description: `${payload.brandName} tọa lạc tại ${payload.address}. Cam kết mang đến trải nghiệm dịch vụ chuyên nghiệp, tận tâm và trọn vẹn nhất cho quý khách hàng.`,
      dealHighlight: payload.type === 'party' ? (payload as OnboardingPartyPayload).partyDealHighlight : undefined,
    };
  }

  try {
    const openai = new OpenAI({
      baseURL: 'https://api.deepseek.com/v1',
      apiKey: apiKey,
    });

    const isParty = payload.type === 'party';
    const firstDeal = isParty
      ? ((payload as OnboardingPartyPayload).partyDeals?.[0]?.title || (payload as OnboardingPartyPayload).partyDealHighlight || '')
      : ((payload as OnboardingDealPayload).deals?.[0]?.title || (payload as OnboardingDealPayload).mainDeal?.title || '');

    const prompt = `
Bạn là Giám đốc Sáng tạo & Copywriter chuyên nghiệp cho nền tảng 1Booking.Asia và 1Beauty.Asia.
Hãy trau chuốt và tối ưu hóa nội dung tiếp thị cho cơ sở kinh doanh sau:
Tên cơ sở: "${payload.brandName}"
Địa chỉ: "${payload.address}"
Loại hình: ${isParty ? 'Nhà hàng / Trung tâm tổ chức Tiệc Tất Niên & Sự Kiện' : 'Cơ sở Dịch vụ & Làm đẹp'}
${isParty ? `Ưu đãi tiệc khách đưa: "${firstDeal}"` : `Ưu đãi chính khách đưa: "${firstDeal}"`}

Yêu cầu trả về DUY NHẤT một chuỗi JSON chuẩn (không dùng markdown code fence, không giải thích gì thêm), có cấu trúc sau:
{
  "tagline": "Một câu slogan đắt giá, cuốn hút, dưới 14 từ tôn vinh thế mạnh thương hiệu",
  "description": "Đoạn giới thiệu ngắn 2-3 câu ngắn gọn, ấm cúng, sang trọng, nêu bật không gian và chất lượng phục vụ tại ${payload.address}.",
  ${isParty ? `"partyDescription": "Đoạn văn 3-4 câu mô tả không gian sảnh tiệc, phong cách ẩm thực và dịch vụ tổ chức tiệc tất niên chu đáo.",
  "dealHighlight": "Câu ưu đãi tiệc rút gọn thật bắt mắt (VD: Tặng trọn gói âm thanh ánh sáng & bia tươi)"` : `"dealTitle": "Tên ưu đãi được viết hoa chuẩn, hấp dẫn khách đặt lịch ngay",
  "dealNote": "Điều kiện hoặc ghi chú áp dụng ngắn gọn, lịch sự"`}
}
`;

    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
    });

    const text = response.choices?.[0]?.message?.content?.trim() || '{}';
    // Làm sạch nếu AI trả về markdown code block
    const cleaned = text.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
    let parsed: any = {};
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.warn('[AI Onboarding] Không thể parse JSON từ AI, dùng fallback:', parseErr);
    }

    return {
      tagline: parsed.tagline || (isParty ? 'Không gian tiệc đẳng cấp, ẩm thực tinh hoa' : 'Trải nghiệm dịch vụ đẳng cấp & tận tâm'),
      description: parsed.description || `${payload.brandName} tại ${payload.address} hân hạnh phục vụ quý khách.`,
      dealHighlight: isParty ? (parsed.dealHighlight || (payload as OnboardingPartyPayload).partyDealHighlight) : undefined,
      partyDescription: isParty ? (parsed.partyDescription || '') : undefined,
    };
  } catch (error) {
    console.error('[AI Onboarding] Lỗi DeepSeek:', error);
    return {
      tagline: payload.type === 'party' 
        ? 'Địa điểm đặt tiệc & sự kiện uy tín'
        : 'Địa chỉ dịch vụ & làm đẹp uy tín',
      description: `${payload.brandName} tọa lạc tại ${payload.address}. Phục vụ chu đáo và tận tâm.`,
      dealHighlight: payload.type === 'party' ? (payload as OnboardingPartyPayload).partyDealHighlight : undefined,
    };
  }
}

/**
 * Xử lý toàn diện luồng Onboarding:
 * 1. Tạo Auth User (Vendor)
 * 2. Gọi AI tối ưu nội dung
 * 3. Tạo bản ghi businesses (Draft)
 * 4. Tạo business_party_profiles (nếu tiệc)
 * 5. Ghi nhật ký onboarding_submissions
 * 6. Bắn chuông Telegram Admin kèm nút bấm duyệt/chỉnh sửa
 */
export async function processOnboardingSubmission(payload: OnboardingInput) {
  const supabase = await createAdminClient();

  // 1. Quản lý tài khoản người dùng (Auth User)
  let userId: string;
  const cleanEmail = payload.email.trim().toLowerCase();

  const { data: userList } = await supabase.auth.admin.listUsers();
  const existingUser = userList?.users?.find(u => u.email?.toLowerCase() === cleanEmail);

  if (existingUser) {
    userId = existingUser.id;
    if (payload.password && payload.password.length >= 6) {
      await supabase.auth.admin.updateUserById(userId, {
        password: payload.password,
        user_metadata: {
          full_name: payload.managerName,
          role: 'owner',
        },
      });
    }
  } else {
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email: cleanEmail,
      password: payload.password || '12345678',
      email_confirm: true,
      user_metadata: {
        full_name: payload.managerName,
        role: 'owner',
      },
    });

    if (createErr || !newUser?.user) {
      throw new Error(`Không thể khởi tạo tài khoản: ${createErr?.message || 'Lỗi Auth'}`);
    }
    userId = newUser.user.id;
  }

  // Đảm bảo hồ sơ người dùng trong bảng profiles luôn có role 'owner'
  try {
    await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: cleanEmail,
        full_name: payload.managerName,
        role: 'owner',
      }, { onConflict: 'id' });
  } catch (profErr) {
    console.warn('[Onboarding] Không thể cập nhật bảng profiles:', profErr);
  }

  // 2. Chạy AI tối ưu hóa văn phong & slogan
  const aiResult = await enhanceCopywritingWithAI(payload);

  // 3. Tạo slug duy nhất
  const slug = await generateUniqueSlug(payload.brandName, supabase);

  // 4. Chuẩn bị page_content theo cấu trúc chuẩn
  const isParty = payload.type === 'party';
  const partyPayload = isParty ? (payload as OnboardingPartyPayload) : null;
  const dealPayload = !isParty ? (payload as OnboardingDealPayload) : null;

  let deals: any[] = [];
  let services: any[] = [];

  if (isParty && partyPayload) {
    if (Array.isArray(partyPayload.partyDeals) && partyPayload.partyDeals.length > 0) {
      deals = partyPayload.partyDeals
        .filter((d) => d && d.title && d.title.trim())
        .map((d, idx) => ({
          id: d.id || `deal-party-${idx + 1}-${Date.now()}`,
          title: d.title.trim(),
          promo_price: d.promoPrice?.trim() || (partyPayload.priceRange ? `Từ ${(partyPayload.priceRange.min).toLocaleString('vi-VN')}đ` : 'Ưu đãi'),
          original_price: d.originalPrice?.trim() || (partyPayload.priceRange ? `Đến ${(partyPayload.priceRange.max).toLocaleString('vi-VN')}đ` : ''),
          note: d.note?.trim() || 'Áp dụng cho đoàn đặt tiệc liên hoan, tất niên cuối năm.',
          badge: d.badge?.trim() || (idx === 0 ? 'TIỆC TẤT NIÊN' : 'ƯU ĐÃI'),
          status: 'active',
        }));
    }

    if (deals.length === 0) {
      deals = [
        {
          id: `deal-party-${Date.now()}`,
          title: aiResult.dealHighlight || partyPayload.partyDealHighlight || 'Ưu Đãi Đặt Tiệc Tất Niên',
          promo_price: partyPayload.priceRange ? `Từ ${(partyPayload.priceRange.min).toLocaleString('vi-VN')}đ` : 'Ưu đãi',
          original_price: partyPayload.priceRange ? `Đến ${(partyPayload.priceRange.max).toLocaleString('vi-VN')}đ` : '',
          note: 'Áp dụng cho đoàn đặt tiệc liên hoan, tất niên cuối năm.',
          badge: 'TIỆC TẤT NIÊN',
          status: 'active',
        },
      ];
    }
  } else if (dealPayload) {
    const now = Date.now();
    if (Array.isArray(dealPayload.deals) && dealPayload.deals.length > 0) {
      deals = dealPayload.deals
        .filter((d) => d && d.title && d.title.trim())
        .map((d, idx) => ({
          id: d.id || `deal-${now}-${idx + 1}`,
          title: d.title.trim(),
          promo_price: d.promoPrice?.trim() || 'Ưu đãi',
          original_price: d.originalPrice?.trim() || '',
          note: d.note?.trim() || 'Áp dụng khi đăng ký nhận mã ưu đãi trực tuyến.',
          badge: d.badge?.trim() || (idx === 0 ? 'HOT' : ''),
          status: 'active',
        }));
    }

    if (deals.length === 0 && dealPayload.mainDeal?.title) {
      deals = [
        {
          id: `deal-${now}-1`,
          title: dealPayload.mainDeal.title.trim(),
          promo_price: dealPayload.mainDeal.promoPrice?.trim() || 'Ưu đãi',
          original_price: dealPayload.mainDeal.originalPrice?.trim() || '',
          note: dealPayload.mainDeal.note?.trim() || 'Áp dụng khi đăng ký nhận mã ưu đãi trực tuyến.',
          badge: dealPayload.mainDeal.badge?.trim() || 'HOT',
          status: 'active',
        },
      ];
    }

    if (Array.isArray(dealPayload.services) && dealPayload.services.length > 0) {
      services = dealPayload.services.map((s, idx) => ({
        id: `srv-${idx + 1}`,
        name: s.name,
        price: typeof s.price === 'number' ? s.price : parseInt(String(s.price || '0').replace(/\D/g, '') || '0', 10),
        desc: s.desc || '',
      }));
    }
  }

  const pageContent = {
    logo_url: payload.logoUrl || null,
    banners: Array.isArray(payload.bannerUrls)
      ? payload.bannerUrls.map((b) => typeof b === 'string' ? b.trim() : '').filter(Boolean).slice(0, 3)
      : [],
    gallery: Array.isArray(payload.galleryUrls)
      ? payload.galleryUrls.map((g) => typeof g === 'string' ? g.trim() : '').filter(Boolean).slice(0, 8)
      : [],
    tagline: aiResult.tagline,
    description: aiResult.description,
    address: payload.address,
    phone: payload.phone,
    zalo: payload.zalo || payload.phone,
    website: payload.website || null,
    hours: dealPayload?.hours || '08:00 - 22:00',
    amenities: isParty 
      ? (partyPayload?.spacesAndAmenities || ['Phòng VIP riêng', 'Sân khấu & Âm thanh', 'Bãi đỗ ô tô'])
      : (dealPayload?.amenities || ['Wifi miễn phí', 'Chỗ đỗ xe', 'Trà nước miễn phí']),
    deals: deals,
    services: services,
    socials: {
      facebook: payload.facebook || null,
    },
    raw_manager_name: payload.managerName,
  };

  // 5. Thêm bản ghi vào bảng businesses (status: 'draft')
  const categorySlug = isParty ? 'nha-hang-am-thuc' : (dealPayload?.categorySlug || 'spa-thu-gian');

  // Tọa độ mặc định trung tâm TP.HCM để hiển thị bản đồ pin
  const defaultCoordinates = { lat: 10.7769, lng: 106.7009 };

  const { data: newBusiness, error: bizInsertError } = await supabase
    .from('businesses')
    .insert({
      name: payload.brandName,
      slug: slug,
      category_slug: categorySlug,
      address: payload.address,
      phone: payload.phone,
      email: cleanEmail,
      website: payload.website || null,
      zalo: payload.zalo || payload.phone,
      status: 'draft', // Chờ duyệt qua Telegram
      owner_id: userId,
      is_featured: false,
      page_content: pageContent,
      location_slug: 'ho-chi-minh',
      map_coordinates: defaultCoordinates,
    })
    .select('id, name, slug, status')
    .single();

  if (bizInsertError || !newBusiness) {
    console.error('[Onboarding] Lỗi thêm business:', bizInsertError);
    throw new Error(`Lỗi cơ sở dữ liệu: ${bizInsertError?.message || 'Không tạo được business'}`);
  }

  // 6. Nếu là Nhà hàng / Tiệc: Tạo hồ sơ business_party_profiles
  // Quy chuẩn đơn giá trong DB là VNĐ/người (khách nhập giá bàn 10 người nên quy đổi nếu >= 1.000.000đ)
  if (isParty && partyPayload) {
    const rawMin = Number(partyPayload.priceRange?.min) || 2500000;
    const rawMax = Number(partyPayload.priceRange?.max) || 6000000;
    const pricePerPersonMin = rawMin >= 1000000 ? Math.round(rawMin / 10) : rawMin;
    const pricePerPersonMax = rawMax >= 1000000 ? Math.round(rawMax / 10) : rawMax;

    const { error: partyInsertError } = await supabase
      .from('business_party_profiles')
      .upsert({
        business_id: newBusiness.id,
        min_guests: Number(partyPayload.capacity?.minGuests) || 10,
        max_guests: Number(partyPayload.capacity?.maxGuests) || 300,
        num_vip_rooms: Number(partyPayload.capacity?.vipRooms) || 0,
        price_min: pricePerPersonMin,
        price_max: pricePerPersonMax,
        spaces_and_amenities: partyPayload.spacesAndAmenities || [],
        cuisines: partyPayload.cuisines || [],
        party_perks: partyPayload.partyPerks || [],
        party_deal_highlight: aiResult.dealHighlight || partyPayload.partyDealHighlight || deals[0]?.title || 'Ưu Đãi Đặt Tiệc Tất Niên',
        party_description: aiResult.partyDescription || aiResult.description,
        party_banner_url: partyPayload.bannerUrls?.[0] || null,
        party_gallery: partyPayload.galleryUrls || [],
        party_menu_url: partyPayload.menuDriveUrl || null,
        set_menus: Array.isArray(partyPayload.setMenus) ? partyPayload.setMenus : [],
        is_active: true,
        is_vip: false,
      }, { onConflict: 'business_id' });

    if (partyInsertError) {
      console.error('[Onboarding] Lỗi tạo party profile:', partyInsertError);
      throw new Error(`Lỗi tạo hồ sơ tiệc: ${partyInsertError.message}`);
    }
  }

  // 7. Gán quyền sở hữu trong business_members
  const { error: memberError } = await supabase
    .from('business_members')
    .upsert({
      business_id: newBusiness.id,
      user_id: userId,
      role: 'owner',
    }, { onConflict: 'business_id,user_id' });

  if (memberError) {
    console.error('[Onboarding] Lỗi gán quyền sở hữu:', memberError);
    throw new Error(`Không thể gán quyền quản trị cho tài khoản: ${memberError.message}`);
  }

  // 8. Ghi log vào onboarding_submissions (Loại bỏ mật khẩu để đảm bảo bảo mật an toàn)
  const safePayload: Record<string, any> = { ...payload };
  delete safePayload.password;

  const { error: subErr } = await supabase
    .from('onboarding_submissions')
    .insert({
      business_id: newBusiness.id,
      type: payload.type,
      contact_name: payload.managerName,
      contact_phone: payload.phone,
      contact_email: cleanEmail,
      raw_payload: safePayload,
      ai_enhanced_payload: aiResult,
      status: 'pending',
    });

  if (subErr) {
    console.warn('[Onboarding] Cảnh báo lưu onboarding_submissions:', subErr.message);
  }

  // 9. Bắn chuông Telegram Dual-Dispatch kèm Inline Keyboard buttons
  await sendTelegramNotificationToAdmin({
    businessId: newBusiness.id,
    businessName: newBusiness.name,
    businessSlug: newBusiness.slug,
    type: payload.type,
    managerName: payload.managerName,
    phone: payload.phone,
    email: cleanEmail,
    address: payload.address,
    tagline: aiResult.tagline,
    dealHighlight: isParty
      ? (aiResult.dealHighlight || partyPayload?.partyDealHighlight || deals[0]?.title || 'Ưu Đãi Đặt Tiệc Tất Niên')
      : (deals[0]?.title || dealPayload?.mainDeal?.title || 'Ưu Đãi Đặc Biệt'),
    menuDriveUrl: partyPayload?.menuDriveUrl,
  });

  return {
    success: true,
    businessId: newBusiness.id,
    slug: newBusiness.slug,
    name: newBusiness.name,
    previewUrl: isParty ? `https://1booking.asia/${newBusiness.slug}/tiec` : `https://1booking.asia/${newBusiness.slug}`,
  };
}

/**
 * Gửi thông báo đến Telegram Admin với đầy đủ nút bấm Inline Keyboard
 */
async function sendTelegramNotificationToAdmin(info: {
  businessId: string;
  businessName: string;
  businessSlug: string;
  type: 'deal' | 'party';
  managerName: string;
  phone: string;
  email: string;
  address: string;
  tagline: string;
  dealHighlight?: string;
  menuDriveUrl?: string;
}) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN_1BOOKING || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID || process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn('[Telegram Onboarding] Thiếu Bot Token hoặc Chat ID trong biến môi trường');
    return;
  }

  const isParty = info.type === 'party';
  const typeText = isParty ? '🏮 HỒ SƠ ĐẶT TIỆC TẤT NIÊN' : '🎁 HỒ SƠ GIAN HÀNG ƯU ĐÃI';
  const demoUrl = isParty 
    ? `https://1booking.asia/${info.businessSlug}/tiec` 
    : `https://1booking.asia/${info.businessSlug}`;

  const message = `
<b>🛎️ [1BOOKING/1BEAUTY] YÊU CẦU TẠO TRANG MỚI!</b>
━━━━━━━━━━━━━━━━━━━━
📌 <b>Loại trang:</b> ${typeText}
🏛️ <b>Tên quán:</b> <b>${info.businessName}</b>
🔗 <b>Slug dự kiến:</b> <code>/${info.businessSlug}</code>
📍 <b>Địa chỉ:</b> ${info.address}
👤 <b>Đại diện:</b> ${info.managerName}
📞 <b>SĐT:</b> <code>${info.phone}</code>
✉️ <b>Email TK:</b> <code>${info.email}</code>

🤖 <b>AI ĐÃ TRAU CHUỐT NỘI DUNG:</b>
• <i>Slogan:</i> "${info.tagline}"
• <i>Gói ưu đãi:</i> ${info.dealHighlight || 'Nhận ưu đãi độc quyền'}
${info.menuDriveUrl ? `\n📂 <b>Link Menu Drive:</b> <a href="${info.menuDriveUrl}">Bấm xem Menu</a>` : ''}
━━━━━━━━━━━━━━━━━━━━
👉 <i>Trang đang ở trạng thái DRAFT. Anh bấm nút bên dưới để xem thử hoặc duyệt xuất bản công khai:</i>
`.trim();

  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: '👁️ Xem Trang Demo', url: demoUrl },
        { text: '✅ Duyệt & Bật Public', callback_data: `pub:${info.businessId}` },
      ],
      [
        { text: '🔄 Nhờ AI Viết Lại', callback_data: `ai:${info.businessId}` },
        { text: '⛔ Tạm Ngưng', callback_data: `sus:${info.businessId}` },
      ],
    ],
  };

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        reply_markup: inlineKeyboard,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[Telegram Onboarding] Gửi lỗi:', errText);
    }
  } catch (err) {
    console.error('[Telegram Onboarding] Ngoại lệ fetch:', err);
  }
}

/**
 * Xử lý khi Admin bấm nút duyệt trên Telegram
 */
export async function handleTelegramCallback(callbackData: string, fromChatId: string | number) {
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (adminChatId && String(fromChatId) !== String(adminChatId)) {
    return { text: '⛔ Bạn không có quyền thực hiện thao tác này.' };
  }

  const [action, businessId] = callbackData.split(':');
  if (!action || !businessId) return { text: 'Lệnh không hợp lệ' };

  const supabase = await createAdminClient();

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, slug, status, page_content, category_slug')
    .eq('id', businessId)
    .single();

  if (!business) {
    return { text: '❌ Không tìm thấy thông tin cơ sở này.' };
  }

  if (action === 'pub') {
    const isParty = business.category_slug === 'nha-hang-am-thuc' || business.category_slug === 'dining' || business.category_slug === 'tiec-cuoi';
    const planCode = isParty ? 'tiec_standard' : 'udai_standard';

    // 1. Tìm gói tương ứng trong bảng plans
    const { data: targetPlan } = await supabase
      .from('plans')
      .select('id, code, name, plan_type, tier, price_yearly')
      .eq('code', planCode)
      .maybeSingle();

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    // 2. Cấp hoặc gia hạn gói hội viên 1 năm
    if (targetPlan) {
      const { data: existingMems } = await supabase
        .from('memberships')
        .select('id, expires_at')
        .eq('business_id', business.id)
        .order('expires_at', { ascending: false })
        .limit(1);

      if (existingMems && existingMems.length > 0) {
        await supabase
          .from('memberships')
          .update({
            plan_id: targetPlan.id,
            status: 'active',
            starts_at: now.toISOString(),
            expires_at: expiresAt.toISOString(),
          })
          .eq('id', existingMems[0].id);
      } else {
        await supabase
          .from('memberships')
          .insert({
            business_id: business.id,
            plan_id: targetPlan.id,
            status: 'active',
            starts_at: now.toISOString(),
            expires_at: expiresAt.toISOString(),
          });
      }
    }

    // 3. Nếu là Nhà hàng: Đảm bảo hồ sơ tiệc is_active = true
    if (isParty) {
      await supabase
        .from('business_party_profiles')
        .update({
          is_active: true,
          updated_at: now.toISOString(),
        })
        .eq('business_id', business.id);
    }

    // 4. Duyệt & Publish Business
    await supabase
      .from('businesses')
      .update({
        status: 'published',
        is_featured: true,
        plan_id: targetPlan?.id || null,
        plan_tier: targetPlan?.tier || 'standard',
        updated_at: now.toISOString(),
      })
      .eq('id', business.id);

    // 5. Cập nhật onboarding_submissions
    await supabase
      .from('onboarding_submissions')
      .update({ status: 'approved', updated_at: now.toISOString() })
      .eq('business_id', business.id);

    const publicUrl = isParty ? `https://1booking.asia/${business.slug}/tiec` : `https://1booking.asia/${business.slug}`;

    return {
      text: `✅ ĐÃ DUYỆT CÔNG KHAI!\n\nGian hàng "${business.name}" đã được kích hoạt Gói ${targetPlan?.name || 'Chuẩn'} (1 năm) và chính thức hiển thị trên 1Booking.\n🔗 Link công khai: ${publicUrl}`,
    };
  }

  if (action === 'sus') {
    await supabase
      .from('businesses')
      .update({ status: 'suspended', updated_at: new Date().toISOString() })
      .eq('id', business.id);

    return {
      text: `⛔ ĐÃ TẠM NGƯNG GIAN HÀNG "${business.name}".`,
    };
  }

  if (action === 'ai') {
    // Chạy lại AI DeepSeek với văn phong biến thể sắc bén hơn
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return { text: '⚠️ Thiếu DEEPSEEK_API_KEY trong cấu hình.' };
    }

    const openai = new OpenAI({
      baseURL: 'https://api.deepseek.com/v1',
      apiKey,
    });

    const prompt = `
Hãy viết lại câu Slogan và Đoạn giới thiệu cho cơ sở: "${business.name}".
Địa chỉ: ${business.page_content?.address || ''}
Phong cách yêu cầu: Sang trọng, đẳng cấp, độc đáo, kích thích khách hàng bấm nhận ưu đãi ngay lập tức.
Trả về DUY NHẤT một chuỗi JSON chuẩn:
{
  "tagline": "Slogan mới dưới 14 từ",
  "description": "Giới thiệu mới 2-3 câu ngắn gọn đầy ấn tượng"
}
`;

    try {
      const resp = await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.85,
      });

      const raw = resp.choices?.[0]?.message?.content?.trim() || '{}';
      const clean = raw.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
      let parsed: any = {};
      try {
        parsed = JSON.parse(clean);
      } catch (parseErr) {
        console.warn('[AI Onboarding] Lỗi parse JSON khi viết lại:', parseErr);
      }

      const updatedPageContent = {
        ...(business.page_content || {}),
        tagline: parsed.tagline || business.page_content?.tagline,
        description: parsed.description || business.page_content?.description,
      };

      const { error: updateErr } = await supabase
        .from('businesses')
        .update({ page_content: updatedPageContent, updated_at: new Date().toISOString() })
        .eq('id', business.id);

      if (updateErr) {
        return { text: `⚠️ Không thể lưu nội dung mới: ${updateErr.message}` };
      }

      return {
        text: `✨ AI ĐÃ VIẾT LẠI THÀNH CÔNG CHO "${business.name}":\n\n• Slogan mới: "${parsed.tagline || 'Đã cập nhật'}"\n• Mô tả mới: "${parsed.description || 'Đã cập nhật'}"\n\nAnh bấm F5 trên link demo để kiểm tra lại nhé!`,
      };
    } catch (err: any) {
      return { text: `⚠️ Lỗi xử lý AI: ${err.message}` };
    }
  }

  return { text: 'Hành động không xác định' };
}
