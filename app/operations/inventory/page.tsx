import { InventoryAdjustmentForm } from "@/components/business/inventory-adjustment-form";
import { Icon } from "@/components/app-icons";
import {
  HeroPanel,
  MetricTile,
  SectionCard,
  EmptyState,
  formatDateTime,
} from "@/components/research/ui";
import { requireUser } from "@/lib/auth";
import {
  listBusinessProducts,
  listInventoryAdjustments,
} from "@/lib/business-store";

export default async function OperationsInventoryPage() {
  const { userId } = await requireUser("/operations/inventory");
  const [products, adjustments] = await Promise.all([
    listBusinessProducts(userId),
    listInventoryAdjustments(userId),
  ]);

  const totalUnits = products.reduce((total, product) => total + product.onHandUnits, 0);
  const lowStock = products.filter(
    (product) => product.reorderPoint > 0 && product.onHandUnits <= product.reorderPoint,
  ).length;

  return (
    <div className="space-y-6">
      <HeroPanel
        title="Track inventory without leaving the operating workspace."
        body="Use stock adjustments for restocks, count corrections, and damaged units. Sales logs pull stock down automatically when orders are delivered."
      >
        <div className="grid w-full max-w-[460px] gap-4 sm:grid-cols-2">
          <MetricTile
            label="Tracked products"
            value={String(products.length)}
            hint="Products carrying stock in operations."
          />
          <MetricTile
            label="Units on hand"
            value={String(totalUnits)}
            hint="Current available stock across all products."
          />
        </div>
      </HeroPanel>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricTile
          label="Low stock"
          value={String(lowStock)}
          hint="Products at or below their reorder threshold."
        />
        <MetricTile
          label="Positive adjustments"
          value={String(adjustments.filter((item) => item.deltaUnits > 0).length)}
          hint="Restocks and upward corrections logged."
        />
        <MetricTile
          label="Negative adjustments"
          value={String(adjustments.filter((item) => item.deltaUnits < 0).length)}
          hint="Shrinkage, damage, or stock write-downs logged."
        />
      </div>

      <SectionCard
        icon={<Icon name="box" className="h-5 w-5" />}
        eyebrow="Adjust stock"
        title="Record manual inventory changes"
        body="Use positive numbers for restocks and negative numbers for shrinkage or write-offs."
      >
        {products.length === 0 ? (
          <EmptyState
            icon={<Icon name="box" />}
            title="Create a product first"
            body="Inventory adjustments need at least one business product in operations."
          />
        ) : (
          <InventoryAdjustmentForm
            products={products.map((product) => ({
              id: product.id,
              name: product.name,
            }))}
          />
        )}
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <SectionCard
          icon={<Icon name="store" className="h-5 w-5" />}
          eyebrow="Current stock"
          title="Stock position by product"
          body="This view helps owners see what is available now and which products need restocking attention."
        >
          {products.length === 0 ? (
            <EmptyState
              icon={<Icon name="store" />}
              title="No stock tracked yet"
              body="Create products and then start adjusting inventory."
            />
          ) : (
            <div className="grid gap-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface)] px-4 py-4"
                >
                  <div>
                    <p className="font-semibold text-[var(--text)]">{product.name}</p>
                    <p className="text-sm text-[var(--muted)]">
                      reorder at {product.reorderPoint} · sold {product.soldUnits}
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
          icon={<Icon name="edit" className="h-5 w-5" />}
          eyebrow="Adjustment log"
          title="Recent stock events"
          body="Every manual change is stored with its reason so stock history stays auditable."
        >
          {adjustments.length === 0 ? (
            <EmptyState
              icon={<Icon name="edit" />}
              title="No adjustments logged"
              body="Manual stock events will appear here once recorded."
            />
          ) : (
            <div className="grid gap-3">
              {adjustments.map((adjustment) => (
                <div
                  key={adjustment.id}
                  className="rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface)] px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-[var(--text)]">{adjustment.productName}</p>
                      <p className="text-sm text-[var(--muted)]">
                        {adjustment.reason} · {formatDateTime(adjustment.createdAt)}
                      </p>
                    </div>
                    <p
                      className={`font-semibold ${
                        adjustment.deltaUnits >= 0 ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {adjustment.deltaUnits > 0 ? `+${adjustment.deltaUnits}` : adjustment.deltaUnits}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
