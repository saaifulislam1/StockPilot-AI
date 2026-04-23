import Link from "next/link";

import { Icon } from "@/components/app-icons";
import {
  EmptyState,
  HeroPanel,
  MetricTile,
  ShellCard,
  formatCurrency,
  formatDateTime,
} from "@/components/research/ui";
import type { SavedResearchSummary } from "@/lib/research-store";

export function SavedProductsGrid({
  items,
}: {
  items: SavedResearchSummary[];
}) {
  return (
    <div className="space-y-6">
      <HeroPanel
        title="Saved products"
        body="Every saved research record lives here. Business owners can reopen a product in read mode, review the full research, and switch into edit mode when the market changes."
      >
        <div className="grid w-full max-w-[420px] gap-4 sm:grid-cols-2">
          <MetricTile
            label="Saved records"
            value={String(items.length)}
            hint="Researches stored in Neon."
          />
          <MetricTile
            label="Latest update"
            value={items[0] ? formatDateTime(items[0].updatedAt) : "—"}
            hint="Most recently edited research."
          />
        </div>
      </HeroPanel>

      {items.length === 0 ? (
        <EmptyState
          icon={<Icon name="list" />}
          title="No saved products yet"
          body="Create a new research, save it, and it will show up here as a reusable product record."
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <ShellCard key={item.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex rounded-full bg-[var(--accent-soft)] p-2 text-[var(--accent-strong)]">
                    <Icon name="store" />
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--text)]">
                    {item.productName || "Untitled product"}
                  </h2>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    {item.supplier || "No supplier saved"}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                  <span className="text-sm text-[var(--muted)]">Recommended sell</span>
                  <span className="font-semibold text-[var(--text)]">
                    {formatCurrency(item.recommendedSellPrice)}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                  <span className="text-sm text-[var(--muted)]">Competitors tracked</span>
                  <span className="font-semibold text-[var(--text)]">
                    {item.competitorCount}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                  <span className="text-sm text-[var(--muted)]">Last updated</span>
                  <span className="font-semibold text-[var(--text)]">
                    {formatDateTime(item.updatedAt)}
                  </span>
                </div>
              </div>

              <Link
                href={`/saved-products/${item.id}`}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--text)] px-4 py-2.5 text-sm font-medium text-[var(--bg)] transition hover:opacity-92"
              >
                Open research
                <Icon name="arrow-right" className="h-4 w-4" />
              </Link>
            </ShellCard>
          ))}
        </div>
      )}
    </div>
  );
}
