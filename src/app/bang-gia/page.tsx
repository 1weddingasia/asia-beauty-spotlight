import { PageShell } from "@/components/site/Layout";
import { Check, X } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { Metadata } from "next";
import PricingClient from "./PricingClient";

export const metadata: Metadata = {
  title: "Bảng giá & Gói thành viên | 1Beauty.Asia",
  description: "Các gói thành viên và bảng giá quảng bá doanh nghiệp làm đẹp trên 1Beauty.Asia",
};

export const revalidate = 60; // Cache for 60 seconds

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: plans } = await supabase.from('plans').select('*').eq('is_active', true).order('price_monthly', { ascending: true });

  return (
    <PageShell>
      {/* Header section with background image */}
      <section className="relative border-b border-border">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("https://images.pexels.com/photos/398532/pexels-photo-398532.jpeg?auto=compress&cs=tinysrgb&w=1920")' }}
        >
          <div className="absolute inset-0 bg-ink/70"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 md:py-24 text-center">
          <p className="text-xs tracking-[0.3em] text-gold uppercase drop-shadow-sm">Thành Viên</p>
          <h1 className="mt-5 text-4xl md:text-5xl text-white drop-shadow-md font-display">Bảng Giá Dịch Vụ</h1>
          <p className="mt-4 max-w-2xl mx-auto text-gray-200 drop-shadow-md text-lg">
            Nâng tầm doanh nghiệp của bạn, tiếp cận hàng ngàn khách hàng tiềm năng mỗi ngày với các gói thành viên linh hoạt từ 1Beauty.Asia.
          </p>
        </div>
      </section>

      {/* Pricing Content */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        {!plans || plans.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            Hệ thống đang cập nhật bảng giá. Vui lòng quay lại sau.
          </div>
        ) : (
          <PricingClient plans={plans} />
        )}
      </section>
    </PageShell>
  );
}
