import { getPublishedBusinesses } from "@/data/business";
import { Store, Eye, TrendingUp, Users, FileText } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const businesses = await getPublishedBusinesses(100);
  
  // Lấy số lượng người dùng (khách hàng & admin)
  const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  
  // Lấy số lượng bài viết
  const { count: blogCount } = await supabase.from('blogs').select('*', { count: 'exact', head: true });
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tổng quan</h2>
        <p className="text-muted-foreground mt-2">
          Chào mừng trở lại! Dưới đây là tình hình hoạt động của danh bạ.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6 flex flex-col justify-between">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Tổng doanh nghiệp</h3>
            <Store className="size-4 text-muted-foreground" />
          </div>
          <div>
            <div className="text-2xl font-bold">{businesses.length}</div>
            <p className="text-xs text-muted-foreground">Đã xuất bản</p>
          </div>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6 flex flex-col justify-between">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Thành viên</h3>
            <Users className="size-4 text-muted-foreground" />
          </div>
          <div>
            <div className="text-2xl font-bold">{userCount || 0}</div>
            <p className="text-xs text-muted-foreground">Khách hàng & Quản trị</p>
          </div>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6 flex flex-col justify-between">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Bài viết (SEO)</h3>
            <FileText className="size-4 text-muted-foreground" />
          </div>
          <div>
            <div className="text-2xl font-bold">{blogCount || 0}</div>
            <p className="text-xs text-muted-foreground">Trên Blog</p>
          </div>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6 flex flex-col justify-between">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Lượt xem (Tháng)</h3>
            <Eye className="size-4 text-muted-foreground" />
          </div>
          <div>
            <div className="text-2xl font-bold">12,450</div>
            <p className="text-xs text-muted-foreground">+19% so với tháng trước</p>
          </div>
        </div>
      </div>
    </div>
  );
}
