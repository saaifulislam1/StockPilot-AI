import { Icon } from "@/components/app-icons";
import {
  HeroPanel,
  MetricTile,
  SectionCard,
  ShellCard,
  EmptyState,
  formatCurrency,
  formatDateTime,
} from "@/components/research/ui";
import { requireUser } from "@/lib/auth";
import { getOperationsOverview } from "@/lib/business-store";

export default async function OperationsPage() {
  const { userId } = await requireUser("/operations");
  const overview = await getOperationsOverview(userId);

  return (
    <div className="space-y-6">
      <HeroPanel
        title="Run the business after the research is approved."
        body="This workspace tracks products, stock, purchases, and sales in one system. Research stays separate for pre-buy decisions, while operations shows what is actually happening after launch."
      >
        <div className="grid w-full max-w-[460px] gap-4 sm:grid-cols-2">
          <MetricTile
            label="Live products"
            value={String(overview.activeProducts)}
            hint="Products currently managed in operations."
          />
          <MetricTile
            label="Open purchase value"
            value={formatCurrency(overview.openPurchaseValue)}
            hint="Planned or ordered inventory not fully closed yet."
          />
        </div>
      </HeroPanel>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricTile
          label="On-hand units"
          value={String(overview.onHandUnits)}
          hint="Current stock available across all products."
        />
        <MetricTile
          label="Low stock"
          value={String(overview.lowStockCount)}
          hint="Products at or below their reorder point."
        />
        <MetricTile
          label="30-day revenue"
          value={formatCurrency(overview.last30DayRevenue)}
          hint="Delivered sales revenue across the last 30 days."
        />
        <MetricTile
          label="30-day profit"
          value={formatCurrency(overview.last30DayProfit)}
          hint="Revenue minus logged delivery, ads, packaging, and platform fees."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard
          icon={<Icon name="box" className="h-5 w-5" />}
          eyebrow="Inventory watch"
          title="Low-stock products"
          body="These products are closest to their reorder point and should be checked before they block sales."
        >
          {overview.lowStockProducts.length === 0 ? (
            <EmptyState
              icon={<Icon name="box" />}
              title="No low-stock products"
              body="Once products are created with reorder points, they will surface here automatically."
            />
          ) : (
            <div className="grid gap-3">
              {overview.lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface)] px-4 py-4"
                >
                  <div>
                    <p className="font-semibold text-[var(--text)]">{product.name}</p>
                    <p className="text-sm text-[var(--muted)]">
                      {product.supplier || "No supplier"} · reorder at {product.reorderPoint}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                      On hand
                    </p>
                    <p className="text-xl font-semibold text-[var(--text)]">
                      {product.onHandUnits}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          icon={<Icon name="save" className="h-5 w-5" />}
          eyebrow="Procurement"
          title="Recent purchase orders"
          body="Use purchase orders to track supplier commitments and upcoming cash requirements."
        >
          {overview.recentPurchases.length === 0 ? (
            <EmptyState
              icon={<Icon name="save" />}
              title="No purchase orders yet"
              body="Create purchase orders once products are approved for sourcing."
            />
          ) : (
            <div className="grid gap-3">
              {overview.recentPurchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface)] px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-[var(--text)]">{purchase.productName}</p>
                      <p className="text-sm text-[var(--muted)]">
                        {purchase.status} · {purchase.units} units
                      </p>
                    </div>
                    <p className="font-semibold text-[var(--text)]">
                      {formatCurrency(purchase.totalCost)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard
        icon={<Icon name="bookmark" className="h-5 w-5" />}
        eyebrow="Recent trading"
        title="Latest sales logs"
        body="Delivered orders reduce stock automatically. Logged returns and cancellations stay visible for operating decisions."
      >
        {overview.recentSales.length === 0 ? (
          <EmptyState
            icon={<Icon name="bookmark" />}
            title="No sales logs yet"
            body="Start logging delivered orders to unlock real revenue and profit tracking."
          />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {overview.recentSales.map((sale) => (
              <ShellCard key={sale.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[var(--text)]">{sale.productName}</p>
                    <p className="text-sm text-[var(--muted)]">
                      {sale.channel} · {sale.status} · {formatDateTime(sale.soldAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[var(--text)]">
                      {formatCurrency(sale.revenue)}
                    </p>
                    <p className="text-sm text-[var(--muted)]">
                      Profit {formatCurrency(sale.profit)}
                    </p>
                  </div>
                </div>
              </ShellCard>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
