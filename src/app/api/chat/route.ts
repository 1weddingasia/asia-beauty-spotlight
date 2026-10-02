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

    // 2. Kẹp Context vào System Prompt
    const systemPrompt = `BẠN LÀ: Trợ lý lễ tân trực tuyến chuyên nghiệp của ${business.name}.
QUY TẮC BẮT BUỘC:
1. Luôn chào khách lịch sự, xưng "em" gọi "chị/anh".
2. TUYỆT ĐỐI CHỈ trả lời dựa trên thông tin tiệm dưới đây. KHÔNG bịa đặt giá hoặc dịch vụ.
3. Nếu khách hỏi dịch vụ tiệm không có, hãy lịch sự từ chối.
4. Mục tiêu cao nhất: Khéo léo nhắc khách để lại Số Điện Thoại để nhận voucher giảm giá hoặc giữ lịch hẹn. Khách cung cấp SĐT thì cảm ơn và báo nhân viên sẽ gọi lại sớm.

[DỮ LIỆU TIỆM]:
- Tên tiệm: ${business.name}
- Hotline: ${business.page_content?.phone || 'Chưa cập nhật'}
- Địa chỉ: ${business.address || 'Chưa cập nhật'}
- Bảng giá/Dịch vụ: ${JSON.stringify(business.page_content?.services || 'Đang cập nhật')}
- Ưu đãi: ${JSON.stringify(business.page_content?.deals || business.page_content?.promotions || business.page_content?.offers || 'Đang cập nhật')}
`;

    // 3. Xử lý "bắt" Số Điện Thoại tự động
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      const phoneFound = extractPhone(lastUserMsg.content);
      if (phoneFound) {
        // Lưu data tự động
        const voucher_code = `1B-${business.name.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
        
        await supabase.from('business_leads').insert({
          business_id: shop_id,
          customer_name: 'Khách từ Chatbot',
          customer_phone: phoneFound,
          deal_name: 'Tư vấn trực tiếp',
          voucher_code,
        });

        // Bắn Telegram thông báo Lead từ Chatbot
        const telegramChatId = business.page_content?.telegram_chat_id || process.env.TELEGRAM_CHAT_ID;
        if (telegramChatId) {
          const msg = `🤖 [AI CHATBOT] CÓ KHÁCH ĐỂ LẠI SĐT!\n\nTiệm: ${business.name}\nSĐT: ${phoneFound}\nNội dung chat: "${lastUserMsg.content}"\n👉 Anh/Chị gọi ngay để chốt nhé!`;
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

    const reply = aiRes.data?.choices?.[0]?.message?.content;
    if (!reply) {
      return NextResponse.json({ error: "Không nhận được phản hồi từ AI" }, { status: 502 });
    }

    return NextResponse.json({ reply });

  } catch (error: unknown) {
    const e = error as { response?: { data?: unknown }, message?: string };
    console.error("Chat API Error:", e.response?.data || e.message);
    return NextResponse.json({ error: "Lỗi kết nối AI" }, { status: 500 });
  }
}
