import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, LayoutDashboard, Store, Settings, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function BusinessDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Lấy thông tin doanh nghiệp của user
  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, slug, plan_id")
    .eq("owner_id", user.id)
    .single();

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6 shadow-sm">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gold">
          1Beauty<span className="text-ink">.Asia</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={business ? `/doanh-nghiep/${business.slug}` : "/"}>
              Xem trang hiển thị
            </Link>
          </Button>
          <form action="/auth/signout" method="post">
            <Button variant="outline" size="sm" type="submit">
              <LogOut className="mr-2 size-4" /> Đăng xuất
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
          <nav className="flex-1 space-y-1 px-4">
            <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted text-foreground">
              <LayoutDashboard className="size-4" /> Tổng quan
            </Link>
            <Link href="/dashboard/profile" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted text-foreground">
              <Store className="size-4" /> Chỉnh sửa Gian hàng
            </Link>
            <Link href="/dashboard/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted text-foreground">
              <Settings className="size-4" /> Cài đặt Tài khoản
            </Link>
          </nav>
          <div className="p-4 mt-auto">
            <div className="rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 p-4 border border-gold/30">
              <h4 className="font-bold text-sm mb-1 flex items-center gap-1">
                <Sparkles className="size-4 text-gold" /> Gói Standard
              </h4>
              <p className="text-xs text-muted-foreground mb-3">Mở khóa hiển thị SĐT, Zalo và ảnh không giới hạn.</p>
              <Button asChild size="sm" className="w-full bg-gold text-ink hover:bg-gold/90">
                <Link href="/dashboard/upgrade">Nâng cấp ngay</Link>
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
