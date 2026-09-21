import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin/AppSidebar";

export const metadata = {
  title: "Admin Portal | 1Beauty.Asia",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // --- AUTH GUARD ---
  // Server-side kiểm tra session. Nếu chưa đăng nhập → redirect /login
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Kiểm tra role — chỉ admin/superadmin mới vào được /admin
  const role = user.user_metadata?.role;
  if (role === "owner") {
    // Owner (chủ doanh nghiệp) không có quyền truy cập admin panel
    redirect("/dashboard");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 overflow-x-hidden bg-background">
        <div className="flex items-center gap-2 border-b p-4">
          <SidebarTrigger />
          <h1 className="text-sm font-medium tracking-wide">Trạm điều khiển</h1>
        </div>
        <div className="p-6">{children}</div>
      </main>
    </SidebarProvider>
  );
}
