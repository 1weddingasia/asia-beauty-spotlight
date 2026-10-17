/**
 * 1Booking.Asia & 1Beauty.Asia
 * Dịch vụ tạo và gửi Email Xác Nhận Thanh Toán & Kích Hoạt Gói Thành Viên
 * Gửi tự động qua Resend API từ hi@1booking.asia
 */

export interface PaymentEmailPayload {
  recipientEmail: string;
  recipientName?: string;
  businessName: string;
  businessSlug?: string;
  planName: string;
  planTier?: string;
  amount: number;
  transactionCode: string;
  paymentDate?: string | Date;
  paymentMethod?: string;
  accountNumber?: string;
  startsAt?: string | Date;
  expiresAt?: string | Date;
  features?: string[];
}

/**
 * Định dạng tiền tệ VNĐ
 */
function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Định dạng ngày giờ chuẩn Việt Nam (DD/MM/YYYY HH:mm)
 */
function formatDateTime(dateInput?: string | Date): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) return new Date().toLocaleString('vi-VN');
  
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Định dạng ngày (DD/MM/YYYY)
 */
function formatDate(dateInput?: string | Date): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) return new Date().toLocaleDateString('vi-VN');
  
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/**
 * Tạo nội dung HTML Email Xác nhận thanh toán sang trọng, chuẩn Responsive
 */
export function generatePaymentConfirmationHtml(payload: PaymentEmailPayload): string {
  const {
    recipientName = 'Quý Đối Tác',
    businessName,
    businessSlug,
    planName = 'Gói Thành Viên Doanh Nghiệp VIP (1 Năm)',
    amount = 500000,
    transactionCode,
    paymentDate = new Date(),
    paymentMethod = 'Quét mã QR Ngân Hàng (VietQR 24/7)',
    accountNumber = '00003554020 - TPBank',
    startsAt = new Date(),
    expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    features = [
      'Huy hiệu Tích Xanh Đối Tác Xác Thực (Verified Partner)',
      'Ưu tiên Top 1 hiển thị danh mục ngành & địa phương',
      'Mở khóa Đăng ảnh, Album & Bảng giá dịch vụ không giới hạn',
      'Tích hợp Hotline bấm gọi trực tiếp & Nút liên kết Zalo/Facebook',
      'Tặng kèm Chatbot AI tư vấn và chốt lịch tự động cho khách hàng 24/7',
      'Báo cáo thống kê lượt xem, cuộc gọi và tương tác khách hàng theo thời gian thực'
    ],
  } = payload;

  const formattedAmount = formatVND(amount);
  const formattedPaymentDate = formatDateTime(paymentDate);
  const formattedStartDate = formatDate(startsAt);
  const formattedExpiryDate = formatDate(expiresAt);
  
  const dashboardUrl = businessSlug 
    ? `https://1booking.asia/${businessSlug}/dashboard` 
    : 'https://1booking.asia';
  const publicStoreUrl = businessSlug 
    ? `https://1booking.asia/${businessSlug}` 
    : 'https://1booking.asia';

  const featureItemsHtml = features
    .map(
      (feat) => `
        <tr>
          <td style="padding: 6px 0; vertical-align: top; width: 24px;">
            <span style="display: inline-block; width: 18px; height: 18px; background-color: #D4AF37; color: #111827; border-radius: 50%; text-align: center; font-size: 11px; line-height: 18px; font-weight: bold;">✓</span>
          </td>
          <td style="padding: 6px 0 6px 8px; color: #334155; font-size: 14px; line-height: 1.5;">
            ${feat}
          </td>
        </tr>
      `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Biên lai xác nhận thanh toán - 1Booking.Asia</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      color: #0f172a;
    }
    table {
      border-collapse: collapse;
    }
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
        border-radius: 0 !important;
      }
      .content-padding {
        padding: 20px 16px !important;
      }
      .receipt-row td {
        display: block !important;
        width: 100% !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
      }
      .btn-cta {
        display: block !important;
        width: 100% !important;
        box-sizing: border-box;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f1f5f9;">
  <center>
    <!-- MAIN CONTAINER -->
    <table class="container" role="presentation" width="600" cellpadding="0" cellspacing="0" style="width: 600px; max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04); margin: 0 auto; text-align: left;">
      
      <!-- TOP GOLD ACCENT LINE -->
      <tr>
        <td style="height: 5px; background: linear-gradient(90deg, #996515 0%, #D4AF37 50%, #F3E5AB 80%, #D4AF37 100%);"></td>
      </tr>

      <!-- BRAND HEADER (DARK SLATE & GOLD) -->
      <tr>
        <td style="background-color: #0b0f19; padding: 32px 32px 28px 32px; text-align: center; border-bottom: 1px solid #1e293b;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center">
                <a href="https://1booking.asia" target="_blank" style="text-decoration: none; display: inline-block;">
                  <img src="https://1booking.asia/images/logo-1booking.png" alt="1Booking.Asia" width="180" style="max-width: 180px; height: auto; display: block; margin: 0 auto 12px auto;" onerror="this.style.display='none'" />
                  <div style="font-size: 22px; font-weight: 800; letter-spacing: 2px; color: #D4AF37; text-transform: uppercase; font-family: 'Playfair Display', Georgia, serif;">
                    1BOOKING<span style="color: #ffffff;">.ASIA</span>
                  </div>
                </a>
                <div style="font-size: 11px; letter-spacing: 3px; color: #94a3b8; text-transform: uppercase; margin-top: 6px; font-weight: 500;">
                  PREMIUM DIRECTORY &amp; SMART BOOKING ECOSYSTEM
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- SUCCESS STATUS BANNER -->
      <tr>
        <td style="background: linear-gradient(135deg, #064e3b 0%, #065f46 100%); padding: 20px 32px; text-align: center; border-bottom: 2px solid #D4AF37;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center">
                <span style="display: inline-block; background-color: #10b981; color: #ffffff; width: 28px; height: 28px; border-radius: 50%; font-size: 16px; line-height: 28px; font-weight: bold; margin-bottom: 8px;">✓</span>
                <div style="font-size: 18px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px; text-transform: uppercase;">
                  XÁC NHẬN ĐÃ NHẬN THANH TOÁN THÀNH CÔNG
                </div>
                <div style="font-size: 13px; color: #a7f3d0; margin-top: 4px;">
                  Biên lai điện tử &amp; Kích hoạt gói thành viên đối tác
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- BODY CONTENT -->
      <tr>
        <td class="content-padding" style="padding: 32px 32px 24px 32px;">
          
          <!-- GREETING -->
          <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
            Kính gửi <strong>${recipientName}</strong>,
          </p>
          <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 24px 0;">
            Hệ thống <strong>1Booking.Asia &amp; 1Beauty.Asia</strong> trân trọng thông báo chúng tôi đã nhận được thanh toán của Quý khách cho gian hàng <strong style="color: #0f172a; text-decoration: underline;">${businessName}</strong> qua phương thức quét mã QR tự động. Gói thành viên của Quý khách đã được kích hoạt thành công trên toàn hệ thống!
          </p>

          <!-- RECEIPT SUMMARY BOX -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px; overflow: hidden;">
            <tr>
              <td style="padding: 16px 20px; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0;">
                <div style="font-size: 12px; font-weight: 700; letter-spacing: 1px; color: #64748b; text-transform: uppercase;">
                  CHI TIẾT BIÊN NHẬN THANH TOÁN (RECEIPT)
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px 20px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr class="receipt-row">
                    <td style="padding: 8px 0; font-size: 14px; color: #64748b; width: 45%;">Mã giao dịch:</td>
                    <td style="padding: 8px 0; font-size: 14px; font-weight: 700; color: #0f172a; font-family: monospace;" align="right">
                      #${transactionCode}
                    </td>
                  </tr>
                  <tr class="receipt-row">
                    <td style="padding: 8px 0; font-size: 14px; color: #64748b; border-top: 1px dashed #e2e8f0;">Thời gian giao dịch:</td>
                    <td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: #0f172a; border-top: 1px dashed #e2e8f0;" align="right">
                      ${formattedPaymentDate}
                    </td>
                  </tr>
                  <tr class="receipt-row">
                    <td style="padding: 8px 0; font-size: 14px; color: #64748b; border-top: 1px dashed #e2e8f0;">Phương thức:</td>
                    <td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: #0f172a; border-top: 1px dashed #e2e8f0;" align="right">
                      ${paymentMethod}
                    </td>
                  </tr>
                  <tr class="receipt-row">
                    <td style="padding: 8px 0; font-size: 14px; color: #64748b; border-top: 1px dashed #e2e8f0;">Tài khoản nhận:</td>
                    <td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: #0f172a; border-top: 1px dashed #e2e8f0;" align="right">
                      ${accountNumber}
                    </td>
                  </tr>
                  <tr class="receipt-row">
                    <td style="padding: 8px 0; font-size: 14px; color: #64748b; border-top: 1px dashed #e2e8f0;">Trạng thái ghi nhận:</td>
                    <td style="padding: 8px 0; border-top: 1px dashed #e2e8f0;" align="right">
                      <span style="display: inline-block; background-color: #dcfce7; color: #15803d; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 20px; border: 1px solid #bbf7d0;">
                        ● ĐÃ XÁC NHẬN 100%
                      </span>
                    </td>
                  </tr>
                  <tr class="receipt-row">
                    <td style="padding: 12px 0 4px 0; font-size: 15px; font-weight: 700; color: #0f172a; border-top: 2px solid #e2e8f0;">
                      Tổng số tiền:
                    </td>
                    <td style="padding: 12px 0 4px 0; font-size: 20px; font-weight: 800; color: #b45309; border-top: 2px solid #e2e8f0;" align="right">
                      ${formattedAmount}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- MEMBERSHIP PLAN CARD -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #fffdfa; border: 2px solid #D4AF37; border-radius: 12px; margin-bottom: 28px; overflow: hidden; box-shadow: 0 4px 12px rgba(212, 175, 55, 0.1);">
            <tr>
              <td style="padding: 16px 20px; background: linear-gradient(90deg, #fffbeb 0%, #fef3c7 100%); border-bottom: 1px solid #fde68a;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <span style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: #92400e; text-transform: uppercase; background-color: #fef08a; padding: 2px 8px; border-radius: 4px; border: 1px solid #fcd34d;">
                        GÓI DỊCH VỤ ĐỐI TÁC
                      </span>
                      <div style="font-size: 18px; font-weight: 800; color: #78350f; margin-top: 6px;">
                        ${planName}
                      </div>
                    </td>
                    <td align="right" style="vertical-align: middle;">
                      <span style="display: inline-block; background-color: #15803d; color: #ffffff; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px;">
                        KÍCH HOẠT
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px;">
                <!-- DATES -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px; background-color: #ffffff; border: 1px solid #f1f5f9; border-radius: 8px; padding: 12px;">
                  <tr>
                    <td style="padding: 4px 8px; font-size: 13px; color: #64748b;">
                      Ngày kích hoạt: <strong style="color: #0f172a;">${formattedStartDate}</strong>
                    </td>
                    <td style="padding: 4px 8px; font-size: 13px; color: #64748b;" align="right">
                      Hiệu lực đến: <strong style="color: #b45309;">${formattedExpiryDate}</strong>
                    </td>
                  </tr>
                </table>

                <!-- PRIVILEGES LIST -->
                <div style="font-size: 13px; font-weight: 700; letter-spacing: 0.5px; color: #0f172a; text-transform: uppercase; margin-bottom: 10px;">
                  ĐẶC QUYỀN ĐỐI TÁC ĐÃ ĐƯỢC MỞ KHÓA:
                </div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${featureItemsHtml}
                </table>
              </td>
            </tr>
          </table>

          <!-- CALL TO ACTION BUTTON -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
            <tr>
              <td align="center">
                <a href="${dashboardUrl}" target="_blank" class="btn-cta" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%); color: #0b0f19; font-size: 15px; font-weight: 800; text-decoration: none; padding: 15px 36px; border-radius: 30px; letter-spacing: 0.5px; text-transform: uppercase; box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4);">
                  TRUY CẬP TRANG QUẢN TRỊ SHOP →
                </a>
                <div style="margin-top: 12px;">
                  <a href="${publicStoreUrl}" target="_blank" style="font-size: 13px; color: #64748b; text-decoration: underline;">
                    Xem trang gian hàng trên sàn 1Booking.Asia
                  </a>
                </div>
              </td>
            </tr>
          </table>

          <!-- SUPPORT & NOTICE -->
          <div style="background-color: #f8fafc; border-left: 3px solid #D4AF37; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 8px;">
            <p style="font-size: 13px; line-height: 1.5; color: #475569; margin: 0;">
              <strong>Hỗ trợ kỹ thuật &amp; Thiết lập gian hàng:</strong> Nếu Quý khách cần cập nhật bảng giá dịch vụ, thêm chi nhánh hoặc tùy biến giao diện, vui lòng liên hệ trực tiếp với chúng tôi qua email <a href="mailto:hi@1booking.asia" style="color: #b45309; font-weight: bold; text-decoration: none;">hi@1booking.asia</a> để được chuyên viên hỗ trợ ưu tiên 24/7.
            </p>
          </div>

        </td>
      </tr>

      <!-- FOOTER (DARK & PRESTIGIOUS) -->
      <tr>
        <td style="background-color: #0b0f19; padding: 28px 32px; border-top: 1px solid #1e293b; color: #94a3b8; font-size: 12px; line-height: 1.6; text-align: center;">
          <div style="font-weight: 700; color: #e2e8f0; font-size: 13px; margin-bottom: 6px;">
            1BOOKING.ASIA — NỀN TẢNG KẾT NỐI VÀ ĐẶT LỊCH THÔNG MINH
          </div>
          <div style="color: #64748b; margin-bottom: 12px;">
            Hệ sinh thái liên kết: 1Booking.Asia &bull; 1Beauty.Asia
          </div>
          <div style="border-top: 1px solid #1e293b; padding-top: 12px; margin-top: 12px; color: #64748b; font-size: 11px;">
            Email liên hệ chính thức: <a href="mailto:hi@1booking.asia" style="color: #D4AF37; text-decoration: none;">hi@1booking.asia</a><br>
            Bạn nhận được email này vì đã thực hiện giao dịch thanh toán trên nền tảng 1Booking.Asia.<br>
            &copy; 2026 1Booking.Asia. All rights reserved.
          </div>
        </td>
      </tr>

    </table>
  </center>
</body>
</html>
  `.trim();
}

/**
 * Gửi email xác nhận thanh toán qua Resend API
 */
export async function sendPaymentConfirmationEmail(payload: PaymentEmailPayload): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.error('[sendPaymentConfirmationEmail] Missing RESEND_API_KEY in environment');
      return { success: false, error: 'Chưa cấu hình RESEND_API_KEY' };
    }

    const fromAddress = process.env.RESEND_FROM || '1Booking.Asia - 1Beauty.Asia <hi@1booking.asia>';
    const toAddress = payload.recipientEmail;

    if (!toAddress || !toAddress.includes('@')) {
      console.error('[sendPaymentConfirmationEmail] Invalid recipient email:', toAddress);
      return { success: false, error: 'Địa chỉ email người nhận không hợp lệ' };
    }

    const subject = `[Xác nhận thanh toán] Kích hoạt thành công ${payload.planName} - ${payload.businessName}`;
    const htmlContent = generatePaymentConfirmationHtml(payload);

    console.log(`[sendPaymentConfirmationEmail] Sending receipt to ${toAddress} from ${fromAddress}...`);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [toAddress],
        subject: subject,
        html: htmlContent,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('[sendPaymentConfirmationEmail] Resend API error response:', data);
      return {
        success: false,
        error: data.message || `Resend error status ${res.status}`,
      };
    }

    console.log('[sendPaymentConfirmationEmail] Successfully sent email! Resend ID:', data.id);
    return {
      success: true,
      messageId: data.id,
    };
  } catch (err: any) {
    console.error('[sendPaymentConfirmationEmail] Unexpected exception:', err);
    return {
      success: false,
      error: err.message || 'Lỗi ngoại lệ khi gửi email',
    };
  }
}
