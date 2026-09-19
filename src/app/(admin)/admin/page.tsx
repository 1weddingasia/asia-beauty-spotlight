import { getPublishedBusinesses } from "@/data/business";
import { Store, Eye, TrendingUp } from "lucide-react";

export default async function AdminDashboardPage() {
  const businesses = await getPublishedBusinesses(100);
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tổng quan</h2>
        <p className="text-muted-foreground mt-2">
          Chào mừng trở lại! Dưới đây là tình hình hoạt động của danh bạ.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Tổng doanh nghiệp</h3>
            <Store className="size-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{businesses.length}</div>
            <p className="text-xs text-muted-foreground">+2 trong tháng này</p>
          </div>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Lượt xem (Tháng)</h3>
            <Eye className="size-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">12,450</div>
            <p className="text-xs text-muted-foreground">+19% so với tháng trước</p>
          </div>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Tỷ lệ chuyển đổi</h3>
            <TrendingUp className="size-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">4.2%</div>
            <p className="text-xs text-muted-foreground">Click gọi điện / chỉ đường</p>
          </div>
        </div>
      </div>
    </div>
  );
}
