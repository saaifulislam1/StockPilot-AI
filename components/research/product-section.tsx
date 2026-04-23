import type { ProductInputs } from "@/lib/product-research";

import { SectionCard, formatPercent } from "@/components/research/ui";
import { Icon } from "@/components/app-icons";

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

type ProductSectionProps = {
  product: ProductInputs;
  editable: boolean;
  onTextChange: (key: ProductTextKey, value: string) => void;
  onNumberChange: (key: ProductNumberKey, value: number) => void;
  onFailedOrderRateChange: (value: number) => void;
};

const numberFields: Array<{
  label: string;
  key: ProductNumberKey;
  placeholder: string;
}> = [
  { label: "Buying Cost Per Unit (BDT)", key: "buyingCostPerUnit", placeholder: "1100" },
  { label: "Units Bought", key: "unitsBought", placeholder: "20" },
  { label: "Delivery Cost Per Order (BDT)", key: "deliveryCostPerOrder", placeholder: "120" },
  { label: "Packaging Cost Per Order (BDT)", key: "packagingCostPerOrder", placeholder: "30" },
  { label: "Average Ad Cost Per Order (BDT)", key: "averageAdCostPerOrder", placeholder: "200" },
  { label: "Return Loss Per Failed Order (BDT)", key: "returnLossPerFailedOrder", placeholder: "80" },
  { label: "Target Net Profit Per Order (BDT)", key: "targetNetProfitPerOrder", placeholder: "350" },
  { label: "Manual Target Sell Price (BDT)", key: "manualTargetSellPrice", placeholder: "1990" },
];

function DisplayRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-base font-semibold text-[var(--text)]">{value || "—"}</p>
    </div>
  );
}

export function ProductSection({
  product,
  editable,
  onTextChange,
  onNumberChange,
  onFailedOrderRateChange,
}: ProductSectionProps) {
  return (
    <SectionCard
      icon={<Icon name="box" />}
      eyebrow="Product Inputs"
      title="Capture the source economics"
      body="Business owners enter only the manual fields. The app handles the pricing and margin calculations automatically."
    >
      {editable ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-[var(--text)]">Product Name</span>
            <input
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
              value={product.productName}
              placeholder="Mini Multi Cooker"
              onChange={(event) => onTextChange("productName", event.target.value)}
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-[var(--text)]">
              Supplier / Source
            </span>
            <input
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
              value={product.supplier}
              placeholder="Example supplier"
              onChange={(event) => onTextChange("supplier", event.target.value)}
            />
          </label>

          {numberFields.map((field) => (
            <label key={field.key} className="space-y-2">
              <span className="text-sm font-medium text-[var(--text)]">
                {field.label}
              </span>
              <input
                type="number"
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
                value={product[field.key] === 0 ? "" : product[field.key]}
                placeholder={field.placeholder}
                onChange={(event) =>
                  onNumberChange(field.key, Number(event.target.value))
                }
              />
            </label>
          ))}

          <label className="space-y-3 sm:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-[var(--text)]">
                Failed Order Rate
              </span>
              <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-sm font-medium text-[var(--accent-strong)]">
                {formatPercent(product.failedOrderRate)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.01"
              value={product.failedOrderRate}
              onChange={(event) => onFailedOrderRateChange(Number(event.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </label>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <DisplayRow label="Product Name" value={product.productName} />
          <DisplayRow label="Supplier / Source" value={product.supplier} />
          {numberFields.map((field) => (
            <DisplayRow
              key={field.key}
              label={field.label}
              value={product[field.key] ? String(product[field.key]) : ""}
            />
          ))}
          <DisplayRow
            label="Failed Order Rate"
            value={formatPercent(product.failedOrderRate)}
          />
        </div>
      )}
    </SectionCard>
  );
}
