/**
 * Helper chuẩn hóa và phân giải liên hệ Zalo kết nối dữ liệu database thật
 * Đảm bảo liên kết chính xác từ cột `businesses.zalo`, `page_content.zalo`, `businesses.phone`
 */

export interface ZaloContactInfo {
  hasZalo: boolean;
  rawZalo: string;
  venueZaloUrl: string;
  venueZaloDisplay: string;
  supportZaloUrl: string;
  supportZaloDisplay: string;
}

export const SUPPORT_ZALO_PHONE = '0918731411';
export const SUPPORT_ZALO_DISPLAY = '0918.731.411';
export const SUPPORT_ZALO_URL = `https://zalo.me/${SUPPORT_ZALO_PHONE}`;

/**
 * Định dạng số điện thoại đẹp dạng 09xx.xxx.xxx, chuẩn hóa mã vùng 84
 */
export function formatPhoneNumber(phone: string): string {
  let clean = phone.replace(/\D/g, '');
  if (clean.startsWith('0084')) {
    clean = '0' + clean.slice(4);
  } else if (clean.startsWith('84') && clean.length >= 11) {
    clean = '0' + clean.slice(2);
  }

  if (clean.length === 10) {
    return `${clean.slice(0, 4)}.${clean.slice(4, 7)}.${clean.slice(7)}`;
  }
  if (clean.length === 11) {
    return `${clean.slice(0, 5)}.${clean.slice(5, 8)}.${clean.slice(8)}`;
  }
  return clean || phone;
}

/**
 * Phân giải liên kết Zalo từ thông tin đối tượng Business hoặc Venue
 */
export function resolveZaloContact(entity?: {
  zalo?: string | null;
  phone?: string | null;
  page_content?: any;
}): ZaloContactInfo {
  if (!entity) {
    return {
      hasZalo: false,
      rawZalo: '',
      venueZaloUrl: SUPPORT_ZALO_URL,
      venueZaloDisplay: SUPPORT_ZALO_DISPLAY,
      supportZaloUrl: SUPPORT_ZALO_URL,
      supportZaloDisplay: SUPPORT_ZALO_DISPLAY,
    };
  }

  let pContent: any = {};
  if (typeof entity.page_content === 'string') {
    try {
      pContent = JSON.parse(entity.page_content);
    } catch {
      pContent = {};
    }
  } else if (entity.page_content && typeof entity.page_content === 'object') {
    pContent = entity.page_content;
  }

  // Ưu tiên:
  // 1. entity.zalo (cột zalo trong bảng businesses)
  // 2. entity.page_content.zalo (nếu lưu trong JSONB)
  // 3. entity.phone (cột phone)
  // 4. entity.page_content.phone
  const rawZalo = (
    entity.zalo ||
    pContent.zalo ||
    entity.phone ||
    pContent.phone ||
    ''
  ).toString().trim();

  if (!rawZalo) {
    return {
      hasZalo: false,
      rawZalo: '',
      venueZaloUrl: SUPPORT_ZALO_URL,
      venueZaloDisplay: SUPPORT_ZALO_DISPLAY,
      supportZaloUrl: SUPPORT_ZALO_URL,
      supportZaloDisplay: SUPPORT_ZALO_DISPLAY,
    };
  }

  let venueZaloUrl = '';
  let venueZaloDisplay = '';

  if (rawZalo.startsWith('http://') || rawZalo.startsWith('https://')) {
    venueZaloUrl = rawZalo;
    venueZaloDisplay = 'Zalo OA / Kênh Zalo';
  } else if (rawZalo.startsWith('zalo.me/')) {
    venueZaloUrl = `https://${rawZalo}`;
    const rest = rawZalo.replace('zalo.me/', '');
    venueZaloDisplay = formatPhoneNumber(rest);
  } else {
    let cleanDigits = rawZalo.replace(/\D/g, '');
    if (cleanDigits.startsWith('0084')) {
      cleanDigits = '0' + cleanDigits.slice(4);
    } else if (cleanDigits.startsWith('84') && cleanDigits.length >= 11) {
      cleanDigits = '0' + cleanDigits.slice(2);
    }

    if (cleanDigits) {
      venueZaloUrl = `https://zalo.me/${cleanDigits}`;
      venueZaloDisplay = formatPhoneNumber(cleanDigits);
    } else {
      venueZaloUrl = SUPPORT_ZALO_URL;
      venueZaloDisplay = SUPPORT_ZALO_DISPLAY;
    }
  }

  return {
    hasZalo: true,
    rawZalo,
    venueZaloUrl,
    venueZaloDisplay,
    supportZaloUrl: SUPPORT_ZALO_URL,
    supportZaloDisplay: SUPPORT_ZALO_DISPLAY,
  };
}
