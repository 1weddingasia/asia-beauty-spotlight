"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { QuickPromoBuilderDialog } from "./QuickPromoBuilderDialog";

export function GlobalPromoFAB() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const role = session?.user?.user_metadata?.role;
      if (role === 'admin' || role === 'superadmin') {
        setIsAdmin(true);
      }
    };
    checkRole();
  }, [supabase.auth]);

  if (!isAdmin) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 md:bottom-10 md:left-10 z-[9999] flex items-center justify-center size-14 md:size-16 rounded-full bg-gradient-to-r from-gold to-amber-500 text-ink shadow-2xl hover:scale-105 transition-transform active:scale-95 group border-2 border-white/20"
        title="Tạo nhanh trang Ưu Đãi"
      >
        <Sparkles className="size-6 animate-pulse" />
        <span className="absolute left-full ml-4 bg-ink text-white px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
          Tạo Trang Ưu Đãi
        </span>
      </button>

      <QuickPromoBuilderDialog open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
