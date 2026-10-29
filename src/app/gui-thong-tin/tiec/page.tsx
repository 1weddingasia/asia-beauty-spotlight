import type { Metadata } from "next";
import { PageShell } from "@/components/site/Layout";
import { OnboardingPartyClient } from "./OnboardingPartyClient";

export const metadata: Metadata = {
  title: "Đăng Ký & Gửi Thông Tin Trang Đặt Tiệc Nhà Hàng",
  description: "Biểu mẫu gửi thông tin và tải ảnh dành cho Nhà hàng, Khách sạn, Trung tâm hội nghị tổ chức tiệc tất niên và sự kiện. Tự động khởi tạo tài khoản quản trị chính thức.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function OnboardingPartyPage() {
  return (
    <PageShell solidHeader>
      <div className="min-h-screen bg-muted/15">
        <OnboardingPartyClient />
      </div>
    </PageShell>
  );
}
