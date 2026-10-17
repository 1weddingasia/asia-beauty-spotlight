import { NextResponse } from 'next/server';
import crypto from 'crypto';

// SePay webhook payload
interface SepayPayload {
  id: number;
  gateway: string;
  transactionDate: string;
  accountNumber: string;
  subAccount?: string;
  code?: string;
  content: string;
  transferType: string;
  transferAmount: number;
  accumulated: number;
  channel?: string;
  referenceCode?: string;
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-sepay-signature');
    const timestamp = request.headers.get('x-sepay-timestamp') || '';
    const authHeader = request.headers.get('authorization');
    const secret = process.env.SEPAY_WEBHOOK_SECRET?.replace(/['"]/g, '').trim();

    if (!secret) {
      console.error("Missing SEPAY_WEBHOOK_SECRET in environment");
      return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 });
    }

    let isAuthenticated = false;

    if (authHeader) {
      // Token might come as "Bearer <secret>", "Apikey <secret>", or just "<secret>"
      const tokenParts = authHeader.split(' ');
      const tokenValue = (tokenParts.length > 1 ? tokenParts[tokenParts.length - 1] : authHeader).trim();
      
      const tokenBuf = Buffer.from(tokenValue);
      const secretBuf = Buffer.from(secret);
      
      if (tokenBuf.length === secretBuf.length && crypto.timingSafeEqual(tokenBuf, secretBuf)) {
        isAuthenticated = true;
      }
    }
    // Cách 2: Xác thực bằng HMAC-SHA256 Signature (Nếu SePay có hỗ trợ gửi x-sepay-signature)
    if (!isAuthenticated && signature) {
      const expectedSignature = 'sha256=' + crypto
        .createHmac('sha256', secret)
        .update(timestamp + '.' + rawBody)
        .digest('hex');
      
      const sigBuf = Buffer.from(signature);
      const expectedSigBuf = Buffer.from(expectedSignature);

      if (sigBuf.length === expectedSigBuf.length && crypto.timingSafeEqual(sigBuf, expectedSigBuf)) {
        isAuthenticated = true;
      }
    }

    if (!isAuthenticated) {
      console.error("Invalid SePay Token or Signature. HasAuthHeader:", !!authHeader, "HasSignature:", !!signature);
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized', 
        debug: {
          authHeaderReceived: !!authHeader,
          signatureReceived: !!signature
        }
      }, { status: 401 });
    }

    const payload: SepayPayload = JSON.parse(rawBody);
    
    // Create supabase client with SERVICE ROLE to bypass RLS since this is a webhook
    const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Save transaction to database
    const { error } = await supabase.from('transactions').insert({
      transaction_id: payload.id.toString(),
      gateway: payload.gateway,
      transaction_date: payload.transactionDate, // ISO 8601 string recommended
      account_number: payload.accountNumber,
      code: payload.code || null,
      content: payload.content,
      transfer_type: payload.transferType,
      transfer_amount: payload.transferAmount,
      accumulated: payload.accumulated,
      reference_number: payload.referenceCode || null,
    });

    if (error) {
      if (error.code === '23505') { // unique_violation
        return NextResponse.json({ success: true, message: 'Giao dịch đã tồn tại' });
      }
      console.error("Sepay Insert Error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Xử lý logic cấp phát membership gói VIP
    // Hỗ trợ 2 cú pháp: 
    // 1. "UPGRADE [SLUG]" hoặc "VIP [SLUG]"
    // 2. Hoặc chỉ cần chứa Số điện thoại (10 số, bắt đầu bằng số 0)
    const contentUpper = payload.content.toUpperCase();
    
    // Tìm Slug
    const slugMatch = contentUpper.match(/(?:UPGRADE|VIP)\s+([A-Z0-9-]+)/);
    const targetSlug = slugMatch ? slugMatch[1].toLowerCase() : null;

    // Tìm Số điện thoại
    const phoneMatch = payload.content.match(/(?:^|\D)(0(?:3|5|7|8|9)[0-9]{8})(?:\D|$)/);
    const targetPhone = phoneMatch ? phoneMatch[1] : null;

    if (targetSlug || targetPhone) {
      if (payload.transferAmount < 500000) {
        console.log(`SePay webhook ignored: Transfer amount ${payload.transferAmount} is less than 500000`);
        return NextResponse.json({ success: true, message: 'Transfer amount too small for upgrade' });
      }

      let business: any = null;

      // 1. Tìm Business ID bằng slug hoặc phone
      if (targetSlug) {
        const { data, error } = await supabase
          .from('businesses')
          .select('id, name, slug, phone, email, owner_id')
          .eq('slug', targetSlug)
          .maybeSingle();
        if (error) console.error("Error finding business by slug:", error);
        business = data;
      }
      
      if (!business && targetPhone) {
        const { data, error } = await supabase
          .from('businesses')
          .select('id, name, slug, phone, email, owner_id')
          .eq('phone', targetPhone)
          .maybeSingle();
        if (error) console.error("Error finding business by phone:", error);
        business = data;
      }

      if (business) {
        // 2. Lấy thông tin của gói VIP (ví dụ gói có tên 'VIP' hoặc 'Premium')
        const { data: plan } = await supabase
          .from('plans')
          .select('id, name, features, price_yearly')
          .eq('is_active', true)
          .ilike('name', '%Premium%')
          .limit(1)
          .single();

        if (plan) {
          // 3. Tạo membership mới (1 năm)
          const startsAt = new Date();
          const expiresAt = new Date();
          expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 năm

          await supabase.from('memberships').insert({
            business_id: business.id,
            plan_id: plan.id,
            status: 'active',
            starts_at: startsAt.toISOString(),
            expires_at: expiresAt.toISOString(),
          });

          // 4. Update Business hiển thị "is_featured" và cập nhật plan_id, plan_tier
          await supabase.from('businesses')
            .update({ is_featured: true, plan_id: plan.id, plan_tier: 'premium' })
            .eq('id', business.id);

          // 5. Cập nhật trạng thái transaction
          await supabase.from('transactions')
            .update({ processed: true, user_id: business.owner_id })
            .eq('transaction_id', payload.id.toString());

          console.log(`Successfully upgraded business ${business.name} to VIP via SePay transaction ${payload.id}`);

          // 6. Gửi email xác nhận thanh toán & kích hoạt gói thành viên qua Resend (hi@1booking.asia)
          try {
            let targetRecipientEmail = business.email;
            if (!targetRecipientEmail && business.owner_id) {
              const { data: ownerUser } = await supabase.auth.admin.getUserById(business.owner_id);
              if (ownerUser?.user?.email) {
                targetRecipientEmail = ownerUser.user.email;
              }
            }

            if (targetRecipientEmail) {
              const { sendPaymentConfirmationEmail } = await import('@/lib/payment-email');
              const emailResult = await sendPaymentConfirmationEmail({
                recipientEmail: targetRecipientEmail,
                recipientName: business.name || 'Quý Đối Tác',
                businessName: business.name || 'Gian hàng đối tác',
                businessSlug: business.slug,
                planName: plan.name || 'Gói Thành Viên Doanh Nghiệp VIP (1 Năm)',
                planTier: 'premium',
                amount: payload.transferAmount,
                transactionCode: payload.code || `SP-${payload.id}`,
                paymentDate: payload.transactionDate ? new Date(payload.transactionDate) : new Date(),
                paymentMethod: 'Quét mã VietQR Ngân Hàng (24/7)',
                accountNumber: payload.accountNumber ? `${payload.accountNumber} (${payload.gateway || 'TPBank'})` : '00003554020 - TPBank',
                startsAt: startsAt,
                expiresAt: expiresAt,
                features: Array.isArray(plan.features) && plan.features.length > 0 
                  ? plan.features 
                  : undefined,
              });
              console.log(`[SePay Webhook] Payment confirmation email dispatched to ${targetRecipientEmail}:`, emailResult);
            } else {
              console.warn(`[SePay Webhook] Business ${business.name} (id: ${business.id}) has no email or owner email found. Skipping email dispatch.`);
            }
          } catch (emailErr) {
            console.error('[SePay Webhook] Error sending payment confirmation email:', emailErr);
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Sepay Webhook Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
