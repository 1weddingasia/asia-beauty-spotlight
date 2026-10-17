/**
 * 1Booking.Asia
 * Dịch vụ tạo và gửi Email Xác Nhận Thanh Toán & Kích Hoạt Gói Thành Viên
 * Gửi tự động qua Resend API từ hi@1booking.asia
 * Tối ưu hóa để vào thẳng Hộp Thư Chính (Inbox), tuyệt đối không bị lọc Spam
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
 * Danh sách quyền lợi mặc định chuẩn cho đối tác (không ghi quá đà Top 1, giữ mực thước chuyên nghiệp)
 */
export const DEFAULT_PLAN_FEATURES = [
  'Huy hiệu Tích Xanh Đối Tác Xác Thực (Verified Partner)',
  'Ưu tiên hiển thị nổi bật trong danh mục ngành & tìm kiếm địa phương',
  'Mở khóa Đăng ảnh, Album & Bảng giá dịch vụ không giới hạn',
  'Tích hợp Hotline bấm gọi trực tiếp & Nút liên kết Zalo/Facebook',
  'Tặng kèm Chatbot AI tư vấn và chốt lịch tự động cho khách hàng 24/7',
  'Báo cáo thống kê lượt xem, cuộc gọi và tương tác khách hàng theo thời gian thực'
];

/**
 * Tạo nội dung Plain-Text để gửi kèm HTML (bắt buộc để giảm điểm SpamAssassin và vào Inbox Yahoo/Gmail)
 */
export function generatePaymentConfirmationPlainText(payload: PaymentEmailPayload): string {
  const {
    recipientName = 'Quý Đối Tác',
    businessName,
    businessSlug,
    planName = 'Gói Thành Viên Doanh Nghiệp (1 Năm)',
    amount = 500000,
    transactionCode,
    paymentDate = new Date(),
    paymentMethod = 'Quét mã QR Ngân Hàng (VietQR 24/7)',
    accountNumber = '00003554020 - TPBank',
    startsAt = new Date(),
    expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    features = DEFAULT_PLAN_FEATURES,
  } = payload;

  const storeUrl = businessSlug ? `https://1booking.asia/${businessSlug}` : 'https://1booking.asia';
  const dashboardUrl = businessSlug ? `https://1booking.asia/${businessSlug}/dashboard` : 'https://1booking.asia';

  return `
1BOOKING.ASIA - XÁC NHẬN THANH TOÁN THÀNH CÔNG

Kính gửi ${recipientName},

Hệ thống 1Booking.Asia trân trọng thông báo chúng tôi đã nhận được thanh toán của Quý khách cho gian hàng ${businessName} qua phương thức quét mã VietQR tự động. Gói thành viên của Quý khách đã được kích hoạt thành công trên toàn hệ thống!

--- CHI TIẾT BIÊN NHẬN THANH TOÁN ---
• Mã giao dịch: #${transactionCode}
• Thời gian: ${formatDateTime(paymentDate)}
• Phương thức: ${paymentMethod}
• Tài khoản nhận: ${accountNumber}
• Trạng thái: Đã xác nhận thành công
• Tổng số tiền: ${formatVND(amount)}

--- THÔNG TIN GÓI THÀNH VIÊN ---
• Gói dịch vụ: ${planName}
• Thời hạn: Từ ${formatDate(startsAt)} đến ${formatDate(expiresAt)} (12 tháng)
• Các quyền lợi đối tác đã kích hoạt:
${features.map(f => `  + ${f}`).join('\n')}

--- TRUY CẬP VÀ QUẢN LÝ ---
• Xem trang gian hàng của bạn: ${storeUrl}
• Vào bảng điều khiển quản trị shop: ${dashboardUrl}

Nếu Quý khách cần hỗ trợ thêm thông tin hoặc hỗ trợ thiết lập gian hàng, vui lòng liên hệ với chúng tôi qua email: hi@1booking.asia.

Trân trọng,
Ban Quản Trị 1Booking.Asia
Email: hi@1booking.asia
Website: https://1booking.asia
`.trim();
}

/**
 * Tạo nội dung HTML Email Xác nhận thanh toán sang trọng, chuẩn Responsive, không dùng ảnh lỗi
 */
export function generatePaymentConfirmationHtml(payload: PaymentEmailPayload): string {
  const {
    recipientName = 'Quý Đối Tác',
    businessName,
    businessSlug,
    planName = 'Gói Thành Viên Doanh Nghiệp (1 Năm)',
    amount = 500000,
    transactionCode,
    paymentDate = new Date(),
    paymentMethod = 'Quét mã VietQR Ngân Hàng (24/7)',
    accountNumber = '00003554020 - TPBank',
    startsAt = new Date(),
    expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    features = DEFAULT_PLAN_FEATURES,
  } = payload;

  const formattedAmount = formatVND(amount);
  const formattedPaymentDate = formatDateTime(paymentDate);
  const formattedStartDate = formatDate(startsAt);
  const formattedExpiryDate = formatDate(expiresAt);
  
  // Đường dẫn chính là đường dẫn trực tiếp về trang gian hàng của họ
  const storeUrl = businessSlug 
    ? `https://1booking.asia/${businessSlug}` 
    : 'https://1booking.asia';

  const dashboardUrl = businessSlug 
    ? `https://1booking.asia/${businessSlug}/dashboard` 
    : 'https://1booking.asia';

  const featureItemsHtml = features
    .map(
      (feat) => `
        <tr>
          <td style="padding: 7px 0; vertical-align: top; width: 22px;">
            <span style="display: inline-block; width: 18px; height: 18px; background-color: #D4AF37; color: #111827; border-radius: 50%; text-align: center; font-size: 11px; line-height: 18px; font-weight: bold;">✓</span>
          </td>
          <td style="padding: 7px 0 7px 8px; color: #334155; font-size: 14px; line-height: 1.5;">
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
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Xác nhận thanh toán - 1Booking.Asia</title>
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
        padding: 24px 18px !important;
      }
      .receipt-row td {
        display: block !important;
        width: 100% !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
        text-align: left !important;
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
    <table class="container" role="presentation" width="600" cellpadding="0" cellspacing="0" style="width: 600px; max-width: 600px; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06); margin: 0 auto; text-align: left; border: 1px solid #e2e8f0;">
      
      <!-- TOP GOLD ACCENT LINE -->
      <tr>
        <td style="height: 4px; background: linear-gradient(90deg, #996515 0%, #D4AF37 50%, #F3E5AB 80%, #D4AF37 100%);"></td>
      </tr>

      <!-- BRAND HEADER: SỬ DỤNG CHỮ THƯƠNG HIỆU THUẦN TÚY (FONT PLAYFAIR DISPLAY + GOLD) -->
      <!-- Tuyệt đối không dùng ảnh raster lỗi hay nền ô ca-rô checkerboard -->
      <tr>
        <td style="background-color: #0b0f19; padding: 28px 24px; text-align: center; border-bottom: 1px solid #1e293b;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center">
                <a href="https://1booking.asia" target="_blank" style="text-decoration: none; display: inline-block;">
                  <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 32px; font-weight: 800; letter-spacing: 1px; line-height: 1.2;">
                    <span style="color: #ffffff;">1Booking</span><span style="color: #D4AF37;">.Asia</span>
                  </div>
                </a>
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 3px; color: #94a3b8; text-transform: uppercase; margin-top: 6px;">
                  HỆ SINH THÁI ĐẶT LỊCH &amp; DANH BẠ SỐ CAO CẤP
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- SUCCESS STATUS BANNER (XANH NGỌC LỤC BẢO SANG TRỌNG) -->
      <tr>
        <td style="background: linear-gradient(135deg, #064e3b 0%, #065f46 100%); padding: 18px 28px; text-align: center; border-bottom: 2px solid #D4AF37;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center">
                <div style="display: inline-block; width: 26px; height: 26px; border-radius: 50%; background-color: #10b981; color: #ffffff; font-size: 15px; line-height: 26px; font-weight: bold; margin-bottom: 6px;">✓</div>
                <div style="font-size: 17px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px;">
                  Xác Nhận Đã Nhận Thanh Toán Thành Công
                </div>
                <div style="font-size: 13px; color: #a7f3d0; margin-top: 2px;">
                  Biên lai điện tử &amp; Kích hoạt gói thành viên đối tác
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- BODY CONTENT -->
      <tr>
        <td class="content-padding" style="padding: 28px 30px 24px 30px;">
          
          <!-- GREETING -->
          <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 14px 0;">
            Kính gửi <strong>${recipientName}</strong>,
          </p>
          <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 22px 0;">
            Hệ thống <strong>1Booking.Asia</strong> trân trọng thông báo chúng tôi đã nhận được thanh toán của Quý khách cho gian hàng <strong style="color: #0f172a; text-decoration: underline;">${businessName}</strong> qua phương thức quét mã VietQR tự động. Gói thành viên của Quý khách đã được kích hoạt thành công trên toàn hệ thống!
          </p>

          <!-- RECEIPT SUMMARY BOX -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 22px; overflow: hidden;">
            <tr>
              <td style="padding: 14px 18px; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0;">
                <div style="font-size: 12px; font-weight: 700; letter-spacing: 0.5px; color: #475569; text-transform: uppercase;">
                  Chi Tiết Biên Nhận Thanh Toán
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px 18px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr class="receipt-row">
                    <td style="padding: 7px 0; font-size: 14px; color: #64748b; width: 45%;">Mã giao dịch:</td>
                    <td style="padding: 7px 0; font-size: 14px; font-weight: 700; color: #0f172a; font-family: monospace;" align="right">
                      #${transactionCode}
                    </td>
                  </tr>
                  <tr class="receipt-row">
                    <td style="padding: 7px 0; font-size: 14px; color: #64748b; border-top: 1px dashed #e2e8f0;">Thời gian:</td>
                    <td style="padding: 7px 0; font-size: 14px; font-weight: 600; color: #0f172a; border-top: 1px dashed #e2e8f0;" align="right">
                      ${formattedPaymentDate}
                    </td>
                  </tr>
                  <tr class="receipt-row">
                    <td style="padding: 7px 0; font-size: 14px; color: #64748b; border-top: 1px dashed #e2e8f0;">Phương thức:</td>
                    <td style="padding: 7px 0; font-size: 14px; font-weight: 600; color: #0f172a; border-top: 1px dashed #e2e8f0;" align="right">
                      ${paymentMethod}
                    </td>
                  </tr>
                  <tr class="receipt-row">
                    <td style="padding: 7px 0; font-size: 14px; color: #64748b; border-top: 1px dashed #e2e8f0;">Tài khoản nhận:</td>
                    <td style="padding: 7px 0; font-size: 14px; font-weight: 600; color: #0f172a; border-top: 1px dashed #e2e8f0;" align="right">
                      ${accountNumber}
                    </td>
                  </tr>
                  <tr class="receipt-row">
                    <td style="padding: 7px 0; font-size: 14px; color: #64748b; border-top: 1px dashed #e2e8f0;">Trạng thái ghi nhận:</td>
                    <td style="padding: 7px 0; border-top: 1px dashed #e2e8f0;" align="right">
                      <span style="display: inline-block; background-color: #dcfce7; color: #15803d; font-size: 12px; font-weight: 700; padding: 2px 10px; border-radius: 20px; border: 1px solid #bbf7d0;">
                        ✓ Đã xác nhận thành công
                      </span>
                    </td>
                  </tr>
                  <tr class="receipt-row">
                    <td style="padding: 10px 0 2px 0; font-size: 15px; font-weight: 700; color: #0f172a; border-top: 2px solid #e2e8f0;">
                      Tổng số tiền:
                    </td>
                    <td style="padding: 10px 0 2px 0; font-size: 19px; font-weight: 800; color: #b45309; border-top: 2px solid #e2e8f0;" align="right">
                      ${formattedAmount}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- MEMBERSHIP PLAN CARD -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #fffdfa; border: 2px solid #D4AF37; border-radius: 10px; margin-bottom: 24px; overflow: hidden;">
            <tr>
              <td style="padding: 14px 18px; background: linear-gradient(90deg, #fffbeb 0%, #fef3c7 100%); border-bottom: 1px solid #fde68a;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <span style="font-size: 11px; font-weight: 800; letter-spacing: 1px; color: #92400e; text-transform: uppercase; background-color: #fef08a; padding: 2px 8px; border-radius: 4px; border: 1px solid #fcd34d;">
                        Gói Dịch Vụ Đối Tác
                      </span>
                      <div style="font-size: 17px; font-weight: 800; color: #78350f; margin-top: 5px;">
                        ${planName}
                      </div>
                    </td>
                    <td align="right" style="vertical-align: middle;">
                      <span style="display: inline-block; background-color: #15803d; color: #ffffff; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 14px;">
                        Đã kích hoạt
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 18px;">
                <!-- DATES -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 14px; background-color: #ffffff; border: 1px solid #f1f5f9; border-radius: 6px; padding: 10px;">
                  <tr>
                    <td style="padding: 2px 6px; font-size: 13px; color: #64748b;">
                      Ngày kích hoạt: <strong style="color: #0f172a;">${formattedStartDate}</strong>
                    </td>
                    <td style="padding: 2px 6px; font-size: 13px; color: #64748b;" align="right">
                      Hiệu lực đến: <strong style="color: #b45309;">${formattedExpiryDate}</strong>
                    </td>
                  </tr>
                </table>

                <!-- PRIVILEGES LIST -->
                <div style="font-size: 12.5px; font-weight: 700; letter-spacing: 0.5px; color: #0f172a; text-transform: uppercase; margin-bottom: 8px;">
                  Quyền lợi gói thành viên đã kích hoạt:
                </div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${featureItemsHtml}
                </table>
              </td>
            </tr>
          </table>

          <!-- PRIMARY CALL TO ACTION: TRUY CẬP TRỰC TIẾP TRANG GIAN HÀNG CỦA HỌ -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 22px;">
            <tr>
              <td align="center">
                <a href="${storeUrl}" target="_blank" class="btn-cta" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%); color: #0b0f19; font-size: 15px; font-weight: 800; text-decoration: none; padding: 14px 34px; border-radius: 25px; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(212, 175, 55, 0.35);">
                  Xem Trang Gian Hàng Của Bạn →
                </a>
                <div style="margin-top: 10px;">
                  <a href="${dashboardUrl}" target="_blank" style="font-size: 13px; color: #64748b; text-decoration: underline;">
                    Vào bảng điều khiển quản trị shop
                  </a>
                </div>
              </td>
            </tr>
          </table>

          <!-- SUPPORT & NOTICE -->
          <div style="background-color: #f8fafc; border-left: 3px solid #D4AF37; padding: 12px 14px; border-radius: 0 6px 6px 0; margin-bottom: 4px;">
            <p style="font-size: 13px; line-height: 1.5; color: #475569; margin: 0;">
              <strong>Hỗ trợ kỹ thuật &amp; Thiết lập gian hàng:</strong> Nếu Quý khách cần cập nhật bảng giá dịch vụ, thêm hình ảnh hay tùy biến giao diện, đội ngũ chuyên viên của 1Booking.Asia luôn sẵn sàng hỗ trợ qua email <a href="mailto:hi@1booking.asia" style="color: #b45309; font-weight: bold; text-decoration: none;">hi@1booking.asia</a>.
            </p>
          </div>

        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="background-color: #0b0f19; padding: 24px 24px; border-top: 1px solid #1e293b; color: #94a3b8; font-size: 12px; line-height: 1.6; text-align: center;">
          <div style="font-weight: 700; color: #e2e8f0; font-size: 13px; margin-bottom: 4px;">
            1BOOKING.ASIA — NỀN TẢNG ĐẶT LỊCH VÀ DANH BẠ SỐ THÔNG MINH
          </div>
          <div style="border-top: 1px solid #1e293b; padding-top: 10px; margin-top: 10px; color: #64748b; font-size: 11px;">
            Email hỗ trợ chính thức: <a href="mailto:hi@1booking.asia" style="color: #D4AF37; text-decoration: none;">hi@1booking.asia</a><br>
            Bạn nhận được email này vì đã thực hiện thanh toán trên hệ thống 1Booking.Asia.<br>
            &copy; 2026 1Booking.Asia. Mọi quyền được bảo lưu.
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

    // Dùng đúng 1Booking.Asia <hi@1booking.asia> để tránh spam filter heuristics
    const fromAddress = '1Booking.Asia <hi@1booking.asia>';
    const toAddress = payload.recipientEmail;

    if (!toAddress || !toAddress.includes('@')) {
      console.error('[sendPaymentConfirmationEmail] Invalid recipient email:', toAddress);
      return { success: false, error: 'Địa chỉ email người nhận không hợp lệ' };
    }

    // Tiêu đề ngắn gọn, tự nhiên, không dùng dấu ngoặc vuông [] hay ALL CAPS
    const subject = `Xác nhận thanh toán và kích hoạt gói thành viên - ${payload.businessName}`;
    const htmlContent = generatePaymentConfirmationHtml(payload);
    const plainTextContent = generatePaymentConfirmationPlainText(payload);

    const maskedEmail = toAddress.replace(/^(.)[^@]*(@.*)$/, '$1***$2');
    console.log(`[sendPaymentConfirmationEmail] Sending receipt to ${maskedEmail} from ${fromAddress}...`);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      signal: AbortSignal.timeout(10000),
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [toAddress],
        subject: subject,
        html: htmlContent,
        text: plainTextContent, // Multipart MIME (HTML + Text) giúp vượt qua bộ lọc Spam của Yahoo & Google
        headers: {
          'X-Entity-Ref-ID': payload.transactionCode,
        },
      }),
    });

    const data = await res.json().catch(() => ({}));

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
