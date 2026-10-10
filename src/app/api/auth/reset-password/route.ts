import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const { email, redirectTo } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Thiếu email' }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // 1. Generate recovery link using Supabase Admin
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: redirectTo || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://1booking.asia'}/dashboard`,
      }
    });

    if (linkError) {
      console.error("Generate recovery link error:", linkError);
      return NextResponse.json({ error: 'Không thể tạo link khôi phục mật khẩu.' }, { status: 400 });
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
        <h2 style="color: #333;">Yêu cầu Đặt lại mật khẩu</h2>
        <p>Xin chào,</p>
        <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản liên kết với email <strong>${email}</strong>.</p>
        <p>Vui lòng click vào nút bên dưới để tiến hành đặt lại mật khẩu của bạn:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${actionLink}" style="background-color: #d4af37; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Đặt Lại Mật Khẩu</a>
        </div>
        <p style="font-size: 14px; color: #666;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
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
        to: [email],
        subject: 'Khôi phục mật khẩu tài khoản của bạn',
        html: htmlContent
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Resend API error:", errorText);
      return NextResponse.json({ error: 'Lỗi khi gửi email.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Đã gửi email khôi phục.' });
  } catch (error: any) {
    console.error("Reset Password API Error:", error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
