import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return NextResponse.json({ error: 'Hệ thống chưa cấu hình gửi email.' }, { status: 500 });
    }

    const safeEmail = escapeHtml(user.email);
    const fromStr = process.env.RESEND_FROM || '1Booking.Asia - 1Beauty.Asia <hi@1booking.asia>';
    const changeTime = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
        <h2 style="color: #2b8a3e; margin-bottom: 8px;">Thông báo Bảo mật: Mật khẩu đã được thay đổi</h2>
        <p>Xin chào <strong>${safeEmail}</strong>,</p>
        <p>Mật khẩu đăng nhập của tài khoản bạn tại hệ thống <strong>1Booking.Asia / 1Beauty.Asia</strong> vừa được cập nhật thành công vào lúc:</p>
        <p style="background-color: #f8f9fa; padding: 10px 14px; border-radius: 6px; font-weight: 600; color: #333; display: inline-block;">
          🕒 ${changeTime} (Giờ Việt Nam)
        </p>
        <p style="color: #555; margin-top: 16px;">
          Nếu chính bạn là người thực hiện thay đổi này, bạn có thể yên tâm bỏ qua email này.
        </p>
        <div style="margin-top: 24px; padding: 14px; background-color: #fff3bf; border-left: 4px solid #f59f00; border-radius: 4px;">
          <p style="margin: 0; font-size: 13px; color: #856404;">
            ⚠️ <strong>Cảnh báo bảo mật:</strong> Nếu bạn KHÔNG thực hiện thay đổi mật khẩu này, hãy liên hệ ngay với chúng tôi qua email <a href="mailto:hi@1booking.asia" style="color: #d9480f; font-weight: bold;">hi@1booking.asia</a> hoặc sử dụng tính năng "Quên mật khẩu" để bảo vệ tài khoản ngay lập tức.
          </p>
        </div>
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 24px 0;" />
        <p style="font-size: 12px; color: #999;">
          Email này được gửi tự động từ hệ thống bảo mật 1Booking.Asia & 1Beauty.Asia.
        </p>
      </div>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromStr,
        to: [user.email],
        subject: '[1Booking.Asia] Thông báo bảo mật: Mật khẩu tài khoản đã được thay đổi',
        html: htmlContent
      })
    });

    if (!res.ok) {
      console.error("Resend API error:", await res.text());
      return NextResponse.json({ error: 'Lỗi khi gửi email.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Đã gửi thông báo bảo mật qua email.' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Notify password changed error:", msg);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
