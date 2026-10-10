import { NextResponse, after } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';
import { getSiteConfig } from '@/config/site-config';
import { z } from 'zod';

import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';



// Fallback in-memory map for dev/testing when Upstash is not configured
const memoryRateLimits = new Map<string, { count: number, resetAt: number }>();

let ratelimit: Ratelimit | null = null;
let isRatelimitInitialized = false;

async function isRateLimited(ip: string): Promise<boolean> {
  if (!isRatelimitInitialized) {
    const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
    const redis = (redisUrl && redisToken) ? new Redis({ url: redisUrl, token: redisToken }) : null;
    if (redis) {
      ratelimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, "5 m"),
        analytics: true,
      });
    }
    isRatelimitInitialized = true;
  }

  if (ratelimit) {
    try {
      const { success } = await ratelimit.limit(ip);
      return !success;
    } catch (error) {
      console.error('Rate limit (Upstash) error, falling back to memory limiter:', error);
    }
  }

  // Fallback memory rate limiting
  const now = Date.now();
  const limitWindow = 5 * 60 * 1000;
  const maxRequests = 3;

  let record = memoryRateLimits.get(ip);
  if (!record || record.resetAt < now) {
    record = { count: 1, resetAt: now + limitWindow };
    memoryRateLimits.set(ip, record);
    return false;
  }

  if (record.count >= maxRequests) {
    return true;
  }

  record.count += 1;
  return false;
}

// Zod schema for input validation and sanitization
const LeadSchema = z.object({
  business_id: z.string().uuid("ID doanh nghiệp không hợp lệ"),
  customer_name: z.string().max(100).optional().default('Khách vãng lai'),
  customer_phone: z.string().regex(/^(03|05|07|08|09)\d{8}$/, "Số điện thoại không hợp lệ"),
  deal_name: z.string().max(200).optional().default('Nhận Ưu Đãi Chung'),
  cross_sell_items: z.string().max(500).optional().nullable(),
  booking_time: z.string().max(200).optional().nullable()
});



function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Fire and forget telegram alert (now returning promise to allow awaiting)
function sendTelegramAsync(botToken: string, chatId: string, message: string) {
  if (!botToken || !chatId) return Promise.resolve();

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' })
  }).catch(err => console.error("Telegram error:", err));
}

// ═════════════════════════════════════════════════
// ZALO GATEWAY (abs-zalo-bot sidecar)
// Tắt mặc định. Chỉ kích hoạt khi ZALO_ENABLED=true trong .env
// ═════════════════════════════════════════════════

const ZALO_SEND_MESSAGE_PATH = '/api/send-message';

function getRandomZaloSenderId(): string | null {
  const senderIds = (process.env.ZALO_SENDER_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (senderIds.length === 0) return null;
  // Use random selection instead of mutable round-robin state for better serverless compatibility
  const randomIndex = Math.floor(Math.random() * senderIds.length);
  return senderIds[randomIndex];
}

// Fire and forget Zalo alert via abs-zalo-bot sidecar HTTP API
function sendZaloAsync(toUserId: string, message: string) {
  if (process.env.ZALO_ENABLED !== 'true') return Promise.resolve(); // Feature flag — disabled by default

  const sidecarUrl = process.env.ZALO_SIDECAR_URL;
  const token = process.env.ZALO_SIDECAR_TOKEN;
  if (!sidecarUrl || !token) {
    console.warn('[Zalo] ZALO_SIDECAR_URL or ZALO_SIDECAR_TOKEN not set');
    return Promise.resolve();
  }

  const senderId = getRandomZaloSenderId();
  if (!senderId) {
    console.warn('[Zalo] No ZALO_SENDER_IDS configured');
    return Promise.resolve();
  }

  // abs-zalo-bot REST API
  // See: https://github.com/teddiesloco/abs-zalo-bot
  return fetch(`${sidecarUrl}${ZALO_SEND_MESSAGE_PATH}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      senderId,    // Zalo account ID to send from (randomized)
      toUserId,    // Recipient's Zalo userId
      message,     // Plain text message
    }),
    signal: AbortSignal.timeout(5000), // 5s timeout, never block main response
  })
  .then(res => {
    if (!res.ok) console.error(`[Zalo] Sidecar responded ${res.status}`);
  })
  .catch(err => console.error('[Zalo] Sidecar error:', err));
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (await isRateLimited(ip)) {
      return NextResponse.json({ error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau 5 phút.' }, { status: 429 });
    }

    const body = await req.json();
    
    // Validate inputs using Zod
    if (body.customer_phone) {
        body.customer_phone = body.customer_phone.replace(/\D/g, '');
    }
    
    const parsedData = LeadSchema.safeParse(body);
    
    if (!parsedData.success) {
      const errorMessage = parsedData.error.issues?.[0]?.message || 'Dữ liệu không hợp lệ';
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { business_id, customer_name, customer_phone: cleanPhone, deal_name: normalizedDealName, cross_sell_items, booking_time } = parsedData.data;

    const supabase = await createAdminClient();
    
    // Fetch business to get name and telegram_chat_id
    const { data: business } = await supabase
      .from('businesses')
      .select('name, category_slug, telegram_chat_id:page_content->>telegram_chat_id, zalo_owner_id:page_content->>zalo_owner_id')
      .eq('id', business_id)
      .single();

    if (!business) {
      return NextResponse.json({ error: 'Doanh nghiệp không tồn tại' }, { status: 404 });
    }

    // Fetch customer or create if not exists
    let customerId;
    const { data: existingCustomer } = await supabase
      .from('business_customers')
      .select('id')
      .eq('business_id', business_id)
      .eq('phone', cleanPhone)
      .single();

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from('business_customers')
        .insert({
          business_id,
          phone: cleanPhone,
          name: customer_name || 'Khách vãng lai',
          total_visits: 0,
          last_visit_at: null
        })
        .select('id')
        .single();

      if (customerError || !newCustomer) {
        console.error("DB Customer Insert Error:", customerError);
        return NextResponse.json({ error: 'Lỗi hệ thống khi tạo khách hàng' }, { status: 500 });
      }
      customerId = newCustomer.id;
    }

    // --- MINI-CRM: Prevent double bookings ---
    const { data: previousVisits } = await supabase
      .from('business_leads')
      .select('id, created_at, deal_name')
      .eq('business_id', business_id)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (previousVisits) {
      const isBooking = !!booking_time;
      // Find if they recently claimed the EXACT SAME deal/booking
      const recentVisit = previousVisits.find(v => (v.deal_name || 'Nhận Ưu Đãi Chung') === normalizedDealName);
      
      if (recentVisit) {
        const lastTime = new Date(recentVisit.created_at);
        if (isBooking) {
          // For bookings, block double-clicks (2 mins)
          if (lastTime > new Date(Date.now() - 2 * 60 * 1000)) {
            return NextResponse.json({ error: 'Bạn vừa đặt lịch này. Vui lòng đợi 2 phút nếu muốn đặt thêm cho người thân.' }, { status: 400 });
          }
        } else {
          // For offers, prevent spamming the same offer within 24 hours. Clear message.
          if (lastTime > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
            return NextResponse.json({ error: 'Số điện thoại này đã nhận ưu đãi này rồi. Vui lòng kiểm tra lại tin nhắn hoặc dùng số khác!' }, { status: 400 });
          }
        }
      }
    }

    // The visit_count for the lead itself will just track how many leads they've created so far
    const visitNumber = (previousVisits?.length || 0) + 1;
    const voucher_code = cleanPhone;

    // Insert lead
    const { error: insertError } = await supabase
      .from('business_leads')
      .insert({
        business_id,
        customer_id: customerId,
        customer_name: customer_name || 'Khách vãng lai',
        customer_phone: cleanPhone,
        deal_name: normalizedDealName,
        voucher_code,
        visit_count: visitNumber,
        cross_sell_items: cross_sell_items || null,
        notes: booking_time ? `Lịch hẹn: ${booking_time}` : null,
      });

    if (insertError) {
      console.error("DB Insert Error:", insertError);
      return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 });
    }

    // --- SMART TELEGRAM NOTIFICATION ---
    const telegramChatId = business.telegram_chat_id || process.env.TELEGRAM_CHAT_ID;
    
    const isVIP = visitNumber >= 3;
    const isReturning = visitNumber >= 2;

    // Computed tags to avoid nested ternaries
    let customerTag = '🆕 Mới';
    let zaloTag = '🔔 KHACH MOI';
    let adminZaloTag = 'Moi';
    
    if (isVIP) {
      customerTag = '🏆 VIP';
      zaloTag = '🏆 KHACH VIP';
      adminZaloTag = 'VIP';
    } else if (isReturning) {
      customerTag = '⭐ Quay lại';
      zaloTag = '⭐ KHACH QUEN';
      adminZaloTag = 'Quen';
    }

    let tip: string;
    if (isVIP) {
      tip = '⚡ Khách quen! Hãy dặn nhân viên phục vụ thật chu đáo!';
    } else if (isReturning) {
      tip = '✨ Khách quay lại! Gọi ngay để chốt lịch!';
    } else {
      tip = '👉 Gọi ngay để chốt lịch!';
    }

    // Escape user-supplied HTML to prevent Telegram parse_mode injection
    const safeName = escapeHtml(customer_name || 'Không cung cấp');
    const safeDeal = escapeHtml(normalizedDealName);

    // Build visit history summary (last 3 visits)
    let historyNote = ''
    if (previousVisits && previousVisits.length > 0) {
      const recent = previousVisits.slice(0, 3);
      const lines = recent.map(v => {
        const d = new Date(v.created_at);
        const dateStr = `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}`;
        return `  • ${dateStr}: ${escapeHtml(v.deal_name || 'Ưu đãi chung')}`;
      });
      historyNote = `\n📋 Lịch sử ghé tiệm:\n${lines.join('\n')}`;
    }

    const notifications: Promise<any>[] = [];
    const isBookingDeal = !!booking_time;

    if (telegramChatId) {
      let header = '';

      const host = req.headers.get('host') || '';
      const siteConfig = getSiteConfig(host);
      const platformStr = siteConfig.brand.toUpperCase();
      const isBookingSite = siteConfig.brand === '1Booking';
      
      const botToken = isBookingSite 
        ? (process.env.TELEGRAM_BOT_TOKEN_1BOOKING || process.env.TELEGRAM_BOT_TOKEN || '') 
        : (process.env.TELEGRAM_BOT_TOKEN_1BEAUTY || process.env.TELEGRAM_BOT_TOKEN || '');

      let actionStr = 'LỊCH HẸN';
      if (isBookingDeal) {
        const actionNames: Record<string, string> = {
          'fashion': 'NHẬN TƯ VẤN',
          'sports': 'ĐẶT SÂN',
          'health': 'ĐẶT LỊCH KHÁM',
          'dining': 'ĐẶT BÀN',
          'auto': 'ĐẶT LỊCH DỊCH VỤ',
          'fitness': 'ĐĂNG KÝ TẬP',
          'beauty': 'ĐẶT LỊCH LÀM ĐẸP',
          'studio': 'ĐẶT LỊCH CHỤP',
          'pet': 'ĐẶT LỊCH CHĂM SÓC',
          'repair': 'GỌI THỢ',
          'travel': 'ĐẶT PHÒNG/TOUR',
          'consulting': 'ĐẶT LỊCH TƯ VẤN',
          'other': 'LIÊN HỆ'
        };
        actionStr = actionNames[business.category_slug] || 'LỊCH HẸN';

        header = isVIP
          ? `🏆 [${platformStr}] ${actionStr} TỪ KHÁCH VIP (Lần ${visitNumber})`
          : isReturning
          ? `⭐ [${platformStr}] ${actionStr} TỪ KHÁCH QUAY LẠI (Lần ${visitNumber})`
          : `📅 [${platformStr}] ${actionStr} MỚI`;
      } else {
        header = isVIP
          ? `🏆 [${platformStr}] ƯU ĐÃI TỪ KHÁCH VIP (Lần ${visitNumber})`
          : isReturning
          ? `⭐ [${platformStr}] ƯU ĐÃI TỪ KHÁCH QUAY LẠI (Lần ${visitNumber})`
          : `🎁 [${platformStr}] NHẬN ƯU ĐÃI MỚI`;
      }

      // 🔔 KÊNH 1: Bắn về tiệm
      const crossSellStr = cross_sell_items ? `\n🛒 Bán chéo: ${escapeHtml(cross_sell_items)}` : '';
      const bookingTimeStr = booking_time ? `\n🕒 Lịch hẹn: ${escapeHtml(booking_time)}` : '';
      const msgForShop = `<b>${header}</b>\n\n👤 Khách: ${safeName}\n📞 SĐT: ${cleanPhone}\n${isBookingDeal ? `📅 ${actionStr}` : '🎁 Gói'}: ${safeDeal}${crossSellStr}${bookingTimeStr}\n🏷 Mã: ${voucher_code}${historyNote}\n\n${tip}`;
      notifications.push(sendTelegramAsync(botToken, telegramChatId, msgForShop));

      // 📡 KÊNH 2: Dual-Dispatch bắn về Admin 1Beauty để giám sát toàn mạng
      const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
      if (adminChatId && adminChatId !== telegramChatId) {
        const safeBusinessName = escapeHtml(business.name || 'Không rõ tiệm');
        const msgForAdmin = `<b>📊 [${platformStr} - TOÀN MẠNG] ${safeBusinessName}</b>\n\n${customerTag} | 📞 ${cleanPhone} | ${isBookingDeal ? `📅 ${actionStr}` : '🎁 Ưu đãi'}: ${safeDeal}\nMã: ${voucher_code}`;
        notifications.push(sendTelegramAsync(botToken, adminChatId, msgForAdmin));
      }
    }

    // 💬 KÊNH 3: ZALO GATEWAY
    // Tính năng này tắt/bật thông qua ZALO_ENABLED (được kiểm tra bên trong sendZaloAsync)
    // Tin nhắn gọn cho chủ tiệm qua Zalo (plain text, không HTML)
    const zaloShopMsg = [
      `${zaloTag} — ${business.name}`,
      `👤 ${customer_name || 'Khach vang lai'}`,
      `📞 SdT: ${cleanPhone}`,
      `${isBookingDeal ? '📅 Dich vu' : '🎁 Goi'}: ${normalizedDealName}`,
      cross_sell_items ? `🛒 Mua them: ${cross_sell_items}` : '',
      `🏷 Ma: ${voucher_code}`,
      previousVisits && previousVisits.length > 0 ? `📊 Da den: ${previousVisits.length} lan truoc` : '',
      tip.replace(/<[^>]*>/g, ''), // strip HTML for plain Zalo text
    ].filter(Boolean).join('\n');

    const zaloShopId = business.zalo_owner_id;
    if (zaloShopId) notifications.push(sendZaloAsync(zaloShopId, zaloShopMsg));

    // Bản sao giám sát cho Admin 1Beauty qua Zalo
    const zaloAdminId = process.env.ZALO_ADMIN_ID;
    if (zaloAdminId && zaloAdminId !== zaloShopId) {
      const zaloAdminMsg = `[1BEAUTY MONITOR] ${business.name} | ${adminZaloTag} | ${cleanPhone}`;
      notifications.push(sendZaloAsync(zaloAdminId, zaloAdminMsg));
    }

    // Execute notifications in the background after returning response
    if (notifications.length > 0) {
      after(async () => {
        await Promise.allSettled(notifications);
      });
    }

    return NextResponse.json({ success: true, voucher_code, visit_number: visitNumber });
  } catch (error) {
    console.error("API Leads Error:", error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
