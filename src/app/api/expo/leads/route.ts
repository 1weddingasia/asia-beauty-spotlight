import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';
import { z } from 'zod';

const ExpoLeadSchema = z.object({
  business_id: z.string().uuid("ID gian hàng không hợp lệ"),
  customer_name: z.string().min(1, "Vui lòng nhập họ và tên").max(100),
  customer_phone: z.string().min(8, "Số điện thoại quá ngắn").max(25),
  customer_email: z.string().email("Email không hợp lệ").optional().nullable().or(z.literal('')),
  company_name: z.string().max(150).optional().nullable(),
  interests: z.string().max(500).optional().nullable(),
  preferred_lang: z.enum(['vi', 'en', 'ko', 'zh']).optional().default('vi'),
});

// Bộ nhớ tạm giới hạn request & chống gửi trùng lặp (Tối ưu cho Wifi đông người tại Triển lãm)
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();
const recentSubmissions = new Map<string, number>();
let lastCleanup = 0;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  // Dọn dẹp định kỳ mỗi 60 giây hoặc khi map vượt ngưỡng
  if (now - lastCleanup > 60000 || ipRequestCounts.size > 2000) {
    lastCleanup = now;
    for (const [k, v] of ipRequestCounts.entries()) {
      if (v.resetAt < now) ipRequestCounts.delete(k);
    }
    for (const [k, ts] of recentSubmissions.entries()) {
      if (now - ts > 30000) recentSubmissions.delete(k);
    }
  }

  const record = ipRequestCounts.get(ip);
  if (!record || record.resetAt < now) {
    ipRequestCounts.set(ip, { count: 1, resetAt: now + 60 * 1000 });
    return false;
  }
  // Cho phép tối đa 150 request/phút trên cùng 1 IP (đáp ứng hàng trăm khách cùng dùng chung Wifi SECC / 4G NAT)
  if (record.count >= 150) {
    return true;
  }
  record.count += 1;
  return false;
}

export async function POST(req: Request) {
  let currentDedupKey: string | null = null;
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    if (checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Hệ thống đang tiếp nhận quá nhiều yêu cầu. Vui lòng thử lại sau 30 giây.' }, { status: 429 });
    }

    const body = await req.json();
    const parsed = ExpoLeadSchema.safeParse(body);

    if (!parsed.success) {
      const msg = parsed.error.issues?.[0]?.message || 'Dữ liệu không hợp lệ';
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const {
      business_id,
      customer_name,
      customer_phone,
      customer_email,
      company_name,
      interests,
      preferred_lang,
    } = parsed.data;

    // Kiểm tra chống gửi trùng / bấm đúp khi mạng 4G chập chờn (Idempotency)
    const cleanPhone = customer_phone.replace(/\D/g, '');
    const dedupKey = `${business_id}:${cleanPhone}`;
    currentDedupKey = dedupKey;
    const now = Date.now();

    const lastSubmitTime = recentSubmissions.get(dedupKey);
    if (lastSubmitTime && now - lastSubmitTime < 15000) {
      // Đã gửi trong vòng 15 giây -> Trả về thành công ngay lập tức mà không ghi đè DB
      return NextResponse.json({
        success: true,
        message: 'Thông tin của bạn đã được ghi nhận thành công!',
        deduplicated: true,
        lead: null,
      });
    }

    // Đặt chỗ dedup ngay từ đầu để chặn race-condition khi 2 request song song
    recentSubmissions.set(dedupKey, now);

    const supabase = await createAdminClient();

    // 1. Kiểm tra gian hàng tồn tại và lấy tên gian hàng
    const { data: business, error: bizErr } = await supabase
      .from('businesses')
      .select('id, name, slug, phone')
      .eq('id', business_id)
      .maybeSingle();

    if (bizErr || !business) {
      recentSubmissions.delete(dedupKey); // Hoàn tác slot để khách có thể thử lại
      return NextResponse.json({ error: 'Gian hàng không tồn tại trong hệ thống' }, { status: 404 });
    }

    // 2. Lưu vào bảng business_expo_leads
    const { data: newLead, error: insertErr } = await supabase
      .from('business_expo_leads')
      .insert({
        business_id,
        customer_name,
        customer_phone,
        customer_email: customer_email || null,
        company_name: company_name || null,
        interests: interests || null,
        preferred_lang,
        ip_address: ip,
      })
      .select('id, business_id, customer_name, customer_phone, customer_email, company_name, interests, preferred_lang, created_at')
      .single();

    if (insertErr || !newLead) {
      recentSubmissions.delete(dedupKey); // Hoàn tác slot để khách có thể thử lại
      console.error('[Expo Lead Insert Error]:', insertErr);
      return NextResponse.json({ error: 'Lỗi lưu thông tin khách hàng' }, { status: 500 });
    }

    // 3. Bắn Telegram thông báo tức thời (Fire and Forget với timeout 2.5s không làm nghẽn máy chủ)
    const adminBotToken = process.env.TELEGRAM_BOT_TOKEN_1BOOKING;
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
    if (adminBotToken && adminChatId) {
      const tgMsg = `🎯 <b>[EXPO PASS] CÓ KHÁCH QUÉT GIAN HÀNG MỚI!</b>\n\n`
        + `🏢 <b>Gian hàng:</b> ${business.name}\n`
        + `👤 <b>Khách:</b> ${customer_name}\n`
        + `📞 <b>SĐT:</b> ${customer_phone}\n`
        + `${company_name ? `🏢 <b>Công ty:</b> ${company_name}\n` : ''}`
        + `${interests ? `📝 <b>Nhu cầu:</b> ${interests}\n` : ''}`
        + `🌐 <b>Ngôn ngữ:</b> ${preferred_lang.toUpperCase()}\n`
        + `🔗 <a href="https://1booking.asia/expo/${business.slug}/crm">Mở trang CRM Gian Hàng</a>`;

      fetch(`https://api.telegram.org/bot${adminBotToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: adminChatId, text: tgMsg, parse_mode: 'HTML' }),
        signal: AbortSignal.timeout(2500),
      }).catch(e => console.error('[Expo Telegram Error]:', e));
    }

    return NextResponse.json({
      success: true,
      message: 'Gửi thông tin thành công!',
      lead: newLead,
    });
  } catch (error: any) {
    if (currentDedupKey) {
      recentSubmissions.delete(currentDedupKey);
    }
    console.error('[Expo Lead Route Exception]:', error);
    return NextResponse.json({ error: 'Lỗi hệ thống máy chủ' }, { status: 500 });
  }
}
