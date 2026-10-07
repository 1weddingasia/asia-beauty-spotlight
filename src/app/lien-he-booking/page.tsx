import { Metadata } from "next";
import ContactBookingClient from "./ContactBookingClient";

export const metadata: Metadata = {
  title: "Liên Hệ Tư Vấn & Hỗ Trợ | 1Booking.Asia",
  description: "Liên hệ ngay đội ngũ 1Booking.Asia để được tư vấn setup nền tảng đặt lịch 1-chạm & lễ tân AI cho cơ sở kinh doanh của bạn chỉ trong 5 phút.",
};

export default function ContactBookingPage() {
  return <ContactBookingClient />;
}
