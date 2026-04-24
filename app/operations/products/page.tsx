import { ProductForm } from "@/components/business/product-form";
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
import { listBusinessProducts } from "@/lib/business-store";
import { listSavedResearches } from "@/lib/research-store";

export default async function OperationsProductsPage() {
  const { userId } = await requireUser("/operations/products");
  const [products, savedResearch] = await Promise.all([
    listBusinessProducts(userId),
    listSavedResearches(userId),
  ]);

  return (
    <div className="space-y-6">
      <HeroPanel
        title="Products move from research into live operations here."
        body="Create a business product record when a researched item becomes something you will actually stock, sell, and restock."
      >
        <div className="grid w-full max-w-[460px] gap-4 sm:grid-cols-2">
          <MetricTile
            label="Business products"
            value={String(products.length)}
            hint="Live workspaces connected to stock, sales, and purchasing."
          />
          <MetricTile
            label="Linked research"
            value={String(products.filter((product) => product.linkedResearchId).length)}
            hint="Products tied back to a saved research record."
          />
        </div>
      </HeroPanel>

      <SectionCard
        icon={<Icon name="plus" className="h-5 w-5" />}
        eyebrow="Create product"
        title="Open a business workspace for a product"
        body="This does not replace research. It creates the operational record used for stock, purchases, and sales."
      >
        <ProductForm
          researchOptions={savedResearch.map((item) => ({
            id: item.id,
            productName: item.productName,
          }))}
        />
      </SectionCard>

      <SectionCard
        icon={<Icon name="store" className="h-5 w-5" />}
        eyebrow="Live catalog"
        title="Products in operations"
        body="Each product record tracks lifecycle status, target sell price, and the current stock position."
      >
        {products.length === 0 ? (
          <EmptyState
            icon={<Icon name="store" />}
            title="No business products yet"
            body="Create the first product workspace once you are ready to manage something beyond research."
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {products.map((product) => (
              <ShellCard key={product.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                      {product.status}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-[var(--text)]">
                      {product.name}
                    </h2>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      {product.supplier || "No supplier"} · {product.sku || "No SKU"}
                    </p>
                  </div>
                  <div className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-sm text-[var(--muted)]">
                    {product.onHandUnits} on hand
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                    <p className="text-sm text-[var(--muted)]">Target sell</p>
                    <p className="mt-1 font-semibold text-[var(--text)]">
                      {formatCurrency(product.targetSellPrice)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                    <p className="text-sm text-[var(--muted)]">Reorder point</p>
                    <p className="mt-1 font-semibold text-[var(--text)]">
                      {product.reorderPoint}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                    <p className="text-sm text-[var(--muted)]">Units sold</p>
                    <p className="mt-1 font-semibold text-[var(--text)]">
                      {product.soldUnits}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                    <p className="text-sm text-[var(--muted)]">Returns logged</p>
                    <p className="mt-1 font-semibold text-[var(--text)]">
                      {product.returnedUnits}
                    </p>
                  </div>
                </div>

                <div className="mt-5 text-sm leading-7 text-[var(--muted)]">
                  {product.notes || "No notes yet."}
                </div>

                <p className="mt-4 text-xs text-[var(--muted)]">
                  Updated {formatDateTime(product.updatedAt)}
                </p>
              </ShellCard>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
