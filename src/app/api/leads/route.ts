import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';

// Basic in-memory rate limiter (Not perfect for serverless but meets basic requirements)
const rateLimits = new Map<string, { count: number, resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const limitWindow = 5 * 60 * 1000; // 5 minutes
  const maxRequests = 3;

  let record = rateLimits.get(ip);
  if (!record || record.resetAt < now) {
    record = { count: 1, resetAt: now + limitWindow };
    rateLimits.set(ip, record);
    return false;
  }

  if (record.count >= maxRequests) {
    return true;
  }

  record.count += 1;
  return false;
}

function isValidPhone(phone: string): boolean {
  return /^(03|05|07|08|09)\d{8}$/.test(phone);
}

function generateVoucherCode(businessName: string) {
  const prefix = businessName.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `1B-${prefix}-${rand}`;
}


function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Fire and forget telegram alert
function sendTelegramAsync(chatId: string, message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) return;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  fetch(url, {
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
  if (process.env.ZALO_ENABLED !== 'true') return; // Feature flag — disabled by default

  const sidecarUrl = process.env.ZALO_SIDECAR_URL;
  const token = process.env.ZALO_SIDECAR_TOKEN;
  if (!sidecarUrl || !token) {
    console.warn('[Zalo] ZALO_SIDECAR_URL or ZALO_SIDECAR_TOKEN not set');
    return;
  }

  const senderId = getRandomZaloSenderId();
  if (!senderId) {
    console.warn('[Zalo] No ZALO_SENDER_IDS configured');
    return;
  }

  // abs-zalo-bot REST API
  // See: https://github.com/teddiesloco/abs-zalo-bot
  fetch(`${sidecarUrl}${ZALO_SEND_MESSAGE_PATH}`, {
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
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau 5 phút.' }, { status: 429 });
    }

    const body = await req.json();
    const { business_id, customer_name, customer_phone, deal_name } = body;

    if (!business_id || !customer_phone) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
    }

    const cleanPhone = customer_phone.replace(/\D/g, '');
    if (!isValidPhone(cleanPhone)) {
      return NextResponse.json({ error: 'Số điện thoại không hợp lệ' }, { status: 400 });
    }

    const supabase = await createAdminClient();
    
    // Fetch business to get name and telegram_chat_id
    const { data: business } = await supabase
      .from('businesses')
      .select('name, page_content')
      .eq('id', business_id)
      .single();

    if (!business) {
      return NextResponse.json({ error: 'Doanh nghiệp không tồn tại' }, { status: 404 });
    }

    // --- MINI-CRM: Count previous visits for this phone at this business ---
    const { data: previousVisits } = await supabase
      .from('business_leads')
      .select('id, created_at, deal_name')
      .eq('business_id', business_id)
      .eq('customer_phone', cleanPhone)
      .order('created_at', { ascending: false });

    const prevCount = previousVisits?.length ?? 0;
    
    const normalizedDealName = deal_name || 'Nhận Ưu Đãi Chung';
    if (previousVisits && previousVisits.some(v => (v.deal_name || 'Nhận Ưu Đãi Chung') === normalizedDealName)) {
      return NextResponse.json({ error: 'Bạn đã đăng ký nhận ưu đãi này rồi. Vui lòng chọn ưu đãi khác hoặc kiểm tra lại tin nhắn.' }, { status: 400 });
    }

    const visitNumber = prevCount + 1; // This will be the Nth visit after insert

    const voucher_code = generateVoucherCode(business.name);

    // Insert lead with visit_count for dashboard display
    const { error: insertError } = await supabase
      .from('business_leads')
      .insert({
        business_id,
        customer_name: customer_name || 'Khách vãng lai',
        customer_phone: cleanPhone,
        deal_name: normalizedDealName,
        voucher_code,
        visit_count: visitNumber,
      });

    if (insertError) {
      console.error("DB Insert Error:", insertError);
      return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 });
    }

    // --- SMART TELEGRAM NOTIFICATION ---
    const telegramChatId = business.page_content?.telegram_chat_id || process.env.TELEGRAM_CHAT_ID;
    
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
    const safeDeal = escapeHtml(deal_name || 'Ưu đãi chung');

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

    if (telegramChatId) {
      const header = isVIP
        ? `🏆 ĐƠN MỚI TỪ KHÁCH VIP (Đến tiệm lần thứ ${visitNumber})`
        : isReturning
        ? `⭐ ĐƠN MỚI TỪ KHÁCH QUAY LẠI (Lần thứ ${visitNumber})`
        : `🔔 ĐƠN MỚI TỪ KHÁCH MỚI`;

      // 🔔 KÊNH 1: Bắn về tiệm
      const msgForShop = `<b>${header}</b>\n\n👤 Khách: ${safeName}\n📞 SĐT: ${cleanPhone}\n🎁 Gói: ${safeDeal}\n🏷 Mã: ${voucher_code}${historyNote}\n\n${tip}`;
      sendTelegramAsync(telegramChatId, msgForShop);

      // 📡 KÊNH 2: Dual-Dispatch bắn về Admin 1Beauty để giám sát toàn mạng
      const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
      if (adminChatId && adminChatId !== telegramChatId) {
        const safeBusinessName = escapeHtml(business.name || 'Không rõ tiệm');
        const msgForAdmin = `<b>📊 [TOÀN MẠNG] ${safeBusinessName}</b>\n\n${customerTag} | 📞 ${cleanPhone} | 🎁 ${safeDeal}\nMã: ${voucher_code}`;
        sendTelegramAsync(adminChatId, msgForAdmin);
      }
    }

    // 💬 KÊNH 3: ZALO GATEWAY
    // Tính năng này tắt/bật thông qua ZALO_ENABLED (được kiểm tra bên trong sendZaloAsync)
    // Tin nhắn gọn cho chủ tiệm qua Zalo (plain text, không HTML)
    const zaloShopMsg = [
      `${zaloTag} — ${business.name}`,
      `👤 ${customer_name || 'Khach vang lai'}`,
      `📞 SdT: ${cleanPhone}`,
      `🎁 Goi: ${deal_name || 'Uu dai chung'}`,
      `🏷 Ma: ${voucher_code}`,
      previousVisits && previousVisits.length > 0 ? `📊 Da den: ${previousVisits.length} lan truoc` : '',
      tip.replace(/<[^>]*>/g, ''), // strip HTML for plain Zalo text
    ].filter(Boolean).join('\n');

    const zaloShopId = (business.page_content as Record<string, string> | null)?.zalo_owner_id;
    if (zaloShopId) sendZaloAsync(zaloShopId, zaloShopMsg);

    // Bản sao giám sát cho Admin 1Beauty qua Zalo
    const zaloAdminId = process.env.ZALO_ADMIN_ID;
    if (zaloAdminId && zaloAdminId !== zaloShopId) {
      const zaloAdminMsg = `[1BEAUTY MONITOR] ${business.name} | ${adminZaloTag} | ${cleanPhone}`;
      sendZaloAsync(zaloAdminId, zaloAdminMsg);
    }

    return NextResponse.json({ success: true, voucher_code, visit_number: visitNumber });
  } catch (error) {
    console.error("API Leads Error:", error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
