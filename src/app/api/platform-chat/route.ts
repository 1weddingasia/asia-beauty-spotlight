import { NextResponse } from 'next/server';
import axios from 'axios';
import { createAdminClient } from '@/utils/supabase/server';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

function extractPhone(text: string): string | null {
  // Matches typical Vietnamese 10 digit numbers starting with 03, 05, 07, 08, 09
  // Allow spaces, dots, dashes between digits
  const cleaned = text.replace(/[\s\.\-]/g, '');
  const match = cleaned.match(/(03|05|07|08|09)\d{8}/);
  return match ? match[0] : null;
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
    const { messages } = await req.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const today = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    const userMessages = messages.filter((m: any) => m.role === 'user');
    const allUserTexts = userMessages.map((m: any) => m.content).join(' ');
    const userPhoneFound = extractPhone(allUserTexts);
    const lastUserMsg = userMessages[userMessages.length - 1];

    const systemPrompt = `BẠN LÀ: Trợ lý kinh doanh B2B trực tuyến chuyên nghiệp của nền tảng 1Beauty.Asia.
QUY TẮC BẮT BUỘC:
1. Luôn chào khách (thường là các chủ tiệm spa, salon, nail) lịch sự, xưng "em" gọi "anh/chị chủ tiệm".
2. SỨ MỆNH: Tư vấn giải pháp "Cổng đón khách & chống trôi đơn tự động" của 1Beauty giúp các chủ tiệm tăng doanh thu, không bỏ lót khách hàng.
3. THÔNG TIN SẢN PHẨM: 
- Tính năng: Tạo trang Web/Lookbook riêng tốc độ cao 3 giây, QR Code để bàn, Mini-CRM quản lý khách quen/mới, Chuông báo Telegram nổ đơn tức thì 24/7 (0% sót đơn). Khách hàng không cần tải app hay đăng ký phức tạp.
- Chi phí: Gói Trọn Gói 500.000đ/Năm (chỉ tương đương 1.300đ/ngày, rẻ hơn 1 cốc trà đá).
- Cách đăng ký: Chủ tiệm nhấn vào nút "Đăng Nhập / Quản Lý" trên menu hoặc "Đăng Ký Ngay", đăng ký tài khoản (hỗ trợ Google Login), sau đó tự tạo hồ sơ tiệm. Tuy nhiên, nếu chủ tiệm bận, 1Beauty có đội ngũ setup trọn gói từ A-Z trong 15 phút.
4. MỤC TIÊU: Thuyết phục chủ tiệm để lại Số Điện Thoại để chuyên viên 1Beauty gọi điện hỗ trợ setup dùng thử hoặc tư vấn chuyên sâu.
5. NẾU KHÁCH ĐÃ CUNG CẤP SĐT: Hãy cảm ơn và báo chuyên viên sẽ gọi lại sớm nhất, tuyệt đối không hỏi lại SĐT.
6. Nếu khách hàng tỏ ý "đăng ký", "mua gói", "gọi lại cho tôi", "tư vấn", bạn BẮT BUỘC phải chèn thêm đúng chuỗi "[CHOT_DON]" vào cuối câu trả lời của bạn.

[THÔNG TIN NGỮ CẢNH]:
- Thời gian hiện tại: ${today}
- Thông tin khách hàng đã biết: ${userPhoneFound ? `Đã có SĐT là ${userPhoneFound}` : 'Chưa cung cấp SĐT'}
`;

    // Gửi báo cáo Lead Telegram
    if (lastUserMsg && extractPhone(lastUserMsg.content)) {
        const telegramChatId = process.env.TELEGRAM_ADMIN_CHAT_ID || process.env.TELEGRAM_CHAT_ID;
        if (telegramChatId) {
          const msg = `🚀 [1BEAUTY LEAD] CÓ CHỦ TIỆM ĐỂ LẠI SĐT TRÊN WEB!\n\nSĐT: ${extractPhone(lastUserMsg.content)}\nNội dung: "${lastUserMsg.content}"\n👉 CSKH gọi ngay nhé!`;
          sendTelegramAsync(telegramChatId, msg);
        }
    }

    const aiRes = await axios.post(
      "https://api.deepseek.com/chat/completions",
      {
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        temperature: 0.6,
      },
      {
        headers: {
          "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 60000
      }
    );

    let reply = aiRes.data?.choices?.[0]?.message?.content;
    if (!reply) {
      return NextResponse.json({ error: "Không nhận được phản hồi từ AI" }, { status: 502 });
    }

    if (reply.includes('[CHOT_DON]')) {
      reply = reply.replace(/\[CHOT_DON\]/g, '').trim();
    }

    return NextResponse.json({ reply });

  } catch (error: unknown) {
    const e = error as { response?: { data?: unknown }, message?: string };
    console.error("Platform Chat API Error:", e.response?.data || e.message);
    return NextResponse.json({ error: "Lỗi kết nối AI" }, { status: 500 });
  }
}
