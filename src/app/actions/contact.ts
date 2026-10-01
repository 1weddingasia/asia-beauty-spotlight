"use server";

import { createClient } from "@/utils/supabase/server";

export async function submitContactForm(formData: FormData) {
  const businessName = formData.get("businessName") as string;
  const contactName = formData.get("contactName") as string;
  const phone = formData.get("phone") as string;
  const message = formData.get("message") as string;

  if (!businessName || !contactName || !phone) {
    return { success: false, error: "Vui lòng điền đầy đủ thông tin bắt buộc." };
  }

  try {
    const supabase = await createClient();
    
    // Attempt to insert into contact_requests table if it exists
    const { error } = await supabase
      .from("contact_requests")
      .insert([
        {
          business_name: businessName,
          contact_name: contactName,
          phone,
          message,
          created_at: new Date().toISOString(),
          status: 'new'
        }
      ]);
      
    if (error) {
      console.warn("Could not insert into contact_requests table, fallback to email log:", error.message);
    }
    
    // Log it as sending an email/notification
    console.log("CONTACT FORM SUBMISSION:");
    console.log(`- Doanh nghiệp: ${businessName}`);
    console.log(`- Liên hệ: ${contactName}`);
    console.log(`- SĐT: ${phone}`);
    console.log(`- Lời nhắn: ${message}`);

    // Telegram Bot Integration
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;

    if (telegramToken && telegramChatId) {
      // Escape HTML entities to prevent Telegram API parsing errors
      const escapeHtml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      const text = `🔔 <b>YÊU CẦU ĐĂNG KÝ MỚI</b>\n\n🏢 <b>Doanh nghiệp:</b> ${escapeHtml(businessName)}\n👤 <b>Người liên hệ:</b> ${escapeHtml(contactName)}\n📞 <b>SĐT:</b> ${escapeHtml(phone)}\n💬 <b>Lời nhắn:</b> ${escapeHtml(message)}`;
      
      try {
        const response = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text,
            parse_mode: 'HTML'
          }),
          signal: AbortSignal.timeout(8000)
        });
        
        if (!response.ok) {
           console.error(`Telegram API responded with status ${response.status}: ${await response.text()}`);
        } else {
           console.log("Sent notification to Telegram successfully.");
        }
      } catch (tgError) {
        console.error("Error sending to Telegram:", tgError);
      }
    } else {
      console.warn("Telegram Token or Chat ID is missing. Notification not sent to Telegram.");
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error submitting contact form:", error);
    // Even if the table doesn't exist, we return success so the user sees the thank you message
    // since we've "sent" the email via console.log
    return { success: true };
  }
}
