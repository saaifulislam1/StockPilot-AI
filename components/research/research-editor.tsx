"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  createResearchAction,
  updateResearchAction,
} from "@/app/actions";
import { Icon } from "@/components/app-icons";
import { CompetitorSection } from "@/components/research/competitor-section";
import { DecisionPanel } from "@/components/research/decision-panel";
import {
  ProductSection,
  type ProductFieldDrafts,
  type ProductNumberKey,
  type ProductTextKey,
  type ProductValidation,
} from "@/components/research/product-section";
import {
  type CompetitorEntry,
  type ProductInputs,
  type ResearchDataset,
  computeResearchModel,
  normalizeLinks,
} from "@/lib/product-research";

type ResearchEditorProps = {
  initialDataset: ResearchDataset;
  mode: "create" | "detail";
  researchId?: string;
};

type ResearchStep = "inputs" | "analysis";

function blankCompetitor(): CompetitorEntry {
  return {
    id: crypto.randomUUID(),
    date: new Date().toISOString().slice(0, 10),
    competitor: "",
    channel: "Website",
    listedPrice: 0,
    customDeliveryFee: 0,
    notes: "",
    productLinks: [],
  };
}

function ensureCompetitorIds(entries: CompetitorEntry[]) {
  if (entries.length === 0) {
    return [blankCompetitor()];
  }

  return entries.map((entry) => ({
    ...entry,
    id: entry.id ?? crypto.randomUUID(),
    productLinks: normalizeLinks(
      entry.productLinks ?? (entry.productUrl ? [entry.productUrl] : []),
    ),
    customDeliveryFee: entry.customDeliveryFee ?? 0,
  }));
}

function createProductFieldDrafts(product: ProductInputs): ProductFieldDrafts {
  return {
    buyingCostPerUnit: String(product.buyingCostPerUnit),
    unitsBought: String(product.unitsBought),
    deliveryCostPerOrder: String(product.deliveryCostPerOrder),
    packagingCostPerOrder: String(product.packagingCostPerOrder),
    averageAdCostPerOrder: String(product.averageAdCostPerOrder),
    returnLossPerFailedOrder: String(product.returnLossPerFailedOrder),
    targetNetProfitPerOrder: String(product.targetNetProfitPerOrder),
    manualTargetSellPrice: String(product.manualTargetSellPrice),
    failedOrderRate: formatFailedOrderRateDraft(product.failedOrderRate),
  };
}

function formatFailedOrderRateDraft(value: number) {
  return Number((value * 100).toFixed(1)).toString();
}

function parseNumericInput(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return 0;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isNonNegativeNumberDraft(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return false;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed >= 0;
}

function isPercentageDraft(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return false;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 100;
}

function validateProductInputs(
  product: ProductInputs,
  drafts: ProductFieldDrafts,
): ProductValidation {
  return {
    productName: Boolean(product.productName.trim()),
    buyingCostPerUnit: isNonNegativeNumberDraft(drafts.buyingCostPerUnit),
    unitsBought: isNonNegativeNumberDraft(drafts.unitsBought),
    deliveryCostPerOrder: isNonNegativeNumberDraft(drafts.deliveryCostPerOrder),
    packagingCostPerOrder: isNonNegativeNumberDraft(drafts.packagingCostPerOrder),
    averageAdCostPerOrder: isNonNegativeNumberDraft(drafts.averageAdCostPerOrder),
    returnLossPerFailedOrder: isNonNegativeNumberDraft(drafts.returnLossPerFailedOrder),
    targetNetProfitPerOrder: isNonNegativeNumberDraft(drafts.targetNetProfitPerOrder),
    failedOrderRate: isPercentageDraft(drafts.failedOrderRate),
  };
}

function hasRequiredProductInputs(validation: ProductValidation) {
  return Object.values(validation).every(Boolean);
}

export function ResearchEditor({
  initialDataset,
  mode,
  researchId,
}: ResearchEditorProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(mode === "create");
  const [step, setStep] = useState<ResearchStep>(
    mode === "create" ? "inputs" : "analysis",
  );
  const [product, setProduct] = useState<ProductInputs>(initialDataset.product);
  const [productDrafts, setProductDrafts] = useState<ProductFieldDrafts>(
    createProductFieldDrafts(initialDataset.product),
  );
  const [competitors, setCompetitors] = useState<CompetitorEntry[]>(
    ensureCompetitorIds(initialDataset.competitors),
  );
  const [saveState, setSaveState] = useState(
    initialDataset.storage.provider === "neon"
      ? "Ready"
      : "DATABASE_URL not configured",
  );
  const [isPending, startTransition] = useTransition();

  const model = useMemo(
    () =>
      computeResearchModel(
        {
          product,
          competitors,
          salesLog: initialDataset.salesLog,
        },
        product.unitsBought,
      ),
    [competitors, initialDataset.salesLog, product],
  );
  const productValidation = useMemo(
    () => validateProductInputs(product, productDrafts),
    [product, productDrafts],
  );
  const canContinue = hasRequiredProductInputs(productValidation);

  function updateProductText(key: ProductTextKey, value: string) {
    setProduct((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateProductNumber(key: ProductNumberKey, value: string) {
    setProductDrafts((current) => ({
      ...current,
      [key]: value,
    }));
    setProduct((current) => ({
      ...current,
      [key]: parseNumericInput(value),
    }));
  }

  function updateFailedOrderRate(value: string) {
    setProductDrafts((current) => ({
      ...current,
      failedOrderRate: value,
    }));
    setProduct((current) => ({
      ...current,
      failedOrderRate: parseNumericInput(value) / 100,
    }));
  }

  function updateCompetitor(
    index: number,
    key: keyof CompetitorEntry,
    value: string | number | boolean | string[],
  ) {
    setCompetitors((current) =>
      current.map((entry, currentIndex) =>
        currentIndex === index ? { ...entry, [key]: value } : entry,
      ),
    );
  }

  function addCompetitor() {
    setCompetitors((current) => [...current, blankCompetitor()]);
  }

  function removeCompetitor(index: number) {
    setCompetitors((current) => {
      const next = current.filter((_, currentIndex) => currentIndex !== index);
      return next.length > 0 ? next : [blankCompetitor()];
    });
  }

  function saveResearch() {
    if (!canContinue) {
      setSaveState("Error: complete required fields marked *");
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          product,
          competitors: competitors.filter((entry) => entry.listedPrice > 0).map((entry) => ({
            ...entry,
            productLinks: normalizeLinks(
              entry.productLinks ?? (entry.productUrl ? [entry.productUrl] : []),
            ),
          })),
          scenarioUnitsSold: product.unitsBought,
        };

        if (mode === "create") {
          const result = await createResearchAction(payload);
          setSaveState("Saved");
          router.push(`/saved-products/${result.id}`);
          router.refresh();
          return;
        }

        if (!researchId) {
          throw new Error("Missing research id");
        }

        await updateResearchAction(researchId, payload);
        setSaveState("Updated");
        setIsEditing(false);
        setStep("analysis");
        router.refresh();
      } catch {
        setSaveState("Save failed");
      }
    });
  }

  const inputMode = mode === "create" || isEditing;
  const showInputs = inputMode && step === "inputs";
  const showAnalysis = !inputMode || step === "analysis";

  function reviewAnalysis() {
    if (!canContinue) {
      setSaveState("Error: complete required fields marked *");
      return;
    }

    setStep("analysis");
  }

  function goToStep(nextStep: ResearchStep) {
    if (nextStep === "analysis") {
      reviewAnalysis();
      return;
    }

    setStep("inputs");
  }

  function toggleEditing() {
    setIsEditing((current) => {
      const next = !current;
      setStep(next ? "inputs" : "analysis");
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {inputMode ? (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] px-4 py-4 sm:px-5">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              {[
                {
                  stepKey: "inputs" as const,
                  number: "01",
                  title: "Inputs",
                  complete: step === "analysis",
                  disabled: false,
                },
                {
                  stepKey: "analysis" as const,
                  number: "02",
                  title: "Analysis",
                  complete: false,
                  disabled: !canContinue,
                },
              ].map((stage) => {
                const active = step === stage.stepKey;

                return (
                  <div key={stage.stepKey} className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => goToStep(stage.stepKey)}
                      disabled={stage.disabled}
                      className="flex items-center gap-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold ${
                          active
                            ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                            : stage.complete
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700"
                              : "border-[var(--border)] bg-[var(--surface-strong)] text-[var(--muted)]"
                        }`}
                      >
                        {stage.number}
                      </span>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                          Step {stage.number}
                        </p>
                        <p className="mt-1 text-base font-semibold text-[var(--text)]">
                          {stage.title}
                        </p>
                      </div>
                    </button>

                    {stage.stepKey === "inputs" ? (
                      <div className="hidden h-px w-10 bg-[var(--border)] sm:block" />
                    ) : null}
                  </div>
                );
              })}
            </div>
            <p className={`text-sm font-medium ${canContinue ? "text-emerald-700" : "text-rose-700"}`}>
              {canContinue
                ? "Required fields complete."
                : "Finish required fields to unlock analysis."}
            </p>
          </div>
        ) : null}

        {mode === "detail" ? (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={toggleEditing}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--text)] transition hover:border-[var(--accent)]"
            >
              <Icon name="edit" className="h-4 w-4" />
              {isEditing ? "Stop Editing" : "Edit Research"}
            </button>
          </div>
        ) : null}

        {showInputs ? (
          <>
            <ProductSection
              product={product}
              fieldValues={productDrafts}
              validation={productValidation}
              editable={true}
              onTextChange={updateProductText}
              onNumberChange={updateProductNumber}
              onFailedOrderRateChange={updateFailedOrderRate}
            />

            <CompetitorSection
              competitors={competitors}
              editable={true}
              deliveryCostPerOrder={product.deliveryCostPerOrder}
              onAddCompetitor={addCompetitor}
              onRemoveCompetitor={removeCompetitor}
              onUpdateCompetitor={updateCompetitor}
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={reviewAnalysis}
                disabled={!canContinue}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--text)] px-5 py-3 text-sm font-medium text-[var(--bg)] transition hover:opacity-92 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Icon name="arrow-right" className="h-4 w-4" />
                Review Analysis
              </button>
            </div>
          </>
        ) : null}

        {showAnalysis ? (
          <DecisionPanel
            competitors={competitors}
            deliveryCostPerOrder={product.deliveryCostPerOrder}
            model={model}
            onBack={inputMode ? () => setStep("inputs") : undefined}
            onSave={inputMode ? saveResearch : undefined}
            saveLabel={
              mode === "create"
                ? isPending
                  ? "Saving Research..."
                  : "Save Research"
                : isPending
                  ? "Updating Research..."
                  : "Update Research"
            }
            saveDisabled={isPending || !canContinue}
            saveStatus={saveState}
          />
        ) : null}
      </div>
    </div>
  );
}
