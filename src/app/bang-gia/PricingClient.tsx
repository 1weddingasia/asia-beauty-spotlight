"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import Link from "next/link";

export default function PricingClient({ plans }: { plans: any[] }) {
  const isYearly = true; // Always true as requested by user

  return (
    <div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
        {plans.map((plan) => {
          const isPremium = plan.price_yearly > 0;
          const price = plan.price_yearly;
          const originalPrice = plan.price_monthly * 12; // Just for display
          
          return (
            <div 
              key={plan.id} 
              className={`relative flex flex-col rounded-2xl border ${isPremium ? 'border-gold shadow-lg shadow-gold/10 scale-[1.02]' : 'border-border shadow-sm'} bg-card p-8`}
            >
              {isPremium && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gold text-ink text-xs font-bold uppercase tracking-widest py-1 px-4 rounded-full shadow-sm">
                  Phổ biến nhất
                </div>
              )}
              
              <h3 className="text-xl font-display font-bold text-center">{plan.name}</h3>
              <p className="mt-2 text-sm text-center text-muted-foreground h-10">
                {plan.description || "Dành cho doanh nghiệp làm đẹp"}
              </p>
              
              <div className="mt-6 text-center">
                {isPremium && originalPrice > price && (
                  <div className="text-sm text-muted-foreground line-through mb-1">
                    {Number(originalPrice).toLocaleString('vi-VN')} đ
                  </div>
                )}
                <span className="text-4xl font-bold">{Number(price).toLocaleString('vi-VN')} đ</span>
                <span className="text-muted-foreground">/năm</span>
              </div>
              
              <ul className="mt-8 flex-1 space-y-4">
                <li className="flex gap-3">
                  <Check className="size-5 text-gold shrink-0" />
                  <span className="text-sm">Hiển thị trong kết quả tìm kiếm</span>
                </li>
                <li className="flex gap-3">
                  <Check className="size-5 text-gold shrink-0" />
                  <span className="text-sm">Tạo trang giới thiệu chuyên nghiệp</span>
                </li>
                {isPremium && (
                  <>
                    <li className="flex gap-3">
                      <Check className="size-5 text-gold shrink-0" />
                      <span className="text-sm font-medium">Huy hiệu Nổi bật (Featured)</span>
                    </li>
                    <li className="flex gap-3">
                      <Check className="size-5 text-gold shrink-0" />
                      <span className="text-sm">Ưu tiên hiển thị trên trang chủ</span>
                    </li>
                    <li className="flex gap-3">
                      <Check className="size-5 text-gold shrink-0" />
                      <span className="text-sm">Hỗ trợ SEO từ khóa khu vực</span>
                    </li>
                  </>
                )}
              </ul>
              
              <Link 
                href="/lien-he"
                className={`mt-8 block text-center w-full rounded-full py-3 text-sm font-bold transition-all ${
                  isPremium 
                    ? "bg-gold text-ink hover:bg-gold/90 shadow-md" 
                    : "bg-gray-100 text-ink hover:bg-gray-200"
                }`}
              >
                Đăng ký ngay
              </Link>
            </div>
          );
        })}
      </div>
      
      {/* SEPAY Info for Vietnamese Bank Transfer */}
      <div className="mt-16 text-center bg-champagne/30 rounded-2xl p-8 border border-gold/30">
        <h4 className="text-lg font-bold font-display mb-2">Thanh toán tự động 24/7</h4>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Hệ thống hỗ trợ tự động nâng cấp gói bằng cách quét mã QR chuyển khoản qua SePay. Tài khoản của bạn sẽ được kích hoạt VIP ngay lập tức mà không cần chờ đợi.
        </p>
      </div>
    </div>
  );
}
