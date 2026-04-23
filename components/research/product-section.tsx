import type { ProductInputs } from "@/lib/product-research";

import { SectionCard, formatPercent } from "@/components/research/ui";
import { Icon } from "@/components/app-icons";

export type ProductTextKey = "productName" | "supplier";
export type ProductNumberKey =
  | "buyingCostPerUnit"
  | "unitsBought"
  | "deliveryCostPerOrder"
  | "packagingCostPerOrder"
  | "averageAdCostPerOrder"
  | "returnLossPerFailedOrder"
  | "targetNetProfitPerOrder"
  | "manualTargetSellPrice";
export type ProductDraftKey = ProductNumberKey | "failedOrderRate";
export type RequiredProductFieldKey =
  | "productName"
  | "buyingCostPerUnit"
  | "unitsBought"
  | "deliveryCostPerOrder"
  | "packagingCostPerOrder"
  | "averageAdCostPerOrder"
  | "returnLossPerFailedOrder"
  | "targetNetProfitPerOrder"
  | "failedOrderRate";
export type ProductFieldDrafts = Record<ProductDraftKey, string>;
export type ProductValidation = Record<RequiredProductFieldKey, boolean>;

type ProductSectionProps = {
  product: ProductInputs;
  fieldValues: ProductFieldDrafts;
  validation: ProductValidation;
  editable: boolean;
  onTextChange: (key: ProductTextKey, value: string) => void;
  onNumberChange: (key: ProductNumberKey, value: string) => void;
  onFailedOrderRateChange: (value: string) => void;
};

const numberFields: Array<{
  label: string;
  key: ProductNumberKey;
  placeholder: string;
  required?: boolean;
}> = [
  {
    label: "Buying Cost Per Unit (BDT)",
    key: "buyingCostPerUnit",
    placeholder: "1100",
    required: true,
  },
  { label: "Units Bought", key: "unitsBought", placeholder: "20", required: true },
  {
    label: "Delivery Cost Per Order (BDT)",
    key: "deliveryCostPerOrder",
    placeholder: "120",
    required: true,
  },
  {
    label: "Packaging Cost Per Order (BDT)",
    key: "packagingCostPerOrder",
    placeholder: "30",
    required: true,
  },
  {
    label: "Average Ad Cost Per Order (BDT)",
    key: "averageAdCostPerOrder",
    placeholder: "200",
    required: true,
  },
  {
    label: "Return Loss Per Failed Order (BDT)",
    key: "returnLossPerFailedOrder",
    placeholder: "80",
    required: true,
  },
  {
    label: "Target Net Profit Per Order (BDT)",
    key: "targetNetProfitPerOrder",
    placeholder: "350",
    required: true,
  },
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

function getValidationStyles(required: boolean, valid?: boolean) {
  if (!required) {
    return "border-[var(--border)] bg-[var(--surface-strong)] focus:border-[var(--accent)]";
  }

  if (valid) {
    return "border-emerald-500/50 bg-emerald-500/[0.04] focus:border-emerald-600";
  }

  return "border-rose-500/50 bg-rose-500/[0.04] focus:border-rose-600";
}

function FieldLabel({
  label,
  required = false,
  valid,
}: {
  label: string;
  required?: boolean;
  valid?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-[var(--text)]">
        {label}
        {required ? (
          <span
            className={`ml-1 ${valid ? "text-emerald-600" : "text-rose-600"}`}
            aria-hidden="true"
          >
            *
          </span>
        ) : null}
      </span>
    </div>
  );
}

export function ProductSection({
  product,
  fieldValues,
  validation,
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
        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
            <p className="text-sm text-[var(--muted)]">
              Fields marked with <span className="font-semibold text-rose-600">*</span>{" "}
              are required. Valid fields turn green.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <FieldLabel
                label="Product Name"
                required={true}
                valid={validation.productName}
              />
              <input
                required
                aria-invalid={!validation.productName}
                className={`w-full rounded-2xl border px-4 py-3 text-[var(--text)] outline-none transition ${getValidationStyles(true, validation.productName)}`}
                value={product.productName}
                placeholder="Mini Multi Cooker"
                onChange={(event) => onTextChange("productName", event.target.value)}
              />
            </label>

            <label className="space-y-2">
              <FieldLabel label="Supplier / Source" />
              <input
                className={`w-full rounded-2xl border px-4 py-3 text-[var(--text)] outline-none transition ${getValidationStyles(false)}`}
                value={product.supplier}
                placeholder="Example supplier"
                onChange={(event) => onTextChange("supplier", event.target.value)}
              />
            </label>

            {numberFields.map((field) => (
              <label key={field.key} className="space-y-2">
                <FieldLabel
                  label={field.label}
                  required={field.required}
                  valid={
                    field.required
                      ? validation[field.key as keyof ProductValidation]
                      : undefined
                  }
                />
                <input
                  type="number"
                  required={field.required}
                  aria-invalid={
                    field.required
                      ? !validation[field.key as keyof ProductValidation]
                      : undefined
                  }
                  className={`w-full rounded-2xl border px-4 py-3 text-[var(--text)] outline-none transition ${getValidationStyles(
                    Boolean(field.required),
                    field.required
                      ? validation[field.key as keyof ProductValidation]
                      : undefined,
                  )}`}
                  value={fieldValues[field.key]}
                  placeholder={field.placeholder}
                  onChange={(event) => onNumberChange(field.key, event.target.value)}
                />
              </label>
            ))}

            <label className="space-y-2 sm:col-span-2">
              <FieldLabel
                label="Failed Order Rate (%)"
                required={true}
                valid={validation.failedOrderRate}
              />
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                required
                aria-invalid={!validation.failedOrderRate}
                className={`w-full rounded-2xl border px-4 py-3 text-[var(--text)] outline-none transition ${getValidationStyles(true, validation.failedOrderRate)}`}
                value={fieldValues.failedOrderRate}
                placeholder="16"
                onChange={(event) => onFailedOrderRateChange(event.target.value)}
              />
            </label>
          </div>
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
