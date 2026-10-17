import { NextRequest, NextResponse } from 'next/server';
import { createStaticClient } from '@/utils/supabase/server';
import { PartyVenue } from '@/types/party';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function sendTelegramAlert(message: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN_1BOOKING || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn('[Party API] Telegram botToken or chatId missing');
    return;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
      signal: AbortSignal.timeout(5000),
    });
  } catch (err) {
    console.error('[Party API] Telegram send error:', err);
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const guests = parseInt(searchParams.get('guests') || '0', 10);
  const priceMax = parseInt(searchParams.get('price_max') || '0', 10);
  const spaces = searchParams.get('spaces')?.split(',').filter(Boolean) || [];
  const cuisines = searchParams.get('cuisines')?.split(',').filter(Boolean) || [];
  const perks = searchParams.get('perks')?.split(',').filter(Boolean) || [];
  const note = searchParams.get('note')?.trim() || '';

  return handleMatch({
    guests,
    priceMax,
    spaces,
    cuisines,
    perks,
    note,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const guests = typeof body.guests === 'number' ? body.guests : parseInt(body.guests || '0', 10);
    const priceMax = typeof body.priceMax === 'number' ? body.priceMax : parseInt(body.priceMax || '0', 10);
    const spaces = Array.isArray(body.spaces) ? body.spaces : [];
    const cuisines = Array.isArray(body.cuisines) ? body.cuisines : [];
    const perks = Array.isArray(body.perks) ? body.perks : [];
    const note = (body.note || '').trim();
    const customerName = (body.customer_name || body.name || '').trim();
    const customerPhone = (body.customer_phone || body.phone || '').trim();

    return handleMatch({
      guests,
      priceMax,
      spaces,
      cuisines,
      perks,
      note,
      customerName,
      customerPhone,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Dữ liệu yêu cầu không hợp lệ' }, { status: 400 });
  }
}

interface MatchParams {
  guests: number;
  priceMax: number;
  spaces: string[];
  cuisines: string[];
  perks: string[];
  note?: string;
  customerName?: string;
  customerPhone?: string;
}

async function handleMatch(params: MatchParams) {
  const {
    guests,
    priceMax,
    spaces,
    cuisines,
    perks,
    note,
    customerName,
    customerPhone,
  } = params;

  const supabase = createStaticClient();

  // Query tất cả nhà hàng có business_party_profiles đang active bằng cú pháp !inner
  let query = supabase
    .from('businesses')
    .select(`
      id,
      slug,
      name,
      address,
      phone,
      zalo,
      map_coordinates,
      page_content,
      plan_tier,
      status,
      category_slug,
      business_party_profiles!inner (
        min_guests,
        max_guests,
        num_vip_rooms,
        price_min,
        price_max,
        spaces_and_amenities,
        cuisines,
        party_perks,
        party_deal_highlight,
        party_description,
        set_menus,
        is_vip,
        is_active
      )
    `)
    .in('status', ['published', 'active'])
    .eq('business_party_profiles.is_active', true);

  const { data, error } = await query;

  if (error) {
    console.error('[Party API] DB Query Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rawVenues = (data || []).map((b: any): PartyVenue => {
    const profile = Array.isArray(b.business_party_profiles)
      ? b.business_party_profiles[0]
      : b.business_party_profiles;

    return {
      id: b.id,
      slug: b.slug,
      name: b.name,
      address: b.address,
      phone: b.phone,
      zalo: b.zalo,
      map_coordinates: b.map_coordinates,
      page_content: b.page_content || {},
      plan_tier: b.plan_tier,
      status: b.status,
      category_slug: b.category_slug,
      min_guests: profile?.min_guests ?? 10,
      max_guests: profile?.max_guests ?? 200,
      num_vip_rooms: profile?.num_vip_rooms ?? 0,
      price_min: profile?.price_min ?? 200000,
      price_max: profile?.price_max ?? 1000000,
      spaces_and_amenities: profile?.spaces_and_amenities ?? [],
      cuisines: profile?.cuisines ?? [],
      party_perks: profile?.party_perks ?? [],
      party_description: profile?.party_description ?? null,
      party_deal_highlight: profile?.party_deal_highlight ?? null,
      set_menus: profile?.set_menus ?? [],
      is_vip: Boolean(profile?.is_vip),
      is_active: Boolean(profile?.is_active),
    };
  });

  // Bước 1: Hard filter
  const filtered = rawVenues.filter((v) => {
    // Nếu có lọc số khách
    if (guests > 0 && v.max_guests < guests) return false;
    // Nếu có ngân sách tối đa
    if (priceMax > 0 && v.price_min > priceMax) return false;
    return true;
  });

  // Bước 2: Soft scoring
  const scored = filtered.map((v) => {
    let score = 50; // base score

    // Khớp tiện ích
    if (spaces.length > 0) {
      const matchSpaces = spaces.filter((s) => v.spaces_and_amenities.includes(s));
      score += matchSpaces.length * 15;
    }

    // Khớp phong cách ẩm thực
    if (cuisines.length > 0) {
      const matchCuisines = cuisines.filter((c) => v.cuisines.includes(c));
      score += matchCuisines.length * 12;
    }

    // Khớp ưu đãi
    if (perks.length > 0) {
      const matchPerks = perks.filter((p) => v.party_perks.includes(p));
      score += matchPerks.length * 8;
    }

    // Ưu tiên quán VIP và gói Premium
    if (v.is_vip) score += 25;
    if (v.plan_tier === 'premium') score += 15;

    // Quán có sẵn phòng VIP nếu khách > 20
    if (guests >= 20 && v.num_vip_rooms > 0) score += 10;

    return {
      ...v,
      match_score: score,
    };
  });

  // Bước 3: Sắp xếp theo điểm giảm dần
  scored.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));

  // Bước 4: Nếu có SĐT hoặc yêu cầu đặc biệt (note) -> Gửi lead về Telegram & lưu bảng leads
  if (customerPhone || note) {
    const formattedPhone = customerPhone || 'Chưa cung cấp';
    const formattedName = customerName || 'Khách vãng lai';
    const formattedGuests = guests > 0 ? `${guests} khách` : 'Chưa chọn';
    const formattedBudget = priceMax > 0 ? `Dưới ${priceMax.toLocaleString('vi-VN')} đ/người` : 'Chưa chọn';
    const selectedSpacesStr = spaces.length > 0 ? escapeHtml(spaces.join(', ')) : 'Tùy chọn';
    const noteContent = note ? escapeHtml(note) : 'Không có ghi chú thêm';

    const telegramMsg = [
      `🎉 <b>[1BOOKING.ASIA] YÊU CẦU ĐẶT TIỆC TẤT NIÊN MỚI</b>`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `👤 <b>Khách hàng:</b> ${escapeHtml(formattedName)}`,
      `📞 <b>Số điện thoại:</b> <code>${escapeHtml(formattedPhone)}</code>`,
      `👥 <b>Số lượng khách:</b> ${formattedGuests}`,
      `💰 <b>Ngân sách:</b> ${formattedBudget}`,
      `✨ <b>Không gian/Tiện ích:</b> ${selectedSpacesStr}`,
      `📝 <b>Yêu cầu riêng:</b> <i>${noteContent}</i>`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `📍 <i>Nguồn: Bản đồ Phố Tiệc Tất Niên (/tat-nien)</i>`,
      `⏰ <i>Thời gian: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</i>`,
    ].join('\n');

    // Bắn Telegram ngay lập tức
    await sendTelegramAlert(telegramMsg);

    // Lưu vào bảng leads nếu có số điện thoại
    if (customerPhone && rawVenues.length > 0) {
      try {
        await supabase.from('leads').insert({
          business_id: rawVenues[0].id, // Quán điểm cao nhất làm lead owner tham chiếu
          customer_name: formattedName,
          customer_phone: customerPhone,
          deal_name: `[Tất Niên] ${formattedGuests} - ${note || 'Yêu cầu tiệc'}`,
          booking_time: `Dự kiến: ${formattedGuests}`,
          cross_sell_items: `Ngân sách: ${formattedBudget} | Tiện ích: ${selectedSpacesStr}`,
        });
      } catch (leadErr) {
        console.error('[Party API] Lưu lead thất bại:', leadErr);
      }
    }
  }

  return NextResponse.json({
    venues: scored,
    total_matched: scored.length,
    filter_applied: {
      guests,
      priceMax,
      spaces,
      cuisines,
      perks,
      has_note: Boolean(note),
    },
  });
}
