/**
 * site-config.ts — Cấu hình đa thương hiệu (Multi-domain Config-driven)
 *
 * Mỗi khi muốn thêm domain mới hoặc thay đổi nội dung thương hiệu,
 * chỉ cần chỉnh sửa file này. KHÔNG cần động vào bất kỳ trang con nào.
 */

// ── Hằng số dùng chung ───────────────────────────────────────────────────────
export const CONTACT_ZALO = "https://zalo.me/0918731411";
export const CONTACT_PHONE = "0918.731.411";
export const CONTACT_EMAIL = "partner@1booking.asia";
export const PRICING_AMOUNT = "500K";

// ── Type định nghĩa ──────────────────────────────────────────────────────────
export type SiteConfig = {
  brand: string;
  domain: string;
  logoText: string;
  logoDomain: string;
  logoImageUrl: string;    // Đường dẫn ảnh logo (/images/...); trống = dùng text fallback
  ogImageUrl: string;      // Đường dẫn ảnh OpenGraph chia sẻ MXH (/images/...)
  description: string;
  exploreTitle: string;
  exploreSubtitle: string;
  exploreHeroTag: string;
  exploreHeroBgImage?: string;
  industryFilter: string[] | null;
  poweredBy: string;
  metaTitleSuffix: string;
};

// ── Cấu hình từng domain ──────────────────────────────────────────────────────

const BEAUTY_CONFIG: SiteConfig = {
  brand: "1Beauty.Asia",
  domain: "1beauty.asia",
  logoText: "1Beauty",
  logoDomain: ".Asia",
  logoImageUrl: "", // dùng text fallback; thêm path khi có file logo
  ogImageUrl: "/images/og-1beauty.png",
  description:
    "Danh bạ chuyên ngành làm đẹp, kết nối khách hàng với các spa, thẩm mỹ viện, salon và học viện uy tín trên khắp Việt Nam.",
  exploreTitle: "Khám Phá Ưu Đãi Làm Đẹp",
  exploreSubtitle:
    "Hàng trăm chương trình ưu đãi, giảm giá sốc từ các Spa & Thẩm mỹ viện uy tín trên 1Beauty.Asia.",
  exploreHeroTag: "Săn Deal Làm Đẹp",
  exploreHeroBgImage: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1920&q=80",
  industryFilter: ["beauty", "spa", "salon", "nail", "tham-my", "lam-dep", "studio", "health"],
  poweredBy: "1Beauty.Asia",
  metaTitleSuffix: "1Beauty.Asia",
};

const BOOKING_CONFIG: SiteConfig = {
  brand: "1Booking.Asia",
  domain: "1booking.asia",
  logoText: "1Booking",
  logoDomain: ".Asia",
  logoImageUrl: "", // dùng text fallback
  ogImageUrl: "/images/og-1booking.png",
  description:
    "Nền tảng đặt hẹn đa ngành, kết nối khách hàng với các cơ sở dịch vụ uy tín trên khắp Việt Nam.",
  exploreTitle: "Kho Ưu Đãi Độc Quyền Hơn 12+ Ngành Dịch Vụ",
  exploreSubtitle:
    "Săn hàng ngàn voucher giảm đến 50% từ 500+ thương hiệu uy tín: Làm đẹp, Ẩm thực, Thể thao, Nha khoa, Chăm sóc xe, Du lịch và Đời sống.",
  exploreHeroTag: "Săn Deal Đa Ngành Toàn Quốc",
  exploreHeroBgImage: "/images/hero-multisector-deals.jpg",
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
