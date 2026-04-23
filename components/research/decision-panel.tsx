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

function AnalysisList({
  items,
}: {
  items: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
        >
          <span className="text-sm text-[var(--muted)]">{item.label}</span>
          <span className="text-right font-semibold text-[var(--text)]">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function DecisionPanel({
  competitors,
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
    competitors.some((entry) => entry.listedPrice > 0);
  const hasMarketAverage = model.competitorSummary.competitorsTracked > 0;

  const topPrice = Math.max(
    model.competitorSummary.highestCompetitorPrice,
    model.pricing.recommendedSellPrice,
    model.product.manualTargetSellPrice,
    1,
  );
  const buyingCostRange = hasMarketAverage
    ? `${ready(model.product.buyingCostPerUnit, hasData)} to ${ready(
        model.pricing.idealBuyingCostAtMarketAverage,
        hasData,
      )}`
    : ready(model.product.buyingCostPerUnit, hasData);

  return (
    <div className="space-y-6">
      <SectionCard
        icon={<Icon name="chart" />}
        eyebrow="Automated Output"
        title="Basic analysis"
        body="Start with the key pricing and profit signals. Open the expanded view for the full breakdown."
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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
          <MetricTile
            label="Buying Cost Per Unit"
            value={buyingCostRange}
            hint={
              hasMarketAverage
                ? "Range from your entered unit cost to the ideal buying cost at market average."
                : "Add competitor prices to calculate the ideal buying cost at market average."
            }
          />
          <MetricTile
            label="Recommended Sell Price"
            value={ready(model.pricing.recommendedSellPrice, hasData)}
            hint="Suggested sell price from true cost plus target profit."
          />
          <MetricTile
            label="Facebook Avg Sell Price"
            value={
              model.competitorSummary.facebookCompetitors > 0
                ? ready(model.competitorSummary.facebookAveragePrice, hasData)
                : "—"
            }
            hint="Average listed competitor sell price found on Facebook."
            icon={<Icon name="facebook" className="h-4 w-4" />}
          />
          <MetricTile
            label="Website Avg Sell Price"
            value={
              model.competitorSummary.websiteCompetitors > 0
                ? ready(model.competitorSummary.websiteAveragePrice, hasData)
                : "—"
            }
            hint="Average listed competitor sell price found on websites."
          />
          <MetricTile
            label="Net Profit @ Market Avg"
            value={
              hasMarketAverage
                ? ready(model.pricing.netProfitAtMarketAveragePrice, hasData)
                : "—"
            }
            hint={
              hasMarketAverage
                ? `Margin: ${formatPercent(model.pricing.marginAtMarketAveragePrice)}.`
                : "Add competitor prices to calculate market-average profit."
            }
          />
          <MetricTile
            label="Profit You Will Make"
            value={ready(model.pricing.projectedProfitPerOrder, hasData)}
            hint={`Projected profit per order at the recommended sell price. Margin: ${formatPercent(
              model.pricing.recommendedSellPrice > 0
                ? model.pricing.projectedProfitPerOrder /
                    model.pricing.recommendedSellPrice
                : 0,
            )}. ROI: ${formatPercent(model.cashflow.roiThisBatch)}.`}
          />
          <MetricTile
            label="Total Profit (All Units)"
            value={ready(model.pricing.projectedTotalProfit, hasData)}
            hint="Projected total profit across the full purchased batch."
          />
          <MetricTile
            label="Profit Status"
            value={model.pricing.profitStatus}
            hint="Quick read on margin strength at the current assumptions."
          />
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
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
              {competitors.filter((entry) => entry.listedPrice > 0).length === 0 ? (
                <p className="text-sm text-[var(--muted)]">
                  No competitor rows yet.
                </p>
              ) : (
                competitors
                  .filter((entry) => entry.listedPrice > 0)
                  .map((entry) => (
                    <div
                      key={`${entry.date}-${entry.competitor}-${entry.listedPrice}`}
                      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-[var(--text)]">
                            {entry.competitor || "Unnamed competitor"}
                          </p>
                          <p className="mt-1 text-sm text-[var(--muted)]">
                            {entry.channel} • {entry.date}
                          </p>
                          {(entry.productLinks ?? []).length > 0 ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {(entry.productLinks ?? []).map((link) => (
                                <a
                                  key={link}
                                  href={link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-1.5 text-xs font-medium text-[var(--accent-strong)] transition hover:border-[var(--accent)]"
                                >
                                  <Icon name="link" className="h-3.5 w-3.5" />
                                  Product page
                                </a>
                              ))}
                            </div>
                          ) : null}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-[var(--muted)]">Adjusted price</p>
                          <p className="mt-1 font-semibold text-[var(--text)]">
                            {formatCurrency(
                              getAdjustedPrice(entry),
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

      <details className="group rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 marker:hidden">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent-strong)]">
              <Icon name="spark" className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-[var(--muted)]">
                Deep dive
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-[var(--text)]">
                See advanced analysis
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--muted)]">
                Expanded pricing, market, cashflow, and strategy metrics from the
                full research model.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm font-medium text-[var(--text)]">
            Expand
            <Icon
              name="chevron-down"
              className="h-4 w-4 transition-transform group-open:rotate-180"
            />
          </span>
        </summary>

        <div className="border-t border-[var(--border)] px-6 py-6">
          <div className="grid gap-6">
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
                    ["Buying Price Input", ready(model.product.buyingCostPerUnit, hasData)],
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

            <ShellCard className="p-6">
              <h3 className="text-xl font-semibold text-[var(--text)]">Price ladder</h3>
              <div className="mt-5 space-y-4">
                {[
                  ["Lowest Competitor", model.competitorSummary.lowestCompetitorPrice, "var(--muted-soft)"],
                  ["Market Average", model.competitorSummary.averageCompetitorPrice, "var(--accent)"],
                  ["Recommended Sell", model.pricing.recommendedSellPrice, "#34d399"],
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

            <div className="grid gap-6 xl:grid-cols-2">
            <ShellCard className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[var(--accent-soft)] p-2.5 text-[var(--accent-strong)]">
                  <Icon name="chart" className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-[var(--text)]">
                    Pricing engine
                  </h4>
                  <p className="text-sm text-[var(--muted)]">
                    Cost structure and pricing guardrails.
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <AnalysisList
                  items={[
                    {
                      label: "Average adjusted competitor price",
                      value: ready(
                        model.competitorSummary.averageAdjustedCompetitorPrice,
                        hasData,
                      ),
                    },
                    {
                      label: "Base landed cost per order",
                      value: ready(model.pricing.baseLandedCostPerOrder, hasData),
                    },
                    {
                      label: "Failed order cost spread",
                      value: ready(model.pricing.failedOrderCostSpread, hasData),
                    },
                    {
                      label: "True cost per successful order",
                      value: ready(
                        model.pricing.trueCostPerSuccessfulOrder,
                        hasData,
                      ),
                    },
                    {
                      label: "Ideal buying cost at market average",
                      value: ready(
                        model.pricing.idealBuyingCostAtMarketAverage,
                        hasData,
                      ),
                    },
                    {
                      label: "Max safe buying cost",
                      value: ready(model.pricing.maxSafeBuyingCost, hasData),
                    },
                  ]}
                />
              </div>
            </ShellCard>

            <ShellCard className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[var(--accent-soft)] p-2.5 text-[var(--accent-strong)]">
                  <Icon name="box" className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-[var(--text)]">
                    Cash and inventory
                  </h4>
                  <p className="text-sm text-[var(--muted)]">
                    Capital exposure and survival thresholds.
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <AnalysisList
                  items={[
                    {
                      label: "Total capital invested",
                      value: ready(model.cashflow.totalCapitalInvested, hasData),
                    },
                    {
                      label: "Total ad budget needed",
                      value: ready(model.cashflow.totalAdBudgetNeeded, hasData),
                    },
                    {
                      label: "Total cash needed",
                      value: ready(model.cashflow.totalCashNeeded, hasData),
                    },
                    {
                      label: "Min revenue to break even",
                      value: ready(model.cashflow.minRevenueToBreakEven, hasData),
                    },
                    {
                      label: "Target revenue at recommended price",
                      value: ready(
                        model.cashflow.targetRevenueAtRecommendedPrice,
                        hasData,
                      ),
                    },
                    {
                      label: "Break-even revenue target",
                      value: ready(
                        model.scenario.breakEvenRevenueAtUnitTarget,
                        hasData,
                      ),
                    },
                  ]}
                />
              </div>
            </ShellCard>

            <ShellCard className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[var(--accent-soft)] p-2.5 text-[var(--accent-strong)]">
                  <Icon name="store" className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-[var(--text)]">
                    Market signals
                  </h4>
                  <p className="text-sm text-[var(--muted)]">
                    Channel mix, pricing spread, and market positioning.
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <AnalysisList
                  items={[
                    {
                      label: "Competitors tracked",
                      value: String(model.competitorSummary.competitorsTracked),
                    },
                    {
                      label: "Website average price",
                      value: ready(model.competitorSummary.websiteAveragePrice, hasData),
                    },
                    {
                      label: "Facebook average price",
                      value: ready(model.competitorSummary.facebookAveragePrice, hasData),
                    },
                    {
                      label: "Facebook premium over web",
                      value: ready(
                        model.competitorSummary.facebookPremiumOverWeb,
                        hasData,
                      ),
                    },
                    {
                      label: "Price spread",
                      value: ready(model.competitorSummary.priceSpread, hasData),
                    },
                    {
                      label: "Recommended vs market average",
                      value: ready(
                        model.competitorSummary.recommendedVsMarketAverage,
                        hasData,
                      ),
                    },
                  ]}
                />
              </div>
            </ShellCard>

            <ShellCard className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[var(--accent-soft)] p-2.5 text-[var(--accent-strong)]">
                  <Icon name="clock" className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-[var(--text)]">
                    Strategy tests
                  </h4>
                  <p className="text-sm text-[var(--muted)]">
                    Compare plan variants before committing inventory.
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {model.strategyBoard.map((scenario) => (
                  <div
                    key={scenario.name}
                    className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-[var(--text)]">
                          {scenario.name}
                        </p>
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          {scenario.label}
                        </p>
                      </div>
                      <span
                        className={`rounded-full border px-3 py-1 text-sm font-medium ${getTone(
                          scenario.verdict,
                        )}`}
                      >
                        {scenario.verdict}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div>
                        <p className="text-sm text-[var(--muted)]">Buy cost</p>
                        <p className="mt-1 font-semibold text-[var(--text)]">
                          {ready(scenario.buyCostPerUnit, hasData)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-[var(--muted)]">Profit per order</p>
                        <p className="mt-1 font-semibold text-[var(--text)]">
                          {ready(scenario.profitPerOrder, hasData)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-[var(--muted)]">Projected total</p>
                        <p className="mt-1 font-semibold text-[var(--text)]">
                          {ready(scenario.projectedTotalProfit, hasData)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ShellCard>
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}
