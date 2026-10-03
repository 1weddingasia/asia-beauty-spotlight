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
    const secret = process.env.SEPAY_WEBHOOK_SECRET;

    if (!secret || !signature) {
      console.error("Missing SePay secret or signature");
      return NextResponse.json({ success: false, error: 'Missing signature' }, { status: 401 });
    }

    // Xác thực HMAC-SHA256 theo chuẩn SePay
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (
      signature.length !== expectedSignature.length || 
      !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
    ) {
      console.error("Invalid SePay Signature");
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 });
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

      let business = null;

      // 1. Tìm Business ID bằng slug hoặc phone
      if (targetSlug) {
        const { data, error } = await supabase
          .from('businesses')
          .select('id, name')
          .eq('slug', targetSlug)
          .maybeSingle();
        if (error) console.error("Error finding business by slug:", error);
        business = data;
      }
      
      if (!business && targetPhone) {
        const { data, error } = await supabase
          .from('businesses')
          .select('id, name')
          .eq('phone', targetPhone)
          .maybeSingle();
        if (error) console.error("Error finding business by phone:", error);
        business = data;
      }

      if (business) {
        // 2. Lấy ID của gói VIP (ví dụ gói có tên 'VIP' hoặc gói có giá > 0 đầu tiên)
        const { data: plan } = await supabase
          .from('plans')
          .select('id')
          .eq('is_active', true)
          .ilike('name', '%Premium%')
          .limit(1)
          .single();

        if (plan) {
          // 3. Tạo membership mới (1 năm)
          const expiresAt = new Date();
          expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 năm

          await supabase.from('memberships').insert({
            business_id: business.id,
            plan_id: plan.id,
            status: 'active',
            starts_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString(),
          });

          // 4. Update Business hiển thị "is_featured" và cập nhật plan_id, plan_tier
          await supabase.from('businesses')
            .update({ is_featured: true, plan_id: plan.id, plan_tier: 'premium' })
            .eq('id', business.id);

          console.log(`Successfully upgraded business ${business.name} to VIP via SePay transaction ${payload.id}`);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Sepay Webhook Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
