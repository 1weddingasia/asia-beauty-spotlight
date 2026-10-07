/**
 * site-config.ts — Cấu hình đa thương hiệu (Multi-domain Config-driven)
 *
 * Mỗi khi muốn thêm domain mới hoặc thay đổi nội dung thương hiệu,
 * chỉ cần chỉnh sửa file này. KHÔNG cần động vào bất kỳ trang con nào.
 */

// ── Hằng số dùng chung ───────────────────────────────────────────────────────
export const CONTACT_ZALO = "https://zalo.me/0918731411";

// ── Type định nghĩa ──────────────────────────────────────────────────────────
export type SiteConfig = {
  brand: string;           // Tên thương hiệu đầy đủ, VD: "1Beauty.Asia"
  domain: string;          // Domain chính, VD: "1beauty.asia"
  logoText: string;        // Phần đầu text logo, VD: "1Beauty"
  logoDomain: string;      // Phần sau text logo, VD: ".Asia"
  description: string;     // Mô tả ngắn cho footer
  exploreTitle: string;    // Tiêu đề trang khám phá ưu đãi (h1)
  exploreSubtitle: string; // Mô tả trang khám phá
  exploreHeroTag: string;  // Tag nhỏ phía trên hero
  industryFilter: string[] | null; // null = hiển thị tất cả; mảng = lọc theo ngành
  poweredBy: string;       // Text "Vận hành bởi X" ở footer tiệm
  metaTitleSuffix: string; // Suffix cho thẻ <title>
};

// ── Cấu hình từng domain ──────────────────────────────────────────────────────

const BEAUTY_CONFIG: SiteConfig = {
  brand: "1Beauty.Asia",
  domain: "1beauty.asia",
  logoText: "1Beauty",
  logoDomain: ".Asia",
  description:
    "Danh bạ chuyên ngành làm đẹp, kết nối khách hàng với các spa, thẩm mỹ viện, salon và học viện uy tín trên khắp Việt Nam.",
  exploreTitle: "Khám Phá Ưu Đãi Làm Đẹp",
  exploreSubtitle:
    "Hàng trăm chương trình ưu đãi, giảm giá sốc từ các Spa & Thẩm mỹ viện uy tín trên 1Beauty.Asia.",
  exploreHeroTag: "Săn Deal Làm Đẹp",
  industryFilter: ["spa", "salon", "nail", "tham-my", "lam-dep"],
  poweredBy: "1Beauty.Asia",
  metaTitleSuffix: "1Beauty.Asia",
};

const BOOKING_CONFIG: SiteConfig = {
  brand: "1Booking.Asia",
  domain: "1booking.asia",
  logoText: "1Booking",
  logoDomain: ".Asia",
  description:
    "Nền tảng đặt hẹn đa ngành, kết nối khách hàng với các cơ sở dịch vụ uy tín trên khắp Việt Nam.",
  exploreTitle: "Khám Phá Dịch Vụ Đặt Lịch",
  exploreSubtitle:
    "Hàng trăm dịch vụ đa ngành đang chờ bạn — từ làm đẹp, y tế, tư vấn đến giải trí.",
  exploreHeroTag: "Khám Phá Dịch Vụ",
  industryFilter: null, // null = hiển thị TẤT CẢ ngành
  poweredBy: "1Booking.Asia",
  metaTitleSuffix: "1Booking.Asia",
};

// ── Helper chính ──────────────────────────────────────────────────────────────

/**
 * Trả về SiteConfig tương ứng với hostname.
 * Hàm này thuần (pure), đồng bộ — an toàn để gọi ở cả Server và Client.
 *
 * @example
 * // Server Component
 * import { headers } from 'next/headers';
 * const config = getSiteConfig((await headers()).get('host') || '');
 *
 * // Client Component / Hook
 * const config = getSiteConfig(window.location.hostname);
 */
export function getSiteConfig(host: string): SiteConfig {
  const hostname = (host || "").split(":")[0].toLowerCase();

  if (hostname === "1beauty.asia" || hostname.endsWith(".1beauty.asia")) {
    return BEAUTY_CONFIG;
  }

  // Mặc định: 1booking.asia, localhost, preview URLs, v.v.
  return BOOKING_CONFIG;
}
