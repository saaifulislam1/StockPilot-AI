import {
  type Channel,
  type CompetitorEntry,
  getAdjustedPrice,
} from "@/lib/product-research";

import {
  EmptyState,
  SectionCard,
  formatCurrency,
} from "@/components/research/ui";
import { Icon } from "@/components/app-icons";

type CompetitorSectionProps = {
  competitors: CompetitorEntry[];
  editable: boolean;
  deliveryCostPerOrder: number;
  onAddCompetitor: () => void;
  onRemoveCompetitor: (index: number) => void;
  onUpdateCompetitor: (
    index: number,
    key: keyof CompetitorEntry,
    value: string | number | boolean,
  ) => void;
};

const channels: Channel[] = ["Website", "Facebook", "Marketplace", "Retail"];

export function CompetitorSection({
  competitors,
  editable,
  deliveryCostPerOrder,
  onAddCompetitor,
  onRemoveCompetitor,
  onUpdateCompetitor,
}: CompetitorSectionProps) {
  const visibleRows = editable ? competitors : competitors.filter((item) => item.competitor.trim());

  return (
    <SectionCard
      icon={<Icon name="chart" />}
      eyebrow="Market Inputs"
      title="Track competitor pricing"
      body="Add the competitors the owner has found in market research. Delivery-adjusted pricing is calculated automatically."
      action={
        editable ? (
          <button
            type="button"
            onClick={onAddCompetitor}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-medium text-[var(--text)] transition hover:border-[var(--accent)]"
          >
            <Icon name="plus" className="h-4 w-4" />
            Add row
          </button>
        ) : null
      }
    >
      {visibleRows.length === 0 ? (
        <EmptyState
          icon={<Icon name="chart" />}
          title="No competitors added yet"
          body="When the owner starts adding competitor data, this section becomes the live market tracker for pricing decisions."
        />
      ) : editable ? (
        <div className="space-y-3">
          <div className="hidden grid-cols-[0.9fr_1.05fr_0.85fr_0.8fr_0.9fr_0.95fr_0.48fr] gap-3 px-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)] lg:grid">
            <span>Date</span>
            <span>Competitor</span>
            <span>Channel</span>
            <span>Listed Price</span>
            <span>Delivery Fee</span>
            <span>Notes</span>
            <span>Action</span>
          </div>
          {competitors.map((entry, index) => (
            <div
              key={entry.id ?? index}
              className="grid gap-3 rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface)] p-4 lg:grid-cols-[0.9fr_1.05fr_0.85fr_0.8fr_0.9fr_0.95fr_0.48fr]"
            >
              <input
                type="date"
                className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2 text-sm text-[var(--text)]"
                value={entry.date}
                onChange={(event) => onUpdateCompetitor(index, "date", event.target.value)}
              />
              <input
                className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2 text-sm text-[var(--text)]"
                value={entry.competitor}
                placeholder="Rokomari"
                onChange={(event) =>
                  onUpdateCompetitor(index, "competitor", event.target.value)
                }
              />
              <select
                className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2 text-sm text-[var(--text)]"
                value={entry.channel}
                onChange={(event) =>
                  onUpdateCompetitor(index, "channel", event.target.value as Channel)
                }
              >
                {channels.map((channel) => (
                  <option key={channel} value={channel}>
                    {channel}
                  </option>
                ))}
              </select>
              <input
                type="number"
                className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2 text-sm text-[var(--text)]"
                value={entry.listedPrice === 0 ? "" : entry.listedPrice}
                placeholder="1760"
                onChange={(event) =>
                  onUpdateCompetitor(index, "listedPrice", Number(event.target.value))
                }
              />
              <input
                type="number"
                className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2 text-sm text-[var(--text)]"
                value={entry.customDeliveryFee === 0 ? "" : entry.customDeliveryFee}
                placeholder={`Fee ${deliveryCostPerOrder || 0}`}
                onChange={(event) =>
                  onUpdateCompetitor(
                    index,
                    "customDeliveryFee",
                    Number(event.target.value),
                  )
                }
              />
              <input
                className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2 text-sm text-[var(--text)]"
                value={entry.notes ?? ""}
                placeholder="Observed market price"
                onChange={(event) => onUpdateCompetitor(index, "notes", event.target.value)}
              />
              <button
                type="button"
                onClick={() => onRemoveCompetitor(index)}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2 text-sm text-[var(--muted)] transition hover:border-rose-400 hover:text-rose-600"
              >
                Remove
              </button>
              <div className="lg:col-span-7 rounded-lg bg-[var(--accent-soft)] px-3 py-2 text-sm text-[var(--accent-strong)]">
                Adjusted market price: {formatCurrency(getAdjustedPrice(entry, deliveryCostPerOrder))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visibleRows.map((entry) => (
            <article
              key={`${entry.date}-${entry.competitor}`}
              className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text)]">
                    {entry.competitor}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {entry.channel} • {entry.date}
                  </p>
                </div>
                <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-sm font-medium text-[var(--accent-strong)]">
                  {formatCurrency(getAdjustedPrice(entry, deliveryCostPerOrder))}
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-[var(--muted)]">Listed price</p>
                  <p className="mt-1 font-semibold text-[var(--text)]">
                    {formatCurrency(entry.listedPrice)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[var(--muted)]">Delivery fee used</p>
                  <p className="mt-1 font-semibold text-[var(--text)]">
                    {formatCurrency(
                      entry.customDeliveryFee && entry.customDeliveryFee > 0
                        ? entry.customDeliveryFee
                        : deliveryCostPerOrder,
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[var(--muted)]">Adjusted market price</p>
                  <p className="mt-1 font-semibold text-[var(--text)]">
                    {formatCurrency(getAdjustedPrice(entry, deliveryCostPerOrder))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[var(--muted)]">Notes</p>
                  <p className="mt-1 font-semibold text-[var(--text)]">
                    {entry.notes || "—"}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
