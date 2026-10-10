import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';

function resolveBotToken(reqUrl: string): string | undefined {
  const urlObj = new URL(reqUrl);
  const botType = urlObj.searchParams.get('bot');
  return botType === '1booking'
    ? (process.env.TELEGRAM_BOT_TOKEN_1BOOKING || process.env.TELEGRAM_BOT_TOKEN)
    : (process.env.TELEGRAM_BOT_TOKEN_1BEAUTY || process.env.TELEGRAM_BOT_TOKEN);
}

// Telegram Webhook Handler
export async function POST(req: Request) {
  try {
    const update = await req.json();

    // Check if it's a message with text
    if (update.message && update.message.text) {
      const chatId = update.message.chat.id.toString();
      const text = update.message.text.trim();

      // Check if it's a /start command with a payload (Deep link)
      // Example: /start ngoc-spa
      if (text.startsWith('/start ')) {
        const payload = text.split(' ')[1]; // This is the slug

        if (payload) {
          const supabase = await createAdminClient();

          // 1. Find the business by slug
          const { data: business, error: findError } = await supabase
            .from('businesses')
            .select('id, name, page_content')
            .eq('slug', payload)
            .single();

          if (business && !findError) {
            // 2. Update the telegram_chat_id in page_content
            const newContent = {
              ...(business.page_content || {}),
              telegram_chat_id: chatId
            };

            const { error: updateError } = await supabase
              .from('businesses')
              .update({ page_content: newContent })
              .eq('id', business.id);

            // 3. Send a confirmation message back to the user via Telegram
            const token = resolveBotToken(req.url);

            if (token && !updateError) {
              const url = `https://api.telegram.org/bot${token}/sendMessage`;
              const msg = `✅ Kích hoạt thành công!\n\nHệ thống đã kết nối Telegram của bạn với tiệm <b>${business.name}</b>.\nTừ giờ, khi có khách để lại SĐT hoặc chốt đơn trên Web, bạn sẽ nhận được thông báo trực tiếp tại đây!`;
              
              await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'HTML' })
              }).catch(console.error);
            }
            
            return NextResponse.json({ success: true, message: 'Linked successfully' });
          } else {
            // Business not found
            const token = resolveBotToken(req.url);
            
            if (token) {
              const url = `https://api.telegram.org/bot${token}/sendMessage`;
              await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: "❌ Không tìm thấy thông tin tiệm. Vui lòng thử lại link từ trang quản trị." })
              }).catch(console.error);
            }
          }
        }
      }
    }

    // Always return 200 to Telegram so it doesn't retry
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Telegram Webhook Error:", error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
