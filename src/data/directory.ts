/**
 * directory.ts — Static data dùng cho các component UI
 *
 * CHÚ Ý: File này chỉ chứa dữ liệu TĨNH (heroSlides).
 * Tất cả dữ liệu doanh nghiệp, danh mục, địa điểm đều lấy từ Supabase DB.
 * Mock data cũ đã được xóa (biz-1..6 không còn dùng nữa).
 */

import _hero1 from "@/assets/hero-1.jpg";
const hero1 = _hero1.src;
import _hero2 from "@/assets/hero-2.jpg";
const hero2 = _hero2.src;
import _hero3 from "@/assets/hero-3.jpg";
const hero3 = _hero3.src;

export const heroSlides = [
  {
    image: hero1,
    kicker: "1Beauty.Asia — Danh bạ làm đẹp cao cấp",
    title: "Nơi hội tụ tinh hoa ngành làm đẹp Việt Nam",
    description:
      "Khám phá hàng trăm spa, thẩm mỹ viện, salon và học viện uy tín, được tuyển chọn kỹ lưỡng.",
    cta: "Khám phá danh bạ",
  },
  {
    image: hero2,
    kicker: "Salon & Hair Studio",
    title: "Chọn đúng chuyên gia cho phong cách của bạn",
    description:
      "So sánh dịch vụ, bảng giá và ưu đãi từ những thương hiệu hàng đầu chỉ trong vài giây.",
    cta: "Xem doanh nghiệp nổi bật",
  },
  {
    image: hero3,
    kicker: "Clinic & Skincare",
    title: "Chuẩn mực mới cho trải nghiệm làm đẹp",
    description:
      "Thông tin minh bạch, ưu đãi độc quyền và đánh giá thực tế từ cộng đồng yêu cái đẹp.",
    cta: "Nhận ưu đãi hôm nay",
  },
];
