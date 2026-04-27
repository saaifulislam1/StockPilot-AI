"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Icon } from "@/components/app-icons";
import { SignOutButton } from "@/components/sign-out-button";
import { getVisibleSiteNavLinks } from "@/components/site-nav-links";

type SiteMobileMenuProps = {
  isSignedIn: boolean;
  userName?: string | null;
  userEmail?: string | null;
};

export function SiteMobileMenu({
  isSignedIn,
  userName,
  userEmail,
}: SiteMobileMenuProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const visibleLinks = getVisibleSiteNavLinks(isSignedIn);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-[var(--shadow-soft)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-raised)]"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-site-navigation"
      >
        <Icon name={isOpen ? "x" : "menu"} className="h-5 w-5" />
      </button>

      {isOpen ? (
        <div
          id="mobile-site-navigation"
          className="absolute left-4 right-4 top-full mt-2 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] p-2 shadow-[0_18px_46px_rgba(15,23,42,0.18)]"
        >
          <nav className="grid gap-1" aria-label="Mobile navigation">
            {visibleLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-[var(--surface-raised)] text-[var(--text)] shadow-[var(--shadow-soft)]"
                      : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
                  }`}
                >
                  <Icon name={link.icon} className="h-4 w-4 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-2 border-t border-[var(--border)] pt-2">
            {isSignedIn ? (
              <div className="space-y-2">
                <div className="rounded-xl bg-[var(--surface)] px-3 py-2.5">
                  <p className="truncate text-sm font-medium text-[var(--text)]">
                    {userName ?? userEmail}
                  </p>
                  {userEmail ? (
                    <p className="mt-0.5 truncate text-xs text-[var(--muted)]">
                      {userEmail}
                    </p>
                  ) : null}
                </div>
                <SignOutButton />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--text)] transition hover:border-[var(--accent)]"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--text)] px-4 py-2 text-sm font-medium text-[var(--bg)] transition hover:opacity-92"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
