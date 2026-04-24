"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import {
  FieldHelpLabel,
  LoadingSpinner,
  getPrimaryActionButtonClassName,
} from "@/components/research/ui";

type ResearchOption = {
  id: string;
  productName: string;
};

export function ProductForm({
  researchOptions,
}: {
  researchOptions: ResearchOption[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [supplier, setSupplier] = useState("");
  const [status, setStatus] = useState("researching");
  const [targetSellPrice, setTargetSellPrice] = useState("0");
  const [reorderPoint, setReorderPoint] = useState("0");
  const [linkedResearchId, setLinkedResearchId] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsPending(true);

    const response = await fetch("/api/business/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        sku,
        supplier,
        status,
        targetSellPrice: Number(targetSellPrice),
        reorderPoint: Number(reorderPoint),
        linkedResearchId: linkedResearchId || null,
        notes,
      }),
    });

    const payload = (await response.json()) as { ok: boolean; error?: string };
    setIsPending(false);

    if (!response.ok || !payload.ok) {
      setError(payload.error ?? "Unable to create product.");
      return;
    }

    setMessage("Product workspace created.");
    setName("");
    setSku("");
    setSupplier("");
    setStatus("researching");
    setTargetSellPrice("0");
    setReorderPoint("0");
    setLinkedResearchId("");
    setNotes("");
    router.refresh();
  }

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
      <label className="space-y-2">
        <FieldHelpLabel
          label="Product name"
          help="The live business product you will manage after research is approved."
        />
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none"
          placeholder="Travel bottle blender"
        />
      </label>

      <label className="space-y-2">
        <FieldHelpLabel
          label="SKU"
          help="A short internal code for identifying the product across stock, sales, and purchases."
        />
        <input
          value={sku}
          onChange={(event) => setSku(event.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none"
          placeholder="PR-001"
        />
      </label>

      <label className="space-y-2">
        <FieldHelpLabel
          label="Supplier"
          help="The main supplier or source you buy this product from."
        />
        <input
          value={supplier}
          onChange={(event) => setSupplier(event.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none"
          placeholder="Rahman Traders"
        />
      </label>

      <label className="space-y-2">
        <FieldHelpLabel
          label="Lifecycle status"
          help="The current stage of the product in your business, from research through scaling or stopping."
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none"
        >
          <option value="researching">Researching</option>
          <option value="approved">Approved</option>
          <option value="ordered">Ordered</option>
          <option value="launching">Launching</option>
          <option value="scaling">Scaling</option>
          <option value="restock-soon">Restock soon</option>
          <option value="at-risk">At risk</option>
          <option value="stopped">Stopped</option>
        </select>
      </label>

      <label className="space-y-2">
        <FieldHelpLabel
          label="Target sell price"
          help="The intended selling price you want operations and reporting to track against."
        />
        <input
          type="number"
          min="0"
          value={targetSellPrice}
          onChange={(event) => setTargetSellPrice(event.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none"
        />
      </label>

      <label className="space-y-2">
        <FieldHelpLabel
          label="Reorder point"
          help="When on-hand stock falls to this number or below, the product should be reviewed for restocking."
        />
        <input
          type="number"
          min="0"
          value={reorderPoint}
          onChange={(event) => setReorderPoint(event.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none"
        />
      </label>

      <label className="space-y-2 md:col-span-2">
        <FieldHelpLabel
          label="Linked research"
          help="Optional link back to the research record that originally justified buying this product."
        />
        <select
          value={linkedResearchId}
          onChange={(event) => setLinkedResearchId(event.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none"
        >
          <option value="">No linked research</option>
          {researchOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.productName || "Untitled research"}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2 md:col-span-2">
        <FieldHelpLabel
          label="Notes"
          help="Internal operating notes such as launch plan, supplier issues, or packaging reminders."
        />
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="min-h-28 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none"
          placeholder="Launch notes, target audience, packaging reminders, supplier risks..."
        />
      </label>

      {error ? (
        <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 md:col-span-2">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 md:col-span-2">
          {message}
        </p>
      ) : null}

      <div className="md:col-span-2">
        <button type="submit" disabled={isPending} className={getPrimaryActionButtonClassName()}>
          {isPending ? <LoadingSpinner className="h-4 w-4" /> : null}
          {isPending ? "Creating workspace..." : "Create business product"}
        </button>
      </div>
    </form>
  );
}
