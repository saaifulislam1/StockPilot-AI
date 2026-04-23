import {
  DEFAULT_COMPETITOR_DELIVERY_FEE,
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
  onAddCompetitor: () => void;
  onRemoveCompetitor: (index: number) => void;
  onUpdateCompetitor: (
    index: number,
    key: keyof CompetitorEntry,
    value: string | number | boolean | string[],
  ) => void;
};

const channels: Channel[] = ["Website", "Facebook", "Marketplace", "Retail"];

export function CompetitorSection({
  competitors,
  editable,
  onAddCompetitor,
  onRemoveCompetitor,
  onUpdateCompetitor,
}: CompetitorSectionProps) {
  const visibleRows = editable
    ? competitors
    : competitors.filter((item) => item.listedPrice > 0);

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
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-raised)] px-4 py-2 text-sm font-medium text-[var(--text)] shadow-[var(--shadow-soft)] hover:border-[var(--border-strong)] hover:bg-[var(--surface)]"
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
        <div className="overflow-x-auto">
          <div className="min-w-[1300px] space-y-3">
            <div className="grid grid-cols-[0.85fr_1fr_0.8fr_0.75fr_0.8fr_1fr_1.35fr_0.38fr] gap-3 px-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
              <span>Date</span>
              <span>Competitor</span>
              <span>Channel</span>
              <span>Listed Price</span>
              <span>Delivery Fee</span>
              <span>Notes</span>
              <span>Product Page Links</span>
              <span>Action</span>
            </div>
            {competitors.map((entry, index) => (
              <div
                key={entry.id ?? index}
                className="rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]"
              >
                <div className="grid grid-cols-[0.85fr_1fr_0.8fr_0.75fr_0.8fr_1fr_1.35fr_0.38fr] gap-3">
                  <input
                    type="date"
                    className="h-10 min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] px-3 text-sm text-[var(--text)] shadow-[var(--shadow-soft)]"
                    value={entry.date}
                    onChange={(event) =>
                      onUpdateCompetitor(index, "date", event.target.value)
                    }
                  />
                  <input
                    className="h-10 min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] px-3 text-sm text-[var(--text)] shadow-[var(--shadow-soft)]"
                    value={entry.competitor}
                    placeholder="Rokomari"
                    onChange={(event) =>
                      onUpdateCompetitor(index, "competitor", event.target.value)
                    }
                  />
                  <select
                    className="h-10 min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] px-3 text-sm text-[var(--text)] shadow-[var(--shadow-soft)]"
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
                    required
                    className={`h-10 min-w-0 rounded-lg border bg-[var(--surface-raised)] px-3 text-sm text-[var(--text)] shadow-[var(--shadow-soft)] ${
                      entry.listedPrice > 0
                        ? "border-emerald-500/50 focus:border-emerald-600"
                        : "border-[var(--border)] focus:border-[var(--border-strong)]"
                    }`}
                    value={entry.listedPrice === 0 ? "" : entry.listedPrice}
                    placeholder="1760"
                    onChange={(event) =>
                      onUpdateCompetitor(
                        index,
                        "listedPrice",
                        event.target.value === "" ? 0 : Number(event.target.value),
                      )
                    }
                  />
                  <input
                    type="number"
                    className="h-10 min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] px-3 text-sm text-[var(--text)] shadow-[var(--shadow-soft)]"
                    value={entry.customDeliveryFee === 0 ? "" : entry.customDeliveryFee}
                    placeholder={`Fee ${DEFAULT_COMPETITOR_DELIVERY_FEE}`}
                    onChange={(event) =>
                      onUpdateCompetitor(
                        index,
                        "customDeliveryFee",
                        Number(event.target.value),
                      )
                    }
                  />
                  <input
                    className="h-10 min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] px-3 text-sm text-[var(--text)] shadow-[var(--shadow-soft)]"
                    value={entry.notes ?? ""}
                    placeholder="Observed market price"
                    onChange={(event) =>
                      onUpdateCompetitor(index, "notes", event.target.value)
                    }
                  />
                  <textarea
                    className="h-10 min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-2 text-sm text-[var(--text)] shadow-[var(--shadow-soft)]"
                    value={(entry.productLinks ?? []).join("\n")}
                    placeholder={"https://store.com/product-1\nhttps://store.com/product-2"}
                    onChange={(event) =>
                      onUpdateCompetitor(
                        index,
                        "productLinks",
                        event.target.value
                          .split("\n")
                          .map((link) => link.trim())
                          .filter(Boolean),
                      )
                    }
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveCompetitor(index)}
                    aria-label="Remove competitor row"
                    className="inline-flex h-10 w-10 items-center justify-center self-start rounded-xl border border-rose-500/18 bg-[var(--surface-raised)] text-rose-500 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:border-rose-500/28 hover:bg-rose-500/10 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  >
                    <Icon name="trash" className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 rounded-lg bg-[var(--accent-soft)] px-3 py-2 text-sm text-[var(--accent-strong)]">
                  Adjusted market price:{" "}
                  {formatCurrency(getAdjustedPrice(entry))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visibleRows.map((entry) => (
            <article
              key={`${entry.date}-${entry.competitor}-${entry.listedPrice}`}
              className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text)]">
                    {entry.competitor || "Unnamed competitor"}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {entry.channel} • {entry.date}
                  </p>
                </div>
                <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-sm font-medium text-[var(--accent-strong)]">
                  {formatCurrency(getAdjustedPrice(entry))}
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
                  <p className="text-sm text-[var(--muted)]">Product pages</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(entry.productLinks ?? []).length > 0 ? (
                      (entry.productLinks ?? []).map((link) => (
                        <a
                          key={link}
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-1.5 text-sm font-medium text-[var(--accent-strong)] transition hover:border-[var(--accent)]"
                        >
                          <Icon name="link" className="h-4 w-4" />
                          Open page
                        </a>
                      ))
                    ) : (
                      <p className="font-semibold text-[var(--text)]">—</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-[var(--muted)]">Delivery fee used</p>
                  <p className="mt-1 font-semibold text-[var(--text)]">
                    {formatCurrency(
                      entry.customDeliveryFee && entry.customDeliveryFee > 0
                        ? entry.customDeliveryFee
                        : DEFAULT_COMPETITOR_DELIVERY_FEE,
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[var(--muted)]">Adjusted market price</p>
                  <p className="mt-1 font-semibold text-[var(--text)]">
                    {formatCurrency(getAdjustedPrice(entry))}
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
