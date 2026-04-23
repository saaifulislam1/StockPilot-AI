import { Icon } from "@/components/app-icons";
import {
  MetricTile,
  SectionCard,
  ShellCard,
  formatCurrency,
  formatPercent,
  getTone,
} from "@/components/research/ui";
import { type CompetitorEntry, getAdjustedPrice } from "@/lib/product-research";

type DecisionPanelProps = {
  competitors: CompetitorEntry[];
  deliveryCostPerOrder: number;
  model: ReturnType<typeof import("@/lib/product-research").computeResearchModel>;
  onSave?: () => void;
  onBack?: () => void;
  saveLabel?: string;
  saveDisabled?: boolean;
  saveStatus?: string;
};

function ready(value: number, hasData: boolean) {
  if (!hasData && value === 0) {
    return "—";
  }
  return formatCurrency(value);
}

export function DecisionPanel({
  competitors,
  deliveryCostPerOrder,
  model,
  onSave,
  onBack,
  saveLabel = "Save Research",
  saveDisabled = false,
  saveStatus = "Ready",
}: DecisionPanelProps) {
  const hasData =
    Boolean(model.product.productName) ||
    model.product.buyingCostPerUnit > 0 ||
    competitors.some((entry) => entry.competitor.trim());

  const topPrice = Math.max(
    model.competitorSummary.highestCompetitorPrice,
    model.pricing.recommendedSellPrice,
    model.product.manualTargetSellPrice,
    1,
  );

  return (
    <div className="space-y-6">
      <SectionCard
        icon={<Icon name="chart" />}
        eyebrow="Automated Output"
        title="Decision engine"
        body="Once the owner enters manual inputs, the app calculates pricing, margin, break-even, and cash exposure without any spreadsheet work."
        action={
          onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-medium text-[var(--text)] transition hover:border-[var(--accent)]"
            >
              <Icon name="edit" className="h-4 w-4" />
              Back to inputs
            </button>
          ) : null
        }
      >
        <div className="grid gap-4 xl:grid-cols-3">
          <MetricTile
            label="Recommended Sell Price"
            value={ready(model.pricing.recommendedSellPrice, hasData)}
            hint="True cost plus target profit."
          />
          <MetricTile
            label="Break-even Sell Price"
            value={ready(model.pricing.breakEvenSellPrice, hasData)}
            hint="Your minimum viable price."
          />
          <MetricTile
            label="Net Profit At Market Average"
            value={ready(model.pricing.netProfitAtMarketAveragePrice, hasData)}
            hint={`Margin: ${formatPercent(model.pricing.marginAtMarketAveragePrice)}.`}
          />
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <ShellCard className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-[var(--text)]">
                Outcome summary
              </h3>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                Review the key financial outcomes before deciding whether to keep this
                research.
              </p>
            </div>
            <span className={`rounded-full border px-3 py-1 text-sm font-medium ${getTone(model.pricing.profitStatus)}`}>
              {model.pricing.profitStatus}
            </span>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              ["Projected Profit Per Order", ready(model.pricing.projectedProfitPerOrder, hasData)],
              ["Projected Total Profit", ready(model.pricing.projectedTotalProfit, hasData)],
              ["ROI This Batch", `${formatPercent(model.cashflow.roiThisBatch)}`],
              ["Break-even Units", String(model.scenario.minUnitsToSellToBreakEven)],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface)] p-4"
              >
                <p className="text-sm text-[var(--muted)]">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--text)]">{value}</p>
              </div>
            ))}
          </div>
        </ShellCard>

        <ShellCard className="p-6">
          <h3 className="text-xl font-semibold text-[var(--text)]">
            Margin watch
          </h3>
          <div className="mt-5 space-y-3">
            {[
              ["Current Avg. Market Price", model.competitorSummary.averageCompetitorPrice],
              ["Lowest Competitor Price", model.competitorSummary.lowestCompetitorPrice],
              ["Highest Competitor Price", model.competitorSummary.highestCompetitorPrice],
              ["Safety Buffer", model.pricing.safetyBuffer],
              ["Headroom To Max Competitor", model.pricing.headroomToMaxCompetitorPrice],
              ["Expected Failed Orders", model.cashflow.expectedFailedOrders],
              ["Return Loss Reserve", model.cashflow.expectedReturnLossReserve],
              ["Projected Total Profit", model.pricing.projectedTotalProfit],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
              >
                <span className="text-sm text-[var(--muted)]">{label}</span>
                <span className="font-semibold text-[var(--text)]">
                  {typeof value === "number" && value > 25
                    ? ready(value, hasData)
                    : String(value)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <span className={`rounded-full border px-3 py-1 text-sm font-medium ${getTone(model.pricing.breakEvenAlert)}`}>
              {model.pricing.breakEvenAlert}
            </span>
            <span className={`rounded-full border px-3 py-1 text-sm font-medium ${getTone(model.pricing.restockDecision)}`}>
              {model.pricing.restockDecision}
            </span>
          </div>
        </ShellCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <ShellCard className="p-6">
          <h3 className="text-xl font-semibold text-[var(--text)]">Price ladder</h3>
          <div className="mt-5 space-y-4">
            {[
              ["Lowest Competitor", model.competitorSummary.lowestCompetitorPrice, "var(--muted-soft)"],
              ["Market Average", model.competitorSummary.averageCompetitorPrice, "var(--accent)"],
              ["Break-even Floor", model.pricing.breakEvenSellPrice, "#fb7185"],
              ["Recommended Sell", model.pricing.recommendedSellPrice, "#34d399"],
              ["Manual Target", model.product.manualTargetSellPrice, "#a78bfa"],
              ["Highest Competitor", model.competitorSummary.highestCompetitorPrice, "#f59e0b"],
            ].map(([label, value, color]) => (
              <div key={String(label)}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-[var(--muted)]">{label}</span>
                  <span className="font-medium text-[var(--text)]">
                    {ready(Number(value), hasData)}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-[var(--surface)]">
                  <div
                    className="h-3 rounded-full"
                    style={{
                      width: `${Math.max((Number(value) / topPrice) * 100, 8)}%`,
                      backgroundColor: String(color),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ShellCard>

        <ShellCard className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-[var(--text)]">Save this research</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                Save the current product profile and market tracker so it can be opened
                later from Saved Products.
              </p>
            </div>
            <span className={`rounded-full border px-3 py-1 text-sm font-medium ${getTone(saveStatus)}`}>
              {saveStatus}
            </span>
          </div>

          {onSave ? (
            <button
              type="button"
              onClick={onSave}
              disabled={saveDisabled}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--text)] px-4 py-3 text-sm font-medium text-[var(--bg)] transition hover:opacity-92 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Icon name="save" className="h-4 w-4" />
              {saveLabel}
            </button>
          ) : null}

          <div className="mt-6">
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Tracked competitors
            </h4>
            <div className="mt-3 space-y-3">
              {competitors.filter((entry) => entry.competitor.trim()).length === 0 ? (
                <p className="text-sm text-[var(--muted)]">
                  No competitor rows yet.
                </p>
              ) : (
                competitors
                  .filter((entry) => entry.competitor.trim())
                  .map((entry) => (
                    <div
                      key={`${entry.date}-${entry.competitor}`}
                      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-[var(--text)]">
                            {entry.competitor}
                          </p>
                          <p className="mt-1 text-sm text-[var(--muted)]">
                            {entry.channel} • {entry.date}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-[var(--muted)]">Adjusted price</p>
                          <p className="mt-1 font-semibold text-[var(--text)]">
                            {formatCurrency(
                              getAdjustedPrice(entry, deliveryCostPerOrder),
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </ShellCard>
      </div>
    </div>
  );
}
