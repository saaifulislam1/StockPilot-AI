import { OperationsTabs } from "@/components/business/operations-tabs";
import { ShellCard } from "@/components/research/ui";
import { requireUser } from "@/lib/auth";

export default async function OperationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser("/operations");

  return (
    <div className="space-y-6">
      <ShellCard className="p-4 sm:p-5">
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-[var(--muted)]">
            Operations workspace
          </p>
          <OperationsTabs />
        </div>
      </ShellCard>
      {children}
    </div>
  );
}
