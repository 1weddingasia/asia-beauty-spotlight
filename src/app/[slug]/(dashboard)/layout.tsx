import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { LogOut, Sparkles, Store, AlertTriangle, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import SidebarNav from "./SidebarNav";
import MobileBottomNav from "./MobileBottomNav";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

import { getSiteConfig } from "@/config/site-config";
import { headers } from "next/headers";

import { isFnBCategory } from "@/types/party";

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const siteConfig = getSiteConfig(h.get('host') || '');
  return {
    title: "Bảng điều khiển Gian hàng",
    description: `Quản lý gian hàng, ưu đãi, đơn đặt bàn và danh sách khách hàng của bạn trên hệ thống ${siteConfig.brand}`,
  };
}

export default async function BusinessDashboardLayout({ 
  children,
  params
}: { 
  children: React.ReactNode,
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const h = await headers();
  const siteConfig = getSiteConfig(h.get('host') || '');

  if (!user) {
    redirect("/login");
  }

  // Lấy thông tin doanh nghiệp của user
  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, slug, plan_id, plan_tier, status, created_at, category_slug")
    .eq("slug", slug)
    .eq("owner_id", user.id)
    .maybeSingle();

  // If business not found or not owned by user, redirect
  if (!business) {
    redirect("/dashboard");
  }

  // Lấy thông tin gói thành viên thật từ database
  const { data: membership } = await supabase
    .from("memberships")
    .select("id, status, starts_at, expires_at, plan_id, plans(name, price_yearly)")
    .eq("business_id", business.id)
    .order("expires_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const isFnB = isFnBCategory(business.category_slug);

  // Tính toán hạn dùng thật từ Database
  const now = new Date();
  const rawExpiry = membership?.expires_at ? new Date(membership.expires_at) : null;
  // Fallback nếu chưa có record membership: 30 ngày từ khi tạo quán
  const fallbackExpiry = new Date(new Date(business.created_at || now).getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiryDate = rawExpiry || fallbackExpiry;

  const msLeft = expiryDate.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
  const isExpired = msLeft <= 0;

  const memStatus = membership?.status || (business.plan_tier === 'premium' ? 'active' : 'trial');
  const planName = (membership?.plans as any)?.name || (isFnB ? 'Gói Trang Đặt Tiệc' : 'Gói Trang Ưu Đãi');
  const formattedExpiry = expiryDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6 shadow-sm">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg sm:text-xl text-gold">
          {siteConfig.logoText}<span className="text-ink">{siteConfig.logoDomain}</span>
        </Link>
        <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
          <Button variant="ghost" size="sm" asChild className="px-2 sm:px-3 text-zinc-700 hover:text-black">
            <Link href={`/${business.slug}`} target="_blank">
              <Store className="size-4 sm:mr-1.5 text-gold" />
              <span className="hidden sm:inline">Xem Trang Ưu Đãi</span>
            </Link>
          </Button>

          {isFnB && (
            <Button variant="outline" size="sm" asChild className="px-2 sm:px-3 border-amber-500/40 text-amber-700 hover:text-amber-800 hover:bg-amber-50">
              <Link href={`/${business.slug}/tiec`} target="_blank">
                <Sparkles className="size-4 sm:mr-1.5 text-amber-500" />
                <span className="hidden sm:inline">Xem Trang Đặt Tiệc</span>
              </Link>
            </Button>
          )}

          <form action="/auth/signout" method="post">
            <Button variant="outline" size="sm" type="submit" className="px-2 sm:px-3 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
              <LogOut className="size-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </Button>
          </form>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden w-64 flex-col border-r bg-card md:flex">
          <div className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Khu vực quản lý</p>
            <h3 className="font-bold text-lg truncate mt-1" title={business?.name || "Chưa có doanh nghiệp"}>
              {business?.name || "Chưa có doanh nghiệp"}
            </h3>
          </div>
          <Suspense fallback={<div className="flex-1 px-4 py-2" />}>
            <SidebarNav slug={slug} categorySlug={business.category_slug} />
          </Suspense>

          {/* Khung Thông Tin Thành Viên & Hạn Dùng Thử */}
          <div className="p-4 mt-auto">
            {(() => {
              if (business.status === 'suspended') {
                return (
                  <div className="rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/5 p-4 border border-red-500/30">
                    <h4 className="font-bold text-sm mb-1 flex items-center gap-1.5 text-red-700">
                      <AlertTriangle className="size-4 shrink-0" /> Trang đang bị tạm ngưng
                    </h4>
                    <p className="text-xs text-red-700/80 mb-3">
                      Vui lòng liên hệ ban quản trị để gia hạn và kích hoạt lại.
                    </p>
                    <Button asChild size="sm" className="w-full bg-gold text-ink hover:bg-gold/90 font-bold">
                      <Link href={`/${slug}/upgrade`}>Kích hoạt & Gia hạn</Link>
                    </Button>
                  </div>
                );
              }

              if (isExpired) {
                return (
                  <div className="rounded-xl bg-gradient-to-br from-rose-500/15 to-rose-500/5 p-4 border border-rose-500/30">
                    <h4 className="font-bold text-xs mb-1 flex items-center gap-1.5 text-rose-700">
                      <Clock className="size-4 shrink-0" /> Dùng thử đã hết hạn
                    </h4>
                    <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                      Hạn dùng thử kết thúc ngày {formattedExpiry}. Kích hoạt gói chính thức để duy trì gian hàng.
                    </p>
                    <Button asChild size="sm" className="w-full bg-gold text-ink hover:bg-gold/90 font-bold text-xs h-8">
                      <Link href={`/${slug}/upgrade`}>
                        <span>Kích hoạt ngay</span>
                        <ArrowRight className="size-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                );
              }

              if (memStatus === 'active' || business.plan_tier === 'premium') {
                return (
                  <div className="rounded-xl bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 p-4 border border-emerald-500/30">
                    <h4 className="font-bold text-xs mb-1 flex items-center gap-1 text-emerald-700">
                      <CheckCircle2 className="size-4 shrink-0" /> {planName}
                    </h4>
                    <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
                      Còn <strong>{daysLeft} ngày</strong> (Hết hạn: {formattedExpiry}).
                    </p>
                    <Button asChild variant="outline" size="sm" className="w-full text-xs h-8 border-emerald-500/40 text-emerald-700 hover:bg-emerald-50">
                      <Link href={`/${slug}/upgrade`}>Gia hạn gói</Link>
                    </Button>
                  </div>
                );
              }

              // Mặc định: Dùng thử 30 ngày
              return (
                <div className="rounded-xl bg-gradient-to-br from-amber-500/15 via-gold/10 to-amber-500/5 p-4 border border-gold/30">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-xs flex items-center gap-1 text-amber-800">
                      <Sparkles className="size-3.5 text-gold" /> Dùng thử — Còn {daysLeft} ngày
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2.5 leading-relaxed">
                    Hạn đến: <strong>{formattedExpiry}</strong>. Nâng cấp để hiển thị trọn gói 1 năm.
                  </p>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-3">
                    <div 
                      className="bg-gold h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.max(5, (daysLeft / 30) * 100))}%` }}
                    />
                  </div>
                  <Button asChild size="sm" className="w-full bg-gold text-ink hover:bg-gold/90 font-bold text-xs h-8">
                    <Link href={`/${slug}/upgrade`}>Kích hoạt gói 1 năm</Link>
                  </Button>
                </div>
              );
            })()}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 pb-20 md:p-10 md:pb-10">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <Suspense fallback={null}>
        <MobileBottomNav slug={slug} categorySlug={business.category_slug} />
      </Suspense>
    </div>
  );
}
