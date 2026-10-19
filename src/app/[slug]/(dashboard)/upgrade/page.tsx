"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Check, Loader2, Sparkles, Building2, Utensils, ArrowRight } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function UpgradePage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [business, setBusiness] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const [bizRes, plansRes] = await Promise.all([
          supabase.from("businesses").select("*").eq("slug", slug).maybeSingle(),
          supabase.from("plans").select("*").eq("is_active", true).order("price_yearly", { ascending: false }),
        ]);

        if (bizRes.data) {
          setBusiness(bizRes.data);
        }

        const activePlans = plansRes.data || [];
        setPlans(activePlans);
        if (activePlans.length > 0) {
          // Default to Gói Trang Ưu Đãi (highest price) or first plan
          setSelectedPlanId(activePlans[0].id);
        }
      } catch (err) {
        console.error("Lỗi tải thông tin:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [slug, router]);

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-gold" />
        <p className="text-muted-foreground text-sm">Đang tải thông tin gói thành viên...</p>
      </div>
    );
  }

  if (!business) {
    return <div className="p-10 text-center">Lỗi: Không tìm thấy thông tin doanh nghiệp.</div>;
  }

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];
  const UPGRADE_AMOUNT = selectedPlan ? Number(selectedPlan.price_yearly) : 1500000;
  const BANK_ACC = "00003554020";
  const BANK_NAME = "TPBank";

  const isPartyPlan = selectedPlan?.name?.toLowerCase().includes("tiệc");
  const planPrefix = isPartyPlan ? "TIEC" : "UDAI";
  const cleanPhone = business.phone ? business.phone.replace(/\D/g, "") : "";
  const TRANSFER_CONTENT = cleanPhone ? `${planPrefix} ${cleanPhone}` : `${planPrefix} ${business.slug.toUpperCase()}`;
  const QR_URL = `https://qr.sepay.vn/img?acc=${BANK_ACC}&bank=${BANK_NAME}&amount=${UPGRADE_AMOUNT}&des=${encodeURIComponent(TRANSFER_CONTENT)}`;

  const handleCheckPayment = async () => {
    setChecking(true);
    try {
      const { data, error } = await supabase.from("businesses").select("plan_tier, status").eq("id", business.id).single();
      if (error) {
        alert("Có lỗi xảy ra khi kiểm tra dữ liệu.");
      } else if (data && data.plan_tier === 'premium') {
        setIsSuccess(true);
        setTimeout(() => {
          router.push(`/${business.slug}/dashboard`);
        }, 3000);
      } else {
        alert("Hệ thống đang chờ giao dịch ngân hàng. Nếu bạn vừa chuyển, vui lòng chờ 30-60 giây và bấm kiểm tra lại!");
      }
    } catch (e) {
      alert("Đã xảy ra sự cố mạng.");
    } finally {
      setChecking(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 py-12 text-center">
        <div className="mx-auto size-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <Check className="size-12" />
        </div>
        <h2 className="text-3xl font-bold">Kích hoạt gói thành công!</h2>
        <p className="text-muted-foreground text-lg">Gói dịch vụ đã được ghi nhận. Đang chuyển hướng về bảng điều khiển...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-ink text-xs font-bold mb-2">
          <Sparkles className="size-3.5 text-gold" /> GÓI THÀNH VIÊN CHÍNH THỨC
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Kích Hoạt & Nâng Cấp Gói</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Giá gói được quản trị trực tiếp từ hệ thống. Quét mã VietQR ngân hàng để kích hoạt tự động tức thì.
        </p>
      </div>

      {/* 1. Selector 2 gói chính thức */}
      <div className="grid md:grid-cols-2 gap-4">
        {plans.map((p) => {
          const isSelected = p.id === selectedPlanId;
          const isParty = p.name.toLowerCase().includes("tiệc");
          return (
            <div
              key={p.id}
              onClick={() => setSelectedPlanId(p.id)}
              className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'border-gold bg-champagne/30 shadow-md ring-2 ring-gold/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isParty ? 'bg-amber-100 text-amber-700' : 'bg-gold/20 text-ink'}`}>
                      {isParty ? <Utensils className="size-4" /> : <Building2 className="size-4" />}
                    </div>
                    <span className="font-bold text-base text-slate-900">{p.name}</span>
                  </div>
                  {isSelected && (
                    <span className="bg-gold text-ink text-[11px] font-black px-2.5 py-0.5 rounded-full">
                      ĐANG CHỌN
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  {p.description || (isParty ? 'Kích hoạt trang sảnh tiệc riêng chuyên biệt đón khách đoàn & tiệc tất niên' : 'Gian hàng số chuẩn sang trọng toàn nền tảng, quảng bá ưu đãi quanh năm')}
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900 font-mono">
                  {Number(p.price_yearly).toLocaleString('vi-VN')} đ
                </span>
                <span className="text-xs text-slate-500 font-medium">/ 1 năm</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Chi tiết gói đã chọn & Mã QR thanh toán */}
      {selectedPlan && (
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <Card className="border-gold/40 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-ink flex items-center gap-2">
                <span>Quyền lợi: {selectedPlan.name}</span>
              </CardTitle>
              <CardDescription>
                {selectedPlan.description || "Gói dịch vụ chính thức trên nền tảng 1Booking.Asia."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold font-mono text-slate-900">
                {UPGRADE_AMOUNT.toLocaleString('vi-VN')} đ <span className="text-sm font-normal text-muted-foreground font-sans">/ năm</span>
              </div>

              <div className="space-y-2.5 pt-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Tính năng bao gồm:</p>
                {(Array.isArray(selectedPlan.features) && selectedPlan.features.length > 0 ? selectedPlan.features : [
                  'Kích hoạt tính năng theo đúng cấu hình gói',
                  'Hiển thị thông tin liên hệ và số điện thoại bấm gọi ngay',
                  'Tiếp nhận yêu cầu đặt lịch hẹn, đặt bàn & thông báo tự động',
                  'Hỗ trợ kỹ thuật 24/7 trong suốt thời gian kích hoạt',
                ]).map((feat: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                    <Check className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg">Mã QR Thanh Toán Tự Động</CardTitle>
              <CardDescription className="text-xs">
                Mở ứng dụng ngân hàng quét mã QR, hệ thống tự động ghi nhận sau khi chuyển.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200 inline-block">
                <img src={QR_URL} alt="Mã QR Thanh toán" width={220} height={220} className="rounded-xl object-contain mx-auto" />
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl w-full text-center space-y-1">
                <p className="text-xs text-slate-500">Nội dung chuyển khoản (chính xác):</p>
                <p className="font-mono font-bold text-base text-slate-900 tracking-wide select-all">{TRANSFER_CONTENT}</p>
                <p className="text-[11px] text-slate-500">Số tiền: <strong className="text-slate-900 font-mono">{UPGRADE_AMOUNT.toLocaleString('vi-VN')} đ</strong></p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleCheckPayment}
                disabled={checking}
                className="w-full bg-gold text-ink font-bold hover:brightness-105"
              >
                {checking && <Loader2 className="mr-2 size-4 animate-spin" />}
                <span>Tôi đã chuyển khoản thành công</span>
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
