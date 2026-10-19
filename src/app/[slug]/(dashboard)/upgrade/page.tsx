"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  Check, Loader2, Sparkles, Building2, Utensils, Clock, CheckCircle2, 
  Flame, ShieldCheck, ArrowRight, Copy 
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { activateMembershipAction } from "@/app/actions/membership";
import { toast } from "sonner";
import Link from "next/link";

export default function UpgradePage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [business, setBusiness] = useState<any>(null);
  const [dealMembership, setDealMembership] = useState<any>(null);
  const [partyMembership, setPartyMembership] = useState<any>(null);
  const [partyProfile, setPartyProfile] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

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
          supabase.from("plans").select("*").eq("is_active", true).order("price_yearly", { ascending: true }),
        ]);

        if (bizRes.data) {
          setBusiness(bizRes.data);

          // Lấy tất cả memberships thật của doanh nghiệp
          const [memsRes, partyRes] = await Promise.all([
            supabase
              .from("memberships")
              .select("id, status, starts_at, expires_at, plan_id, plans(id, code, name, plan_type, tier, price_yearly)")
              .eq("business_id", bizRes.data.id)
              .order("expires_at", { ascending: false }),
            supabase
              .from("business_party_profiles")
              .select("business_id, is_vip, is_active")
              .eq("business_id", bizRes.data.id)
              .maybeSingle()
          ]);

          const allMems = memsRes.data || [];
          const dMem = allMems.find((m: any) => m.plans?.plan_type === 'deal' || m.plans?.name?.includes('Ưu Đãi'));
          const pMem = allMems.find((m: any) => m.plans?.plan_type === 'party' || m.plans?.name?.includes('Tiệc'));

          setDealMembership(dMem || null);
          setPartyMembership(pMem || null);
          setPartyProfile(partyRes.data || null);
        }

        const activePlans = plansRes.data || [];
        setPlans(activePlans);
        if (activePlans.length > 0) {
          // Mặc định chọn gói Ưu Đãi Chuẩn hoặc Tiệc Chuẩn
          setSelectedPlanId(activePlans[0].id);
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

  // Tách 4 gói thành 2 nhóm
  const dealPlans = plans.filter((p) => p.plan_type === 'deal' || p.name.includes('Ưu Đãi'));
  const partyPlans = plans.filter((p) => p.plan_type === 'party' || p.name.includes('Tiệc'));

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];
  const UPGRADE_AMOUNT = selectedPlan ? Number(selectedPlan.price_yearly) : 500000;
  const BANK_ACC = "00003554020";
  const BANK_NAME = "TPBank";

  // Cú pháp chuyển khoản chuẩn xác theo từng gói
  const getTransferPrefix = (plan: any) => {
    if (!plan) return 'UDAI';
    if (plan.plan_type === 'party' || plan.name?.includes('Tiệc')) {
      return (plan.code === 'tiec_vip' || plan.tier === 'vip') ? 'TIECVIP' : 'TIEC';
    }
    return (plan.code === 'udai_vip' || plan.tier === 'vip') ? 'UDAIVIP' : 'UDAI';
  };

  const planPrefix = getTransferPrefix(selectedPlan);
  const cleanPhone = business.phone ? business.phone.replace(/\D/g, "") : "";
  const TRANSFER_CONTENT = cleanPhone ? `${planPrefix} ${cleanPhone}` : `${planPrefix} ${business.slug.toUpperCase()}`;
  const QR_URL = `https://qr.sepay.vn/img?acc=${BANK_ACC}&bank=${BANK_NAME}&amount=${UPGRADE_AMOUNT}&des=${encodeURIComponent(TRANSFER_CONTENT)}`;

  // Tính trạng thái từng gói
  const now = new Date();

  // 1. Trạng thái Trang Ưu Đãi
  const dealExpiry = dealMembership?.expires_at ? new Date(dealMembership.expires_at) : new Date(new Date(business.created_at || now).getTime() + 30 * 24 * 60 * 60 * 1000);
  const dealMsLeft = dealExpiry.getTime() - now.getTime();
  const dealDaysLeft = Math.max(0, Math.ceil(dealMsLeft / (1000 * 60 * 60 * 24)));
  const dealIsActive = dealMembership?.status === 'active' && dealMsLeft > 0;
  const dealIsExpired = dealMsLeft <= 0;

  // 2. Trạng thái Trang Đặt Tiệc
  const partyExpiry = partyMembership?.expires_at ? new Date(partyMembership.expires_at) : null;
  const partyMsLeft = partyExpiry ? partyExpiry.getTime() - now.getTime() : 0;
  const partyDaysLeft = partyExpiry ? Math.max(0, Math.ceil(partyMsLeft / (1000 * 60 * 60 * 24))) : 0;
  const partyIsActive = partyMembership?.status === 'active' && partyMsLeft > 0;
  const partyIsVipNeon = partyIsActive && Boolean(partyProfile?.is_vip || partyMembership?.plans?.tier === 'vip');

  // Đếm tổng số gói đang dùng
  const activePackagesCount = (dealIsActive ? 1 : 0) + (partyIsActive ? 1 : 0);

  const copyTransfer = () => {
    navigator.clipboard.writeText(TRANSFER_CONTENT);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
    toast.success("Đã sao chép nội dung chuyển khoản!");
  };

  // Kích hoạt qua Server Action cập nhật DB thật
  const handleCheckPayment = async () => {
    setChecking(true);
    try {
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
      toast.error("Đã xảy ra sự cố kết nối: " + (e.message || "Vui lòng thử lại"));
    } finally {
      setChecking(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 py-16 text-center select-none">
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
    <div className="max-w-5xl mx-auto space-y-8 pb-12 select-none">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 border border-gold/30 text-ink text-xs font-bold mb-2">
          <Sparkles className="size-3.5 text-gold" /> QUẢN TRỊ 2 DÒNG GÓI THÀNH VIÊN
        </div>
        <h2 className="text-3xl font-black tracking-tight text-slate-900">Kích Hoạt Gói Thành Viên</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Hệ thống có <strong>2 loại trang độc lập</strong>: <strong>Trang Ưu Đãi</strong> (hiển thị gian hàng quanh năm) và <strong>Trang Đặt Tiệc</strong> (hiển thị trên Bản Đồ Tiệc). Quý đối tác có thể kích hoạt từng trang hoặc cả 2 trang.
        </p>
      </div>

      {/* THẺ TỔNG HỢP SỐ GÓI ĐANG DÙNG */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Gói đang sử dụng:</span>
              <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-extrabold ${
                activePackagesCount === 2 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                  : activePackagesCount === 1 
                  ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                {activePackagesCount === 2 
                  ? '⭐ Đang kích hoạt: 2 / 2 gói (Cả 2 Trang)' 
                  : activePackagesCount === 1 
                  ? 'Đang kích hoạt: 1 / 2 gói' 
                  : 'Chưa kích hoạt gói chính thức (Đang dùng thử)'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              Doanh nghiệp: {business.name}
            </h3>
          </div>
          <div className="text-xs font-mono bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-600 sm:text-right">
            Slug: <strong>/{business.slug}</strong>
          </div>
        </div>

        {/* 2 Thẻ con thể hiện chi tiết từng loại trang */}
        <div className="grid sm:grid-cols-2 gap-4 pt-4">
          {/* Card 1: Trang Ưu Đãi */}
          <div className={`p-4 rounded-xl border ${dealIsActive ? 'bg-emerald-50/50 border-emerald-200' : dealIsExpired ? 'bg-rose-50/40 border-rose-200' : 'bg-amber-50/40 border-amber-200'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Building2 className="size-4 text-amber-600" /> Trang Ưu Đãi ({business.slug})
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                dealIsActive ? 'bg-emerald-100 text-emerald-700' : dealIsExpired ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {dealIsActive ? 'Chính thức' : dealIsExpired ? 'Hết hạn' : 'Dùng thử'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              Hạn dùng: <strong className="text-slate-900">{dealExpiry.toLocaleDateString('vi-VN')}</strong> ({dealDaysLeft > 0 ? `Còn ${dealDaysLeft} ngày` : 'Đã hết hạn'})
            </p>
          </div>

          {/* Card 2: Trang Đặt Tiệc */}
          <div className={`p-4 rounded-xl border ${partyIsActive ? 'bg-blue-50/50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Utensils className="size-4 text-blue-600" /> Trang Đặt Tiệc ({business.slug}/tiec)
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                partyIsVipNeon 
                  ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                  : partyIsActive 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {partyIsVipNeon ? '🔥 VIP Neon Bản Đồ' : partyIsActive ? 'Chính thức' : 'Chưa kích hoạt'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              {partyIsActive && partyExpiry ? (
                <>Hạn dùng: <strong className="text-slate-900">{partyExpiry.toLocaleDateString('vi-VN')}</strong> (Còn {partyDaysLeft} ngày)</>
              ) : (
                <span className="text-slate-400">Chưa kích hoạt hiển thị trên Bản Đồ Phố Tiệc</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* DÒNG 1: GÓI TRANG ƯU ĐÃI & GIAN HÀNG SỐ */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
            DÒNG 1
          </span>
          <h3 className="text-lg font-black text-slate-900">
            DÀNH CHO TRANG ƯU ĐÃI (1booking.asia/{business.slug})
          </h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {dealPlans.map((p) => {
            const isSelected = p.id === selectedPlanId;
            const isVip = p.tier === 'vip' || p.code === 'udai_vip';
            return (
              <div
                key={p.id}
                onClick={() => setSelectedPlanId(p.id)}
                className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/40 shadow-md ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                        <Building2 className="size-4" />
                      </div>
                      <span className="font-bold text-sm text-slate-900">{p.name}</span>
                    </div>
                    {isSelected && (
                      <span className="bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full">
                        ĐANG CHỌN
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                    {p.description || (isVip ? 'Setup toàn bộ trang vận hành & chuông Telegram' : 'Kích hoạt trang ưu đãi chính 1 năm')}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                  <span className="text-xl font-black text-slate-900 font-mono">
                    {Number(p.price_yearly).toLocaleString('vi-VN')} đ
                  </span>
                  <span className="text-xs text-slate-500 font-medium">/ 1 năm</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DÒNG 2: GÓI TRANG ĐẶT TIỆC TẤT NIÊN */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
            DÒNG 2
          </span>
          <h3 className="text-lg font-black text-slate-900">
            DÀNH CHO TRANG ĐẶT TIỆC (1booking.asia/{business.slug}/tiec)
          </h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {partyPlans.map((p) => {
            const isSelected = p.id === selectedPlanId;
            const isVip = p.tier === 'vip' || p.code === 'tiec_vip';
            return (
              <div
                key={p.id}
                onClick={() => setSelectedPlanId(p.id)}
                className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/40 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                        <Utensils className="size-4" />
                      </div>
                      <span className="font-bold text-sm text-slate-900">{p.name}</span>
                    </div>
                    {isSelected && (
                      <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                        ĐANG CHỌN
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                    {p.description || (isVip ? 'Thêm chức năng đèn Neon sáng logo trên bản đồ tiệc' : 'Kích hoạt trang nhận tiệc riêng biệt 1 năm')}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                  <span className="text-xl font-black text-slate-900 font-mono">
                    {Number(p.price_yearly).toLocaleString('vi-VN')} đ
                  </span>
                  <span className="text-xs text-slate-500 font-medium">/ 1 năm</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chi tiết gói đang chọn & Mã QR thanh toán */}
      {selectedPlan && (
        <div className="grid md:grid-cols-2 gap-6 items-start pt-2">
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                <span>Quyền lợi: {selectedPlan.name}</span>
              </CardTitle>
              <CardDescription className="text-xs">
                {selectedPlan.description || "Gói dịch vụ chính thức theo quy định hệ thống."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-extrabold font-mono text-slate-900">
                {UPGRADE_AMOUNT.toLocaleString('vi-VN')} đ <span className="text-sm font-normal text-muted-foreground font-sans">/ 1 năm</span>
              </div>

              <div className="space-y-2.5 pt-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Quyền lợi cam kết:</p>
                {(Array.isArray(selectedPlan.features) && selectedPlan.features.length > 0 ? selectedPlan.features : [
                  'Kích hoạt đúng loại trang đã chọn trong vòng 1 năm',
                  'Đăng tải hình ảnh, thông tin & bảng giá',
                  'Tiếp nhận yêu cầu của khách hàng trực tuyến',
                  'Hỗ trợ kỹ thuật 24/7'
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
              <CardTitle className="text-base font-bold">Mã QR Chuyển Khoản Ngân Hàng</CardTitle>
              <CardDescription className="text-xs">
                Quét mã VietQR để thanh toán tự động qua SePay 24/7.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-3">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200 inline-block">
                <img src={QR_URL} alt="Mã QR Thanh toán" width={200} height={200} className="rounded-xl object-contain mx-auto" />
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl w-full text-center space-y-1">
                <p className="text-xs text-slate-500">Nội dung chuyển khoản (chính xác):</p>
                <div className="flex items-center justify-center gap-1.5">
                  <span className="font-mono font-bold text-base text-slate-900 tracking-wide select-all">{TRANSFER_CONTENT}</span>
                  <button type="button" onClick={copyTransfer} className="text-slate-400 hover:text-black">
                    <Copy className="size-3.5" />
                  </button>
                </div>
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
                <span>{checking ? "Đang xử lý kết nối dữ liệu..." : "Tôi đã chuyển khoản — Kích hoạt ngay"}</span>
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
