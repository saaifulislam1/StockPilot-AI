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
import { ProductSection } from "@/components/research/product-section";
import {
  ShellCard,
  getTone,
} from "@/components/research/ui";
import {
  type CompetitorEntry,
  type ProductInputs,
  type ResearchDataset,
  computeResearchModel,
} from "@/lib/product-research";

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

type ResearchEditorProps = {
  initialDataset: ResearchDataset;
  mode: "create" | "detail";
  researchId?: string;
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
  };
}

function ensureCompetitorIds(entries: CompetitorEntry[]) {
  if (entries.length === 0) {
    return [blankCompetitor()];
  }

  return entries.map((entry) => ({
    ...entry,
    id: entry.id ?? crypto.randomUUID(),
    customDeliveryFee: entry.customDeliveryFee ?? 0,
  }));
}

export function ResearchEditor({
  initialDataset,
  mode,
  researchId,
}: ResearchEditorProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(mode === "create");
  const [step, setStep] = useState<"inputs" | "analysis">(
    mode === "create" ? "inputs" : "analysis",
  );
  const [product, setProduct] = useState<ProductInputs>(initialDataset.product);
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

  function updateProductText(key: ProductTextKey, value: string) {
    setProduct((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateProductNumber(key: ProductNumberKey, value: number) {
    setProduct((current) => ({
      ...current,
      [key]: Number.isFinite(value) ? value : 0,
    }));
  }

  function updateCompetitor(
    index: number,
    key: keyof CompetitorEntry,
    value: string | number | boolean,
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
    if (!product.productName.trim()) {
      setSaveState("Product name required");
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          product,
          competitors: competitors.filter(
            (entry) => entry.competitor.trim() || entry.listedPrice > 0,
          ),
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
    if (!product.productName.trim()) {
      setSaveState("Product name required");
      return;
    }

    setStep("analysis");
  }

  return (
    <div className="space-y-6">
      <ShellCard className="px-6 py-8 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-[var(--muted)]">
              {mode === "create" ? "New Research" : "Saved Product"}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-4xl">
              {mode === "create"
                ? "Create product research"
                : product.productName || "Saved product research"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              {inputMode
                ? showInputs
                  ? "Enter only the manual product and market inputs. Then move to analysis to review the automated output."
                  : "Review the automated analysis, then decide whether to save this research."
                : "This is the saved research in read mode. Switch to edit mode if the supplier, competitor prices, or assumptions change."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`rounded-full border px-3 py-1.5 text-sm font-medium ${getTone(saveState)}`}>
              {saveState}
            </span>
            {mode === "detail" ? (
              <button
                type="button"
                onClick={() =>
                  setIsEditing((current) => {
                    const next = !current;
                    setStep(next ? "inputs" : "analysis");
                    return next;
                  })
                }
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--text)] transition hover:border-[var(--accent)]"
              >
                <Icon name="edit" className="h-4 w-4" />
                {isEditing ? "Stop Editing" : "Edit Research"}
              </button>
            ) : null}
          </div>
        </div>
      </ShellCard>

      <div className="grid gap-6">
        {showInputs ? (
          <>
            <ProductSection
              product={product}
              editable={true}
              onTextChange={updateProductText}
              onNumberChange={updateProductNumber}
              onFailedOrderRateChange={(value) =>
                setProduct((current) => ({
                  ...current,
                  failedOrderRate: value,
                }))
              }
            />

            <CompetitorSection
              competitors={competitors}
              editable={true}
              deliveryCostPerOrder={product.deliveryCostPerOrder}
              onAddCompetitor={addCompetitor}
              onRemoveCompetitor={removeCompetitor}
              onUpdateCompetitor={updateCompetitor}
            />

            <ShellCard className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-[var(--muted)]">
                    Next step
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-[var(--text)]">
                    Review the analysis
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                    Once inputs are ready, move to the analysis screen to review pricing
                    and decide whether to save.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={reviewAnalysis}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--text)] px-5 py-3 text-sm font-medium text-[var(--bg)] transition hover:opacity-92"
                >
                  <Icon name="arrow-right" className="h-4 w-4" />
                  Review Analysis
                </button>
              </div>
            </ShellCard>
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
            saveDisabled={isPending}
            saveStatus={saveState}
          />
        ) : null}
      </div>
    </div>
  );
}
