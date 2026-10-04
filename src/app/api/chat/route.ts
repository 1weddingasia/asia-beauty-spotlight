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
    const { shop_id, messages } = await req.json();

    if (!shop_id || !messages || messages.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createAdminClient();
    
    // 1. Lấy thông tin tiệm (Context)
    const { data: business } = await supabase
      .from('businesses')
      .select('name, address, page_content')
      .eq('id', shop_id)
      .single();

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Đồng bộ logic hiển thị trên web (PromoClient): không tự biên tự diễn deal ảo
    let deals = business.page_content?.deals || business.page_content?.promotions || [];
    if (deals.length === 0) {
      if (Array.isArray(business.page_content?.offers) && business.page_content.offers.length > 0) {
        deals = business.page_content.offers;
      }
    }

    const services = business.page_content?.services || 'Đang cập nhật';
    const crossSells = business.page_content?.cross_sells || [];

    // Xử lý thông tin khách từ lịch sử chat
    const userMessages = messages.filter((m: any) => m.role === 'user');
    const allUserTexts = userMessages.map((m: any) => m.content).join(' ');
    const userPhoneFound = extractPhone(allUserTexts);
    const lastUserMsg = userMessages[userMessages.length - 1];

    // 2. Kẹp Context vào System Prompt
    const today = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    const systemPrompt = `BẠN LÀ: Trợ lý lễ tân trực tuyến chuyên nghiệp của ${business.name}.
QUY TẮC BẮT BUỘC:
1. Luôn chào khách lịch sự, xưng "em" gọi "chị/anh".
2. TUYỆT ĐỐI CHỈ trả lời dựa trên thông tin tiệm dưới đây. KHÔNG bịa đặt giá, dịch vụ, hay tự tạo sản phẩm/ưu đãi ảo. Nếu khách hỏi thông tin không có trong dữ liệu, hãy lịch sự từ chối và báo tiệm chưa có dịch vụ đó.
3. TUYỆT ĐỐI CHỈ áp dụng khuyến mãi cho các dịch vụ CÓ TRONG DANH SÁCH ƯU ĐÃI (Deals) bên dưới. Nếu dịch vụ khách hỏi KHÔNG nằm trong danh sách Ưu đãi, chỉ báo giá gốc của dịch vụ đó, tuyệt đối không tự áp dụng khuyến mãi.
4. Khi khách muốn lấy ưu đãi/đặt lịch, nhắc khách khi đến tiệm chỉ cần đọc Số Điện Thoại đã đăng ký để xác nhận. TUYỆT ĐỐI KHÔNG yêu cầu mang theo CMND hay CCCD.
5. Mục tiêu cao nhất: Khéo léo nhắc khách để lại Số Điện Thoại để nhận voucher giảm giá hoặc giữ lịch hẹn.
6. NẾU KHÁCH ĐÃ CUNG CẤP SỐ ĐIỆN THOẠI (xem ở mục Thông tin khách đã biết): TUYỆT ĐỐI KHÔNG HỎI LẠI SĐT. Hãy ghi nhớ số này và tư vấn trực tiếp.
7. Nếu khách hàng tỏ ý "chốt đơn", "đặt lịch hẹn", "mua liệu trình", bạn BẮT BUỘC phải chèn thêm đúng chuỗi "[CHOT_DON]" vào cuối câu trả lời của bạn.
8. BÁN CHÉO (UPSELL/CROSS-SELL): Nếu khách có vẻ quan tâm hoặc đã đồng ý lấy ưu đãi, HÃY KHÉO LÉO tư vấn và mời khách mua/đăng ký thêm các "Sản phẩm/Dịch vụ mua kèm" (ưu đãi thêm) dưới đây để tiệm gia tăng doanh thu. Chỉ giới thiệu các sản phẩm mua kèm CÓ TRONG DANH SÁCH.

[DỮ LIỆU TIỆM]:
- Tên tiệm: ${business.name}
- Hotline: ${business.page_content?.phone || 'Chưa cập nhật'}
- Địa chỉ: ${business.address || 'Chưa cập nhật'}
- Bảng giá/Dịch vụ: ${JSON.stringify(services)}
- Ưu đãi chính: ${JSON.stringify(deals)}
- Sản phẩm/Dịch vụ mua kèm (Cross-sell): ${JSON.stringify(crossSells)}

[THÔNG TIN NGỮ CẢNH]:
- Thời gian hiện tại: ${today}
- Thông tin khách hàng đã biết: ${userPhoneFound ? `Đã có SĐT là ${userPhoneFound}` : 'Chưa cung cấp SĐT'}
`;

    // 3. Xử lý "bắt" Số Điện Thoại tự động ngay khi khách nhắn
    if (lastUserMsg) {
      const phoneInLastMsg = extractPhone(lastUserMsg.content);
      if (phoneInLastMsg) {
        // Lưu data tự động
        const voucher_code = `1B-${business.name.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
        
        await supabase.from('business_leads').insert({
          business_id: shop_id,
          customer_name: 'Khách từ Chatbot',
          customer_phone: phoneInLastMsg,
          deal_name: 'Tư vấn trực tiếp',
          voucher_code,
        });

        // Bắn Telegram thông báo Lead từ Chatbot
        const telegramChatId = business.page_content?.telegram_chat_id || process.env.TELEGRAM_CHAT_ID;
        if (telegramChatId) {
          const msg = `🤖 [AI CHATBOT] CÓ KHÁCH ĐỂ LẠI SĐT!\n\nTiệm: ${business.name}\nSĐT: ${phoneInLastMsg}\nNội dung chat: "${lastUserMsg.content}"\n👉 Anh/Chị gọi ngay để chốt nhé!`;
          sendTelegramAsync(telegramChatId, msg);
        }
      }
    }

    // 4. Gọi AI
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

    // Xử lý gửi Telegram khi khách chốt đơn
    if (reply.includes('[CHOT_DON]')) {
      reply = reply.replace(/\[CHOT_DON\]/g, '').trim();
      const telegramChatId = business.page_content?.telegram_chat_id || process.env.TELEGRAM_CHAT_ID;
      if (telegramChatId && userPhoneFound) {
        const msg = `🔥 [AI CHATBOT - CHỐT ĐƠN/ĐẶT LỊCH] 🔥\n\nTiệm: ${business.name}\nSĐT Khách: ${userPhoneFound}\nNội dung khách vừa nhắn: "${lastUserMsg?.content || ''}"\nAI đã phản hồi: "${reply}"\n👉 Anh/Chị gọi điện xác nhận cho khách ngay nhé!`;
        sendTelegramAsync(telegramChatId, msg);
      }
    }

    return NextResponse.json({ reply });

  } catch (error: unknown) {
    const e = error as { response?: { data?: unknown }, message?: string };
    console.error("Chat API Error:", e.response?.data || e.message);
    return NextResponse.json({ error: "Lỗi kết nối AI" }, { status: 500 });
  }
}
