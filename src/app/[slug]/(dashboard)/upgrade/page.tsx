"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Check, Loader2, Sparkles, Building2, Utensils, Clock, CheckCircle2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { activateMembershipAction } from "@/app/actions/membership";
import { toast } from "sonner";

export default function UpgradePage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [business, setBusiness] = useState<any>(null);
  const [membership, setMembership] = useState<any>(null);
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

          // Lấy membership thật từ database
          const { data: memData } = await supabase
            .from("memberships")
            .select("id, status, starts_at, expires_at, plan_id, plans(name, price_yearly)")
            .eq("business_id", bizRes.data.id)
            .order("expires_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          setMembership(memData);
        }

        const activePlans = plansRes.data || [];
        setPlans(activePlans);
        if (activePlans.length > 0) {
          // Mặc định chọn gói phù hợp với ngành
          const isFood = bizRes.data?.category_slug?.includes("am-thuc") || bizRes.data?.category_slug?.includes("tiec");
          const defaultPlan = isFood 
            ? activePlans.find((p) => p.name.includes("Tiệc")) || activePlans[0]
            : activePlans.find((p) => p.name.includes("Ưu Đãi")) || activePlans[0];
          setSelectedPlanId(defaultPlan.id);
        }
      } catch (err) {
        console.error("Lỗi tải thông tin gói:", err);
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
        <p className="text-muted-foreground text-sm">Đang tải thông tin gói thành viên từ hệ thống...</p>
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

  // Tính ngày dùng thử còn lại
  const now = new Date();
  const expiryDate = membership?.expires_at ? new Date(membership.expires_at) : new Date(new Date(business.created_at || now).getTime() + 30 * 24 * 60 * 60 * 1000);
  const msLeft = expiryDate.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
  const isExpired = msLeft <= 0;
  const isTrial = membership?.status === 'trial' || business.plan_tier === 'trial';
  const isActive = (membership?.status === 'active' || business.plan_tier === 'premium') && !isExpired;
  const formattedExpiry = expiryDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  // Kiểm tra thanh toán SePay hoặc kích hoạt
  const handleCheckPayment = async () => {
    setChecking(true);
    try {
      // 1. Kiểm tra trạng thái membership trong database
      const { data: memCheck } = await supabase
        .from("memberships")
        .select("id, status, expires_at, plan_id")
        .eq("business_id", business.id)
        .order("expires_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (memCheck && memCheck.status === 'active' && new Date(memCheck.expires_at) > now) {
        setIsSuccess(true);
        toast.success("Hệ thống đã ghi nhận thanh toán thành công!");
        setTimeout(() => {
          router.push(`/${business.slug}/dashboard`);
        }, 2000);
        return;
      }

      // 2. Kích hoạt trực tiếp qua Server Action để cập nhật DB thật
      const res = await activateMembershipAction({
        businessId: business.id,
        planId: selectedPlanId,
        amount: UPGRADE_AMOUNT,
        durationYears: 1,
        provider: "VietQR-SePay",
        transactionRef: TRANSFER_CONTENT,
      });

      if (res.success) {
        setIsSuccess(true);
        toast.success(`Kích hoạt ${res.planName} thành công 1 năm!`);
        setTimeout(() => {
          router.push(`/${business.slug}/dashboard`);
        }, 2000);
      } else {
        toast.error(res.error || "Không thể kích hoạt gói. Vui lòng thử lại.");
      }
    } catch (e: any) {
      toast.error("Đã xảy ra sự cố mạng: " + (e.message || "Vui lòng thử lại"));
    } finally {
      setChecking(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 py-16 text-center">
        <div className="mx-auto size-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
          <Check className="size-12" />
        </div>
        <h2 className="text-3xl font-black text-slate-900">Kích Hoạt Gói Thành Viên Thành Công!</h2>
        <p className="text-muted-foreground text-base max-w-md mx-auto">
          Thời hạn thành viên đã được cập nhật chính thức vào cơ sở dữ liệu. Đang chuyển hướng về Bảng điều khiển gian hàng...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 border border-gold/30 text-ink text-xs font-bold mb-2">
          <Sparkles className="size-3.5 text-gold" /> GÓI THÀNH VIÊN DOANH NGHIỆP
        </div>
        <h2 className="text-3xl font-black tracking-tight text-slate-900">Kích Hoạt & Nâng Cấp Gói Thành Viên</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Lựa chọn gói dịch vụ phù hợp để duy trì hiển thị gian hàng số, chạy deal ưu đãi và nhận thông báo khách đặt bàn quanh năm.
        </p>
      </div>

      {/* Thẻ Trạng Thái Thành Viên Hiện Tại */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase text-slate-400">Trạng thái hiện tại:</span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
              isActive
                ? 'bg-emerald-100 text-emerald-800'
                : isExpired
                ? 'bg-rose-100 text-rose-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {isActive ? <CheckCircle2 className="size-3" /> : <Clock className="size-3" />}
              {isActive ? 'Gói Chính Thức Đang Hoạt Động' : isExpired ? 'Dùng Thử Đã Hết Hạn' : 'Dùng Thử Miễn Phí 30 Ngày'}
            </span>
          </div>
          <p className="text-sm text-slate-600">
            Hạn dùng đến ngày: <strong className="text-slate-900">{formattedExpiry}</strong> (Còn <strong>{daysLeft} ngày</strong>).
          </p>
        </div>
        <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl sm:text-right">
          <span>Doanh nghiệp: </span>
          <strong className="text-slate-900">{business.name}</strong>
        </div>
      </div>

      {/* Selector 2 gói chính thức từ database plans */}
      <div className="grid md:grid-cols-2 gap-4">
        {plans.map((p) => {
          const isSelected = p.id === selectedPlanId;
          const isParty = p.name.toLowerCase().includes("tiệc");
          return (
            <div
              key={p.id}
              onClick={() => setSelectedPlanId(p.id)}
              className={`cursor-pointer rounded-2xl p-6 border-2 transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'border-gold bg-champagne/30 shadow-md ring-2 ring-gold/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isParty ? 'bg-amber-100 text-amber-700' : 'bg-gold/20 text-ink'}`}>
                      {isParty ? <Utensils className="size-5" /> : <Building2 className="size-5" />}
                    </div>
                    <div>
                      <span className="font-bold text-base text-slate-900 block">{p.name}</span>
                      <span className="text-[11px] text-slate-400">Thời hạn: 1 Năm (365 Ngày)</span>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="bg-gold text-ink text-[11px] font-black px-2.5 py-0.5 rounded-full">
                      ĐANG CHỌN
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
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

      {/* Chi tiết gói đã chọn & Mã QR thanh toán */}
      {selectedPlan && (
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <Card className="border-gold/40 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-xl text-ink flex items-center gap-2">
                <span>Quyền lợi: {selectedPlan.name}</span>
              </CardTitle>
              <CardDescription className="text-xs">
                {selectedPlan.description || "Gói dịch vụ chính thức trên nền tảng thương mại."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold font-mono text-slate-900">
                {UPGRADE_AMOUNT.toLocaleString('vi-VN')} đ <span className="text-sm font-normal text-muted-foreground font-sans">/ 1 năm</span>
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

          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg">Mã QR Thanh Toán Ngân Hàng</CardTitle>
              <CardDescription className="text-xs">
                Mở ứng dụng ngân hàng quét mã VietQR để thanh toán tự động.
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
                className="w-full bg-gold text-ink font-bold hover:brightness-105 h-11"
              >
                {checking && <Loader2 className="mr-2 size-4 animate-spin" />}
                <span>{checking ? "Đang xử lý kết nối dữ liệu..." : "Tôi đã chuyển khoản thành công"}</span>
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
