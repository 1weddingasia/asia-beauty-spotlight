const fs = require('fs');
let code = fs.readFileSync('src/components/site/Layout.tsx', 'utf8');

const regex = /<header[\s\S]*?<\/header>/;
const newHeader = \<header
      className={
        solid
          ? "sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur"
          : "absolute top-0 right-0 left-0 z-50"
      }
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-baseline gap-1">
          <span className={\\\ont-display text-2xl \\\\}>
            1Beauty
          </span>
          <span className="text-gradient-gold font-display text-2xl">.Asia</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              href={l.to}
              className={\\\	ext-xs tracking-[0.18em] uppercase transition-colors hover:text-gold \\\\}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={() => setOpen(!open)}
          aria-label="Menu"
          className={\\\md:hidden \\\\}
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
    </header>\;

code = code.replace(regex, newHeader);
fs.writeFileSync('src/components/site/Layout.tsx', code, 'utf8');
