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

// Simple memory limiter
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = ipRequestCounts.get(ip);
  if (!record || record.resetAt < now) {
    ipRequestCounts.set(ip, { count: 1, resetAt: now + 60 * 1000 });
    return false;
  }
  if (record.count >= 5) {
    return true; // Exceeded 5 submissions per minute per IP
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

    const supabase = await createAdminClient();

    // 1. Kiểm tra gian hàng tồn tại và lấy tên gian hàng
    const { data: business, error: bizErr } = await supabase
      .from('businesses')
      .select('id, name, slug, phone')
      .eq('id', business_id)
      .maybeSingle();

    if (bizErr || !business) {
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
      console.error('[Expo Lead Insert Error]:', insertErr);
      return NextResponse.json({ error: 'Lỗi lưu thông tin khách hàng' }, { status: 500 });
    }

    // 3. Bắn Telegram thông báo tức thời (Fire and Forget)
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
      }).catch(e => console.error('[Expo Telegram Error]:', e));
    }

    return NextResponse.json({
      success: true,
      message: 'Gửi thông tin thành công!',
      lead: newLead,
    });
  } catch (error: any) {
    console.error('[Expo Lead Route Exception]:', error);
    return NextResponse.json({ error: 'Lỗi hệ thống máy chủ' }, { status: 500 });
  }
}
