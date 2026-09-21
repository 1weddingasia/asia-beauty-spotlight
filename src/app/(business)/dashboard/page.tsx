import { createClient } from "@/utils/supabase/server";
import { Store, Eye, TrendingUp, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function BusinessDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: business } = await supabase
    .from("businesses")
    .select("*, plans(name)")
    .eq("owner_id", user?.id)
    .single();

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <Store className="size-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Chưa có gian hàng nào được liên kết</h2>
        <p className="text-muted-foreground">
          Vui lòng liên hệ với Ban quản trị 1Beauty.Asia để được cấp quyền sở hữu doanh nghiệp của bạn.
        </p>
      </div>
    );
  }

  // In the future, fetch real stats from an analytics table. For now, show placeholder.
  const views = "---";
  const clicks = "---";
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Xin chào, {business.name}!</h2>
        <p className="text-muted-foreground mt-2">
          Theo dõi hiệu quả hoạt động kinh doanh và tối ưu hóa gian hàng của bạn.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6 flex flex-col justify-between">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Lượt xem trang (Tháng này)</h3>
            <Eye className="size-4 text-muted-foreground" />
          </div>
          <div>
            <div className="text-2xl font-bold text-muted-foreground">{views}</div>
            <p className="text-xs text-muted-foreground">Đang thu thập dữ liệu...</p>
          </div>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6 flex flex-col justify-between">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Click lấy SĐT / Zalo</h3>
            <TrendingUp className="size-4 text-muted-foreground" />
          </div>
          <div>
            <div className="text-2xl font-bold text-muted-foreground">{clicks}</div>
            <p className="text-xs text-muted-foreground">Đang thu thập dữ liệu...</p>
          </div>
        </div>
        
        <div className="rounded-xl border border-gold/50 bg-gradient-to-br from-gold/10 to-transparent text-card-foreground shadow p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Gói hiện tại</h3>
            <Sparkles className="size-4 text-gold" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gold uppercase">{business.plans?.name || 'FREE'}</div>
            <p className="text-xs text-muted-foreground mb-4">
              {business.plan_id ? 'Đang kích hoạt' : 'Gói cơ bản'}
            </p>
            <Button asChild size="sm" className="w-full bg-gold text-ink hover:bg-gold/90">
              <Link href="/dashboard/upgrade">Nâng cấp Gói</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
