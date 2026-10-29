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
      } else if (text === '/status' || text === '/help' || text === '/pending') {
        const token = resolveBotToken(req.url);
        const adminId = process.env.TELEGRAM_ADMIN_CHAT_ID || process.env.TELEGRAM_CHAT_ID;

        if (token && adminId && String(chatId) === String(adminId)) {
          const supabase = await createAdminClient();

          if (text === '/status') {
            const [{ count: totalBiz }, { count: draftBiz }, { count: pubBiz }] = await Promise.all([
              supabase.from('businesses').select('*', { count: 'exact', head: true }),
              supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
              supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('status', 'published'),
            ]);

            const msg = `
📊 <b>BÁO CÁO HỆ THỐNG 1BOOKING / 1BEAUTY</b>
━━━━━━━━━━━━━━━━━━━━
🏛️ <b>Tổng gian hàng:</b> ${totalBiz || 0}
🟢 <b>Đang công khai:</b> ${pubBiz || 0}
🟡 <b>Đang chờ duyệt (Draft):</b> ${draftBiz || 0}
━━━━━━━━━━━━━━━━━━━━
Gõ <code>/pending</code> để xem danh sách chờ duyệt.
            `.trim();

            await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'HTML' }),
            }).catch(console.error);
          } else if (text === '/pending') {
            const { data: pendings } = await supabase
              .from('businesses')
              .select('id, name, slug, created_at')
              .eq('status', 'draft')
              .order('created_at', { ascending: false })
              .limit(5);

            if (!pendings || pendings.length === 0) {
              await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: '✅ Hiện không có gian hàng nào đang chờ duyệt!' }),
              }).catch(console.error);
            } else {
              for (const p of pendings) {
                const pMsg = `<b>🟡 CHỜ DUYỆT: ${p.name}</b>\n🔗 Link: <code>/${p.slug}</code>`;
                const keyboard = {
                  inline_keyboard: [
                    [
                      { text: '👁️ Xem Demo', url: `https://1booking.asia/${p.slug}` },
                      { text: '✅ Duyệt Public', callback_data: `pub:${p.id}` },
                    ],
                  ],
                };
                await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    chat_id: chatId,
                    text: pMsg,
                    parse_mode: 'HTML',
                    reply_markup: keyboard,
                  }),
                }).catch(console.error);
              }
            }
          } else if (text === '/help') {
            const helpMsg = `
🤖 <b>LỆNH BOT QUẢN TRỊ VIÊN 1BOOKING:</b>
━━━━━━━━━━━━━━━━━━━━
• <code>/status</code>: Xem tình trạng tổng thể hệ thống
• <code>/pending</code>: Xem danh sách các tiệm đang chờ duyệt
• <code>/start [slug]</code>: Liên kết thông báo đặt lịch với gian hàng
━━━━━━━━━━━━━━━━━━━━
Các biểu mẫu gửi thông tin trực tuyến:
• Ưu Đãi: <code>https://1booking.asia/gui-thong-tin/uu-dai</code>
• Tiệc: <code>https://1booking.asia/gui-thong-tin/tiec</code>
            `.trim();

            await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ chat_id: chatId, text: helpMsg, parse_mode: 'HTML' }),
            }).catch(console.error);
          }
        }
      }
    }

    // Check if it's an inline button click (callback_query)
    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const callbackData = callbackQuery.data; // ví dụ: "pub:uuid", "ai:uuid", "sus:uuid"
      const chatId = callbackQuery.message?.chat?.id;
      const callbackId = callbackQuery.id;
      const token = resolveBotToken(req.url);

      if (!callbackData || !chatId) {
        return NextResponse.json({ success: true });
      }

      if (callbackData.startsWith('pub:') || callbackData.startsWith('ai:') || callbackData.startsWith('sus:')) {
        const { handleTelegramCallback } = await import('@/lib/services/ai-onboarding');
        const result = await handleTelegramCallback(callbackData, chatId);

        if (token) {
          // Báo cho Telegram tắt hiệu ứng loading của button
          await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              callback_query_id: callbackId,
              text: result.text.slice(0, 150),
            }),
          }).catch(console.error);

          // Gửi tin nhắn kết quả chi tiết cho Admin
          await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: result.text,
            }),
          }).catch(console.error);
        }

        return NextResponse.json({ success: true });
      }
    }

    // Always return 200 to Telegram so it doesn't retry
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Telegram Webhook Error:", error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
