/**
 * TELEGRAM REMOTE AGENT & INTERACTION DAEMON
 * Dành riêng cho Admin 1Booking / 1Beauty
 * 
 * Chức năng:
 * 1. Nhận lệnh code từ xa: /code <yêu cầu> -> chạy Antigravity CLI (agy.exe) tự động code, test, commit và báo cáo kết quả.
 * 2. Xử lý nút bấm Inline Keyboard tức thì:
 *    - [✅ Duyệt & Bật Public] -> Kích hoạt published trong DB Supabase
 *    - [🔄 Nhờ AI Viết Lại] -> Gọi DeepSeek viết lại slogan
 *    - [⛔ Tạm Ngưng] -> Chuyển suspended
 * 3. Báo cáo tình trạng: /status, /pending, /help
 */

import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';
import { exec } from 'node:child_process';
import util from 'node:util';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const execPromise = util.promisify(exec);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN_1BOOKING || process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = String(process.env.TELEGRAM_ADMIN_CHAT_ID || '584207194');
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const AGY_PATH = 'C:\\Users\\Dell\\AppData\\Local\\agy\\bin\\agy.exe';

if (!BOT_TOKEN) {
  console.error('❌ Thiếu TELEGRAM_BOT_TOKEN');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Gửi tin nhắn Telegram
async function sendTelegram(chatId, text, replyMarkup = null) {
  const body = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    disable_web_page_preview: false,
  };
  if (replyMarkup) body.reply_markup = replyMarkup;

  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch (err) {
    console.error('[Telegram Send Error]:', err.message);
  }
}

// Trả lời Callback Query
async function answerCallbackQuery(callbackQueryId, text = '') {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
    });
  } catch (err) {
    console.error('[Answer Callback Error]:', err.message);
  }
}

// Xử lý nút bấm Inline Keyboard
async function handleCallbackQuery(cb) {
  const callbackId = cb.id;
  const data = cb.data || '';
  const chatId = String(cb.message?.chat?.id || '');

  console.log(`[Telegram Daemon] Nhận callback: ${data} từ chat: ${chatId}`);

  // Kiểm tra quyền Admin
  if (chatId !== ADMIN_CHAT_ID) {
    await answerCallbackQuery(callbackId, '⛔ Bạn không có quyền quản trị.');
    return;
  }

  const [action, businessId] = data.split(':');
  if (!action || !businessId) {
    await answerCallbackQuery(callbackId, 'Lệnh không hợp lệ');
    return;
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, slug, status, category_slug, page_content')
    .eq('id', businessId)
    .single();

  if (!business) {
    await answerCallbackQuery(callbackId, 'Không tìm thấy gian hàng này trong DB');
    await sendTelegram(chatId, '❌ <b>Không tìm thấy thông tin cơ sở này</b> (có thể đã bị xóa hoặc chưa lưu vào CSDL).');
    return;
  }

  const isParty = business.category_slug === 'nha-hang-am-thuc' || business.category_slug === 'dining' || business.category_slug === 'tiec-cuoi';
  const publicUrl = isParty ? `https://1booking.asia/${business.slug}/tiec` : `https://1booking.asia/${business.slug}`;

  if (action === 'pub') {
    // Duyệt & Bật Public
    await supabase
      .from('businesses')
      .update({ status: 'published', is_featured: true, updated_at: new Date().toISOString() })
      .eq('id', business.id);

    await supabase
      .from('onboarding_submissions')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('business_id', business.id);

    await answerCallbackQuery(callbackId, '✅ Đã duyệt công khai!');
    await sendTelegram(
      chatId,
      `✅ <b>ĐÃ DUYỆT CÔNG KHAI THÀNH CÔNG!</b>\n\n` +
      `🏛️ Gian hàng: <b>${business.name}</b>\n` +
      `🟢 Trạng thái mới: <code>published</code> (Đang hiển thị công khai)\n` +
      `🔗 Link xem trực tiếp: <a href="${publicUrl}">${publicUrl}</a>`
    );
    return;
  }

  if (action === 'sus') {
    await supabase
      .from('businesses')
      .update({ status: 'suspended', updated_at: new Date().toISOString() })
      .eq('id', business.id);

    await answerCallbackQuery(callbackId, '⛔ Đã tạm ngưng');
    await sendTelegram(chatId, `⛔ <b>Đã tạm ngưng gian hàng:</b> "${business.name}"`);
    return;
  }

  if (action === 'ai') {
    await answerCallbackQuery(callbackId, '🤖 AI đang viết lại...');
    await sendTelegram(chatId, `⏳ <i>Đang gọi DeepSeek AI viết lại slogan & mô tả cho "${business.name}"...</i>`);

    try {
      const openai = new OpenAI({ baseURL: 'https://api.deepseek.com/v1', apiKey: DEEPSEEK_API_KEY });
      const prompt = `Viết lại câu Slogan (dưới 14 từ) và Đoạn giới thiệu (2 câu) cho cơ sở "${business.name}". Phong cách sang trọng, cuốn hút. Trả về JSON: {"tagline": "...", "description": "..."}`;
      const res = await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.85,
        max_tokens: 300,
      });

      const raw = res.choices?.[0]?.message?.content?.trim() || '{}';
      const clean = raw.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
      const parsed = JSON.parse(clean);

      const updatedPageContent = {
        ...(business.page_content || {}),
        tagline: parsed.tagline || business.page_content?.tagline,
        description: parsed.description || business.page_content?.description,
      };

      await supabase.from('businesses').update({ page_content: updatedPageContent, updated_at: new Date().toISOString() }).eq('id', business.id);

      await sendTelegram(
        chatId,
        `✨ <b>AI ĐÃ CẬP NHẬT NỘI DUNG MỚI CHO "${business.name}":</b>\n\n` +
        `• <b>Slogan:</b> "${parsed.tagline}"\n` +
        `• <b>Mô tả:</b> "${parsed.description}"\n\n` +
        `🔗 Link xem thử: <a href="${publicUrl}">${publicUrl}</a>`
      );
    } catch (err) {
      await sendTelegram(chatId, `⚠️ Lỗi xử lý AI: ${err.message}`);
    }
  }
}

// Xử lý tin nhắn văn bản từ Admin
async function handleMessage(msg) {
  const chatId = String(msg.chat.id);
  const text = (msg.text || '').trim();

  // Kiểm tra quyền Admin
  if (chatId !== ADMIN_CHAT_ID) {
    await sendTelegram(chatId, '⛔ Bạn không có quyền truy cập hệ thống điều khiển này.');
    return;
  }

  // 1. Trợ giúp /help
  if (text === '/start' || text === '/help') {
    const helpMsg = `
🤖 <b>TRUNG TÂM ĐIỀU KHIỂN & GIAO VIỆC TỪ XA (1BOOKING / 1BEAUTY)</b>
━━━━━━━━━━━━━━━━━━━━
<b>1. Giao Việc Lập Trình Cho AI Agent:</b>
• <code>/code &lt;nhiệm vụ&gt;</code> hoặc <code>/task &lt;nhiệm vụ&gt;</code>: Ra lệnh cho AI Agent tự động đọc mã nguồn, sửa code, test và commit lên Git!
<i>Ví dụ:</i> <code>/code Sửa màu nút xem thử trên trang tiệc sang màu vàng gold</code>

<b>2. Quản Trị Gian Hàng & Duyệt Nhanh:</b>
• <code>/pending</code>: Xem danh sách các tiệm đang chờ duyệt kèm nút bấm Duyệt ngay.
• <code>/status</code>: Báo cáo số lượng gian hàng, commit Git mới nhất.

<b>3. Tạo Trang Tức Thì:</b>
• <code>/create &lt;tên tiệm&gt;</code>: Tạo nhanh một gian hàng mẫu.
━━━━━━━━━━━━━━━━━━━━
👉 Anh có thể gõ lệnh trực tiếp tại đây!
`.trim();
    await sendTelegram(chatId, helpMsg);
    return;
  }

  // 2. Báo cáo tình trạng /status
  if (text === '/status') {
    const [{ count: totalBiz }, { count: draftBiz }, { count: pubBiz }] = await Promise.all([
      supabase.from('businesses').select('*', { count: 'exact', head: true }),
      supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
      supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    ]);

    let gitInfo = 'N/A';
    try {
      const { stdout } = await execPromise('git log -1 --oneline');
      gitInfo = stdout.trim();
    } catch (e) {}

    const statusMsg = `
📊 <b>BÁO CÁO HỆ THỐNG HIỆN TẠI</b>
━━━━━━━━━━━━━━━━━━━━
🏛️ <b>Tổng số gian hàng:</b> ${totalBiz || 0}
🟢 <b>Đang công khai (Public):</b> ${pubBiz || 0}
🟡 <b>Đang chờ duyệt (Draft):</b> ${draftBiz || 0}
📌 <b>Git commit mới nhất:</b> <code>${gitInfo}</code>
🤖 <b>Antigravity CLI (agy):</b> Sẵn sàng nhận việc qua <code>/code</code>
━━━━━━━━━━━━━━━━━━━━
Gõ <code>/pending</code> để duyệt các tiệm đang chờ.
`.trim();
    await sendTelegram(chatId, statusMsg);
    return;
  }

  // 3. Danh sách chờ duyệt /pending
  if (text === '/pending') {
    const { data: pendings } = await supabase
      .from('businesses')
      .select('id, name, slug, category_slug, created_at')
      .eq('status', 'draft')
      .order('created_at', { ascending: false })
      .limit(6);

    if (!pendings || pendings.length === 0) {
      await sendTelegram(chatId, '✅ <b>Hiện tại không có gian hàng nào đang chờ duyệt!</b> Tất cả đã được xuất bản công khai.');
      return;
    }

    await sendTelegram(chatId, `🔔 <b>CÓ ${pendings.length} GIAN HÀNG ĐANG CHỜ DUYỆT:</b>`);
    for (const p of pendings) {
      const isParty = p.category_slug === 'nha-hang-am-thuc' || p.category_slug === 'dining' || p.category_slug === 'tiec-cuoi';
      const demoUrl = isParty ? `https://1booking.asia/${p.slug}/tiec` : `https://1booking.asia/${p.slug}`;
      const pMsg = `🏛️ <b>${p.name}</b>\n🔗 Link: <code>/${p.slug}${isParty ? '/tiec' : ''}</code>`;
      const keyboard = {
        inline_keyboard: [
          [
            { text: '👁️ Xem Demo', url: demoUrl },
            { text: '✅ Duyệt & Bật Public', callback_data: `pub:${p.id}` },
          ],
        ],
      };
      await sendTelegram(chatId, pMsg, keyboard);
    }
    return;
  }

  // 4. Giao việc code từ xa qua /code hoặc /task
  if (text.startsWith('/code ') || text.startsWith('/task ')) {
    const taskContent = text.replace(/^\/(code|task)\s+/, '').trim();
    if (!taskContent) {
      await sendTelegram(chatId, '⚠️ Vui lòng ghi rõ yêu cầu lập trình sau lệnh <code>/code</code>.');
      return;
    }

    await sendTelegram(
      chatId,
      `👨‍💻 <b>ĐÃ NHẬN NHIỆM VỤ LẬP TRÌNH TỪ BẠN!</b>\n\n` +
      `📝 <b>Yêu cầu:</b> <i>"${taskContent}"</i>\n\n` +
      `⚡ <i>AI Agent đang tiến hành đọc mã nguồn và thực hiện qua Antigravity CLI... Vui lòng đợi trong giây lát, tôi sẽ gửi báo cáo chi tiết ngay khi hoàn tất!</i>`
    );

    try {
      // Thực thi qua Antigravity CLI agy.exe
      const cmd = `"${AGY_PATH}" --prompt "${taskContent.replace(/"/g, '\\"')}"`;
      const { stdout, stderr } = await execPromise(cmd, {
        cwd: process.cwd(),
        timeout: 10 * 60 * 1000, // 10 phút
      });

      const fullOutput = (stdout || stderr || 'Nhiệm vụ đã được thực thi thành công.').trim();
      const summary = fullOutput.length > 3000 ? fullOutput.slice(-3000) : fullOutput;

      await sendTelegram(
        chatId,
        `✅ <b>AI AGENT ĐÃ HOÀN TẤT NHIỆM VỤ!</b>\n\n` +
        `📝 <b>Yêu cầu:</b> <i>${taskContent}</i>\n\n` +
        `<b>Báo cáo kết quả:</b>\n<pre>${summary}</pre>\n\n` +
        `<i>Bạn có thể gõ /status để kiểm tra commit mới nhất!</i>`
      );
    } catch (err) {
      console.error('[AI Code Error]:', err);
      await sendTelegram(
        chatId,
        `❌ <b>Quá trình thực thi code gặp sự cố:</b>\n\n` +
        `<pre>${err.message}</pre>`
      );
    }
    return;
  }

  // Phản hồi mặc định
  await sendTelegram(chatId, `❓ Lệnh không hợp lệ. Gõ <code>/help</code> để xem hướng dẫn sử dụng bot.`);
}

// Long Polling lặp liên tục để nhận update từ Telegram
async function startLongPolling() {
  console.log('========================================================');
  console.log('🤖 TELEGRAM REMOTE BOT DAEMON ĐANG KHỞI CHẠY...');
  console.log('• Admin Chat ID:', ADMIN_CHAT_ID);
  console.log('• Bot Token:', BOT_TOKEN.slice(0, 10) + '...');
  console.log('========================================================');

  // Xóa webhook cũ nếu có để chuyển sang chế độ Long-Polling tức thì
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook?drop_pending_updates=false`);
    console.log('✅ Đã kích hoạt chế độ Polling trực tiếp từ Telegram!');
  } catch (e) {
    console.warn('⚠️ Lỗi xóa webhook:', e.message);
  }

  let offset = 0;

  while (true) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${offset}&timeout=20`);
      const data = await res.json();

      if (data.ok && Array.isArray(data.result) && data.result.length > 0) {
        for (const update of data.result) {
          offset = update.update_id + 1;

          // Xử lý nút bấm Inline Keyboard
          if (update.callback_query) {
            await handleCallbackQuery(update.callback_query);
          }

          // Xử lý tin nhắn văn bản
          if (update.message && update.message.text) {
            await handleMessage(update.message);
          }
        }
      }
    } catch (err) {
      console.error('[Polling Loop Error]:', err.message);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

startLongPolling();
