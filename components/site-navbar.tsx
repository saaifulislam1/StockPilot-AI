"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon } from "@/components/app-icons";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  { href: "/", label: "New Research", icon: "spark" as const },
  { href: "/saved-products", label: "Saved Products", icon: "list" as const },
];

export function SiteNavbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color:var(--surface-strong)]/94 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--text)]">
            <Icon name="brand" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--text)]">StockPilot</p>
            <p className="text-xs text-[var(--muted)]">Product Research</p>
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
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-[var(--text)] text-[var(--bg)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
                }`}
              >
                <Icon name={link.icon} className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
