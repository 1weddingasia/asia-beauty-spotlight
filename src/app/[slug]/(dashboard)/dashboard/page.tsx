import { createClient } from "@/utils/supabase/server";
import { Store, Eye, TrendingUp, Sparkles, Users, Ticket, ArrowUpRight, CalendarDays } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DashboardPrintQR from "./DashboardPrintQR";
import { headers } from "next/headers";
import { getSiteConfig } from "@/config/site-config";

export default async function BusinessDashboardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const h = await headers();
  const siteConfig = getSiteConfig(h.get('host') || '');

  const { data: business } = await supabase
    .from("businesses")
    .select("*, plans(name)")
    .eq("slug", slug)
    .eq("owner_id", user?.id)
    .single();

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <Store className="size-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Chưa có gian hàng nào được liên kết</h2>
        <p className="text-muted-foreground">
          Vui lòng liên hệ với Ban quản trị {siteConfig.brand} để được cấp quyền sở hữu doanh nghiệp của bạn.
        </p>
      </div>
    );
  }

  // --- REAL ANALYTICS from business_leads ---
  const now = new Date();
  const todayDayOfMonth = now.getDate();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  // Exclusive end: ngày mai 00:00 → đảm bảo bao gồm hết hôm nay
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), todayDayOfMonth + 1).toISOString();
  // Clamp ngày tháng trước để tránh tràn (VD: 31/03 → tháng 2 chỉ có 28 ngày)
  const prevMonthLastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  const clampedDay = Math.min(todayDayOfMonth, prevMonthLastDay);
  const firstDayPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  // Exclusive end: ngày clampedDay+1 của tháng trước → bao gồm hết ngày clampedDay
  const endOfSameDayPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, clampedDay + 1).toISOString();

  const [leadsAllResult, leadsMonthResult, dealsResult, prevMonthResult, bookingsResult, membershipResult] = await Promise.all([
    // Tổng leads từ trước đến nay
    supabase
      .from("business_leads")
      .select("id", { count: "exact", head: true })
      .eq("business_id", business.id),
    // Leads từ đầu tháng đến hết hôm nay
    supabase
      .from("business_leads")
      .select("id", { count: "exact", head: true })
      .eq("business_id", business.id)
      .gte("created_at", firstDayOfMonth)
      .lt("created_at", endOfToday),
    // Top deals: dùng RPC để GROUP BY chính xác trên DB, không bị giới hạn bởi limit client-side
    supabase.rpc("get_top_deals_for_business", { p_business_id: business.id, p_limit: 3 }),
    // Cùng số ngày đã trôi qua nhưng của tháng trước (exclusive end để symmetric)
    supabase
      .from("business_leads")
      .select("id", { count: "exact", head: true })
      .eq("business_id", business.id)
      .gte("created_at", firstDayPrevMonth)
      .lt("created_at", endOfSameDayPrevMonth),
    // Tổng số Bookings
    supabase
      .from("business_leads")
      .select("id", { count: "exact", head: true })
      .eq("business_id", business.id)
      .ilike("notes", "%Lịch hẹn:%"),
    // Gói thành viên thật từ database
    supabase
      .from("memberships")
      .select("id, status, starts_at, expires_at, plan_id, plans(id, code, name, plan_type, tier, price_yearly)")
      .eq("business_id", business.id)
      .order("expires_at", { ascending: false }),
  ]);

  const totalLeads = leadsAllResult.error ? 0 : (leadsAllResult.count ?? 0);
  const monthLeads = leadsMonthResult.error ? 0 : (leadsMonthResult.count ?? 0);
  const prevMonthLeads = prevMonthResult.error ? null : (prevMonthResult.count ?? null);
  const totalBookings = bookingsResult.error ? 0 : (bookingsResult.count ?? 0);
  const totalPromos = Math.max(0, totalLeads - totalBookings);

  // Top 3 deals phổ biến nhất – tổng hợp chính xác từ DB via RPC
  const topDeals: [string, number][] = dealsResult.error
    ? []
    : (dealsResult.data ?? []).map(
        (r: { deal_name: string; lead_count: number }) => [r.deal_name, Number(r.lead_count)]
      );

  // Tăng trưởng so cùng khoảng ngày tháng trước (month-to-date vs same period last month)
  const growthPct = prevMonthLeads && prevMonthLeads > 0
    ? Math.round(((monthLeads - prevMonthLeads) / prevMonthLeads) * 100)
    : null;

  // Tính toán 2 gói thành viên độc lập từ Database
  const allMemberships = (membershipResult.data as any[]) || [];
  const dealMem = allMemberships.find((m: any) => m.plans?.plan_type === 'deal' || m.plans?.name?.includes('Ưu Đãi'));
  const partyMem = allMemberships.find((m: any) => m.plans?.plan_type === 'party' || m.plans?.name?.includes('Tiệc'));

  // 1. Trạng thái Trang Ưu Đãi
  const dealExpiry = dealMem?.expires_at ? new Date(dealMem.expires_at) : new Date(new Date(business.created_at || now).getTime() + 30 * 24 * 60 * 60 * 1000);
  const dealMsLeft = dealExpiry.getTime() - now.getTime();
  const dealDaysLeft = Math.max(0, Math.ceil(dealMsLeft / (1000 * 60 * 60 * 24)));
  const dealActive = dealMem?.status === 'active' && dealMsLeft > 0;
  const dealExpired = dealMsLeft <= 0;

  // 2. Trạng thái Trang Đặt Tiệc
  const partyExpiry = partyMem?.expires_at ? new Date(partyMem.expires_at) : null;
  const partyMsLeft = partyExpiry ? partyExpiry.getTime() - now.getTime() : 0;
  const partyDaysLeft = partyExpiry ? Math.max(0, Math.ceil(partyMsLeft / (1000 * 60 * 60 * 24))) : 0;
  const partyActive = partyMem?.status === 'active' && partyMsLeft > 0;
  const partyIsVip = partyActive && partyMem?.plans?.tier === 'vip';

  const activeCount = (dealActive ? 1 : 0) + (partyActive ? 1 : 0);

  return (
    <div className="space-y-8 select-none">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Xin chào, {business.name}!</h2>
        <p className="text-muted-foreground mt-2">
          Theo dõi hiệu quả hoạt động kinh doanh và trạng thái gói thành viên của các trang.
        </p>
      </div>

      {/* THẺ TRẠNG THÁI 2 GÓI THÀNH VIÊN ĐỘC LẬP TỪ DATABASE */}
      <div className={`rounded-2xl border p-6 shadow-sm transition-all relative overflow-hidden ${
        activeCount === 2
          ? 'bg-gradient-to-r from-emerald-950/20 via-card to-card border-emerald-500/40'
          : activeCount === 1
          ? 'bg-gradient-to-r from-blue-950/20 via-card to-card border-blue-500/40'
          : 'bg-gradient-to-r from-amber-950/15 via-gold/5 to-card border-gold/40'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                activeCount === 2 
                  ? 'bg-emerald-500/20 text-emerald-700 border border-emerald-500/30'
                  : activeCount === 1 
                  ? 'bg-blue-500/20 text-blue-700 border border-blue-500/30'
                  : 'bg-amber-500/20 text-amber-800 border border-amber-500/30'
              }`}>
                <Sparkles className="size-3.5" />
                {activeCount > 0 ? `Đang kích hoạt: ${activeCount} / 2 gói thành viên` : 'Đang dùng thử 30 ngày (0 / 2 gói)'}
              </span>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
                Doanh nghiệp: {business.name}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Quản lý độc lập 2 dòng sản phẩm: Trang Ưu Đãi quanh năm & Trang Nhận Tiệc trên Bản Đồ Phố Tiệc.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button asChild className="bg-gold text-ink font-bold hover:brightness-105 shadow-md">
              <Link href={`/${business.slug}/upgrade`}>
                <span>{activeCount < 2 ? 'Kích hoạt thêm gói ↗' : 'Quản lý & Gia hạn ↗'}</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* 2 Khung trạng thái chi tiết của 2 loại trang */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Card 1: Trang Ưu Đãi */}
          <div className={`p-4 rounded-xl border ${dealActive ? 'bg-emerald-50/60 border-emerald-200' : dealExpired ? 'bg-rose-50/60 border-rose-200' : 'bg-amber-50/60 border-amber-200'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                <Store className="size-4 text-amber-600" /> Trang Ưu Đãi ({business.slug})
              </span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                dealActive ? 'bg-emerald-200 text-emerald-800' : dealExpired ? 'bg-rose-200 text-rose-800' : 'bg-amber-200 text-amber-800'
              }`}>
                {dealActive ? 'Chính thức' : dealExpired ? 'Đã hết hạn' : 'Dùng thử 30N'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              Hạn dùng: <strong className="text-slate-900">{dealExpiry.toLocaleDateString('vi-VN')}</strong> ({dealDaysLeft > 0 ? `Còn ${dealDaysLeft} ngày` : 'Hết hạn'}).
            </p>
            <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Gói: {dealMem?.plans?.name || 'Gói Trang Ưu Đãi Chuẩn'}</span>
              <Link href={`/${business.slug}`} target="_blank" className="text-amber-700 font-bold hover:underline">
                Xem trang ↗
              </Link>
            </div>
          </div>

          {/* Card 2: Trang Đặt Tiệc */}
          <div className={`p-4 rounded-xl border ${partyActive ? 'bg-blue-50/60 border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                <Sparkles className="size-4 text-blue-600" /> Trang Đặt Tiệc ({business.slug}/tiec)
              </span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                partyIsVip ? 'bg-amber-200 text-amber-800' : partyActive ? 'bg-blue-200 text-blue-800' : 'bg-slate-200 text-slate-600'
              }`}>
                {partyIsVip ? '🔥 VIP Neon Bản Đồ' : partyActive ? 'Chính thức' : 'Chưa kích hoạt'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              {partyActive && partyExpiry ? (
                <>Hạn dùng: <strong className="text-slate-900">{partyExpiry.toLocaleDateString('vi-VN')}</strong> (Còn {partyDaysLeft} ngày).</>
              ) : (
                <span className="text-slate-400">Chưa kích hoạt hiển thị trên Bản Đồ Tiệc Tất Niên.</span>
              )}
            </p>
            <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">
                Gói: {partyActive ? (partyMem?.plans?.name || 'Gói Trang Đặt Tiệc') : 'Chưa đăng ký'}
              </span>
              <Link href={`/${business.slug}/tiec`} target="_blank" className="text-blue-700 font-bold hover:underline">
                Xem sảnh tiệc ↗
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Top Deals + Quick Links */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top deals */}
        <div className="rounded-xl border bg-card p-6 shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Ticket className="size-4 text-gold" /> Báo cáo Top Ưu Đãi
            </h3>
            <Link href={`/${business.slug}/deals`} className="text-xs text-gold hover:underline">Quản lý &rarr;</Link>
          </div>
          {topDeals.length > 0 ? (
            <div className="space-y-3">
              {topDeals.map(([dealName, count], i) => (
                <div key={dealName} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}.</span>
                    <span className="text-sm truncate max-w-[200px]">{dealName}</span>
                  </div>
                  <span className="text-xs font-semibold bg-gold/10 text-gold px-2 py-0.5 rounded-full">
                    {count} khách
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Chưa có khách nào đăng ký. Hãy tạo ưu đãi hấp dẫn!
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border bg-card p-6 shadow">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <Eye className="size-4 text-gold" /> Thao tác nhanh
          </h3>
          <div className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href={`/${business.slug}/customers`}>→ Xem Danh bạ Khách hàng</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href={`/${business.slug}/deals`}>→ Tạo / Sửa Ưu đãi</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href={`/${business.slug}/profile`}>→ Cập nhật thông tin Gian hàng</Link>
            </Button>
            {business.slug && (
              <Button asChild className="w-full justify-start bg-gold/10 text-gold border border-gold/30 hover:bg-gold/20">
                <Link href={`/${business.slug}`} target="_blank">→ Xem Trang Ưu Đãi của bạn ↗</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* Tổng lượt đăng ký */}
        <Link href={`/${business.slug}/customers`} className="rounded-xl border bg-card text-card-foreground shadow p-6 flex flex-col justify-between hover:border-gold/50 hover:bg-gold/5 transition group cursor-pointer">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium group-hover:text-gold transition">Tổng Khách Hàng</h3>
            <Users className="size-4 text-muted-foreground group-hover:text-gold transition" />
          </div>
          <div>
            <div className="text-3xl font-bold group-hover:text-gold transition">{totalLeads}</div>
            <p className="text-xs text-muted-foreground mt-1">Tổng lượt khách trong hệ thống</p>
          </div>
        </Link>

        {/* Số Booking */}
        <Link href={`/${business.slug}/leads`} className="rounded-xl border bg-card text-card-foreground shadow p-6 flex flex-col justify-between hover:border-blue-500/50 hover:bg-blue-50 transition group cursor-pointer">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium group-hover:text-blue-600 transition">Số Booking Lịch</h3>
            <CalendarDays className="size-4 text-muted-foreground group-hover:text-blue-600 transition" />
          </div>
          <div>
            <div className="text-3xl font-bold group-hover:text-blue-600 transition">{totalBookings}</div>
            <p className="text-xs text-muted-foreground mt-1">Lượt đặt lịch giữ chỗ</p>
          </div>
        </Link>

        {/* Số Lượt Nhận Ưu Đãi */}
        <Link href={`/${business.slug}/leads`} className="rounded-xl border bg-card text-card-foreground shadow p-6 flex flex-col justify-between hover:border-orange-500/50 hover:bg-orange-50 transition group cursor-pointer">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium group-hover:text-orange-600 transition">Lượt Nhận Ưu Đãi</h3>
            <Ticket className="size-4 text-muted-foreground group-hover:text-orange-600 transition" />
          </div>
          <div>
            <div className="text-3xl font-bold group-hover:text-orange-600 transition">{totalPromos}</div>
            <p className="text-xs text-muted-foreground mt-1">Lượt khách nhận mã KM</p>
          </div>
        </Link>

        {/* Lượt Xem Trang */}
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6 flex flex-col justify-between hover:border-emerald-500/50 hover:bg-emerald-50 transition group cursor-pointer">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium group-hover:text-emerald-600 transition">Lượt Xem Trang</h3>
            <Eye className="size-4 text-muted-foreground group-hover:text-emerald-600 transition" />
          </div>
          <div>
            <div className="text-3xl font-bold group-hover:text-emerald-600 transition">
              {(business.page_views || 0) + (business.random_views || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Lượt truy cập gian hàng</p>
          </div>
        </div>

        {/* Lượt đăng ký tháng này */}
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6 flex flex-col justify-between">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Khách Tháng Này</h3>
            <TrendingUp className="size-4 text-muted-foreground" />
          </div>
          <div>
            <div className="text-3xl font-bold">{monthLeads}</div>
            {growthPct !== null ? (
              <p className={`text-xs mt-1 font-semibold flex items-center gap-1 ${
                growthPct >= 0 ? "text-green-600" : "text-red-500"
              }`}>
                <ArrowUpRight className={`size-3 ${growthPct < 0 ? "rotate-180" : ""}`} />
                {growthPct >= 0 ? "+" : ""}{growthPct}% so với tháng trước
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">Tháng đầu tiên</p>
            )}
          </div>
        </div>

        {/* Gói hiện tại */}
        <div className="rounded-xl border border-gold/50 bg-gradient-to-br from-gold/10 to-transparent text-card-foreground shadow p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Gói hiện tại</h3>
            <Sparkles className="size-4 text-gold" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gold uppercase">
              {business.plan_tier === 'premium' ? 'PREMIUM' : 'FREE'}
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              {business.plan_tier === 'premium' ? 'Đang kích hoạt' : 'Gói cơ bản'}
            </p>
            {business.plan_tier !== 'premium' ? (
              <Button asChild size="sm" className="w-full bg-gold text-ink hover:bg-gold/90">
                <Link href={`/${business.slug}/upgrade`}>Nâng cấp Gói</Link>
              </Button>
            ) : (
              <Button size="sm" variant="outline" className="w-full border-gold text-gold cursor-default" tabIndex={-1}>
                Gói đã được đăng ký
              </Button>
            )}
          </div>
        </div>
      </div>

      <DashboardPrintQR business={business} />

      {/* AI Chatbot Power Tips */}
      <div className="mt-8 rounded-xl border border-gold/30 bg-gradient-to-r from-gold/10 via-background to-gold/5 shadow-sm p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles className="size-24 text-gold" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="size-5 text-gold" />
            <h3 className="font-bold text-lg text-gold">Quyền Năng Quản Trị Bằng AI Chatbot</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4 max-w-3xl">
            Bạn có biết? Ngoài việc dùng trang Dashboard này, bạn có thể <b>sửa giá, thêm dịch vụ, hoặc đổi hình ảnh</b> bằng cách ra lệnh trực tiếp cho <b>Chatbot AI</b> ngay trên trang cửa hàng của bạn!
          </p>
          
          <div className="bg-background rounded-lg p-4 border shadow-inner max-w-2xl mb-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Mã bảo mật (Passcode) của bạn là: </span>
              <span className="font-bold text-rose-600 text-lg tracking-widest bg-rose-50 px-2 py-1 rounded select-all" title="Bôi đen để copy">
                {business.chatbot_passcode ? business.chatbot_passcode : "CHƯA CẤP"}
              </span>
            </div>
            {!business.chatbot_passcode && (
              <p className="text-xs text-red-500 mt-2">Vui lòng liên hệ Admin để được cấp mã Passcode sử dụng tính năng này.</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Cách sử dụng:</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Vào {business.slug ? <Link href={`/${business.slug}`} target="_blank" className="text-gold hover:underline">Trang Cửa Hàng</Link> : <span className="text-gold">Trang Cửa Hàng</span>} của bạn.</li>
                <li>Mở khung Chatbot ở góc phải bên dưới.</li>
                <li>Nhập Passcode vào khung chat (hoặc bấm nút "Vào Quản Trị").</li>
                <li>Chatbot sẽ chuyển sang chế độ Admin.</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Câu lệnh mẫu:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><i className="text-foreground/80">"Giảm giá combo Sản phẩm A xuống 99k"</i></li>
                <li><i className="text-foreground/80">"Thêm dịch vụ Gói VIP giá 250k"</i></li>
                <li><i className="text-foreground/80">"Thay banner thành link http..."</i></li>
                <li><i className="text-foreground/80">"Đổi mã bảo mật của tôi thành 8888"</i></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
