"use client";
import Link from "next/link";
import { Menu, X, LogIn, LayoutDashboard } from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";
import { createClient } from "@/utils/supabase/client";

const navLinks = [
  { to: "/", label: "Trang chủ" },
  { to: "/uu-dai", label: "Khám phá Ưu đãi" },
  { to: "/gioi-thieu", label: "Giới thiệu" },
  { to: "/lien-he", label: "Liên hệ" },
] as const;

// FIX #7: Module-level cache để tránh re-fetch mỗi lần render
// Cache tồn tại trong phiên trình duyệt hiện tại
let _settingsCache: any = null;
let _settingsCacheTime = 0;
const SETTINGS_TTL = 5 * 60 * 1000; // 5 phút

let _categoriesCache: any[] | null = null;
let _categoriesCacheTime = 0;

async function getSettings() {
  const now = Date.now();
  if (_settingsCache && now - _settingsCacheTime < SETTINGS_TTL) {
    return _settingsCache;
  }
  const supabase = createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "global")
    .single();
  _settingsCache = data?.value || null;
  _settingsCacheTime = now;
  return _settingsCache;
}

async function getFooterCategories() {
  const now = Date.now();
  if (_categoriesCache && now - _categoriesCacheTime < SETTINGS_TTL) {
    return _categoriesCache;
  }
  const supabase = createClient();
  const { data } = await supabase
    .from("directory_categories")
    .select("*")
    .limit(5);
  _categoriesCache = data || [];
  _categoriesCacheTime = now;
  return _categoriesCache;
}

export function SiteHeader({ solid = false }: { solid?: boolean }) {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    getSettings().then(setSettings);
    const supabase = createClient();
    supabase.auth.getUser()
      .then(({ data }) => {
        setUser(data?.user ?? null);
      })
      .catch((err) => {
        console.error("Auth error:", err);
        setUser(null);
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, []);

  return (
    <header
      className={
        solid
          ? "sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur"
          : "absolute top-0 right-0 left-0 z-50"
      }
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2">
          {settings?.logo_url ? (
            <img src={settings.logo_url} alt={settings?.site_name || "1Beauty.Asia"} className="h-8 w-auto object-contain" />
          ) : (
            <>
              <span className={`font-display text-2xl ${solid ? "text-foreground" : "text-background"}`}>
                1Beauty
              </span>
              <span className="text-gradient-gold font-display text-2xl">.Asia</span>
            </>
          )}
        </Link>

        <div className="flex items-center gap-4 md:hidden">
          {authLoading ? (
            <div className="size-8 rounded-full border border-gold/30 border-t-gold animate-spin"></div>
          ) : user ? (
            <Link 
              href="/dashboard" 
              aria-label="Bảng điều khiển"
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${solid ? "border-gold/50 text-gold hover:bg-gold/10" : "border-white/50 text-white hover:bg-white/10"}`}
            >
              <LayoutDashboard className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Quản lý</span>
            </Link>
          ) : (
            <Link 
              href="/login" 
              aria-label="Đăng nhập"
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${solid ? "border-gold/50 text-gold hover:bg-gold/10" : "border-white/50 text-white hover:bg-white/10"}`}
            >
              <LogIn className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Đăng nhập</span>
            </Link>
          )}
          <button
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            className={`${solid ? "text-foreground" : "text-background"}`}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        <div className="hidden items-center gap-6 md:flex">
          <nav className="flex items-center gap-8">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                href={l.to}
                className={`text-xs tracking-[0.18em] uppercase transition-colors hover:text-gold ${
                  solid ? "text-foreground" : "text-background/85"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          
          {authLoading ? (
            <div className="w-32 h-8 rounded-full bg-muted/20 animate-pulse"></div>
          ) : user ? (
            <Link 
              href="/dashboard" 
              className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full border transition-all hover:scale-105 active:scale-95 ${solid ? "border-gold/30 text-gold bg-gold/5 hover:bg-gold/10 hover:border-gold" : "border-white/30 text-white bg-white/5 hover:bg-white/20 hover:border-white"}`}
            >
              <LayoutDashboard className="size-4" />
              Quản lý Gian hàng
            </Link>
          ) : (
            <Link 
              href="/login" 
              className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full border transition-all hover:scale-105 active:scale-95 ${solid ? "border-gold/30 text-gold bg-gold/5 hover:bg-gold/10 hover:border-gold" : "border-white/30 text-white bg-white/5 hover:bg-white/20 hover:border-white"}`}
            >
              <LogIn className="size-4" />
              Đăng nhập / Đăng ký
            </Link>
          )}
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-6 py-4 md:hidden">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              href={l.to}
              onClick={() => setOpen(false)}
              className="block py-2.5 text-sm"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  const [settings, setSettings] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    getSettings().then(setSettings);
    getFooterCategories().then(setCategories);
  }, []);

  return (
    <footer className="border-t border-border bg-ink text-background/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          {settings?.logo_url ? (
            <img src={settings.logo_url} alt={settings?.site_name || "1Beauty.Asia"} className="h-10 w-auto object-contain brightness-0 invert" />
          ) : (
            <p className="font-display text-2xl text-background">
              {settings?.site_name?.split(".")[0] || "1Beauty"}<span className="text-gradient-gold">.{settings?.site_name?.split(".")[1] || "Asia"}</span>
            </p>
          )}
          <p className="mt-4 max-w-sm text-sm">
            Danh bạ chuyên ngành làm đẹp, kết nối khách hàng với các spa, thẩm mỹ viện, salon và học viện uy tín trên khắp Việt Nam.
          </p>
        </div>
        <div>
          <p className="text-xs tracking-[0.25em] text-gold uppercase">Danh mục</p>
          <ul className="mt-4 space-y-2 text-sm">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/tim-kiem?category=${c.slug}`}
                  className="transition-colors hover:text-gold"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs tracking-[0.25em] text-gold uppercase">Liên hệ</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>{settings?.contact_phone || "0918 731 411"}</li>
            <li>
              <Link href="/lien-he" className="transition-colors hover:text-gold">
                Gửi tin nhắn
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-background/10 py-6 text-center text-xs">
        © {new Date().getFullYear()} {settings?.site_name || "1Beauty.Asia"}. Mọi quyền được bảo lưu.
      </div>
    </footer>
  );
}

export function PageShell({ children, solidHeader = true, className }: { children: ReactNode; solidHeader?: boolean; className?: string }) {
  return (
    <div className={`flex min-h-screen flex-col ${className || ""}`}>
      <SiteHeader solid={solidHeader} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
