"use client";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { categories } from "@/data/directory";

const navLinks = [
  { to: "/", label: "Trang chủ" },
  { to: "/tim-kiem", label: "Danh bạ" },
  { to: "/uu-dai", label: "Ưu đãi" },
  { to: "/lien-he", label: "Liên hệ" },
] as const;

export function SiteHeader({ solid = false }: { solid?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <header
      className={
        solid
          ? "sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur"
          : "absolute top-0 right-0 left-0 z-50"
      }
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-baseline gap-1">
          <span className={`font-display text-2xl ${solid ? "text-foreground" : "text-background"}`}>
            1Beauty
          </span>
          <span className="text-gradient-gold font-display text-2xl">.Asia</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
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

        <button
          onClick={() => setOpen(!open)}
          aria-label="Menu"
          className={`md:hidden ${solid ? "text-foreground" : "text-background"}`}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
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
  return (
    <footer className="border-t border-border bg-ink text-background/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-2xl text-background">
            1Beauty<span className="text-gradient-gold">.Asia</span>
          </p>
          <p className="mt-4 max-w-sm text-sm">
            Danh bạ chuyên ngành làm đẹp, kết nối khách hàng với các spa, thẩm mỹ viện, salon và học viện uy tín trên khắp châu Á.
          </p>
        </div>
        <div>
          <p className="text-xs tracking-[0.25em] text-gold uppercase">Danh mục</p>
          <ul className="mt-4 space-y-2 text-sm">
            {categories.slice(0, 5).map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/danh-muc/${c.slug}`}
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
            <li>contact@1beauty.asia</li>
            <li>+84 28 7300 1988</li>
            <li>TP. Hồ Chí Minh, Việt Nam</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-background/10 py-6 text-center text-xs">
        © {new Date().getFullYear()} 1Beauty.Asia. Mọi quyền được bảo lưu.
      </div>
    </footer>
  );
}

export function PageShell({ children, solidHeader = true }: { children: ReactNode; solidHeader?: boolean }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader solid={solidHeader} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
