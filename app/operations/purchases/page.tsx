import { PurchaseOrderForm } from "@/components/business/purchase-order-form";
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
  listPurchaseOrders,
} from "@/lib/business-store";

export default async function OperationsPurchasesPage() {
  const { userId } = await requireUser("/operations/purchases");
  const [products, purchases] = await Promise.all([
    listBusinessProducts(userId),
    listPurchaseOrders(userId),
  ]);

  const openOrders = purchases.filter(
    (purchase) => purchase.status !== "received" && purchase.status !== "cancelled",
  );

  return (
    <div className="space-y-6">
      <HeroPanel
        title="Plan supplier buying and working capital."
        body="Purchase orders keep supplier commitments, unit cost, and expected cash outflow visible before stock arrives."
      >
        <div className="grid w-full max-w-[460px] gap-4 sm:grid-cols-2">
          <MetricTile
            label="Purchase orders"
            value={String(purchases.length)}
            hint="All purchase records created inside operations."
          />
          <MetricTile
            label="Open value"
            value={formatCurrency(openOrders.reduce((total, item) => total + item.totalCost, 0))}
            hint="Cash still committed to planned or ordered inventory."
          />
        </div>
      </HeroPanel>

      <SectionCard
        icon={<Icon name="save" className="h-5 w-5" />}
        eyebrow="Create purchase"
        title="Log a supplier order"
        body="Purchase orders remain separate from research so sourcing execution does not disturb the pre-buy analysis record."
      >
        {products.length === 0 ? (
          <EmptyState
            icon={<Icon name="save" />}
            title="Create a product first"
            body="Purchases are attached to business products, not directly to research records."
          />
        ) : (
          <PurchaseOrderForm
            products={products.map((product) => ({
              id: product.id,
              name: product.name,
              supplier: product.supplier,
            }))}
          />
        )}
      </SectionCard>

      <SectionCard
        icon={<Icon name="list" className="h-5 w-5" />}
        eyebrow="Supplier pipeline"
        title="Recent purchase orders"
        body="Track which products are still being planned, which are already ordered, and how much capital is tied up."
      >
        {purchases.length === 0 ? (
          <EmptyState
            icon={<Icon name="list" />}
            title="No purchase orders recorded"
            body="Supplier orders will show here once you create them."
          />
        ) : (
          <div className="grid gap-3">
            {purchases.map((purchase) => (
              <div
                key={purchase.id}
                className="rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface)] px-4 py-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[var(--text)]">{purchase.productName}</p>
                    <p className="text-sm text-[var(--muted)]">
                      {purchase.supplier || "No supplier"} · {purchase.status}
                    </p>
                  </div>
                  <p className="font-semibold text-[var(--text)]">
                    {formatCurrency(purchase.totalCost)}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-[var(--muted)]">
                  <span>{purchase.units} units</span>
                  <span>Ordered {formatDateTime(purchase.orderedAt)}</span>
                  {purchase.expectedAt ? <span>ETA {formatDateTime(purchase.expectedAt)}</span> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
