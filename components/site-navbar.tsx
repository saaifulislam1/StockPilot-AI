"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon } from "@/components/app-icons";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  { href: "/", label: "Home", icon: "brand" as const },
  { href: "/new-research", label: "New Research", icon: "spark" as const },
  { href: "/saved-products", label: "Saved Products", icon: "list" as const },
];

export function SiteNavbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color:var(--surface-strong)]/90 shadow-[0_8px_26px_rgba(15,23,42,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-8 sm:py-4 lg:px-10">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] p-2 text-[var(--text)] shadow-[var(--shadow-soft)] sm:p-2.5">
            <Icon name="brand" className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--text)] sm:text-base">
              StockPilot
            </p>
            <p className="truncate text-xs text-[var(--muted)] sm:text-sm">
              Product Research
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {links.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "border-[var(--border-strong)] bg-[var(--surface-raised)] text-[var(--text)] shadow-[var(--shadow-soft)]"
                    : "border-transparent text-[var(--muted)] hover:border-[var(--border)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
                }`}
              >
                <Icon name={link.icon} className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
