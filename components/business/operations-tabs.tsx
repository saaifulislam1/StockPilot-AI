"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon } from "@/components/app-icons";

const links = [
  { href: "/operations", label: "Overview", icon: "chart" as const },
  { href: "/operations/products", label: "Products", icon: "store" as const },
  { href: "/operations/inventory", label: "Inventory", icon: "box" as const },
  { href: "/operations/sales", label: "Sales", icon: "bookmark" as const },
  { href: "/operations/purchases", label: "Purchases", icon: "save" as const },
];

export function OperationsTabs() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => {
        const isActive =
          pathname === link.href ||
          (link.href !== "/operations" && pathname.startsWith(`${link.href}/`));

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
    </div>
  );
}
