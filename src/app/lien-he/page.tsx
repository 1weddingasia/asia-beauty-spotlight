import { Metadata } from "next";
import ContactPageClient from "./ContactPageClient";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "Liên hệ & Đăng ký doanh nghiệp | 1Beauty.Asia",
  description: "Đăng ký thương hiệu làm đẹp của bạn vào danh bạ 1Beauty.Asia hoặc liên hệ đội ngũ biên tập để cập nhật thông tin.",
};

export default async function ContactPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "global")
    .single();

  const settings = data?.value || {};

  return (
    <ContactPageClient 
      address={settings.contact_address} 
      phone={settings.contact_phone} 
      email={settings.contact_email} 
    />
  );
}
