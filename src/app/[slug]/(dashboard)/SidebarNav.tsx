"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LayoutDashboard, Store, Ticket, Users, Settings, CalendarDays, Sparkles } from "lucide-react";
import { isFnBCategory } from "@/types/party";

export default function SidebarNav({ slug, categorySlug }: { slug: string; categorySlug?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');
  const isFnB = isFnBCategory(categorySlug);

  const links = [
    { href: `/${slug}/dashboard`, label: "Tổng quan", icon: LayoutDashboard },
    { href: `/${slug}/upgrade`, label: "Gói Thành Viên & Kích Hoạt", icon: Sparkles },
    { href: `/${slug}/leads`, label: "Danh Sách Khách Đặt", icon: CalendarDays },
    { href: `/${slug}/deals`, label: "Quản lý Ưu đãi & Dịch vụ", icon: Ticket },
    ...(isFnB ? [{ href: `/${slug}/profile?tab=party`, label: "Quản lý Trang Nhận Tiệc 🎉", icon: Sparkles }] : []),
    { href: `/${slug}/customers`, label: "Danh bạ Khách hàng", icon: Users },
    { href: `/${slug}/profile`, label: "Trang Ưu Đãi (Gian hàng)", icon: Store },
    { href: `/${slug}/settings`, label: "Cài đặt Tài khoản", icon: Settings },
  ];

  return (
    <nav className="flex-1 space-y-1 px-4">
      {links.map((link) => {
        const [linkPath, linkQuery] = link.href.split('?');
        const linkTab = linkQuery ? new URLSearchParams(linkQuery).get('tab') : null;
        const isProfileRoot = link.href === `/${slug}/profile`;
        const isActive = linkTab
          ? pathname === linkPath && currentTab === linkTab
          : isProfileRoot
            ? pathname === linkPath && !currentTab
            : pathname === linkPath || pathname.startsWith(`${linkPath}/`);

        const Icon = link.icon;
        
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-gold/10 text-gold font-bold"
                : "hover:bg-muted text-foreground"
            }`}
          >
            <Icon className={`size-4 ${isActive ? "text-gold" : ""}`} /> 
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
