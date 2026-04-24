import Link from "next/link";

import { Icon } from "@/components/app-icons";
import { SiteNavLinks } from "@/components/site-nav-links";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { auth } from "@/lib/auth";

export async function SiteNavbar() {
  const session = await auth();
  const user = session?.user;
  const isSignedIn = Boolean(user?.id);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color:var(--surface-strong)]/90 shadow-[0_8px_26px_rgba(15,23,42,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-8 sm:py-4 lg:px-10">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] p-2 text-[var(--text)] shadow-[var(--shadow-soft)] sm:p-2.5">
            <Icon name="brand" className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--text)] sm:text-base">
              ProfitResearch
            </p>
            <p className="truncate text-xs text-[var(--muted)] sm:text-sm">
              Pricing Research Workspace
            </p>
          </div>
        </Link>

        <SiteNavLinks isSignedIn={isSignedIn} />

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {isSignedIn ? (
            <>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-[var(--text)]">
                  {user?.name ?? user?.email}
                </p>
                <p className="text-xs text-[var(--muted)]">{user?.email}</p>
              </div>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--text)] transition hover:border-[var(--accent)]"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--text)] px-4 py-2 text-sm font-medium text-[var(--bg)] transition hover:opacity-92"
              >
                Sign up
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
