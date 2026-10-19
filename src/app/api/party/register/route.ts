import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/utils/supabase/server';
import { VN_PHONE_REGEX } from '@/types/party';

export const dynamic = 'force-dynamic';

const PARTY_DEAL_NAME = 'Đăng Ký Điểm Tiệc VIP 500K';

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/([^0-9a-z-\s])/g, '')
    .replace(/(\s+)/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function parsePricePerPax(input?: string): { priceMin: number; priceMax: number } {
  if (!input) return { priceMin: 250000, priceMax: 650000 };
  const s = input
    .toLowerCase()
    .replace(/đ/g, '')
    .replace(/vnđ/g, '')
    .replace(/người/g, '')
    .replace(/\//g, '')
    .trim();

  const parts = s.split(/[-–~]|đến/).map((p) => p.trim()).filter(Boolean);

  const parseToken = (t: string): number => {
    let multiplier = 1;
    if (t.includes('tr') || t.includes('triệu')) multiplier = 1000000;
    else if (t.includes('k') || t.includes('nghìn')) multiplier = 1000;
    const numStr = t.replace(/[^\d.]/g, '');
    const val = parseFloat(numStr);
    if (isNaN(val)) return 0;
    if (val > 0 && val < 2000 && multiplier === 1) return val * 1000;
    return Math.round(val * multiplier);
  };

  const p1 = parseToken(parts[0] || '');
  const p2 = parts[1] ? parseToken(parts[1]) : 0;

  if (p1 > 50000 && p2 > 50000) {
    return { priceMin: Math.min(p1, p2), priceMax: Math.max(p1, p2) };
  } else if (p1 > 50000) {
    return { priceMin: p1, priceMax: Math.round(p1 * 1.5) };
  }
  return { priceMin: 250000, priceMax: 650000 };
}

const RegisterSchema = z
  .object({
    name: z.string().min(2, 'Tên nhà hàng/quán tiệc phải có ít nhất 2 ký tự'),
    address: z.string().min(5, 'Vui lòng nhập địa chỉ quán chi tiết (ít nhất 5 ký tự)'),
    district: z.string().default('quan-1'),
    phone: z.string().regex(VN_PHONE_REGEX, 'Số điện thoại không hợp lệ (cần 10 chữ số)'),
    contact_name: z.string().optional(),
    party_deal: z.string().min(3, 'Vui lòng nhập gói ưu đãi tiệc (VD: Tặng 2 thùng bia, giảm 15%...)'),
    price_per_pax: z.string().optional(),
    min_guests: z.number().int().min(1).max(2000).default(15),
    max_guests: z.number().int().min(1).max(5000).default(200),
    photo_url: z.string().optional(),
  })
  .refine((data) => data.min_guests <= data.max_guests, {
    message: 'Số khách tối thiểu không được lớn hơn sức chứa tối đa',
    path: ['max_guests'],
  });

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => null);
    if (!rawBody || typeof rawBody !== 'object') {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
    }

    const body = { ...rawBody };
    if (typeof body.phone === 'string') {
      body.phone = body.phone.replace(/\D/g, '');
    }

    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      const err = parsed.error.issues?.[0]?.message || 'Dữ liệu không hợp lệ';
      return NextResponse.json({ error: err }, { status: 400 });
    }

    const {
      name,
      address,
      district,
      phone: cleanPhone,
      contact_name,
      party_deal,
      price_per_pax,
      min_guests,
      max_guests,
      photo_url,
    } = parsed.data;

    const supabase = await createAdminClient();

    // 1. Phân tích giá tiệc bình quân
    const { priceMin, priceMax } = parsePricePerPax(price_per_pax);

    // 2. Lấy tọa độ từ database thật directory_locations + Jitter tự nhiên
    const { data: districtRow } = await supabase
      .from('directory_locations')
      .select('id, name, slug, map_coordinates')
      .eq('slug', district)
      .maybeSingle();

    if (!districtRow) {
      return NextResponse.json(
        { error: 'Quận / Huyện đã chọn không tồn tại trong hệ thống. Vui lòng chọn lại.' },
        { status: 400 }
      );
    }

    const rawCoords = districtRow.map_coordinates;
    let baseCoords: [number, number] = [106.6983, 10.7756];

    if (
      Array.isArray(rawCoords) &&
      rawCoords.length === 2 &&
      typeof rawCoords[0] === 'number' &&
      typeof rawCoords[1] === 'number'
    ) {
      baseCoords = [rawCoords[0], rawCoords[1]];
    } else if (
      rawCoords &&
      typeof rawCoords === 'object' &&
      'lng' in rawCoords &&
      'lat' in rawCoords &&
      typeof (rawCoords as Record<string, unknown>).lng === 'number' &&
      typeof (rawCoords as Record<string, unknown>).lat === 'number'
    ) {
      const obj = rawCoords as { lng: number; lat: number };
      baseCoords = [obj.lng, obj.lat];
    }

    const jitterLat = (Math.random() - 0.5) * 0.006;
    const jitterLng = (Math.random() - 0.5) * 0.006;
    const mapCoordinates = {
      lat: Number((baseCoords[1] + jitterLat).toFixed(6)),
      lng: Number((baseCoords[0] + jitterLng).toFixed(6)),
    };

    let finalPhoto = '/images/demo/nha-hang/que-nha-banquet-luxury.jpg';
    if (photo_url) {
      if (photo_url.startsWith('/images/')) {
        finalPhoto = photo_url;
      } else if (photo_url.startsWith('https://')) {
        try {
          const parsedUrl = new URL(photo_url);
          finalPhoto = parsedUrl.toString();
        } catch {
          finalPhoto = '/images/demo/nha-hang/que-nha-banquet-luxury.jpg';
        }
      }
    }

    // 2.1. Chống gửi trùng lặp liên tục (Throttling 60s)
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    const { data: recentLead } = await supabase
      .from('business_leads')
      .select('id')
      .eq('customer_phone', cleanPhone)
      .eq('deal_name', PARTY_DEAL_NAME)
      .gt('created_at', oneMinuteAgo)
      .maybeSingle();

    if (recentLead) {
      return NextResponse.json(
        { error: 'Yêu cầu đăng ký của bạn vừa được tiếp nhận. Vui lòng chờ vài phút trước khi gửi lại hoặc liên hệ hotline để được duyệt ngay.' },
        { status: 429 }
      );
    }

    // 3. Kiểm tra xem doanh nghiệp với số điện thoại này đã có chưa
    const { data: existingBiz } = await supabase
      .from('businesses')
      .select('id, slug, name, page_content, category_slug, claim_token, owner_id')
      .eq('phone', cleanPhone)
      .maybeSingle();

    let businessId: string;
    let businessSlug: string;
    let activeClaimToken: string | null = null;

    if (existingBiz) {
      businessId = existingBiz.id;
      businessSlug = existingBiz.slug;
      const prevContent = (existingBiz.page_content as Record<string, unknown>) || {};
      const prevBanners = Array.isArray(prevContent.banners) ? (prevContent.banners as string[]) : [];

      if (!existingBiz.owner_id) {
        // Quán đã có trong DB nhưng chưa có chủ nhận quyền: tái sử dụng claim_token sẵn có hoặc tạo mới
        activeClaimToken = existingBiz.claim_token || crypto.randomUUID();
        if (!existingBiz.claim_token) {
          await supabase.from('businesses').update({ claim_token: activeClaimToken }).eq('id', businessId);
        }
      }

      // Cập nhật thông tin quán hiện có và bảo tồn các trường dữ liệu trước đó
      const { error: updateBizErr } = await supabase
        .from('businesses')
        .update({
          name: name.trim(),
          address: address.trim(),
          category_slug: existingBiz.category_slug || 'nha-hang-am-thuc',
          location_slug: districtRow.slug,
          map_coordinates: mapCoordinates,
          plan_tier: 'vip',
          page_content: {
            ...prevContent,
            hero_image: finalPhoto,
            banners: [finalPhoto, ...prevBanners.filter((b) => b !== finalPhoto)],
            industry: 'fnb',
            action_name: 'Đặt Bàn Ngay',
            party_deal: party_deal.trim(),
            contact_person: contact_name || 'Chủ quán',
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', businessId);

      if (updateBizErr) {
        console.error('[Party Register] Lỗi update businesses:', updateBizErr);
        return NextResponse.json({ error: 'Lỗi cập nhật hồ sơ quán' }, { status: 500 });
      }
    } else {
      // Tạo doanh nghiệp mới hoàn toàn trong bảng businesses thật
      const baseSlug = toSlug(name);
      let candidateSlug = baseSlug || `quan-tiec-${cleanPhone.slice(-4)}`;

      // Kiểm tra trùng slug
      const { data: slugCheck } = await supabase
        .from('businesses')
        .select('id')
        .eq('slug', candidateSlug)
        .maybeSingle();

      if (slugCheck) {
        candidateSlug = `${candidateSlug}-${cleanPhone.slice(-4)}`;
      }

      businessSlug = candidateSlug;
      activeClaimToken = crypto.randomUUID();

      const { data: newBiz, error: insertBizErr } = await supabase
        .from('businesses')
        .insert({
          name: name.trim(),
          slug: businessSlug,
          phone: cleanPhone,
          address: address.trim(),
          category_slug: 'nha-hang-am-thuc',
          location_slug: districtRow.slug,
          status: 'active',
          plan_tier: 'vip',
          claim_token: activeClaimToken,
          map_coordinates: mapCoordinates,
          page_content: {
            hero_image: finalPhoto,
            banners: [finalPhoto],
            gallery: [finalPhoto],
            industry: 'fnb',
            action_name: 'Đặt Bàn Ngay',
            party_deal: party_deal.trim(),
            contact_person: contact_name || 'Chủ quán',
          },
        })
        .select('id')
        .single();

      if (insertBizErr || !newBiz) {
        console.error('[Party Register] Lỗi insert businesses:', insertBizErr);
        return NextResponse.json({ error: 'Lỗi hệ thống khi tạo hồ sơ quán' }, { status: 500 });
      }
      businessId = newBiz.id;
    }

    // 4. Upsert vào business_party_profiles với canonical tag IDs
    const { error: profileErr } = await supabase
      .from('business_party_profiles')
      .upsert(
        {
          business_id: businessId,
          min_guests: min_guests,
          max_guests: max_guests,
          num_vip_rooms: 2,
          price_min: priceMin,
          price_max: priceMax,
          spaces_and_amenities: ['phong_vip', 'karaoke', 'san_khau'],
          cuisines: ['viet_truyen_thong', 'hai_san'],
          party_perks: ['tang_bia', 'free_karaoke'],
          party_deal_highlight: party_deal.trim(),
          party_description: `Sảnh tiệc tất niên sang trọng tại ${name.trim()}. Nhận tiệc từ ${min_guests} đến ${max_guests} khách với ưu đãi độc quyền: ${party_deal.trim()}.`,
          set_menus: [
            { name: 'Set Tiệc Thịnh Vượng (10 người)', price: priceMin * 10, pax: 10 },
            { name: 'Set Tiệc Thượng Hạng (10 người)', price: priceMax * 10, pax: 10 },
          ],
          is_vip: true,
          is_active: true, // Kích hoạt ngay để quán sẵn sàng hiển thị trên Bản Đồ Phố Tiệc
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'business_id' }
      );

    if (profileErr) {
      console.error('[Party Register] Lỗi upsert business_party_profiles:', profileErr);
      return NextResponse.json({ error: 'Lỗi cấu hình hồ sơ tiệc' }, { status: 500 });
    }

    // 4.1. Đồng bộ bảng liên kết business_locations chuẩn với location_id thật từ database
    if (districtRow?.id) {
      await supabase.from('business_locations').delete().eq('business_id', businessId);
      const { error: linkErr } = await supabase.from('business_locations').insert({
        business_id: businessId,
        location_id: districtRow.id,
      });
      if (linkErr) {
        console.warn('[Party Register] Cảnh báo link business_locations:', linkErr);
      }
    }

    // 5. Ghi nhận đăng ký vào business_leads
    const { error: leadErr } = await supabase.from('business_leads').insert({
      business_id: businessId,
      customer_name: contact_name || 'Chủ quán / Quản lý',
      customer_phone: cleanPhone,
      deal_name: PARTY_DEAL_NAME,
      voucher_code: `TN-${cleanPhone.slice(-4)}`,
      notes: `Địa chỉ: ${address} | Gói: 500.000đ | Ưu đãi: ${party_deal}`,
    });

    if (leadErr) {
      console.error('[Party Register] Lỗi ghi nhận hồ sơ tiệc:', leadErr);
    }

    // 6. Gửi chuông Telegram tức thì về Admin (await để đảm bảo tin nhắn được gửi)
    const botToken =
      process.env.TELEGRAM_BOT_TOKEN_1BOOKING ||
      process.env.TELEGRAM_BOT_TOKEN ||
      '';
    const adminChatId =
      process.env.TELEGRAM_ADMIN_CHAT_ID ||
      process.env.TELEGRAM_CHAT_ID;

    if (botToken && adminChatId) {
      const priceFormatted = `${priceMin.toLocaleString('vi-VN')} - ${priceMax.toLocaleString('vi-VN')} đ/người`;
      const districtLabel = districtRow?.name ? ` (${escapeHtml(districtRow.name)})` : '';
      const msg = `<b>🎉 [1BOOKING.ASIA - CHỦ QUÁN ĐĂNG KÝ TIỆC 500K]</b>\n\n🏛️ <b>Quán:</b> ${escapeHtml(name)}\n📍 <b>Địa chỉ:</b> ${escapeHtml(address)}${districtLabel}\n👤 <b>Chủ quán / QL:</b> ${escapeHtml(contact_name || 'Chủ quán')}\n📞 <b>SĐT:</b> <code>${cleanPhone}</code>\n🎁 <b>Gói ưu đãi tiệc:</b> ${escapeHtml(party_deal)}\n💰 <b>Mức giá tiệc:</b> ${priceFormatted}\n👥 <b>Sức chứa:</b> ${min_guests} - ${max_guests} khách\n\n⚡ <i>Gọi xác nhận ngay trong 5 phút và gửi mã VietQR thu 500.000đ kích hoạt sáng đèn neon trên bản đồ!</i>`;

      try {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: adminChatId,
            text: msg,
            parse_mode: 'HTML',
          }),
        });
      } catch (err) {
        console.error('[Telegram Register Error]:', err);
      }
    }

    // 7. Thông tin chuyển khoản VietQR chuẩn SePay
    const BANK_ACC = '00003554020';
    const BANK_NAME = 'TPBank';
    const BANK_OWNER = '1BOOKING.ASIA';
    const transferCode = `TIEC ${cleanPhone}`;
    const qrUrl = `https://qr.sepay.vn/img?acc=${BANK_ACC}&bank=${BANK_NAME}&amount=500000&des=${encodeURIComponent(
      transferCode
    )}`;

    return NextResponse.json({
      success: true,
      business_id: businessId,
      slug: businessSlug,
      claim_token: activeClaimToken,
      claim_url: activeClaimToken ? `/claim/${activeClaimToken}` : null,
      bank_acc: BANK_ACC,
      bank_name: BANK_NAME,
      bank_owner: BANK_OWNER,
      transfer_code: transferCode,
      amount: 500000,
      qr_url: qrUrl,
      photo_url: finalPhoto,
      message: 'Đăng ký điểm tiệc thành công! Quán của bạn đã được ghi nhận vào hệ thống.',
    });
  } catch (err: unknown) {
    console.error('[Party Register Unexpected Error]:', err);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi xử lý đăng ký. Vui lòng thử lại sau ít phút.' },
      { status: 500 }
    );
  }
}
