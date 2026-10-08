import { NextResponse } from 'next/server';

function sendTelegramAsync(chatId: string, message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) return Promise.resolve();

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message })
  }).catch(err => console.error("Telegram error:", err));
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID || process.env.TELEGRAM_CHAT_ID;
    
    if (chatId) {
      await sendTelegramAsync(chatId, message);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Demo Telegram API Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
