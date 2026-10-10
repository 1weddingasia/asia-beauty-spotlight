import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const { currentEmail, newEmail, redirectTo } = await req.json();

    if (!currentEmail || !newEmail) {
      return NextResponse.json({ error: 'Thiếu thông tin email' }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // 1. Generate email change links
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'email_change_new', // We send the link to the new email to verify it
      email: currentEmail,
      newEmail: newEmail,
      options: {
        redirectTo: redirectTo || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://1booking.asia'}/dashboard`,
      }
    });

    if (linkError) {
      console.error("Generate email change link error:", linkError);
      return NextResponse.json({ error: 'Không thể tạo link thay đổi email.' }, { status: 400 });
    }

    const actionLink = linkData.properties?.action_link;
    if (!actionLink) {
      return NextResponse.json({ error: 'Lỗi tạo link.' }, { status: 500 });
    }

    // 2. Send email via Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return NextResponse.json({ error: 'Hệ thống chưa cấu hình gửi email.' }, { status: 500 });
    }

    const htmlContent = `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
        <h2 style="color: #333;">Xác nhận địa chỉ Email mới</h2>
        <p>Xin chào,</p>
        <p>Tài khoản của bạn đang yêu cầu đổi sang email này (<strong>${newEmail}</strong>).</p>
        <p>Vui lòng click vào nút bên dưới để xác nhận đây là email chính xác của bạn:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${actionLink}" style="background-color: #d4af37; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Xác Nhận Email</a>
        </div>
        <p style="font-size: 14px; color: #666;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999;">Trân trọng,<br>Đội ngũ 1Booking.Asia & 1Beauty.Asia</p>
      </div>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: '1Booking.Asia - 1Beauty.Asia <hi@1booking.asia>',
        to: [newEmail],
        subject: 'Xác nhận thay đổi email tài khoản',
        html: htmlContent
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Resend API error:", errorText);
      return NextResponse.json({ error: 'Lỗi khi gửi email.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Đã gửi email xác nhận đến địa chỉ mới.' });
  } catch (error: any) {
    console.error("Change Email API Error:", error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
