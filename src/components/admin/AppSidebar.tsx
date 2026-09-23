"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Store, Users, Settings, LogOut, Package, FileText, MapPin, List, CreditCard, MessageCircle, Zap } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Tổng quan", url: "/admin", icon: LayoutDashboard },
  { title: "Doanh nghiệp", url: "/admin/businesses", icon: Store },
  { title: "⚡ AI Importer", url: "/admin/ai-import", icon: Zap },
  { title: "Danh mục Ngành", url: "/admin/categories", icon: List },
  { title: "Khu vực / Địa điểm", url: "/admin/locations", icon: MapPin },
  { title: "Gói thành viên", url: "/admin/plans", icon: Package },
  { title: "Thành viên", url: "/admin/users", icon: Users },
  { title: "Bài viết (Blog)", url: "/admin/blogs", icon: FileText },
  { title: "Liên hệ & Tin nhắn", url: "/admin/contacts", icon: MessageCircle },
  { title: "Giao dịch", url: "/admin/transactions", icon: CreditCard },
  { title: "Cài đặt", url: "/admin/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex font-display items-center gap-2 text-xl font-bold tracking-widest text-ink">
          1BEAUTY.ASIA
        </div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Admin Portal</p>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Quản lý</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.url || (item.url !== '/admin' && pathname.startsWith(item.url))}
                    onClick={() => setOpenMobile(false)}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <form action="/auth/signout" method="post" className="w-full">
                <button type="submit" className="flex w-full items-center gap-2 text-red-500">
                  <LogOut className="size-4" />
                  <span>Đăng xuất</span>
                </button>
              </form>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
