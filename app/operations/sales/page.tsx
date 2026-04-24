import { SalesLogForm } from "@/components/business/sales-log-form";
import { Icon } from "@/components/app-icons";
import {
  HeroPanel,
  MetricTile,
  SectionCard,
  EmptyState,
  formatCurrency,
  formatDateTime,
} from "@/components/research/ui";
import { requireUser } from "@/lib/auth";
import {
  listBusinessProducts,
  listSalesLogs,
} from "@/lib/business-store";

export default async function OperationsSalesPage() {
  const { userId } = await requireUser("/operations/sales");
  const [products, sales] = await Promise.all([
    listBusinessProducts(userId),
    listSalesLogs(userId),
  ]);

  const deliveredSales = sales.filter((sale) => sale.status === "delivered");

  return (
    <div className="space-y-6">
      <HeroPanel
        title="Log sales and connect them to real stock and profit."
        body="Sales logs convert the app from planning software into an operating system. Delivered orders reduce stock and show the real revenue and profit picture."
      >
        <div className="grid w-full max-w-[460px] gap-4 sm:grid-cols-2">
          <MetricTile
            label="Sales logs"
            value={String(sales.length)}
            hint="Orders and sales outcomes recorded in operations."
          />
          <MetricTile
            label="Delivered revenue"
            value={formatCurrency(deliveredSales.reduce((total, sale) => total + sale.revenue, 0))}
            hint="Revenue only from delivered sales logs."
          />
        </div>
      </HeroPanel>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricTile
          label="Delivered profit"
          value={formatCurrency(deliveredSales.reduce((total, sale) => total + sale.profit, 0))}
          hint="Profit after logged direct costs."
        />
        <MetricTile
          label="Returned logs"
          value={String(sales.filter((sale) => sale.status === "returned").length)}
          hint="Sales entries marked as returned."
        />
        <MetricTile
          label="Cancelled logs"
          value={String(sales.filter((sale) => sale.status === "cancelled").length)}
          hint="Orders marked as cancelled."
        />
      </div>

      <SectionCard
        icon={<Icon name="bookmark" className="h-5 w-5" />}
        eyebrow="Log sale"
        title="Record a sales outcome"
        body="Delivered sales reduce stock automatically. Returns and cancellations stay visible in the trading record."
      >
        {products.length === 0 ? (
          <EmptyState
            icon={<Icon name="bookmark" />}
            title="Create a product first"
            body="Sales logs need a business product so they can affect inventory and reporting correctly."
          />
        ) : (
          <SalesLogForm
            products={products.map((product) => ({
              id: product.id,
              name: product.name,
            }))}
          />
        )}
      </SectionCard>

      <SectionCard
        icon={<Icon name="list" className="h-5 w-5" />}
        eyebrow="Sales history"
        title="Recent trading records"
        body="See the latest operational outcomes with channel, status, revenue, and per-log profit."
      >
        {sales.length === 0 ? (
          <EmptyState
            icon={<Icon name="list" />}
            title="No sales logs yet"
            body="Your sales history will build here as soon as orders are logged."
          />
        ) : (
          <div className="grid gap-3">
            {sales.map((sale) => (
              <div
                key={sale.id}
                className="rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface)] px-4 py-4"
              >
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
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
