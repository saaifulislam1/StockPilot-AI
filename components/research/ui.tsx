import { Icon } from "@/components/app-icons";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(Math.round(Number.isFinite(value) ? value : 0));
}

export function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function getTone(status: string) {
  const lower = status.toLowerCase();

  if (lower.includes("error") || lower.includes("loss") || lower.includes("danger")) {
    return "border-rose-500/15 bg-rose-500/10 text-rose-700 dark:text-rose-300";
  }

  if (lower.includes("wait") || lower.includes("thin") || lower.includes("cautious")) {
    return "border-amber-500/15 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }

  if (lower.includes("need")) {
    return "border-amber-500/15 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }

  return "border-emerald-500/15 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
}

export function ShellCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:rounded-[2rem] ${className}`}
    >
      {children}
    </section>
  );
}

export function SectionCard({
  icon,
  eyebrow,
  title,
  body,
  children,
  action,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  body: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <ShellCard className="overflow-hidden">
      <div className="border-b border-[var(--border)] bg-[var(--surface)] px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="rounded-[1.25rem] bg-[var(--accent-soft)] p-3 text-[var(--accent-strong)] sm:rounded-2xl">
              {icon}
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.26em] text-[var(--muted)]">
                {eyebrow}
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--text)] sm:text-2xl">
                {title}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                {body}
              </p>
            </div>
          </div>
          {action}
        </div>
      </div>
      <div className="px-4 py-4 sm:px-6 sm:py-6">{children}</div>
    </ShellCard>
  );
}

export function HeroPanel({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <ShellCard className="overflow-hidden">
      <div className="bg-[var(--surface)] px-4 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.24em] text-[var(--accent-strong)]">
              <Icon name="spark" className="h-4 w-4" />
              Automated Research
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:mt-5 sm:text-base sm:leading-8">
              {body}
            </p>
          </div>
          {children}
        </div>
      </div>
    </ShellCard>
  );
}

export function MetricTile({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon?: React.ReactNode;
}) {
  return (
    <article className="rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface)] p-4 sm:rounded-[1.5rem] sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-[var(--muted)]">
          {label}
        </p>
        {icon ? (
          <span className="text-[var(--accent-strong)]">{icon}</span>
        ) : null}
      </div>
      <p className="mt-3 text-[2rem] font-semibold tracking-tight text-[var(--text)] sm:text-3xl">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{hint}</p>
    </article>
  );
}

export function EmptyState({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-strong)]">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[var(--text)]">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{body}</p>
    </div>
  );
}
