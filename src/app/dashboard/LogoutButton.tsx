"use client";

import { createClient } from "@/utils/supabase/client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <button 
      onClick={handleLogout}
      className="px-4 py-2 bg-gold text-ink font-medium rounded-lg flex items-center justify-center gap-2 w-full hover:bg-gold-soft transition-colors"
    >
      <LogOut className="size-4" /> Đăng xuất tài khoản này
    </button>
  );
}
