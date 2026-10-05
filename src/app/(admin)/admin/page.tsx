import { Store, Bell, Users, TrendingUp, AlertTriangle, ExternalLink } from "lucide-react";
import { createAdminClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const supabase = await createAdminClient();

  // Tổng tiệm theo từng trạng thái
  const { data: bizStats } = await supabase
    .from('businesses')
    .select('status');

  const totalBiz = bizStats?.length || 0;
  const activeBiz = bizStats?.filter(b => b.status === 'published' || b.status === 'active').length || 0;
  const trialBiz = bizStats?.filter(b => b.status === 'trial').length || 0;
  const suspendedBiz = bizStats?.filter(b => b.status === 'suspended').length || 0;

  // Tổng đơn hàng toàn mạng (hôm nay + tổng cộng)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: todayLeads } = await supabase
    .from('business_leads')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString());

  const { count: totalLeads } = await supabase
    .from('business_leads')
    .select('*', { count: 'exact', head: true });

  // Top tiệm nhiều đơn nhất (7 ngày gần nhất)
  const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentLeads } = await supabase
    .from('business_leads')
    .select('business_id, businesses(name, slug)')
    .gte('created_at', last7Days)
    .limit(200);

  // Group by business
  const bizLeadMap: Record<string, { name: string, slug: string, count: number }> = {};
  (recentLeads || []).forEach((lead: any) => {
    const biz = lead.businesses;
    if (!biz) return;
    if (!bizLeadMap[lead.business_id]) {
      bizLeadMap[lead.business_id] = { name: biz.name, slug: biz.slug, count: 0 };
    }
    bizLeadMap[lead.business_id].count++;
  });

  const topBiz = Object.values(bizLeadMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Giám sát Toàn Mạng 1Beauty</h2>
        <p className="text-muted-foreground mt-2">
          Dashboard thực chiến — theo dõi đơn hàng & tình trạng các tiệm đang chạy.
        </p>
      </div>

      {/* Thống kê nhanh */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-card shadow p-6">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Đơn hôm nay</h3>
            <Bell className="size-4 text-gold" />
          </div>
          <div className="text-3xl font-black text-gold">{todayLeads || 0}</div>
          <p className="text-xs text-muted-foreground mt-1">Tổng cộng: {totalLeads || 0} đơn</p>
        </div>

        <div className="rounded-xl border bg-card shadow p-6">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Tiệm hoạt động</h3>
            <Store className="size-4 text-green-600" />
          </div>
          <div className="text-3xl font-black text-green-600">{activeBiz}</div>
          <p className="text-xs text-muted-foreground mt-1">Tổng {totalBiz} tiệm trên hệ thống</p>
        </div>

        <div className="rounded-xl border bg-card shadow p-6 border-blue-100">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Đang dùng thử</h3>
            <TrendingUp className="size-4 text-blue-500" />
          </div>
          <div className="text-3xl font-black text-blue-600">{trialBiz}</div>
          <p className="text-xs text-blue-400 mt-1">Cần chốt → kích hoạt 500k</p>
        </div>

        <div className={`rounded-xl border shadow p-6 ${suspendedBiz > 0 ? 'bg-red-50 border-red-200' : 'bg-card'}`}>
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Tạm ngưng</h3>
            <AlertTriangle className={`size-4 ${suspendedBiz > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
          </div>
          <div className={`text-3xl font-black ${suspendedBiz > 0 ? 'text-red-600' : 'text-muted-foreground'}`}>{suspendedBiz}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {suspendedBiz > 0 ? '⚠️ Cần liên hệ gia hạn!' : 'Không có tiệm nào bị ngưng'}
          </p>
        </div>
      </div>

      {/* Top tiệm 7 ngày qua */}
      {topBiz.length > 0 && (
        <div className="rounded-xl border bg-card shadow p-6">
          <h3 className="font-bold text-lg mb-1">🏆 Top Tiệm Nhiều Đơn Nhất (7 ngày qua)</h3>
          <p className="text-xs text-muted-foreground mb-4">Tiệm chạy hiệu quả — ưu tiên hỗ trợ và gia hạn sớm.</p>
          <div className="space-y-3">
            {topBiz.map((biz, idx) => (
              <div key={biz.slug} className="flex items-center justify-between p-3 bg-muted/40 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`size-8 rounded-full flex items-center justify-center text-sm font-black ${idx === 0 ? 'bg-gold text-ink' : 'bg-muted text-muted-foreground'}`}>
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{biz.name}</p>
                    <p className="text-xs text-muted-foreground">/{biz.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black text-gold text-lg">{biz.count} đơn</span>
                  <Link href={`/${biz.slug}`} target="_blank">
                    <ExternalLink className="size-4 text-muted-foreground hover:text-gold" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="flex gap-3 flex-wrap">
        <Link href="/admin/businesses" className="inline-flex items-center gap-2 bg-gold text-ink font-bold px-6 py-3 rounded-xl hover:bg-gold/90 transition-colors">
          <Store className="size-4" /> Quản lý Tiệm
        </Link>
        <Link href="/admin/leads" className="inline-flex items-center gap-2 bg-green-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-green-700 transition-colors">
          <Bell className="size-4" /> Xem Tất Cả Đơn
        </Link>
      </div>
    </div>
  );
}
