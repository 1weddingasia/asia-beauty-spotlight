"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Store, Ticket, Users, Settings } from "lucide-react";

export default function SidebarNav({ slug }: { slug: string }) {
  const pathname = usePathname();

  const links = [
    { href: `/${slug}/dashboard`, label: "Tổng quan", icon: LayoutDashboard },
    { href: `/${slug}/profile`, label: "Chỉnh sửa Gian hàng", icon: Store },
    { href: `/${slug}/deals`, label: "Quản lý Ưu đãi (Deals)", icon: Ticket },
    { href: `/${slug}/customers`, label: "Danh bạ Khách hàng", icon: Users },
    { href: `/${slug}/leads`, label: "Booking & Nhận ưu đãi", icon: CalendarDays },
    { href: `/${slug}/settings`, label: "Cài đặt Tài khoản", icon: Settings },
  ];

  return (
    <nav className="flex-1 space-y-1 px-4">
      {links.map((link) => {
        // Kiểm tra xem pathname hiện tại có bằng chính xác link.href không, hoặc là sub-path của nó
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
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
