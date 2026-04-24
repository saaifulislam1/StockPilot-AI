"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon } from "@/components/app-icons";

const links = [
  { href: "/", label: "Home", icon: "brand" as const },
  { href: "/new-research", label: "New Research", icon: "spark" as const },
  { href: "/saved-products", label: "Saved Products", icon: "list" as const },
];

export function SiteNavLinks({
  isSignedIn,
}: {
  isSignedIn: boolean;
}) {
  const pathname = usePathname();
  const visibleLinks = links.filter((link) =>
    isSignedIn ? true : link.href !== "/saved-products",
  );

  return (
    <nav className="hidden items-center gap-2 md:flex">
      {visibleLinks.map((link) => {
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
  );
}
