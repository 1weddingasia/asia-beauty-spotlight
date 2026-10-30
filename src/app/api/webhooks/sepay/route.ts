import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { isFnBCategory, DEFAULT_PARTY_PROFILE_VALUES } from '@/types/party';

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

async function sendTelegramAlert(text: string) {
  try {
    const tokens = [
      process.env.TELEGRAM_BOT_TOKEN_1BOOKING,
      process.env.TELEGRAM_BOT_TOKEN
    ].filter((t, i, arr): t is string => Boolean(t) && arr.indexOf(t) === i);

    const chatIds = [
      process.env.TELEGRAM_CHAT_ID,
      process.env.TELEGRAM_ADMIN_CHAT_ID
    ].filter((c, i, arr): c is string => Boolean(c) && arr.indexOf(c) === i);

    if (tokens.length === 0 || chatIds.length === 0) return;

    for (const token of tokens) {
      for (const chatId of chatIds) {
        try {
          await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
          });
        } catch (subErr) {
          console.error('[SePay Webhook] Telegram send sub-error:', subErr);
        }
      }
    }
  } catch (err) {
    console.error('[SePay Webhook] Telegram dispatch error:', err);
  }
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
    let isAutoActivated = false;
    // Hỗ trợ 2 cú pháp: 
    // 1. "UPGRADE [SLUG]" hoặc "VIP [SLUG]"
    // 2. Hoặc chỉ cần chứa Số điện thoại (10 số, bắt đầu bằng số 0)
    const contentUpper = payload.content.toUpperCase();
    
    // Hỗ trợ nhận diện đơn EXPO Pass: EXPO, EXPO30, EXPO365, DONATE
    const isExpoOrder = contentUpper.includes('EXPO') || contentUpper.includes('DONATE');

    // Tìm Slug (hỗ trợ TIECVIP, UDAIVIP, UPGRADE, TIEC, UDAI, VIP, EXPO365, EXPO30, EXPO, DONATE theo sau bởi slug)
    const slugMatch = contentUpper.match(/^(?:TIECVIP|UDAIVIP|UPGRADE|TIEC|UDAI|VIP|EXPO365|EXPO30|EXPO|DONATE)[\s_]*([A-Z0-9-]+)/) 
      || contentUpper.match(/(?<![A-Z])(?:TIECVIP|UDAIVIP|UPGRADE|TIEC|UDAI|VIP|EXPO365|EXPO30|EXPO|DONATE)[\s_]*([A-Z0-9-]*[A-Z][A-Z0-9-]*)/);
    
    let targetSlug = slugMatch ? slugMatch[1].toLowerCase() : null;
    // Bỏ qua nếu token là 'biz' hoặc toàn chữ số (toàn chữ số để xử lý qua targetPhone bên dưới)
    if (targetSlug === 'biz' || (targetSlug && /^\d+$/.test(targetSlug))) {
      targetSlug = null;
    }

    // Tìm Số điện thoại
    const phoneMatch = payload.content.match(/(?:^|\D)(0(?:3|5|7|8|9)[0-9]{8})(?:\D|$)/);
    const targetPhone = phoneMatch ? phoneMatch[1] : null;

    if (targetSlug || targetPhone) {
      const minAmount = isExpoOrder ? 300000 : 500000;
      if (payload.transferAmount < minAmount) {
        console.log(`SePay webhook ignored: Transfer amount ${payload.transferAmount} is less than ${minAmount}`);
        return NextResponse.json({ success: true, message: 'Transfer amount too small for activation' });
      }

      let business: any = null;

      // 1. Tìm Business ID bằng slug hoặc phone
      if (targetSlug) {
        const { data, error } = await supabase
          .from('businesses')
          .select('id, name, slug, phone, email, owner_id, category_slug, plan_tier')
          .eq('slug', targetSlug)
          .maybeSingle();
        if (error) console.error("Error finding business by slug:", error);
        business = data;

        // Nếu chưa tìm thấy (do khách gõ không có dấu gạch ngang hoặc mã QR chuẩn hóa ký tự)
        if (!business) {
          const cleanTarget = targetSlug.replace(/[^a-z0-9]/g, '');
          const { data: allBizs } = await supabase
            .from('businesses')
            .select('id, name, slug, phone, email, owner_id, category_slug, plan_tier');
          
          if (allBizs && allBizs.length > 0) {
            business = allBizs.find((b: any) => {
              const bClean = (b.slug || '').replace(/[^a-z0-9]/g, '').toLowerCase();
              return bClean === cleanTarget;
            });
          }
        }

        // Nếu vẫn chưa tìm thấy và là đơn Expo, kiểm tra theo số booth trong business_expo_profiles
        if (!business && isExpoOrder) {
          const cleanTarget = targetSlug.replace(/[^a-z0-9]/g, '');
          const { data: expoBizs } = await supabase
            .from('business_expo_profiles')
            .select('business_id, booth_number, businesses(id, name, slug, phone, email, owner_id, category_slug, plan_tier)');
          
          if (expoBizs && expoBizs.length > 0) {
            const matchedExpo = expoBizs.find((ep: any) => {
              if (!ep.businesses || !ep.booth_number) return false;
              const booths = ep.booth_number.split(',').map((b: string) => b.replace(/[^a-z0-9]/g, '').toLowerCase());
              return booths.includes(cleanTarget);
            });
            if (matchedExpo?.businesses) {
              business = matchedExpo.businesses;
            }
          }
        }
      }
      
      if (!business && targetPhone) {
        const { data, error } = await supabase
          .from('businesses')
          .select('id, name, slug, phone, email, owner_id, category_slug, plan_tier')
          .eq('phone', targetPhone)
          .maybeSingle();
        if (error) console.error("Error finding business by phone:", error);
        business = data;
      }

      if (business) {
        // 2. Xác định gói dịch vụ tương ứng dựa trên nội dung CK và số tiền
        // Có 3 dòng sản phẩm độc lập:
        // - 1Booking Expo Pass (expo): EXPO30 / 300k (30 ngày) hoặc EXPO365 / 600k (365 ngày)
        // - Trang Đặt Tiệc (party): TIEC (500k) hoặc TIECVIP / NEON (700k)
        // - Trang Ưu Đãi (deal): UDAI (500k) hoặc UDAIVIP / VIP (1.5tr)
        const isPartyKeyword = contentUpper.includes('TIEC') || contentUpper.includes('TAT-NIEN') || contentUpper.includes('NEON');
        const isPartyOrder = !isExpoOrder && (isPartyKeyword || (isFnBCategory(business.category_slug) && !contentUpper.includes('UDAI')));

        let targetPlanCode: string;
        let isPartyPayment = false;
        let isExpoPayment = false;

        if (isExpoOrder) {
          isExpoPayment = true;
          // Gói Expo: 600k là 365 ngày (expo_pass_yearly), 300k là 30 ngày (expo_pass_event)
          if (payload.transferAmount >= 600000 || contentUpper.includes('EXPO365')) {
            targetPlanCode = 'expo_pass_yearly';
          } else {
            targetPlanCode = 'expo_pass_event';
          }
        } else if (isPartyOrder) {
          isPartyPayment = true;
          // Gói tiệc: 700k là VIP Neon, 500k là Chuẩn
          if (payload.transferAmount >= 700000 || contentUpper.includes('TIECVIP') || contentUpper.includes('NEON')) {
            targetPlanCode = 'tiec_vip';
          } else {
            targetPlanCode = 'tiec_standard';
          }
        } else {
          // Gói ưu đãi: 1.5tr là VIP Chìa Khóa Trao Tay, 500k là Chuẩn
          if (payload.transferAmount >= 1500000 || contentUpper.includes('UDAIVIP')) {
            targetPlanCode = 'udai_vip';
          } else {
            targetPlanCode = 'udai_standard';
          }
        }

        // Lấy plan từ database
        let { data: plan } = await supabase
          .from('plans')
          .select('id, code, name, plan_type, tier, features, price_yearly')
          .eq('is_active', true)
          .eq('code', targetPlanCode)
          .maybeSingle();

        // Fallback theo plan_type nếu code chưa match
        if (!plan) {
          const expectedType = isExpoPayment ? 'expo' : (isPartyOrder ? 'party' : 'deal');
          const { data: fallbackPlan } = await supabase
            .from('plans')
            .select('id, code, name, plan_type, tier, features, price_yearly')
            .eq('is_active', true)
            .eq('plan_type', expectedType)
            .order('price_yearly', { ascending: false })
            .limit(1)
            .maybeSingle();
          plan = fallbackPlan;
        }

        if (plan) {
          // 3. Tìm membership hiện tại của dòng sản phẩm này để gia hạn nối tiếp
          const { data: existingMems } = await supabase
            .from('memberships')
            .select('id, plan_id, status, starts_at, expires_at, plans!inner(plan_type)')
            .eq('business_id', business.id)
            .eq('plans.plan_type', plan.plan_type)
            .order('expires_at', { ascending: false })
            .limit(1);

          const currentMem = existingMems?.[0];
          const now = new Date();
          let baseTime = now.getTime();
          let startsAt = now;
          if (currentMem?.expires_at) {
            const curExp = new Date(currentMem.expires_at).getTime();
            if (curExp > now.getTime()) {
              baseTime = curExp; // Nối tiếp hạn dùng
              startsAt = currentMem.starts_at ? new Date(currentMem.starts_at) : now;
            }
          }
          let durationDays = 365;
          if (plan.code === 'expo_pass_event' || targetPlanCode === 'expo_pass_event') {
            durationDays = 30;
          }
          const expiresAt = new Date(baseTime + durationDays * 24 * 60 * 60 * 1000);

          let membershipId: string;
          if (currentMem) {
            const { data: updatedMem } = await supabase
              .from('memberships')
              .update({
                plan_id: plan.id,
                status: 'active',
                starts_at: startsAt.toISOString(),
                expires_at: expiresAt.toISOString(),
              })
              .eq('id', currentMem.id)
              .select('id')
              .single();
            membershipId = updatedMem?.id || currentMem.id;
          } else {
            const { data: newMem } = await supabase
              .from('memberships')
              .insert({
                business_id: business.id,
                plan_id: plan.id,
                status: 'active',
                starts_at: startsAt.toISOString(),
                expires_at: expiresAt.toISOString(),
              })
              .select('id')
              .single();
            membershipId = newMem?.id;
          }

          // 4. Nếu là gói Tiệc: Kích hoạt business_party_profiles
          // Nếu là tiec_vip (700k): Bật is_vip = true (Đèn neon phát sáng trên bản đồ)
          const isPartyVIP = plan.code === 'tiec_vip' || plan.tier === 'vip' || payload.transferAmount >= 700000;
          const isVipParty = isPartyVIP;
          if (isPartyPayment) {
            try {
              const { data: existingParty } = await supabase
                .from('business_party_profiles')
                .select('business_id, min_guests, max_guests, num_vip_rooms, price_min, price_max, party_deal_highlight, is_vip')
                .eq('business_id', business.id)
                .maybeSingle();

              await supabase.from('business_party_profiles').upsert({
                business_id: business.id,
                min_guests: existingParty?.min_guests ?? DEFAULT_PARTY_PROFILE_VALUES.min_guests,
                max_guests: existingParty?.max_guests ?? DEFAULT_PARTY_PROFILE_VALUES.max_guests,
                num_vip_rooms: existingParty?.num_vip_rooms ?? DEFAULT_PARTY_PROFILE_VALUES.num_vip_rooms,
                price_min: existingParty?.price_min ?? DEFAULT_PARTY_PROFILE_VALUES.price_min,
                price_max: existingParty?.price_max ?? DEFAULT_PARTY_PROFILE_VALUES.price_max,
                is_vip: Boolean(existingParty?.is_vip || isPartyVIP),
                is_active: true,
                party_deal_highlight: existingParty?.party_deal_highlight || (isPartyVIP ? DEFAULT_PARTY_PROFILE_VALUES.party_deal_vip_highlight : DEFAULT_PARTY_PROFILE_VALUES.party_deal_highlight),
                updated_at: new Date().toISOString(),
              }, { onConflict: 'business_id' });
              console.log(`[SePay Webhook] Activated business_party_profiles for ${business.name} (VIP Neon: ${isPartyVIP})`);
            } catch (partyErr) {
              console.error('[SePay Webhook] Error activating party profile:', partyErr);
            }
          }

          // 4.1. Nếu là gói Expo: Kích hoạt business_expo_profiles
          if (isExpoPayment) {
            try {
              const { data: existingExpo } = await supabase
                .from('business_expo_profiles')
                .select('id, business_id')
                .eq('business_id', business.id)
                .maybeSingle();

              if (existingExpo) {
                await supabase.from('business_expo_profiles')
                  .update({
                    is_active: true,
                    updated_at: new Date().toISOString()
                  })
                  .eq('business_id', business.id);
              } else {
                await supabase.from('business_expo_profiles')
                  .insert({
                    business_id: business.id,
                    event_name: '1Booking Expo Pass',
                    is_active: true,
                    access_pin: '123456',
                    languages_enabled: ['vi', 'en', 'ko', 'zh'],
                    default_language: 'vi',
                    updated_at: new Date().toISOString()
                  });
              }
              console.log(`[SePay Webhook] Activated business_expo_profiles for ${business.name}`);
            } catch (expoErr) {
              console.error('[SePay Webhook] Error activating expo profile:', expoErr);
            }
          }

          // 5. Cập nhật Business sang published và giữ nguyên VIP nếu đã VIP
          const newPlanTier = (business.plan_tier === 'vip' || plan.tier === 'vip') ? 'vip' : 'premium';
          await supabase.from('businesses')
            .update({ 
              status: 'published',
              is_featured: true, 
              plan_id: plan.id, 
              plan_tier: newPlanTier,
              updated_at: new Date().toISOString(),
            })
            .eq('id', business.id);

          // 6. Ghi nhận lịch sử thanh toán vào bảng payments
          try {
            await supabase.from('payments').insert({
              business_id: business.id,
              membership_id: membershipId,
              amount: payload.transferAmount,
              provider: 'VietQR-SePay',
              transaction_id: payload.code || `SP-${payload.id}`,
              status: 'completed',
              paid_at: now.toISOString(),
            });
          } catch (payErr) {
            console.warn('[SePay Webhook] Log payment warning:', payErr);
          }

          // 5. Cập nhật trạng thái transaction
          await supabase.from('transactions')
            .update({ processed: true, user_id: business.owner_id })
            .eq('transaction_id', payload.id.toString());

          isAutoActivated = true;
          console.log(`Successfully upgraded business ${business.name} via SePay transaction ${payload.id}`);

          // 5.1. Bắn thông báo nổ chuông Telegram cho Admin
          try {
            let planTag = 'Gian hàng Doanh nghiệp';
            if (isExpoPayment) {
              planTag = `🎪 1Booking Expo Pass (${targetPlanCode === 'expo_pass_yearly' ? 'Gói Toàn Niên 365 Ngày' : 'Gói Sự Kiện 30 Ngày'})`;
            } else if (isPartyPayment) {
              planTag = isVipParty ? '🌟 Kích hoạt VIP Neon' : '✅ Kích hoạt Phố Tiệc';
            }

            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://1booking.asia';
            const crmLink = isExpoPayment ? `${siteUrl}/expo/${business.slug}/crm` : `${siteUrl}/${business.slug}`;
            const msg = `🎉 <b>[1BOOKING.ASIA] NỔ ĐƠN KÍCH HOẠT TỰ ĐỘNG!</b>\n━━━━━━━━━━━━━━━━━━━━\n🏛️ <b>Quán / Gian hàng:</b> ${business.name}\n🔗 <b>Đường dẫn:</b> ${crmLink}\n📞 <b>SĐT:</b> ${business.phone || 'Không rõ'}\n💰 <b>Số tiền:</b> ${payload.transferAmount.toLocaleString('vi-VN')} đ\n📦 <b>Gói:</b> ${plan.name || targetPlanCode}\n✨ <b>Phân loại:</b> ${planTag}\n📝 <b>Nội dung CK:</b> ${payload.content}\n━━━━━━━━━━━━━━━━━━━━\n⏰ <b>Thời gian:</b> ${new Date().toLocaleString('vi-VN')}`;
            await sendTelegramAlert(msg);
          } catch (teleErr) {
            console.error('[SePay Webhook] Telegram alert error:', teleErr);
          }

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

    if (!isAutoActivated) {
      try {
        const unmappedAlert = `⚠️ <b>[1BOOKING.ASIA] CÓ GIAO DỊCH MỚI (CHƯA TỰ ĐỘNG MAP)</b>\n━━━━━━━━━━━━━━━━━━━━\n💰 <b>Số tiền:</b> ${payload.transferAmount.toLocaleString('vi-VN')} đ\n📝 <b>Nội dung CK:</b> ${payload.content}\n🏦 <b>Ngân hàng:</b> ${payload.gateway || 'TPBank'} (STK: ${payload.accountNumber || '00003554020'})\n🆔 <b>Mã GD:</b> ${payload.code || payload.id}\n⏰ <b>Thời gian:</b> ${new Date().toLocaleString('vi-VN')}\n━━━━━━━━━━━━━━━━━━━━\n💡 <i>Giao dịch đã được lưu an toàn vào hệ thống. Vui lòng đối soát và kích hoạt thủ công nếu cần.</i>`;
        await sendTelegramAlert(unmappedAlert);
      } catch (alertErr) {
        console.error('[SePay Webhook] Unmapped alert error:', alertErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Sepay Webhook Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
