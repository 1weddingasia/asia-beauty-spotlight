import { Metadata } from "next";
import ContactPageClient from "./ContactPageClient";

export const metadata: Metadata = {
  title: "Liên hệ & Đăng ký doanh nghiệp | 1Beauty.Asia",
  description: "Đăng ký thương hiệu làm đẹp của bạn vào danh bạ 1Beauty.Asia hoặc liên hệ đội ngũ biên tập để cập nhật thông tin.",
};

export default function ContactPage() {
  return <ContactPageClient />;
}
