// src/lib/views-counter.ts
/**
 * views-counter.ts
 * Bộ tiện ích tính toán và sinh lượt view / người xem trực tuyến thực tế & tự nhiên
 * cho các trang Ưu đãi, Trang Tiệc và Chi tiết Doanh nghiệp.
 */

// Hàm băm chuỗi ổn định (Deterministic Hash)
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Sinh lượt xem ổn định theo ID/Slug của quán hoặc ưu đãi
 * Số lượt xem sẽ tăng tự nhiên nhẹ theo từng ngày trong năm
 */
export function getStableViews(seedKey: string, baseMin = 1200, baseMax = 4800): number {
  if (!seedKey) return 1520;
  const hash = hashString(seedKey);
  const range = Math.max(100, baseMax - baseMin);
  const baseValue = baseMin + (hash % range);

  // Cộng thêm một lượng xem tăng dần nhẹ theo ngày trong năm để tạo cảm giác thực
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const hour = now.getHours();
  const dayFactor = (dayOfYear * 7 + hour * 2) % 350;

  return baseValue + dayFactor;
}

/**
 * Định dạng số lượt xem kiểu Việt Nam (VD: 1.480 hoặc 3,2k)
 */
export function formatViews(count: number): string {
  if (count >= 10000) {
    return (count / 1000).toFixed(1).replace('.', ',') + 'k';
  }
  return new Intl.NumberFormat('vi-VN').format(count);
}

/**
 * Sinh số người đang cùng xem trực tuyến ngay lúc này (Live Viewers)
 */
export function getLiveViewers(seedKey: string, min = 12, max = 46): number {
  if (!seedKey) return 24;
  const hash = hashString(seedKey + 'live');
  const now = new Date();
  const minuteBlock = Math.floor(now.getMinutes() / 5); // thay đổi nhẹ mỗi 5 phút
  const dynamicFactor = (hash + minuteBlock * 3) % (max - min + 1);
  return min + dynamicFactor;
}

/**
 * Sinh số lượt đã nhận ưu đãi / giữ chỗ tiệc
 */
export function getClaimedCount(seedKey: string, min = 45, max = 190): number {
  if (!seedKey) return 86;
  const hash = hashString(seedKey + 'claimed');
  return min + (hash % (max - min + 1));
}
