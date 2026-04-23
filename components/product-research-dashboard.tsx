"use client";

import { useState, useTransition } from "react";

import { saveWorkspaceAction } from "@/app/actions";
import {
  type Channel,
  type CompetitorEntry,
  type ProductInputs,
  type ResearchDataset,
  computeResearchModel,
  getAdjustedPrice,
  roundCurrency,
} from "@/lib/product-research";

type ProductResearchDashboardProps = {
  initialDataset: ResearchDataset;
};

type SaveState = {
  kind: "idle" | "success" | "error";
  message: string;
};

type ProductTextKey = "productName" | "supplier";
type ProductNumberKey =
  | "buyingCostPerUnit"
  | "unitsBought"
  | "deliveryCostPerOrder"
  | "packagingCostPerOrder"
  | "averageAdCostPerOrder"
  | "returnLossPerFailedOrder"
  | "targetNetProfitPerOrder"
  | "manualTargetSellPrice";

const channelOptions: Channel[] = [
  "Website",
  "Facebook",
  "Marketplace",
  "Retail",
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(roundCurrency(value));
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function getStatusBadge(status: string) {
  const lower = status.toLowerCase();
  if (lower.includes("error") || lower.includes("loss") || lower.includes("danger")) {
    return "bg-rose-500/15 text-rose-100 ring-rose-400/30";
  }

  if (lower.includes("thin") || lower.includes("wait") || lower.includes("cautious")) {
    return "bg-amber-500/15 text-amber-100 ring-amber-400/30";
  }

  return "bg-emerald-500/15 text-emerald-100 ring-emerald-400/30";
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <article className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.25)]">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-300">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-300">{hint}</p>
    </article>
  );
}

function SectionTitle({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">{body}</p>
    </div>
  );
}

function createCompetitorRow(): CompetitorEntry {
  return {
    date: new Date().toISOString().slice(0, 10),
    competitor: "",
    channel: "Website",
    listedPrice: 0,
    deliveryIncluded: false,
    offerBundle: "",
    notes: "",
  };
}

export function ProductResearchDashboard({
  initialDataset,
}: ProductResearchDashboardProps) {
  const [product, setProduct] = useState<ProductInputs>(initialDataset.product);
  const [competitors, setCompetitors] = useState<CompetitorEntry[]>(
    initialDataset.competitors,
  );
  const [unitsSold, setUnitsSold] = useState(initialDataset.scenarioUnitsSold);
  const [saveState, setSaveState] = useState<SaveState>({
    kind: "idle",
    message:
      initialDataset.storage.provider === "neon"
        ? "Connected to Neon."
        : "Running with local fallback data until DATABASE_URL is configured.",
  });
  const [isPending, startTransition] = useTransition();

  const model = computeResearchModel(
    {
      product,
      competitors,
      salesLog: initialDataset.salesLog,
    },
    unitsSold,
  );

  const topPrice = Math.max(
    model.competitorSummary.highestCompetitorPrice,
    model.pricing.recommendedSellPrice,
    product.manualTargetSellPrice,
    1,
  );

  function updateProductText(key: ProductTextKey, value: string) {
    setProduct((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateProductNumber(key: ProductNumberKey, value: number) {
    setProduct((current) => ({
      ...current,
      [key]: Number.isFinite(value) ? value : 0,
    }));
  }

  function updateCompetitor(
    index: number,
    key: keyof CompetitorEntry,
    value: string | number | boolean,
  ) {
    setCompetitors((current) =>
      current.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [key]: value } : entry,
      ),
    );
  }

  function addCompetitor() {
    setCompetitors((current) => [...current, createCompetitorRow()]);
  }

  function removeCompetitor(index: number) {
    setCompetitors((current) => current.filter((_, entryIndex) => entryIndex !== index));
  }

  function saveWorkspace() {
    startTransition(async () => {
      try {
        const result = await saveWorkspaceAction({
          product,
          competitors: competitors.filter(
            (entry) => entry.competitor.trim() && entry.listedPrice > 0,
          ),
          scenarioUnitsSold: unitsSold,
        });

        setSaveState({
          kind: "success",
          message: `Saved to ${result.provider} at ${new Date(
            result.savedAt,
          ).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          })}.`,
        });
      } catch {
        setSaveState({
          kind: "error",
          message: "Save failed. Check DATABASE_URL and try again.",
        });
      }
    });
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(245,158,11,0.2),_transparent_32%),linear-gradient(180deg,_#08111f_0%,_#0f172a_40%,_#111827_100%)] text-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        <section className="grid gap-6 rounded-[2rem] border border-white/10 bg-slate-950/50 p-6 shadow-[0_30px_120px_rgba(8,15,31,0.55)] backdrop-blur xl:grid-cols-[1.35fr_0.95fr]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-cyan-100">
                Product Research OS
              </span>
              <span
                className={`rounded-full px-3 py-1 text-sm ring-1 ${getStatusBadge(
                  model.pricing.restockDecision,
                )}`}
              >
                {model.pricing.restockDecision}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-sm ring-1 ${getStatusBadge(
                  saveState.kind === "error" ? "error" : saveState.message,
                )}`}
              >
                {saveState.message}
              </span>
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Users enter product and market data. The pricing research updates itself.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              No Excel dependency. Product costs, competitor tracking, pricing engine,
              break-even math, and sell-through scenarios all run directly in the app.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <MetricCard
                label="Recommended sell"
                value={formatCurrency(model.pricing.recommendedSellPrice)}
                hint={`Built from true cost + ${formatCurrency(product.targetNetProfitPerOrder)} target profit.`}
              />
              <MetricCard
                label="Profit at market average"
                value={formatCurrency(model.pricing.netProfitAtMarketAveragePrice)}
                hint={`Margin lands at ${formatPercent(model.pricing.marginAtMarketAveragePrice)}.`}
              />
              <MetricCard
                label="Projected total profit"
                value={formatCurrency(model.pricing.projectedTotalProfit)}
                hint={`ROI on stock: ${formatPercent(model.cashflow.roiThisBatch)}.`}
              />
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-300">
              Save workspace
            </p>
            <div className="mt-5 space-y-4">
              <div className="rounded-3xl border border-white/10 bg-slate-950/55 p-4">
                <p className="text-sm text-slate-400">Storage provider</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {initialDataset.storage.provider === "neon" ? "Neon" : "Local fallback"}
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/55 p-4">
                <p className="text-sm text-slate-400">Break-even floor</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {formatCurrency(model.pricing.breakEvenSellPrice)}
                </p>
              </div>
              <button
                type="button"
                onClick={saveWorkspace}
                disabled={isPending}
                className="w-full rounded-2xl bg-cyan-300 px-4 py-3 font-medium text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isPending ? "Saving..." : "Save Inputs To Database"}
              </button>
              <p className="text-sm leading-7 text-slate-300">
                The user inputs only product setup, competitor tracker, and scenario
                volume. Everything else is automatic.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <SectionTitle
              eyebrow="Product Setup"
              title="Capture the sourcing economics"
              body="These are the only product-side inputs needed to drive the pricing engine."
            />
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm text-slate-300">Product name</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40"
                  value={product.productName}
                  onChange={(event) => updateProductText("productName", event.target.value)}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-slate-300">Supplier / source</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40"
                  value={product.supplier}
                  onChange={(event) => updateProductText("supplier", event.target.value)}
                />
              </label>
              {[
                ["Buying cost per unit", "buyingCostPerUnit"],
                ["Units bought", "unitsBought"],
                ["Delivery cost per order", "deliveryCostPerOrder"],
                ["Packaging cost per order", "packagingCostPerOrder"],
                ["Average ad cost per order", "averageAdCostPerOrder"],
                ["Return loss per failed order", "returnLossPerFailedOrder"],
                ["Target net profit per order", "targetNetProfitPerOrder"],
                ["Manual target sell price", "manualTargetSellPrice"],
              ].map(([label, key]) => (
                <label key={key} className="space-y-2">
                  <span className="text-sm text-slate-300">{label}</span>
                  <input
                    type="number"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40"
                    value={product[key as ProductNumberKey]}
                    onChange={(event) =>
                      updateProductNumber(
                        key as ProductNumberKey,
                        Number(event.target.value),
                      )
                    }
                  />
                </label>
              ))}
              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm text-slate-300">
                  Failed order rate: {formatPercent(product.failedOrderRate)}
                </span>
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.01"
                  value={product.failedOrderRate}
                  onChange={(event) =>
                    setProduct((current) => ({
                      ...current,
                      failedOrderRate: Number(event.target.value),
                    }))
                  }
                  className="w-full accent-cyan-300"
                />
              </label>
            </div>
          </article>

          <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <SectionTitle
              eyebrow="Pricing Engine"
              title="Everything below is automatic"
              body="Once the user enters costs and market prices, the app calculates real unit cost, break-even, target sell, margin, and buying thresholds."
            />
            <div className="mt-6 space-y-4">
              {[
                ["Average competitor price", model.competitorSummary.averageCompetitorPrice],
                ["Base landed cost", model.pricing.baseLandedCostPerOrder],
                ["Failed order cost spread", model.pricing.failedOrderCostSpread],
                ["True cost / successful order", model.pricing.trueCostPerSuccessfulOrder],
                ["Recommended sell price", model.pricing.recommendedSellPrice],
                ["Max safe buying cost", model.pricing.maxSafeBuyingCost],
                ["Negotiation target", model.pricing.idealBuyingCostAtMarketAverage],
              ].map(([label, value]) => (
                <div
                  key={String(label)}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3"
                >
                  <span className="text-sm text-slate-300">{label}</span>
                  <span className="text-base font-semibold text-white">
                    {formatCurrency(Number(value))}
                  </span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionTitle
              eyebrow="Competitor Market Tracker"
              title="Enter market observations directly"
              body="Adjusted landed price is calculated automatically from the delivery flag and your delivery cost per order."
            />
            <button
              type="button"
              onClick={addCompetitor}
              className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm font-medium text-white transition hover:border-cyan-300/40"
            >
              Add competitor
            </button>
          </div>

          <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/10">
            <div className="hidden grid-cols-[0.9fr_1.1fr_0.75fr_0.8fr_0.7fr_1fr_0.9fr_1.1fr_0.35fr] gap-3 bg-slate-950/80 px-4 py-3 text-xs uppercase tracking-[0.24em] text-slate-400 lg:grid">
              <span>Date</span>
              <span>Competitor</span>
              <span>Channel</span>
              <span>Listed</span>
              <span>Delivery</span>
              <span>Offer</span>
              <span>Adj.</span>
              <span>Notes</span>
              <span />
            </div>
            <div className="divide-y divide-white/10">
              {competitors.map((entry, index) => (
                <div
                  key={`${index}-${entry.date}-${entry.competitor}`}
                  className="grid gap-3 px-4 py-4 lg:grid-cols-[0.9fr_1.1fr_0.75fr_0.8fr_0.7fr_1fr_0.9fr_1.1fr_0.35fr]"
                >
                  <input
                    type="date"
                    className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white"
                    value={entry.date}
                    onChange={(event) =>
                      updateCompetitor(index, "date", event.target.value)
                    }
                  />
                  <input
                    className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white"
                    value={entry.competitor}
                    onChange={(event) =>
                      updateCompetitor(index, "competitor", event.target.value)
                    }
                  />
                  <select
                    className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white"
                    value={entry.channel}
                    onChange={(event) =>
                      updateCompetitor(index, "channel", event.target.value as Channel)
                    }
                  >
                    {channelOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white"
                    value={entry.listedPrice}
                    onChange={(event) =>
                      updateCompetitor(index, "listedPrice", Number(event.target.value))
                    }
                  />
                  <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white">
                    <input
                      type="checkbox"
                      checked={entry.deliveryIncluded}
                      onChange={(event) =>
                        updateCompetitor(index, "deliveryIncluded", event.target.checked)
                      }
                    />
                    Yes
                  </label>
                  <input
                    className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white"
                    value={entry.offerBundle ?? ""}
                    onChange={(event) =>
                      updateCompetitor(index, "offerBundle", event.target.value)
                    }
                  />
                  <div className="flex items-center rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm font-medium text-white">
                    {formatCurrency(getAdjustedPrice(entry, product.deliveryCostPerOrder))}
                  </div>
                  <input
                    className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white"
                    value={entry.notes ?? ""}
                    onChange={(event) =>
                      updateCompetitor(index, "notes", event.target.value)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => removeCompetitor(index)}
                    className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-300 transition hover:border-rose-300/40 hover:text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <SectionTitle
              eyebrow="Scenario"
              title="Adjust units actually sold"
              body="This keeps the same workbook logic, but directly in the product research app."
            />
            <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-slate-950/55 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">Units actually sold</p>
                  <p className="mt-2 text-4xl font-semibold text-white">{unitsSold}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Break-even threshold</p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {model.scenario.minUnitsToSellToBreakEven} units
                  </p>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max={product.unitsBought}
                step="1"
                value={unitsSold}
                onChange={(event) => setUnitsSold(Number(event.target.value))}
                className="mt-5 w-full accent-cyan-300"
              />
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                ["Successful orders", String(model.scenario.successfulOrders)],
                ["Still need to sell", String(model.scenario.stillNeedToSell)],
                [
                  "Revenue from sold units",
                  formatCurrency(model.scenario.revenueFromSoldUnits),
                ],
                ["Net profit (partial)", formatCurrency(model.scenario.netProfitPartial)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-3xl border border-white/10 bg-slate-950/45 p-4"
                >
                  <p className="text-sm text-slate-400">{label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <SectionTitle
              eyebrow="Decision Dashboard"
              title="The rest stays automatic"
              body="These outputs are derived from the user inputs above and should not be manually edited."
            />
            <div className="mt-6 space-y-4">
              {[
                ["Current avg. market price", model.competitorSummary.averageCompetitorPrice],
                ["Lowest competitor", model.competitorSummary.lowestCompetitorPrice],
                ["Highest competitor", model.competitorSummary.highestCompetitorPrice],
                ["Headroom to top competitor", model.pricing.headroomToMaxCompetitorPrice],
                ["Safety buffer", model.pricing.safetyBuffer],
                ["Expected failed orders", model.cashflow.expectedFailedOrders],
                ["Return loss reserve", model.cashflow.expectedReturnLossReserve],
                ["Total cash needed", model.cashflow.totalCashNeeded],
              ].map(([label, value]) => (
                <div
                  key={String(label)}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3"
                >
                  <span className="text-sm text-slate-300">{label}</span>
                  <span className="text-base font-semibold text-white">
                    {typeof value === "number" && value > 25
                      ? formatCurrency(value)
                      : String(value)}
                  </span>
                </div>
              ))}
              <div className="rounded-3xl border border-white/10 bg-slate-950/55 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-400">Market verdict</p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {model.pricing.profitStatus}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-sm ring-1 ${getStatusBadge(
                      model.pricing.breakEvenAlert,
                    )}`}
                  >
                    {model.pricing.breakEvenAlert}
                  </span>
                </div>
              </div>
            </div>
          </article>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
          <SectionTitle
            eyebrow="Price Ladder"
            title="Place your price against the market"
            body="This makes it obvious where the break-even floor, recommendation, and manual target sit relative to tracked competitors."
          />
          <div className="mt-6 space-y-4">
            {[
              ["Lowest competitor", model.competitorSummary.lowestCompetitorPrice, "from-slate-400 to-slate-200"],
              ["Market average", model.competitorSummary.averageCompetitorPrice, "from-cyan-400 to-blue-300"],
              ["Break-even floor", model.pricing.breakEvenSellPrice, "from-rose-400 to-orange-300"],
              ["Recommended sell", model.pricing.recommendedSellPrice, "from-emerald-400 to-lime-300"],
              ["Manual target", product.manualTargetSellPrice, "from-violet-400 to-fuchsia-300"],
              ["Highest competitor", model.competitorSummary.highestCompetitorPrice, "from-amber-300 to-yellow-100"],
            ].map(([label, value, color]) => (
              <div key={String(label)}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-300">{label}</span>
                  <span className="font-medium text-white">
                    {formatCurrency(Number(value))}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-slate-900/80">
                  <div
                    className={`h-3 rounded-full bg-gradient-to-r ${color}`}
                    style={{
                      width: `${Math.max((Number(value) / topPrice) * 100, 8)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
