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

    if (secret && signature) {
      // Xác thực HMAC-SHA256 theo chuẩn SePay
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error("Invalid SePay Signature");
        return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 });
      }
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

    // [TƯƠNG LAI]: Xử lý logic cấp phát membership gói nếu `payload.content` chứa cú pháp "UPGRADE {USER_ID}"
    // VD: parse content tìm keyword và tự động update users hoặc plans.

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Sepay Webhook Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
