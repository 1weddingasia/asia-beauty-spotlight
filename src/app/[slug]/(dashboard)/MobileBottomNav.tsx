"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Store, Ticket, Users, Settings, CalendarDays } from "lucide-react";

export default function MobileBottomNav({ slug }: { slug: string }) {
  const pathname = usePathname();

  const links = [
    { href: `/${slug}/dashboard`, label: "Tổng quan", icon: LayoutDashboard },
    { href: `/${slug}/leads`, label: "Booking", icon: CalendarDays },
    { href: `/${slug}/deals`, label: "Ưu đãi", icon: Ticket },
    { href: `/${slug}/customers`, label: "Khách", icon: Users },
    { href: `/${slug}/profile`, label: "Gian hàng", icon: Store },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 border-t bg-background shadow-[0_-2px_10px_rgba(0,0,0,0.05)] md:hidden">
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
        const Icon = link.icon;
        
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${
              isActive
                ? "text-gold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className={`size-5 ${isActive ? "fill-gold/20" : ""}`} /> 
            <span className="text-[10px] font-medium truncate w-full text-center px-1">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
