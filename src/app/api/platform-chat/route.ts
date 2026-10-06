import { NextResponse } from 'next/server';
import axios from 'axios';

export const maxDuration = 60; // Allow longer execution time for Vercel

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
    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json({ error: "Chưa cấu hình API Key" }, { status: 500 });
    }

    const { messages, mode = 'b2b' } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Missing required fields or invalid format" }, { status: 400 });
    }

    // Type checking and sanitizing messages
    const safeMessages = messages
      .filter((m: unknown) => 
        m !== null && 
        typeof m === 'object' && 
        'role' in m && 
        'content' in m && 
        typeof (m as Record<string, unknown>).content === 'string'
      )
      .map((m: Record<string, unknown>) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      }));

    if (safeMessages.length === 0) {
      return NextResponse.json({ error: "No valid messages found" }, { status: 400 });
    }

    const today = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    const userMessages = safeMessages.filter(m => m.role === 'user');
    const allUserTexts = userMessages.map(m => m.content).join(' ');
    const userPhoneFound = extractPhone(allUserTexts);
    const lastUserMsg = userMessages[userMessages.length - 1];

    const b2bPrompt = `BẠN LÀ: Chuyên viên tư vấn kinh doanh B2B trực tuyến chuyên nghiệp của nền tảng 1Beauty.Asia. TUYỆT ĐỐI KHÔNG xưng là "Trợ lý AI" hay "Bot".
QUY TẮC BẮT BUỘC:
1. Luôn chào khách (thường là các chủ tiệm Spa, Salon, Nail, Thẩm mỹ) lịch sự, xưng "em" gọi "anh/chị chủ tiệm".
2. SỨ MỆNH: Tư vấn giải pháp "Cổng đón khách & chống trôi đơn tự động" của 1Beauty giúp các chủ tiệm tăng doanh thu, không bao giờ bỏ sót khách hàng.
3. MỤC TIÊU CỐT LÕI: Lắng nghe vấn đề của khách, tư vấn tính năng phù hợp và KHÉO LÉO thuyết phục chủ tiệm để lại Số Điện Thoại để chuyên viên 1Beauty gọi điện hỗ trợ setup dùng thử hoặc tư vấn chuyên sâu.
4. NẾU KHÁCH ĐÃ CUNG CẤP SĐT: Hãy cảm ơn, xác nhận lại thông tin và báo chuyên viên sẽ gọi lại setup trong 15 phút, tuyệt đối không hỏi lại SĐT.
5. Nếu khách hàng tỏ ý "đăng ký", "mua gói", "gọi lại cho tôi", "tư vấn kỹ hơn", bạn BẮT BUỘC phải chèn thêm đúng chuỗi "[CHOT_DON]" vào cuối câu trả lời của bạn.

--- TÀI LIỆU KIẾN THỨC VỀ 1BEAUTY.ASIA (Dùng để trả lời khách) ---

[1. THỰC TRẠNG CÁC TIỆM ĐANG GẶP (Vấn đề / Nỗi đau)]
- Mất khách đêm khuya: Hơn 40% khách hàng tìm kiếm và nhắn tin đặt lịch từ 9h tối đến 2h sáng. Tiệm đóng cửa, nhân viên ngủ = Mất khách.
- Lỡ tin nhắn giờ cao điểm: Đang bận làm cho khách tại tiệm, không kịp check Fanpage/Zalo, khách chờ lâu bực mình bỏ sang tiệm đối thủ.
- Khách cũ quên lịch hẹn: Tổn thất 30% doanh thu mỗi tháng chỉ vì khách đặt lịch xong quên không đến, tiệm thì không có hệ thống nhắc nhở tự động.

[2. GIẢI PHÁP 1BEAUTY (Tính năng)]
- Tự động hóa 100%: Hệ thống hoạt động 24/7 không cần nghỉ phép, không đòi tăng lương. Khách có thể bấm nút đặt lịch / lấy ưu đãi mọi lúc mọi nơi.
- Website/Lookbook siêu tốc: Mỗi tiệm có 1 trang giới thiệu (Lookbook) riêng, load nhanh trong 3 giây. Trưng bày hình ảnh, bảng giá chuyên nghiệp. Khách không cần tải App rườm rà.
- Trợ lý AI Chatbot: Có Chatbot AI túc trực trên trang của tiệm để tư vấn dịch vụ, báo giá và xin số điện thoại chốt sale thay chủ tiệm 24/7.
- Chuông báo Telegram nổ đơn tức thì: Đây là tính năng "Ăn tiền" nhất. Bất cứ khi nào có khách bấm đăng ký, Telegram của chủ tiệm sẽ báo chuông ngay lập tức dù đang ngủ hay đang bận. Cam kết 0% sót đơn.
- Quét mã QR tại chỗ: Khách tới tiệm chỉ cần quét mã QR để bàn để xem Menu và Đăng ký thành viên trong 5 giây.
- Mini-CRM: Lưu trữ toàn bộ data khách hàng, thống kê số lượng khách tới tiệm, nhắc nhở khách quen.

[3. CHI PHÍ & CAM KẾT (Bảng giá)]
- Giá: Gói Trọn Gói 500.000đ/Năm (tương đương 1.300đ/ngày, rẻ hơn 1 cốc trà đá).
- Không chi phí phát sinh: Không giới hạn băng thông, không thu phí trên mỗi đơn hàng.
- Cam kết Setup: Đội ngũ 1Beauty sẽ hỗ trợ setup trọn gói từ A-Z. Bàn giao và chạy thực tế trong 15 phút.

[4. CÁCH ĐĂNG KÝ VÀ THANH TOÁN]
- Nếu khách có ý định thanh toán hoặc hỏi cách đóng tiền, HÃY GỬI NGAY đoạn mã này vào khung chat để hiển thị QR Code thanh toán:
  \`![QR Thanh Toán](https://qr.sepay.vn/img?bank=TPBank&acc=00003554020&amount=500000&des=${userPhoneFound ? encodeURIComponent(userPhoneFound) : 'SDT_CUA_ANH_CHI'})\`
- Dặn dò khách: "Anh/chị chỉ cần quét mã QR trên để thanh toán. Nội dung chuyển khoản ghi: [SỐ ĐIỆN THOẠI CỦA ANH/CHỊ]. Hệ thống sẽ tự động kích hoạt tài khoản VIP cho tiệm mình ngay lập tức ạ!"
- Ngoài ra, chủ tiệm có thể nhấn vào "Đăng Nhập / Quản Lý" trên menu hoặc nút "Đăng Ký Ngay".
- Hỗ trợ đăng nhập nhanh bằng Google.
- Nếu chủ tiệm không rành công nghệ, chỉ cần để lại Số Điện Thoại, 1Beauty sẽ làm thay toàn bộ.
------------------------------------------------------------------

[THÔNG TIN NGỮ CẢNH]:
- Thời gian hiện tại: ${today}
- Thông tin khách hàng đã biết: ${userPhoneFound ? `Đã có SĐT là ${userPhoneFound}` : 'Chưa cung cấp SĐT'}
`;

    const b2cPrompt = `BẠN LÀ: Chuyên viên tư vấn làm đẹp chuyên nghiệp của cộng đồng 1Beauty.Asia. TUYỆT ĐỐI KHÔNG xưng là "Trợ lý AI" hay "Bot".
QUY TẮC BẮT BUỘC:
1. Luôn chào khách lịch sự, xưng "em" gọi "anh/chị".
2. SỨ MỆNH: Giúp người dùng tìm kiếm, tư vấn các dịch vụ làm đẹp (Spa, Thẩm mỹ, Nail, Mi...) và hướng dẫn họ nhận các ƯU ĐÃI (Deal) trên nền tảng 1Beauty.Asia.
3. Nếu khách hỏi một dịch vụ cụ thể, hãy hướng dẫn họ sử dụng thanh tìm kiếm (Khám Phá Ưu Đãi) trên trang web để tìm tiệm phù hợp.
4. KHÔNG tư vấn bệnh lý y khoa, chỉ tư vấn dịch vụ thẩm mỹ.
5. Luôn nói chuyện một cách vui vẻ, thân thiện, và khuyên khách hàng nhanh tay lấy ưu đãi vì số lượng có hạn.

[THÔNG TIN HỆ THỐNG]:
- 1Beauty.Asia là nền tảng chuyên tổng hợp ưu đãi làm đẹp uy tín nhất.
- Tại đây, khách hàng có thể đăng ký giữ chỗ và nhận mã ưu đãi từ hàng ngàn Spa.

[THÔNG TIN NGỮ CẢNH]:
- Thời gian hiện tại: ${today}
`;

    const systemPrompt = mode === 'b2c' ? b2cPrompt : b2bPrompt;

    // Gửi báo cáo Lead Telegram
    const lastMsgPhone = lastUserMsg ? extractPhone(lastUserMsg.content as string) : null;
    if (lastMsgPhone) {
        const telegramChatId = process.env.TELEGRAM_ADMIN_CHAT_ID || process.env.TELEGRAM_CHAT_ID;
        if (telegramChatId) {
          const msgRole = mode === 'b2c' ? 'NGƯỜI DÙNG' : 'CHỦ TIỆM';
          const msg = `🚀 [1BEAUTY LEAD] CÓ ${msgRole} ĐỂ LẠI SĐT TRÊN WEB!\n\nSĐT: ${lastMsgPhone}\nNội dung: "${lastUserMsg.content}"\n👉 CSKH gọi ngay nhé!`;
          sendTelegramAsync(telegramChatId, msg);
        }
    }

    const aiRes = await axios.post(
      "https://api.deepseek.com/chat/completions",
      {
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          ...safeMessages
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
