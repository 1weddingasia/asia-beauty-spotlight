import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';
import { z } from 'zod';

const ContactSchema = z.object({
  contact_name: z.string().min(1, "Vui lòng nhập họ và tên").max(100),
  phone: z.string().min(8, "Số điện thoại quá ngắn").max(25),
  business_name: z.string().max(150).optional().nullable(),
  service_type: z.string().max(150).optional().nullable(),
  message: z.string().max(1000).optional().nullable(),
  email: z.string().email("Email không hợp lệ").optional().nullable().or(z.literal('')),
  source: z.string().max(100).optional().default('1Booking Expo Pass'),
});

// Simple memory limiter (max 5 requests / min / IP)
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = ipRequestCounts.get(ip);
  if (!record || record.resetAt < now) {
    ipRequestCounts.set(ip, { count: 1, resetAt: now + 60 * 1000 });
    return false;
  }
  if (record.count >= 5) {
    return true;
  }
  record.count += 1;
  return false;
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    if (checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút.' }, { status: 429 });
    }

    const body = await req.json();
    const parsed = ContactSchema.safeParse(body);

    if (!parsed.success) {
      const msg = parsed.error.issues?.[0]?.message || 'Dữ liệu không hợp lệ';
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const {
      contact_name,
      phone,
      business_name,
      service_type,
      message,
      email,
      source,
    } = parsed.data;

    // 1. Lưu vào Database (contact_requests)
    try {
      const supabase = await createAdminClient();
      const { error: insertErr } = await supabase.from('contact_requests').insert({
        contact_name,
        phone,
        business_name: business_name || 'Khách vãng lai / Gian hàng mới',
        message: [
          service_type ? `[Nhu cầu: ${service_type}]` : '',
          email ? `[Email: ${email}]` : '',
          message || '',
        ].filter(Boolean).join(' - '),
        status: 'new',
        created_at: new Date().toISOString(),
      });
      if (insertErr) {
        console.warn('[Expo Contact] DB insert warning:', insertErr.message);
      }
    } catch (dbErr) {
      console.warn('[Expo Contact] DB save error:', dbErr);
    }

    // 2. Gửi thông báo trực tiếp đến Telegram Admin
    const botToken = process.env.TELEGRAM_BOT_TOKEN_1BOOKING || process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID || process.env.TELEGRAM_CHAT_ID;

    if (botToken && chatId) {
      const escapeHtml = (text: string) =>
        (text || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');

      const tgText = `🚀 <b>[1BOOKING EXPO PASS] YÊU CẦU LIÊN HỆ MỚI!</b>\n\n`
        + `👤 <b>Người liên hệ:</b> ${escapeHtml(contact_name)}\n`
        + `📞 <b>Số điện thoại / Zalo:</b> <code>${escapeHtml(phone)}</code>\n`
        + `🏢 <b>Doanh nghiệp / Gian hàng:</b> ${escapeHtml(business_name || 'Chưa cung cấp')}\n`
        + (service_type ? `🎯 <b>Nhu cầu:</b> ${escapeHtml(service_type)}\n` : '')
        + (email ? `📧 <b>Email:</b> ${escapeHtml(email)}\n` : '')
        + (message ? `💬 <b>Lời nhắn:</b> ${escapeHtml(message)}\n` : '')
        + `📍 <b>Kênh gửi:</b> ${escapeHtml(source)}\n`
        + `⏰ <b>Thời gian:</b> ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`;

      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: tgText,
            parse_mode: 'HTML',
          }),
          signal: AbortSignal.timeout(8000),
        });

        if (!tgRes.ok) {
          console.error(`Telegram API status ${tgRes.status}:`, await tgRes.text());
        }
      } catch (tgErr) {
        console.error('[Expo Contact] Telegram send error:', tgErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Yêu cầu liên hệ đã được gửi thành công!',
    });
  } catch (error: any) {
    console.error('[Expo Contact Route Error]:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}
