import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';

function resolveBotToken(reqUrl: string): string | undefined {
  const urlObj = new URL(reqUrl);
  const botType = urlObj.searchParams.get('bot');
  return botType === '1booking'
    ? (process.env.TELEGRAM_BOT_TOKEN_1BOOKING || process.env.TELEGRAM_BOT_TOKEN)
    : (process.env.TELEGRAM_BOT_TOKEN_1BEAUTY || process.env.TELEGRAM_BOT_TOKEN);
}

function escapeHtml(str: string | null | undefined): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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
• <code>EXPO: Tên Gian Hàng | Số Booth | SĐT | Tên Triển Lãm</code>: Tạo gian hàng Expo tức thì!
• <code>/status</code>: Xem tình trạng tổng thể hệ thống
• <code>/pending</code>: Xem danh sách các tiệm đang chờ duyệt
• <code>/start [slug]</code>: Liên kết thông báo đặt lịch với gian hàng
━━━━━━━━━━━━━━━━━━━━
Danh bạ Expo: <code>https://1booking.asia/expo</code>
            `.trim();

            await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ chat_id: chatId, text: helpMsg, parse_mode: 'HTML' }),
            }).catch(console.error);
          }
        }
      } else if (/^\/delete_(expo|demo)([:\s]|$)/i.test(text)) {
        const token = resolveBotToken(req.url);
        const adminId = process.env.TELEGRAM_ADMIN_CHAT_ID || process.env.TELEGRAM_CHAT_ID;

        if (token && adminId && String(chatId) === String(adminId)) {
          let slugToDelete = text.replace(/^\/delete_(expo|demo)[:\s]*/i, '').trim();
          if (!slugToDelete || text.toLowerCase().startsWith('/delete_demo')) {
            slugToDelete = 'deoproce-korea';
          }

          const supabase = await createAdminClient();
          try {
            const { data: b } = await supabase
              .from('businesses')
              .select('id, name, slug')
              .eq('slug', slugToDelete)
              .maybeSingle();

            if (!b) {
              await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: chatId,
                  text: `⚠️ Không tìm thấy gian hàng có slug: <code>${escapeHtml(slugToDelete)}</code>`,
                  parse_mode: 'HTML',
                }),
              });
              return NextResponse.json({ success: true });
            }

            await supabase.from('business_expo_leads').delete().eq('business_id', b.id);
            await supabase.from('business_expo_profiles').delete().eq('business_id', b.id);
            await supabase.from('businesses').delete().eq('id', b.id);

            await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: `🗑️ <b>ĐÃ XÓA GIAN HÀNG THÀNH CÔNG!</b>\n\n• <b>Gian hàng:</b> ${escapeHtml(b.name)} (<code>${escapeHtml(slugToDelete)}</code>)\n• Đã dọn dẹp toàn bộ dữ liệu mẫu, hệ thống sạch 100% dữ liệu thật.`,
                parse_mode: 'HTML',
              }),
            });
          } catch (delErr: any) {
            console.error('[Delete Expo Webhook Error]:', delErr);
            await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: `⚠️ Lỗi khi xóa gian hàng: ${escapeHtml(delErr?.message || String(delErr))}`,
                parse_mode: 'HTML',
              }),
            }).catch(console.error);
          }
          return NextResponse.json({ success: true });
        }
      } else if (/^\/(expo|create_expo)([:\s]|$)/i.test(text) || text.toUpperCase().startsWith('EXPO:')) {
        const token = resolveBotToken(req.url);
        const adminId = process.env.TELEGRAM_ADMIN_CHAT_ID || process.env.TELEGRAM_CHAT_ID;

        if (token && adminId && String(chatId) === String(adminId)) {
          const rawContent = text
            .replace(/^\/(expo|create_expo)[:\s]*/i, '')
            .replace(/^EXPO:\s*/i, '')
            .trim();

          if (!rawContent) {
            const guideMsg = `
💡 <b>HƯỚNG DẪN TẠO GIAN HÀNG EXPO SIÊU TỐC TRONG 3 GIÂY:</b>
━━━━━━━━━━━━━━━━━━━━
Anh chỉ cần nhắn cú pháp:
<code>EXPO: [Tên Gian Hàng] | [Số Booth] | [SĐT] | [Tên Triển Lãm]</code>

<i>Ví dụ (hỗ trợ tên tiếng Việt hoặc song ngữ Việt / Anh):</i>
<code>EXPO: Mỹ Phẩm Deoproce Korea / Deoproce Korea Cosmetics | A-12 | 0901234567 | Cosmobeauté 2026</code>
━━━━━━━━━━━━━━━━━━━━
Hệ thống sẽ tự động tạo trang đa ngôn ngữ, mã PIN CRM và link in Standee gửi lại cho anh ngay lập tức!
            `.trim();
            await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ chat_id: chatId, text: guideMsg, parse_mode: 'HTML' }),
            }).catch(console.error);
            return NextResponse.json({ success: true });
          }

          const parts = rawContent.split('|').map((s: string) => s.trim());
          let rawName = parts[0] || 'Gian Hàng Triển Lãm Mới';
          let nameVi = rawName;
          let nameEn = '';

          if (rawName.includes('/')) {
            const splitNames = rawName.split('/');
            nameVi = splitNames[0].trim();
            nameEn = splitNames[1].trim();
          } else {
            nameEn = nameVi
              .replace(/^Mỹ Phẩm\s+/i, '')
              .replace(/^Công Ty TNHH\s+/i, '')
              .replace(/^Công Ty Cổ Phần\s+/i, '')
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/đ/g, 'd')
              .replace(/Đ/g, 'D')
              .trim();
          }

          const name = nameVi;
          const booth = parts[1] || 'A-01';
          const phone = parts[2] || '0900000000';
          const eventName = parts[3] || 'Triển Lãm Quốc Tế';

          const baseSlug = name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || `expo-${Date.now().toString().slice(-4)}`;

          const pin = Math.floor(100000 + Math.random() * 900000).toString();
          const supabase = await createAdminClient();

          try {
            const { data: existingBiz } = await supabase
              .from('businesses')
              .select('id, slug, name')
              .eq('slug', baseSlug)
              .maybeSingle();

            let businessId: string;
            let finalSlug = baseSlug;

            if (existingBiz) {
              businessId = existingBiz.id;
              finalSlug = existingBiz.slug;
            } else {
              const { data: newBiz, error: bizErr } = await supabase
                .from('businesses')
                .insert({
                  name,
                  slug: finalSlug,
                  phone,
                  status: 'published',
                  is_featured: true,
                  category_slug: 'expo',
                  page_content: { 
                    name_vi: nameVi,
                    name_en: nameEn,
                    event_name: eventName, 
                    booth_number: booth 
                  },
                })
                .select('id, slug')
                .single();

              if (bizErr || !newBiz) throw new Error(bizErr?.message || 'Lỗi tạo gian hàng');
              businessId = newBiz.id;
              finalSlug = newBiz.slug;
            }

            const { error: profileErr } = await supabase
              .from('business_expo_profiles')
              .upsert({
                business_id: businessId,
                event_name: eventName,
                booth_number: booth,
                access_pin: pin,
                company_name_vi: nameVi,
                company_name_en: nameEn,
                is_active: true,
                updated_at: new Date().toISOString(),
              }, { onConflict: 'business_id' });

            if (profileErr) throw new Error(profileErr.message);

            const boothUrl = `https://1booking.asia/expo/${finalSlug}`;
            const crmUrl = `https://1booking.asia/expo/${finalSlug}/crm`;
            const qrUrl = `https://1booking.asia/expo/${finalSlug}/qr`;

            const successMsg = `
🎉 <b>ĐÃ TẠO GIAN HÀNG EXPO THÀNH CÔNG TRONG 3 GIÂY!</b>
━━━━━━━━━━━━━━━━━━━━
🏢 <b>Gian hàng:</b> ${name}
📍 <b>Vị trí Booth:</b> ${booth}
🎪 <b>Sự kiện:</b> ${eventName}
🔑 <b>Mã PIN Quản Trị CRM:</b> <code>${pin}</code>
━━━━━━━━━━━━━━━━━━━━
🔗 <b>1. Link Khách Quét (4 Ngôn Ngữ):</b>
${boothUrl}

📊 <b>2. Link Web CRM Trực Tiếp:</b>
${crmUrl}

🖨️ <b>3. Link In Standee QR Để Bàn:</b>
${qrUrl}
━━━━━━━━━━━━━━━━━━━━
👉 Anh có thể mở máy của chủ gian hàng, truy cập link CRM và nhập mã PIN <code>${pin}</code> là chốt deal thu tiền ngay tại chỗ!
            `.trim();

            const replyKeyboard = {
              inline_keyboard: [
                [
                  { text: '👁️ Trang Quét Thử', url: boothUrl },
                  { text: '📊 Vào CRM Live', url: crmUrl },
                ],
                [
                  { text: '🖨️ Mở In Standee QR', url: qrUrl },
                ],
              ],
            };

            await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: successMsg,
                parse_mode: 'HTML',
                reply_markup: replyKeyboard,
              }),
            });
          } catch (err: any) {
            console.error('[Telegram Webhook Create Expo Error]:', err);
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
