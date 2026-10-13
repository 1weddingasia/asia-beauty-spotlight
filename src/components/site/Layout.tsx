"use client";
import Link from "next/link";
import { Menu, X, LogIn, LayoutDashboard, ChevronDown, Tag, MapPin } from "lucide-react";
import { useState, useEffect, useRef, type ReactNode } from "react";
import { createClient } from "@/utils/supabase/client";
import { getSiteConfig, type SiteConfig } from "@/config/site-config";

// ── Module-level cache (5 phút) ──────────────────────────────────────────────
let _settingsCache: any = null;
let _settingsCacheTime = 0;
const SETTINGS_TTL = 5 * 60 * 1000;

let _navCache: { categories: any[]; locations: any[] } | null = null;
let _navCacheTime = 0;

async function getSettings() {
  const now = Date.now();
  if (_settingsCache && now - _settingsCacheTime < SETTINGS_TTL) return _settingsCache;
  const supabase = createClient();
  const { data } = await supabase.from("site_settings").select("value").eq("key", "global").single();
  _settingsCache = data?.value || null;
  _settingsCacheTime = now;
  return _settingsCache;
}

async function getNavData() {
  const now = Date.now();
  if (_navCache && now - _navCacheTime < SETTINGS_TTL) return _navCache;
  const supabase = createClient();
  const [{ data: cats }, { data: locs }] = await Promise.all([
    supabase.from("directory_categories").select("id, name, slug, icon").order("sort_order", { ascending: true }).order("name", { ascending: true }).limit(20),
    supabase.from("directory_locations").select("id, name, slug").order("sort_order", { ascending: true }).order("name", { ascending: true }).limit(20),
  ]);
  _navCache = { categories: cats || [], locations: locs || [] };
  _navCacheTime = now;
  return _navCache;
}

// ── useSiteConfig ─────────────────────────────────────────────────────────────
export function useSiteConfig(): SiteConfig {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  useEffect(() => {
    setConfig(getSiteConfig(window.location.hostname));
  }, []);
  return config ?? getSiteConfig("");
}

// ── Dropdown component ────────────────────────────────────────────────────────
function NavDropdown({
  label,
  href,
  items,
  icon: Icon,
  solid,
}: {
  label: string;
  href: string;
  items: { name: string; slug: string; icon?: string | null }[];
  icon: React.ElementType;
  solid: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1 text-xs tracking-[0.18em] uppercase transition-colors hover:text-gold ${
          solid ? "text-foreground" : "text-background/85"
        }`}
      >
        {label}
        <ChevronDown className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 bg-background border border-border rounded-xl shadow-xl py-2 z-[200] animate-in zoom-in-95 fade-in duration-150">
          {/* View all link */}
          <Link
            href={href}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gold hover:bg-gold/5 border-b border-border mb-1"
          >
            <Icon className="size-4" />
            Xem tất cả
          </Link>
          {items.length === 0 ? (
            <p className="px-4 py-2 text-xs text-muted-foreground">Chưa có dữ liệu</p>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {items.map((item) => (
                <Link
                  key={item.slug}
                  href={`${href}/${item.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted hover:text-gold transition-colors"
                >
                  {item.icon && <span>{item.icon}</span>}
                  <span className="line-clamp-1">{item.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── SiteHeader ────────────────────────────────────────────────────────────────
export function SiteHeader({ solid = false }: { solid?: boolean }) {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [navData, setNavData] = useState<{ categories: any[]; locations: any[] }>({ categories: [], locations: [] });
  const [mobileMenuSection, setMobileMenuSection] = useState<"main" | "categories" | "locations">("main");
  const siteConfig = useSiteConfig();

  useEffect(() => {
    getSettings().then(setSettings);
    getNavData().then(setNavData);
    const supabase = createClient();
    supabase.auth
      .getUser()
      .then(({ data }) => setUser(data?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setAuthLoading(false));
  }, []);

  const logoNode = siteConfig.logoImageUrl ? (
    <img src={siteConfig.logoImageUrl} alt={siteConfig.brand} className="h-10 md:h-12 w-auto object-contain" />
  ) : settings?.logo_url ? (
    <img src={settings.logo_url} alt={siteConfig.brand} className="h-10 md:h-12 w-auto object-contain" />
  ) : (
    <>
      <span className={`font-display text-2xl ${solid ? "text-foreground" : "text-background"}`}>
        {siteConfig.logoText}
      </span>
      <span className="text-gradient-gold font-display text-2xl">{siteConfig.logoDomain}</span>
    </>
  );

  return (
    <header
      className={
        solid
          ? "sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur"
          : "absolute top-0 right-0 left-0 z-50"
      }
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          {logoNode}
        </Link>

        {/* Mobile nav trigger */}
        <div className="flex items-center gap-4 md:hidden">
          {authLoading ? (
            <div className="size-8 rounded-full border border-gold/30 border-t-gold animate-spin" />
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
            onClick={() => { setOpen(!open); setMobileMenuSection("main"); }}
            aria-label="Menu"
            className={solid ? "text-foreground" : "text-background"}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className={`text-xs tracking-[0.18em] uppercase transition-colors hover:text-gold ${solid ? "text-foreground" : "text-background/85"}`}
            >
              Trang chủ
            </Link>
            <Link
              href="/uu-dai"
              className={`text-xs tracking-[0.18em] uppercase transition-colors hover:text-gold ${solid ? "text-foreground" : "text-background/85"}`}
            >
              Ưu đãi
            </Link>
            {/* Danh Mục dropdown */}
            <NavDropdown
              label="Danh Mục"
              href="/danh-muc"
              items={navData.categories}
              icon={Tag}
              solid={solid}
            />
            {/* Địa Điểm dropdown */}
            <NavDropdown
              label="Địa Điểm"
              href="/dia-diem"
              items={navData.locations}
              icon={MapPin}
              solid={solid}
            />
            <Link
              href="/lien-he"
              className={`text-xs tracking-[0.18em] uppercase transition-colors hover:text-gold ${solid ? "text-foreground" : "text-background/85"}`}
            >
              Liên hệ
            </Link>
          </nav>

          {authLoading ? (
            <div className="w-32 h-8 rounded-full bg-muted/20 animate-pulse" />
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

      {/* Mobile Menu */}
      {open && (
        <div className="border-t border-border bg-background px-4 py-3 md:hidden">
          {mobileMenuSection === "main" && (
            <nav className="space-y-1">
              <Link href="/" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm rounded-lg hover:bg-muted">
                🏠 Trang chủ
              </Link>
              <Link href="/uu-dai" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm rounded-lg hover:bg-muted">
                🎁 Khám phá Ưu đãi
              </Link>
              <button
                onClick={() => setMobileMenuSection("categories")}
                className="w-full flex items-center justify-between py-2.5 px-3 text-sm rounded-lg hover:bg-muted"
              >
                <span>📋 Danh Mục Ngành</span>
                <ChevronDown className="size-4" />
              </button>
              <button
                onClick={() => setMobileMenuSection("locations")}
                className="w-full flex items-center justify-between py-2.5 px-3 text-sm rounded-lg hover:bg-muted"
              >
                <span>📍 Địa Điểm</span>
                <ChevronDown className="size-4" />
              </button>
              <Link href="/lien-he" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm rounded-lg hover:bg-muted">
                📞 Liên hệ
              </Link>
            </nav>
          )}

          {mobileMenuSection === "categories" && (
            <div>
              <button
                onClick={() => setMobileMenuSection("main")}
                className="flex items-center gap-2 py-2 text-sm text-muted-foreground mb-2"
              >
                ← Quay lại
              </button>
              <Link href="/danh-muc" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm font-semibold text-gold rounded-lg hover:bg-gold/5 mb-1">
                Xem tất cả danh mục →
              </Link>
              {navData.categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/danh-muc/${cat.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 py-2.5 px-3 text-sm rounded-lg hover:bg-muted"
                >
                  {cat.icon && <span>{cat.icon}</span>}
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          {mobileMenuSection === "locations" && (
            <div>
              <button
                onClick={() => setMobileMenuSection("main")}
                className="flex items-center gap-2 py-2 text-sm text-muted-foreground mb-2"
              >
                ← Quay lại
              </button>
              <Link href="/dia-diem" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm font-semibold text-gold rounded-lg hover:bg-gold/5 mb-1">
                Xem tất cả địa điểm →
              </Link>
              {navData.locations.map((loc) => (
                <Link
                  key={loc.slug}
                  href={`/dia-diem/${loc.slug}`}
                  onClick={() => setOpen(false)}
                  className="block py-2.5 px-3 text-sm rounded-lg hover:bg-muted"
                >
                  📍 {loc.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
}

// ── SiteFooter ────────────────────────────────────────────────────────────────
export function SiteFooter() {
  const [settings, setSettings] = useState<any>(null);
  const [navData, setNavData] = useState<{ categories: any[]; locations: any[] }>({ categories: [], locations: [] });
  const siteConfig = useSiteConfig();

  useEffect(() => {
    getSettings().then(setSettings);
    getNavData().then(setNavData);
  }, []);

  return (
    <footer className="border-t border-border bg-ink text-background/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-4">
        {/* Brand */}
        <div className="md:col-span-1">
          {siteConfig.logoImageUrl ? (
            <img src={siteConfig.logoImageUrl} alt={siteConfig.brand} className="h-10 w-auto object-contain" />
          ) : settings?.logo_url ? (
            <img src={settings.logo_url} alt={siteConfig.brand} className="h-10 w-auto object-contain brightness-0 invert" />
          ) : (
            <p className="font-display text-2xl text-background">
              {siteConfig.logoText}
              <span className="text-gradient-gold">{siteConfig.logoDomain}</span>
            </p>
          )}
          <p className="mt-4 max-w-sm text-sm">{siteConfig.description}</p>
          <p className="mt-4 text-xs text-background/40">
            {settings?.contact_phone || "0918 731 411"}
          </p>
        </div>

        {/* Danh Mục */}
        <div>
          <p className="text-xs tracking-[0.25em] text-gold uppercase flex items-center gap-2">
            <Tag className="size-3.5" /> Danh Mục
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {navData.categories.slice(0, 6).map((cat) => (
              <li key={cat.slug}>
                <Link href={`/danh-muc/${cat.slug}`} className="transition-colors hover:text-gold flex items-center gap-1.5">
                  {cat.icon && <span className="text-xs">{cat.icon}</span>}
                  {cat.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/danh-muc" className="transition-colors hover:text-gold italic text-background/50">
                Xem tất cả →
              </Link>
            </li>
          </ul>
        </div>

        {/* Địa Điểm */}
        <div>
          <p className="text-xs tracking-[0.25em] text-gold uppercase flex items-center gap-2">
            <MapPin className="size-3.5" /> Địa Điểm
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {navData.locations.slice(0, 6).map((loc) => (
              <li key={loc.slug}>
                <Link href={`/dia-diem/${loc.slug}`} className="transition-colors hover:text-gold">
                  📍 {loc.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/dia-diem" className="transition-colors hover:text-gold italic text-background/50">
                Xem tất cả →
              </Link>
            </li>
          </ul>
        </div>

        {/* Liên hệ */}
        <div>
          <p className="text-xs tracking-[0.25em] text-gold uppercase">Liên hệ</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>{settings?.contact_phone || "0918 731 411"}</li>
            <li>
              <Link href="/lien-he" className="transition-colors hover:text-gold">
                Gửi tin nhắn
              </Link>
            </li>
            <li>
              <Link href="/gioi-thieu" className="transition-colors hover:text-gold">
                Giới thiệu
              </Link>
            </li>
            <li>
              <Link href="/uu-dai" className="transition-colors hover:text-gold">
                Khám phá Ưu đãi
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-background/10 py-6 text-center text-xs">
        © {new Date().getFullYear()} {siteConfig.brand}. Mọi quyền được bảo lưu.
      </div>
    </footer>
  );
}

// ── PageShell ─────────────────────────────────────────────────────────────────
export function PageShell({
  children,
  solidHeader = true,
  className,
}: {
  children: ReactNode;
  solidHeader?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex min-h-screen flex-col ${className || ""}`}>
      <SiteHeader solid={solidHeader} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
