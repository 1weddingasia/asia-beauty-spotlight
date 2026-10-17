import { NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/utils/supabase/server';
import { sendPaymentConfirmationEmail } from '@/lib/payment-email';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    let isAuthorized = false;

    // Check 1: Bearer Service Role Key
    if (authHeader && secretKey && authHeader.replace('Bearer ', '').trim() === secretKey.trim()) {
      isAuthorized = true;
    }

    // Check 2: Admin User Session
    if (!isAuthorized) {
      const authClient = await createClient();
      const { data: { user } } = await authClient.auth.getUser();
      if (user && user.user_metadata?.role === 'admin') {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized: Admin permission required' }, { status: 401 });
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Body JSON không hợp lệ' }, { status: 400 });
    }

    const {
      recipientEmail,
      recipientName,
      businessId,
      businessSlug,
      planName,
      amount,
      transactionCode,
      paymentMethod,
      features,
    } = body;

    if (!recipientEmail) {
      return NextResponse.json({ error: 'Thiếu email người nhận (recipientEmail)' }, { status: 400 });
    }

    let finalBusinessName = body.businessName || 'Doanh Nghiệp Đối Tác';
    let finalBusinessSlug = businessSlug || '';

    if (businessId || businessSlug) {
      const supabase = await createAdminClient();
      const query = supabase.from('businesses').select('name, slug, email, plan_tier');
      if (businessId) query.eq('id', businessId);
      else if (businessSlug) query.eq('slug', businessSlug);

      const { data: b } = await query.maybeSingle();
      if (b) {
        finalBusinessName = b.name;
        finalBusinessSlug = b.slug;
      }
    }

    const result = await sendPaymentConfirmationEmail({
      recipientEmail,
      recipientName: recipientName || finalBusinessName,
      businessName: finalBusinessName,
      businessSlug: finalBusinessSlug,
      planName: planName || 'Gói Thành Viên Doanh Nghiệp VIP (1 Năm)',
      planTier: body.planTier || 'premium',
      amount: typeof amount === 'number' ? amount : 500000,
      transactionCode: transactionCode || `TXN-${Date.now().toString().slice(-8)}`,
      paymentDate: new Date(),
      paymentMethod: paymentMethod || 'Quét mã VietQR Ngân Hàng (24/7)',
      accountNumber: '00003554020 - TPBank',
      startsAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      features: Array.isArray(features) && features.length > 0 ? features : undefined,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Gửi email thất bại' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      message: `Đã gửi biên lai xác nhận thanh toán thành công tới ${recipientEmail}`,
    });
  } catch (err: any) {
    console.error('Error in send-payment-receipt API:', err);
    return NextResponse.json({ error: err.message || 'Lỗi xử lý yêu cầu' }, { status: 500 });
  }
}
