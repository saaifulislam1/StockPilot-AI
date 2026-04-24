"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

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
import { LoadingSpinner } from "@/components/research/ui";
import {
  type CompetitorEntry,
  type ProductInputs,
  type ResearchDataset,
  computeResearchModel,
  normalizeProductInputs,
  normalizeLinks,
} from "@/lib/product-research";

type ResearchEditorProps = {
  initialDataset: ResearchDataset;
  mode: "create" | "detail";
  researchId?: string;
};

type ResearchStep = "inputs" | "analysis";

type SavePayload = {
  product: ProductInputs;
  competitors: CompetitorEntry[];
  scenarioUnitsSold: number;
};

type CreateResearchResponse = {
  ok: true;
  id: string;
  provider: ResearchDataset["storage"]["provider"];
  savedAt: string;
};

type UpdateResearchResponse = {
  ok: true;
  provider: ResearchDataset["storage"]["provider"];
  savedAt: string;
};

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
    transportationCostToHome:
      product.transportationCostToHome > 0
        ? String(product.transportationCostToHome)
        : "",
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

function normalizeCompetitorsForSave(entries: CompetitorEntry[]) {
  return entries
    .filter((entry) => entry.listedPrice > 0)
    .map((entry) => ({
      ...entry,
      productLinks: normalizeLinks(
        entry.productLinks ?? (entry.productUrl ? [entry.productUrl] : []),
      ),
    }));
}

function createEditorSnapshot(product: ProductInputs, competitors: CompetitorEntry[]) {
  return JSON.stringify({
    product,
    competitors: normalizeCompetitorsForSave(competitors).map((entry) => ({
      date: entry.date,
      competitor: entry.competitor,
      channel: entry.channel,
      listedPrice: entry.listedPrice,
      customDeliveryFee: entry.customDeliveryFee ?? 0,
      notes: entry.notes ?? "",
      productLinks: entry.productLinks ?? [],
    })),
    scenarioUnitsSold: product.unitsBought,
  });
}

async function requestJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const payload = (await response.json().catch(() => null)) as
    | { error?: string }
    | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? "Request failed");
  }

  return payload as T;
}

export function ResearchEditor({
  initialDataset,
  mode,
  researchId,
}: ResearchEditorProps) {
  const router = useRouter();
  const initialProduct = useMemo(
    () => normalizeProductInputs(initialDataset.product),
    [initialDataset.product],
  );
  const [isEditing, setIsEditing] = useState(mode === "create");
  const [step, setStep] = useState<ResearchStep>(
    mode === "create" ? "inputs" : "analysis",
  );
  const [product, setProduct] = useState<ProductInputs>(initialProduct);
  const [productDrafts, setProductDrafts] = useState<ProductFieldDrafts>(
    createProductFieldDrafts(initialProduct),
  );
  const [competitors, setCompetitors] = useState<CompetitorEntry[]>(
    ensureCompetitorIds(initialDataset.competitors),
  );
  const [savedProduct, setSavedProduct] = useState<ProductInputs>(initialProduct);
  const [savedProductDrafts, setSavedProductDrafts] = useState<ProductFieldDrafts>(
    createProductFieldDrafts(initialProduct),
  );
  const [savedCompetitors, setSavedCompetitors] = useState<CompetitorEntry[]>(
    ensureCompetitorIds(initialDataset.competitors),
  );
  const [showStopEditModal, setShowStopEditModal] = useState(false);
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
  const savedSnapshot = useMemo(
    () => createEditorSnapshot(savedProduct, savedCompetitors),
    [savedCompetitors, savedProduct],
  );
  const currentSnapshot = useMemo(
    () => createEditorSnapshot(product, competitors),
    [competitors, product],
  );
  const hasUnsavedChanges = currentSnapshot !== savedSnapshot;

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

    setSaveState(mode === "create" ? "Saving..." : "Updating...");

    startTransition(async () => {
      try {
        const normalizedCompetitors = normalizeCompetitorsForSave(competitors);
        const payload: SavePayload = {
          product,
          competitors: normalizedCompetitors,
          scenarioUnitsSold: product.unitsBought,
        };

        if (mode === "create") {
          const result = await requestJson<CreateResearchResponse>("/api/research", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
          setSaveState("Saved");
          router.push(`/saved-products/${result.id}`);
          router.refresh();
          return;
        }

        if (!researchId) {
          throw new Error("Missing research id");
        }

        await requestJson<UpdateResearchResponse>(`/api/research/${researchId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        setSaveState("Updated");
        setSavedProduct(product);
        setSavedProductDrafts(createProductFieldDrafts(product));
        setSavedCompetitors(ensureCompetitorIds(normalizedCompetitors));
        setCompetitors(ensureCompetitorIds(normalizedCompetitors));
        setShowStopEditModal(false);
        setIsEditing(false);
        setStep("analysis");
        router.refresh();
      } catch (error) {
        setSaveState(
          error instanceof Error && error.message ? error.message : "Save failed",
        );
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
    if (!isEditing) {
      setIsEditing(true);
      setStep("inputs");
      return;
    }

    if (hasUnsavedChanges) {
      setShowStopEditModal(true);
      return;
    }

    setIsEditing(false);
    setStep("analysis");
  }

  function discardEditingChanges() {
    setProduct(savedProduct);
    setProductDrafts(savedProductDrafts);
    setCompetitors(savedCompetitors);
    setShowStopEditModal(false);
    setIsEditing(false);
    setStep("analysis");
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
                    <div className="flex items-center gap-3 text-left">
                      <button
                        type="button"
                        onClick={() => goToStep(stage.stepKey)}
                        disabled={stage.disabled}
                        aria-label={`Go to ${stage.title}`}
                        className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold ${
                          active
                            ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                            : stage.complete
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700"
                              : "border-[var(--border)] bg-[var(--surface-strong)] text-[var(--muted)]"
                        } cursor-pointer transition disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        {stage.number}
                      </button>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                          Step {stage.number}
                        </p>
                        <p className="mt-1 text-base font-semibold text-[var(--text)]">
                          {stage.title}
                        </p>
                      </div>
                    </div>

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
              onAddCompetitor={addCompetitor}
              onRemoveCompetitor={removeCompetitor}
              onUpdateCompetitor={updateCompetitor}
            />

            <div className="flex flex-wrap justify-end gap-3">
              {mode === "detail" && isEditing ? (
                <button
                  type="button"
                  onClick={saveResearch}
                  disabled={isPending || !canContinue || !hasUnsavedChanges}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-medium text-[var(--text)] shadow-[var(--shadow-soft)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-raised)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? (
                    <LoadingSpinner className="h-4 w-4" />
                  ) : (
                    <Icon name="save" className="h-4 w-4" />
                  )}
                  {isPending ? "Updating..." : "Update Changes"}
                </button>
              ) : null}
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

      {showStopEditModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/42 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface-raised)] p-6 shadow-[var(--shadow-elevated)]">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-[var(--muted)]">
              Unsaved changes
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--text)]">
              Update this research before leaving edit mode?
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              You changed the saved research. Update now to keep the edits, or
              discard them and return to read mode.
            </p>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowStopEditModal(false)}
                className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--text)] transition hover:border-[var(--accent)]"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={discardEditingChanges}
                className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--muted)] transition hover:border-rose-400 hover:text-rose-600"
              >
                Discard Changes
              </button>
              <button
                type="button"
                onClick={saveResearch}
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--text)] px-4 py-2 text-sm font-medium text-[var(--bg)] transition hover:opacity-92 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? (
                  <LoadingSpinner className="h-4 w-4" />
                ) : (
                  <Icon name="save" className="h-4 w-4" />
                )}
                {isPending ? "Updating..." : "Update Changes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
