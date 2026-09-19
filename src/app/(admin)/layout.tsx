import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin/AppSidebar";

export const metadata = {
  title: "Admin Portal | 1Beauty.Asia",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 overflow-x-hidden bg-background">
        <div className="flex items-center gap-2 border-b p-4">
          <SidebarTrigger />
          <h1 className="text-sm font-medium tracking-wide">Trạm điều khiển</h1>
        </div>
        <div className="p-6">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
