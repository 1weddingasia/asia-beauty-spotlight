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

// Fire and forget telegram alert
function sendTelegramAsync(chatId: string, message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) return;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message })
  }).catch(err => console.error("Telegram error:", err));
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

    const voucher_code = generateVoucherCode(business.name);

    // Insert lead
    const { error: insertError } = await supabase
      .from('business_leads')
      .insert({
        business_id,
        customer_name: customer_name || 'Khách vãng lai',
        customer_phone: cleanPhone,
        deal_name: deal_name || 'Nhận Ưu Đãi Chung',
        voucher_code,
      });

    if (insertError) {
      console.error("DB Insert Error:", insertError);
      return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 });
    }

    // Async Telegram notification
    const telegramChatId = business.page_content?.telegram_chat_id;
    if (telegramChatId) {
      const msg = `🔔 CÓ KHÁCH NHẬN ƯU ĐÃI MỚI!\n\nTiệm: ${business.name}\nKhách hàng: ${customer_name || 'Không cung cấp'}\nSĐT: ${cleanPhone}\nGói: ${deal_name || 'Ưu đãi chung'}\nMã: ${voucher_code}\n\n👉 Anh/Chị hãy gọi ngay để chốt lịch!`;
      sendTelegramAsync(telegramChatId, msg);
    }

    return NextResponse.json({ success: true, voucher_code });
  } catch (error) {
    console.error("API Leads Error:", error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
