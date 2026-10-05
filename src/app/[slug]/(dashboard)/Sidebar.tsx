"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Store, Ticket, Users, Settings, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Sidebar({ 
  slug, 
  businessName,
  businessStatus,
  planTier 
}: { 
  slug: string, 
  businessName: string,
  businessStatus: string,
  planTier?: string 
}) {
  const pathname = usePathname();

  const menuGroups = [
    {
      title: "QUẢN LÝ CHUNG",
      items: [
        { name: "Tổng quan", href: `/${slug}/dashboard`, icon: LayoutDashboard },
        { name: "Danh sách Khách (Leads)", href: `/${slug}/leads`, icon: Users },
      ]
    },
    {
      title: "NỘI DUNG & TIẾP THỊ",
      items: [
        { name: "Chỉnh sửa Gian hàng", href: `/${slug}/profile`, icon: Store },
        { name: "Quản lý Ưu đãi (Deals)", href: `/${slug}/deals`, icon: Ticket },
      ]
    },
    {
      title: "HỆ THỐNG",
      items: [
        { name: "Cài đặt Tài khoản", href: `/${slug}/settings`, icon: Settings },
      ]
    }
  ];

  return (
    <aside className="hidden w-64 flex-col border-r bg-card md:flex">
      <div className="p-6">
        <p className="text-sm font-medium text-muted-foreground">Khu vực quản lý</p>
        <h3 className="font-bold text-lg truncate mt-1" title={businessName}>
          {businessName}
        </h3>
      </div>
      <nav className="flex-1 space-y-6 px-4 pb-6 overflow-y-auto">
        {menuGroups.map((group, gIdx) => (
          <div key={gIdx}>
            <h4 className="mb-2 px-2 text-xs font-bold uppercase text-muted-foreground tracking-wider">
              {group.title}
            </h4>
            <div className="space-y-1">
              {group.items.map((item, iIdx) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={iIdx}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-gold/10 text-gold font-bold"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    <Icon className={`size-4 ${isActive ? "text-gold" : ""}`} /> 
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      
      <div className="p-4 mt-auto">
        {(() => {
          if (businessStatus === 'published' || businessStatus === 'active' || planTier === 'premium') {
            return (
              <div className="rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 p-4 border border-green-500/30">
                <h4 className="font-bold text-sm mb-1 flex items-center gap-1 text-green-700">
                  <Sparkles className="size-4" /> ✅ Đã kích hoạt
                </h4>
                <p className="text-xs text-muted-foreground">Trang ưu đãi của bạn đang hoạt động và hiển thị công khai.</p>
              </div>
            );
          }

          return (
            <div className="rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 p-4 border border-gold/30 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 transition-transform group-hover:scale-110 group-hover:rotate-12 pointer-events-none">
                <Sparkles className="w-12 h-12 text-gold" />
              </div>
              <h4 className="font-bold text-sm mb-1 flex items-center gap-1">
                <Sparkles className="size-4 text-gold" /> Trải nghiệm thử
              </h4>
              <p className="text-xs text-muted-foreground relative z-10 mb-3">
                Đăng ký gói dịch vụ chính thức để bật hiển thị công khai và nhận khách hàng.
              </p>
              <Button asChild size="sm" className="w-full bg-gold text-ink font-bold hover:bg-gold/90 text-xs h-8">
                <Link href={`/bang-gia`}>Đăng ký ngay</Link>
              </Button>
            </div>
          );
        })()}
      </div>
    </aside>
  );
}
