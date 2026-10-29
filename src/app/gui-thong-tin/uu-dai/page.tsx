import type { Metadata } from "next";
import { PageShell } from "@/components/site/Layout";
import { OnboardingDealClient } from "./OnboardingDealClient";

export const metadata: Metadata = {
  title: "Đăng Ký & Gửi Thông Tin Gian Hàng Ưu Đãi",
  description: "Biểu mẫu gửi thông tin và tải ảnh dành cho Spa, Thẩm mỹ, Salon, Dịch vụ làm đẹp. Tự động khởi tạo tài khoản quản trị và trang ưu đãi chuẩn SEO.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function OnboardingDealPage() {
  return (
    <PageShell solidHeader>
      <div className="min-h-screen bg-muted/15">
        <OnboardingDealClient />
      </div>
    </PageShell>
  );
}
