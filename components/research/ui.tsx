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
    return "border-rose-500/15 bg-rose-500/10";
  }

  if (lower.includes("wait") || lower.includes("thin") || lower.includes("cautious")) {
    return "border-amber-500/15 bg-amber-500/10";
  }

  if (lower.includes("need")) {
    return "border-amber-500/15 bg-amber-500/10";
  }

  return "border-emerald-500/40 bg-emerald-500/14 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]";
}

export function getToneTextStyle(): React.CSSProperties {
  return { color: "var(--status-pill-text)" };
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
      className={`rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface-raised)] shadow-[var(--shadow-card)] sm:rounded-[2rem] ${className}`}
    >
      {children}
    </section>
  );
}

export function LoadingSpinner({
  className = "h-4 w-4",
}: {
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block animate-spin rounded-full border-2 border-current border-r-transparent ${className}`}
    />
  );
}

export function PageLoadingState({
  title = "Loading",
  body = "Please wait while the page data loads.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <ShellCard className="p-8 sm:p-10">
      <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--accent-strong)] shadow-[var(--shadow-soft)]">
          <LoadingSpinner className="h-6 w-6" />
        </div>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight text-[var(--text)]">
          {title}
        </h2>
        <p className="mt-2 max-w-md text-sm leading-7 text-[var(--muted)]">{body}</p>
      </div>
    </ShellCard>
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
      <div className="border-b border-[var(--border)] bg-[linear-gradient(180deg,var(--surface-raised)_0%,var(--surface)_100%)] px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface)] p-3 text-[var(--accent-strong)] shadow-[var(--shadow-soft)] sm:rounded-2xl">
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
      <div className="bg-[linear-gradient(180deg,var(--surface-raised)_0%,var(--surface)_100%)] px-4 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.24em] text-[var(--accent-strong)] shadow-[var(--shadow-soft)]">
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
  hint: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <article className="rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)] sm:rounded-[1.5rem] sm:p-5">
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
      <div className="mt-2 text-sm leading-6 text-[var(--muted)]">{hint}</div>
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
    <div className="rounded-[1.75rem] border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-10 text-center shadow-[var(--shadow-soft)]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-raised)] text-[var(--accent-strong)]">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[var(--text)]">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{body}</p>
    </div>
  );
}
