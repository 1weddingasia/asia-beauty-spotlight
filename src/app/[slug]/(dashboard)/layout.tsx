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

  // Lấy danh sách tất cả gói thành viên của doanh nghiệp từ database
  const { data: allMemberships } = await supabase
    .from("memberships")
    .select("id, status, starts_at, expires_at, plan_id, plans(id, code, name, plan_type, tier, price_yearly)")
    .eq("business_id", business.id)
    .order("expires_at", { ascending: false });

  const dealMem = allMemberships?.find((m: any) => m.plans?.plan_type === 'deal' || m.plans?.name?.includes('Ưu Đãi'));
  const partyMem = allMemberships?.find((m: any) => m.plans?.plan_type === 'party' || m.plans?.name?.includes('Tiệc'));

  const isFnB = isFnBCategory(business.category_slug);
  const now = new Date();

  // 1. Tính toán trạng thái Trang Ưu Đãi
  const dealExpiry = dealMem?.expires_at ? new Date(dealMem.expires_at) : new Date(new Date(business.created_at || now).getTime() + 30 * 24 * 60 * 60 * 1000);
  const dealMsLeft = dealExpiry.getTime() - now.getTime();
  const dealDaysLeft = Math.max(0, Math.ceil(dealMsLeft / (1000 * 60 * 60 * 24)));
  const dealActive = dealMem?.status === 'active' && dealMsLeft > 0;
  const dealExpired = dealMsLeft <= 0;

  // 2. Tính toán trạng thái Trang Đặt Tiệc
  const partyExpiry = partyMem?.expires_at ? new Date(partyMem.expires_at) : null;
  const partyMsLeft = partyExpiry ? partyExpiry.getTime() - now.getTime() : 0;
  const partyDaysLeft = partyExpiry ? Math.max(0, Math.ceil(partyMsLeft / (1000 * 60 * 60 * 24))) : 0;
  const partyActive = partyMem?.status === 'active' && partyMsLeft > 0;
  const partyIsVip = partyActive && (partyMem?.plans as any)?.tier === 'vip';

  // Tổng số gói đang kích hoạt chính thức (0, 1 hoặc 2)
  const activeCount = (dealActive ? 1 : 0) + (partyActive ? 1 : 0);
  const formattedDealExpiry = dealExpiry.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const formattedPartyExpiry = partyExpiry ? partyExpiry.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : null;

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

              return (
                <div className="rounded-xl bg-gradient-to-br from-slate-900 via-zinc-900 to-black text-white p-3.5 border border-amber-500/30 shadow-md">
                  {/* Badge số lượng gói đang dùng */}
                  <div className="flex items-center justify-between gap-1 mb-2.5 pb-2 border-b border-zinc-800">
                    <span className="text-[10px] font-black uppercase text-amber-400 flex items-center gap-1">
                      <Sparkles className="size-3 text-gold" /> GÓI THÀNH VIÊN
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      activeCount === 2 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : activeCount === 1 
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {activeCount > 0 ? `Đang dùng: ${activeCount}/2 gói` : 'Dùng thử 0/2 gói'}
                    </span>
                  </div>

                  {/* 1. Trang Ưu Đãi */}
                  <div className="mb-2 text-[11px] space-y-0.5">
                    <div className="flex items-center justify-between text-zinc-300">
                      <span className="font-semibold flex items-center gap-1">
                        <Store className="size-3 text-amber-400" /> Trang Ưu Đãi:
                      </span>
                      <span className={`text-[10px] font-bold ${dealActive ? 'text-emerald-400' : dealExpired ? 'text-rose-400' : 'text-amber-400'}`}>
                        {dealActive ? 'Chính thức' : dealExpired ? 'Hết hạn' : 'Dùng thử'}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 pl-4">
                      Hạn: {formattedDealExpiry} ({dealDaysLeft > 0 ? `Còn ${dealDaysLeft}N` : 'Hết hạn'})
                    </p>
                  </div>

                  {/* 2. Trang Đặt Tiệc */}
                  <div className="mb-3 text-[11px] space-y-0.5 pt-1.5 border-t border-zinc-800/80">
                    <div className="flex items-center justify-between text-zinc-300">
                      <span className="font-semibold flex items-center gap-1">
                        <Sparkles className="size-3 text-blue-400" /> Trang Đặt Tiệc:
                      </span>
                      <span className={`text-[10px] font-bold ${partyIsVip ? 'text-amber-300' : partyActive ? 'text-blue-400' : 'text-zinc-500'}`}>
                        {partyIsVip ? '🔥 VIP Neon' : partyActive ? 'Chính thức' : 'Chưa kích hoạt'}
                      </span>
                    </div>
                    {partyActive && formattedPartyExpiry ? (
                      <p className="text-[10px] text-zinc-400 pl-4">
                        Hạn: {formattedPartyExpiry} (Còn {partyDaysLeft}N)
                      </p>
                    ) : (
                      <p className="text-[10px] text-zinc-500 pl-4">
                        Chưa ghim Bản Đồ Phố Tiệc
                      </p>
                    )}
                  </div>

                  <Button asChild size="sm" className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-[11px] h-7 shadow">
                    <Link href={`/${slug}/upgrade`}>
                      <span>{activeCount < 2 ? 'Kích hoạt thêm gói ↗' : 'Gia hạn gói ↗'}</span>
                    </Link>
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
