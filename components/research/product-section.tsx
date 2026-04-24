import type { ProductInputs } from "@/lib/product-research";

import { FieldHelpLabel, SectionCard, formatPercent } from "@/components/research/ui";
import { Icon } from "@/components/app-icons";

export type ProductTextKey = "productName" | "supplier";
export type ProductNumberKey =
  | "buyingCostPerUnit"
  | "transportationCostToHome"
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
  help: string;
  required?: boolean;
}> = [
  {
    label: "Buying Cost Per Unit (BDT)",
    key: "buyingCostPerUnit",
    placeholder: "1100",
    help: "The landed buying cost for one unit before delivery, ads, packaging, and returns are added.",
    required: true,
  },
  {
    label: "Transport Cost To Home (BDT)",
    key: "transportationCostToHome",
    placeholder: "200",
    help: "The one-time transport cost to move the batch from supplier or market to your own location.",
  },
  {
    label: "Units Bought",
    key: "unitsBought",
    placeholder: "20",
    help: "How many units you plan to buy in this batch. It affects total capital required.",
    required: true,
  },
  {
    label: "Delivery Cost Per Order (BDT)",
    key: "deliveryCostPerOrder",
    placeholder: "120",
    help: "Average shipping or courier cost you expect to pay for each fulfilled order.",
    required: true,
  },
  {
    label: "Packaging Cost Per Order (BDT)",
    key: "packagingCostPerOrder",
    placeholder: "30",
    help: "Average box, poly, tape, inserts, or other packaging cost for one order.",
    required: true,
  },
  {
    label: "Average Ad Cost Per Order (BDT)",
    key: "averageAdCostPerOrder",
    placeholder: "200",
    help: "Estimated marketing cost needed to generate one successful order.",
    required: true,
  },
  {
    label: "Return Loss Per Failed Order (BDT)",
    key: "returnLossPerFailedOrder",
    placeholder: "80",
    help: "Expected loss when an order fails or returns, including courier or handling loss.",
    required: true,
  },
  {
    label: "Target Net Profit Per Order (BDT)",
    key: "targetNetProfitPerOrder",
    placeholder: "350",
    help: "The minimum profit you want to keep after all direct costs are deducted.",
    required: true,
  },
  {
    label: "Manual Target Sell Price (BDT)",
    key: "manualTargetSellPrice",
    placeholder: "1990",
    help: "Optional override if you want to test a fixed selling price instead of relying only on the recommendation.",
  },
];

function DisplayRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 shadow-[var(--shadow-soft)]">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-base font-semibold text-[var(--text)]">{value || "—"}</p>
    </div>
  );
}

function getValidationStyles(required: boolean, valid?: boolean) {
  if (!required) {
    return "border-[var(--border)] bg-[var(--surface-raised)] shadow-[var(--shadow-soft)] focus:border-[var(--border-strong)]";
  }

  if (valid) {
    return "border-emerald-500/45 bg-[var(--surface-raised)] shadow-[var(--shadow-soft)] focus:border-emerald-600";
  }

  return "border-rose-500/45 bg-[var(--surface-raised)] shadow-[var(--shadow-soft)] focus:border-rose-600";
}

function FieldLabel({
  label,
  help,
  required = false,
  valid,
}: {
  label: string;
  help: string;
  required?: boolean;
  valid?: boolean;
}) {
  return (
    <FieldHelpLabel label={label} help={help} required={required} valid={valid} />
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
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow-soft)]">
            <p className="text-sm text-[var(--muted)]">
              Fields marked with <span className="font-semibold text-rose-600">*</span>{" "}
              are required. Valid fields turn green.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <FieldLabel
                label="Product Name"
                help="The product you are researching before buying inventory."
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
              <FieldLabel
                label="Supplier / Source"
                help="Where you will source the product from, such as a wholesaler, factory, or market."
              />
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
                  help={field.help}
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
                help="The percentage of orders you expect to fail, cancel, or return. This increases the true selling risk."
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
