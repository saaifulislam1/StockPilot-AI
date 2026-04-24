import Link from "next/link";

import { Icon } from "@/components/app-icons";
import { ShellCard } from "@/components/research/ui";

export function AuthShell({
  eyebrow,
  title,
  body,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  body: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-xl">
      <ShellCard className="overflow-hidden">
        <div className="border-b border-[var(--border)] bg-[var(--surface-raised)] px-6 py-6 sm:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-[var(--muted)]">
            <Icon name="brand" className="h-4 w-4" />
            StockPilot
          </Link>
          <p className="mt-4 text-xs font-medium uppercase tracking-[0.24em] text-[var(--muted)]">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text)]">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{body}</p>
        </div>
        <div className="px-6 py-6 sm:px-8">{children}</div>
        {footer ? (
          <div className="border-t border-[var(--border)] px-6 py-5 sm:px-8">{footer}</div>
        ) : null}
      </ShellCard>
    </div>
  );
}
