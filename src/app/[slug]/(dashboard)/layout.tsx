import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, Sparkles, LayoutDashboard, Store, Ticket, Users, Settings } from "lucide-react";
import SidebarNav from "./SidebarNav";
import MobileBottomNav from "./MobileBottomNav";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bảng điều khiển Gian hàng",
  description: "Quản lý gian hàng, ưu đãi, đơn đặt bàn và danh sách khách hàng của bạn trên hệ thống 1Beauty.Asia",
};

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

  if (!user) {
    redirect("/login");
  }

  // Lấy thông tin doanh nghiệp của user
  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, slug, plan_id, plan_tier, status, created_at")
    .eq("slug", slug)
    .eq("owner_id", user.id)
    .single();

  // If business not found or not owned by user, redirect
  if (!business) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6 shadow-sm">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gold">
          1Beauty<span className="text-ink">.Asia</span>
        </Link>
        <div className="ml-auto flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="sm" asChild className="px-2 md:px-3">
            <Link href={business ? `/${business.slug}` : "/"}>
              <Store className="size-4 md:mr-2" />
              <span className="hidden md:inline">Xem Trang Ưu Đãi</span>
            </Link>
          </Button>
          <form action="/auth/signout" method="post">
            <Button variant="outline" size="sm" type="submit" className="px-2 md:px-3 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
              <LogOut className="size-4 md:mr-2" />
              <span className="hidden md:inline">Đăng xuất</span>
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
          <SidebarNav slug={slug} />
          <div className="p-4 mt-auto">
            {(() => {
              const bizStatus = business?.status || 'trial';
              
              if (bizStatus === 'published' || bizStatus === 'active' || business?.plan_tier === 'premium') {
                return (
                  <div className="rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 p-4 border border-green-500/30">
                    <h4 className="font-bold text-sm mb-1 flex items-center gap-1 text-green-700">
                      <Sparkles className="size-4" /> ✅ Đã kích hoạt
                    </h4>
                    <p className="text-xs text-muted-foreground">Trang ưu đãi của bạn đang hoạt động và hiển thị công khai.</p>
                  </div>
                );
              }
              
              if (bizStatus === 'suspended') {
                return (
                  <div className="rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/5 p-4 border border-red-500/30">
                    <h4 className="font-bold text-sm mb-1 flex items-center gap-1 text-red-700">
                      🚨 Trang đang bị tạm ngưng
                    </h4>
                    <p className="text-xs text-red-700/80 mb-3">
                      Vui lòng liên hệ 1Beauty.Asia để gia hạn và kích hoạt lại.
                    </p>
                    <Button asChild size="sm" className="w-full bg-gold text-ink hover:bg-gold/90">
                      <Link href="/lien-he">Liên hệ gia hạn</Link>
                    </Button>
                  </div>
                );
              }

              // Trial: hiển thị số ngày còn lại
              const createdAt = business?.created_at ? new Date(business.created_at) : new Date();
              const trialEndDate = new Date(createdAt);
              trialEndDate.setDate(trialEndDate.getDate() + 7); // 7 ngày dùng thử
              const now = new Date();
              const daysLeft = Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
              
              return (
                <div className="rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 p-4 border border-gold/30">
                  <h4 className="font-bold text-sm mb-1 flex items-center gap-1">
                    <Sparkles className="size-4 text-gold" /> Dùng thử — còn {daysLeft} ngày
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">Liên hệ 1Beauty để kích hoạt chính thức (500.000đ/năm).</p>
                  <Button asChild size="sm" className="w-full bg-gold text-ink hover:bg-gold/90">
                    <Link href={`/${slug}/upgrade`}>Kích hoạt ngay</Link>
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
      <MobileBottomNav slug={slug} />
    </div>
  );
}
