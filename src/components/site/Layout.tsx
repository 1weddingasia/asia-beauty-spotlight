"use client";
import Link from "next/link";
import { Menu, X, LogIn, LayoutDashboard, ChevronDown, Tag, MapPin, Building2, Home, Gift, LayoutGrid, Phone, Sparkles, CreditCard } from "lucide-react";
import { useState, useEffect, useRef, type ReactNode } from "react";
import { createClient } from "@/utils/supabase/client";
import { getSiteConfig, type SiteConfig } from "@/config/site-config";
import { useAppLanguage } from "@/lib/use-app-language";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";

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
  const { t } = useAppLanguage();
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
            {t.nav.viewAll}
          </Link>
          {items.length === 0 ? (
            <p className="px-4 py-2 text-xs text-muted-foreground">{t.nav.noData}</p>
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
  const { t } = useAppLanguage();
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
        <div className="flex items-center gap-3 md:hidden">
          {authLoading ? (
            <div className="size-8 rounded-full border border-gold/30 border-t-gold animate-spin" />
          ) : user ? (
            <Link
              href="/dashboard"
              aria-label={t.nav.dashboard}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${solid ? "border-gold/50 text-gold hover:bg-gold/10" : "border-white/50 text-white hover:bg-white/10"}`}
            >
              <LayoutDashboard className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t.nav.dashboard}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              aria-label={t.nav.login}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${solid ? "border-gold/50 text-gold hover:bg-gold/10" : "border-white/50 text-white hover:bg-white/10"}`}
            >
              <LogIn className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t.nav.login}</span>
            </Link>
          )}
          <button
            onClick={() => { setOpen(!open); setMobileMenuSection("main"); }}
            aria-label={t.nav.menu}
            className={solid ? "text-foreground" : "text-background"}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        {/* Desktop nav — Ưu đãi, Phố tiệc, Expo, Danh mục, Địa điểm, Ngôn ngữ, Đăng nhập */}
        <div className="hidden items-center gap-5 md:flex">
          <nav className="flex items-center gap-5">
            <Link
              href="/uu-dai"
              className={`text-xs tracking-[0.18em] uppercase transition-colors hover:text-gold ${solid ? "text-foreground" : "text-background/85"}`}
            >
              {t.nav.deals}
            </Link>
            <Link
              href="/pho-tiec"
              className="text-xs tracking-[0.18em] uppercase font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1 transition-colors"
            >
              <Sparkles className="size-3.5" />
              <span>{t.nav.party}</span>
            </Link>
            <Link
              href="/expo"
              className="text-xs tracking-[0.18em] uppercase font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1 transition-colors"
            >
              <Sparkles className="size-3.5" />
              <span>{t.nav.expo}</span>
            </Link>
            {/* Danh Mục dropdown */}
            <NavDropdown
              label={t.nav.categories}
              href="/danh-muc"
              items={navData.categories}
              icon={Tag}
              solid={solid}
            />
            {/* Địa Điểm dropdown */}
            <NavDropdown
              label={t.nav.locations}
              href="/dia-diem"
              items={navData.locations}
              icon={MapPin}
              solid={solid}
            />
          </nav>

          {/* Language Switcher 4 flags */}
          <LanguageSwitcher solid={solid} />

          {authLoading ? (
            <div className="w-32 h-8 rounded-full bg-muted/20 animate-pulse" />
          ) : user ? (
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full border transition-all hover:scale-105 active:scale-95 ${solid ? "border-gold/30 text-gold bg-gold/5 hover:bg-gold/10 hover:border-gold" : "border-white/30 text-white bg-white/5 hover:bg-white/20 hover:border-white"}`}
            >
              <LayoutDashboard className="size-4" />
              {t.nav.manageBooth}
            </Link>
          ) : (
            <Link
              href="/login"
              className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full border transition-all hover:scale-105 active:scale-95 ${solid ? "border-gold/30 text-gold bg-gold/5 hover:bg-gold/10 hover:border-gold" : "border-white/30 text-white bg-white/5 hover:bg-white/20 hover:border-white"}`}
            >
              <LogIn className="size-4" />
              {t.nav.login}
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t border-border bg-background px-4 py-3 md:hidden">
          {/* Mobile Language Switcher Selector */}
          <LanguageSwitcher variant="mobile" className="mb-3" />

          {mobileMenuSection === "main" && (
            <nav className="space-y-1">
              <Link href="/uu-dai" onClick={() => setOpen(false)} className="flex items-center gap-2.5 py-2.5 px-3 text-sm rounded-lg hover:bg-muted font-medium">
                <Gift className="size-4 text-amber-500" />
                <span>{t.nav.deals}</span>
              </Link>
              <Link href="/pho-tiec" onClick={() => setOpen(false)} className="flex items-center gap-2.5 py-2.5 px-3 text-sm rounded-lg hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                <Sparkles className="size-4 text-amber-500" />
                <span>{t.nav.party}</span>
              </Link>
              <Link href="/expo" onClick={() => setOpen(false)} className="flex items-center gap-2.5 py-2.5 px-3 text-sm rounded-lg hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                <Sparkles className="size-4 text-amber-500" />
                <span>{t.nav.expo}</span>
              </Link>
              <button
                onClick={() => setMobileMenuSection("categories")}
                className="w-full flex items-center justify-between py-2.5 px-3 text-sm rounded-lg hover:bg-muted font-medium"
              >
                <span className="flex items-center gap-2.5">
                  <LayoutGrid className="size-4 text-muted-foreground" />
                  <span>{t.nav.categories}</span>
                </span>
                <ChevronDown className="size-4" />
              </button>
              <button
                onClick={() => setMobileMenuSection("locations")}
                className="w-full flex items-center justify-between py-2.5 px-3 text-sm rounded-lg hover:bg-muted font-medium"
              >
                <span className="flex items-center gap-2.5">
                  <MapPin className="size-4 text-muted-foreground" />
                  <span>{t.nav.locations}</span>
                </span>
                <ChevronDown className="size-4" />
              </button>

              <div className="pt-2 mt-2 border-t border-border/60 space-y-1">
                <Link href="/bang-gia" onClick={() => setOpen(false)} className="flex items-center gap-2.5 py-2 px-3 text-xs text-muted-foreground hover:text-foreground">
                  <CreditCard className="size-3.5" />
                  <span>{t.nav.pricing}</span>
                </Link>
                <Link href="/lien-he" onClick={() => setOpen(false)} className="flex items-center gap-2.5 py-2 px-3 text-xs text-muted-foreground hover:text-foreground">
                  <Phone className="size-3.5" />
                  <span>{t.nav.contactSupport}</span>
                </Link>
                <Link href="/danh-cho-doanh-nghiep" onClick={() => setOpen(false)} className="flex items-center gap-2.5 py-2 px-3 text-xs text-gold hover:underline font-semibold">
                  <Building2 className="size-3.5" />
                  <span>{t.nav.forBusiness}</span>
                </Link>
              </div>
            </nav>
          )}

          {mobileMenuSection === "categories" && (
            <div>
              <button
                onClick={() => setMobileMenuSection("main")}
                className="flex items-center gap-2 py-2 text-sm text-muted-foreground mb-2"
              >
                ← {t.nav.back}
              </button>
              <Link href="/danh-muc" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm font-semibold text-gold rounded-lg hover:bg-gold/5 mb-1">
                {t.nav.viewAll} →
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
                ← {t.nav.back}
              </button>
              <Link href="/dia-diem" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm font-semibold text-gold rounded-lg hover:bg-gold/5 mb-1">
                {t.nav.viewAll} →
              </Link>
              {navData.locations.map((loc) => (
                <Link
                  key={loc.slug}
                  href={`/dia-diem/${loc.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 py-2.5 px-3 text-sm rounded-lg hover:bg-muted"
                >
                  <MapPin className="size-3.5 text-muted-foreground" />
                  <span>{loc.name}</span>
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
  const { t, lang } = useAppLanguage();
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
          <p className="mt-4 max-w-sm text-sm">
            {lang === 'vi' ? (siteConfig.description || t.footer.brandDesc) : t.footer.brandDesc}
          </p>
          <p className="mt-2 text-xs text-background/40">
            {t.footer.hotline}: {settings?.contact_phone || "0918 731 411"}
          </p>
          <div className="mt-4 pt-3 border-t border-background/10">
            <p className="text-[10px] uppercase tracking-wider text-background/50 mb-2 font-semibold">
              {lang === 'vi' ? 'Ngôn ngữ' : (lang === 'ko' ? '언어' : (lang === 'zh' ? '语言' : 'Language'))}
            </p>
            <LanguageSwitcher solid={false} />
          </div>
        </div>

        {/* Danh Mục */}
        <div>
          <p className="text-xs tracking-[0.25em] text-gold uppercase flex items-center gap-2 font-semibold">
            <Tag className="size-3.5" /> {t.footer.categories}
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
                {t.footer.viewAll}
              </Link>
            </li>
          </ul>
        </div>

        {/* Địa Điểm */}
        <div>
          <p className="text-xs tracking-[0.25em] text-gold uppercase flex items-center gap-2 font-semibold">
            <MapPin className="size-3.5" /> {t.footer.locations}
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {navData.locations.slice(0, 6).map((loc) => (
              <li key={loc.slug}>
                <Link href={`/dia-diem/${loc.slug}`} className="inline-flex items-center gap-1.5 transition-colors hover:text-gold">
                  <MapPin className="size-3 text-gold/60" />
                  <span>{loc.name}</span>
                </Link>
              </li>
            ))}
            <li>
              <Link href="/dia-diem" className="transition-colors hover:text-gold italic text-background/50">
                {t.footer.viewAll}
              </Link>
            </li>
          </ul>
        </div>

        {/* Dịch vụ & Đối tác */}
        <div>
          <p className="text-xs tracking-[0.25em] text-gold uppercase font-semibold">{t.footer.support}</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/bang-gia" className="transition-colors hover:text-gold flex items-center gap-1.5">
                <CreditCard className="size-3.5 text-gold/60" />
                <span>{t.nav.pricing}</span>
              </Link>
            </li>
            <li>
              <Link href="/danh-cho-doanh-nghiep" className="transition-colors hover:text-gold flex items-center gap-1.5">
                <Building2 className="size-3.5 text-gold/60" />
                <span>{t.nav.forBusiness}</span>
              </Link>
            </li>
            <li>
              <Link href="/pho-tiec" className="transition-colors hover:text-gold flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-amber-500" />
                <span>{t.nav.party}</span>
              </Link>
            </li>
            <li>
              <Link href="/expo" className="transition-colors hover:text-gold flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-amber-500" />
                <span>{t.nav.expo}</span>
              </Link>
            </li>
            <li>
              <Link href="/uu-dai" className="transition-colors hover:text-gold flex items-center gap-1.5">
                <Gift className="size-3.5 text-gold/60" />
                <span>{t.nav.deals}</span>
              </Link>
            </li>
            <li>
              <Link href="/lien-he" className="transition-colors hover:text-gold">
                {t.nav.contactSupport}: {settings?.contact_phone || "0918 731 411"}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-background/10 py-6 text-center text-xs">
        © {new Date().getFullYear()} {siteConfig.brand}. {t.footer.rightsReserved}
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
