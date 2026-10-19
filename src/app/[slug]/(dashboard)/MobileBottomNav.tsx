"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LayoutDashboard, Store, Ticket, CalendarDays, Sparkles } from "lucide-react";
import { isFnBCategory } from "@/types/party";

export default function MobileBottomNav({ slug, categorySlug }: { slug: string; categorySlug?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');
  const isFnB = isFnBCategory(categorySlug);

  const links = [
    { href: `/${slug}/dashboard`, label: "Tổng quan", icon: LayoutDashboard },
    { href: `/${slug}/leads`, label: "Khách đặt", icon: CalendarDays },
    { href: `/${slug}/deals`, label: "Ưu đãi", icon: Ticket },
    ...(isFnB
      ? [{ href: `/${slug}/profile?tab=party`, label: "Nhận Tiệc", icon: Sparkles }]
      : []),
    { href: `/${slug}/profile`, label: "Gian hàng", icon: Store },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 border-t bg-background shadow-[0_-2px_10px_rgba(0,0,0,0.05)] md:hidden">
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
            className={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${
              isActive
                ? "text-gold font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className={`size-5 ${isActive ? "fill-gold/20" : ""}`} /> 
            <span className="text-[10px] font-medium truncate w-full text-center px-0.5">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
