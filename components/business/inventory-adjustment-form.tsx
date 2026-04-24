"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import {
  FieldHelpLabel,
  LoadingSpinner,
  getPrimaryActionButtonClassName,
} from "@/components/research/ui";

type ProductOption = {
  id: string;
  name: string;
};

export function InventoryAdjustmentForm({
  products,
}: {
  products: ProductOption[];
}) {
  const router = useRouter();
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [deltaUnits, setDeltaUnits] = useState("0");
  const [reason, setReason] = useState("restock");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsPending(true);

    const response = await fetch("/api/business/inventory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId,
        deltaUnits: Number(deltaUnits),
        reason,
        note,
      }),
    });

    const payload = (await response.json()) as { ok: boolean; error?: string };
    setIsPending(false);

    if (!response.ok || !payload.ok) {
      setError(payload.error ?? "Unable to adjust stock.");
      return;
    }

    setMessage("Inventory updated.");
    setDeltaUnits("0");
    setReason("restock");
    setNote("");
    router.refresh();
  }

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
      <label className="space-y-2">
        <FieldHelpLabel
          label="Product"
          help="Choose the product whose stock level you want to change."
        />
        <select
          value={productId}
          onChange={(event) => setProductId(event.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none"
        >
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2">
        <FieldHelpLabel
          label="Units change"
          help="Use a positive number to add stock and a negative number to reduce stock."
        />
        <input
          type="number"
          value={deltaUnits}
          onChange={(event) => setDeltaUnits(event.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none"
          placeholder="Use positive or negative numbers"
        />
      </label>

      <label className="space-y-2">
        <FieldHelpLabel
          label="Reason"
          help="Explain why the stock is changing, such as a restock, manual recount, or damage write-off."
        />
        <select
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none"
        >
          <option value="restock">Restock</option>
          <option value="manual-count">Manual count</option>
          <option value="damaged">Damaged</option>
          <option value="return-to-stock">Return to stock</option>
          <option value="shrinkage">Shrinkage</option>
        </select>
      </label>

      <label className="space-y-2">
        <FieldHelpLabel
          label="Note"
          help="Optional short context for the adjustment so future reviews are easier."
        />
        <input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none"
          placeholder="Short explanation"
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
        <button type="submit" disabled={!productId || isPending} className={getPrimaryActionButtonClassName()}>
          {isPending ? <LoadingSpinner className="h-4 w-4" /> : null}
          {isPending ? "Updating stock..." : "Apply stock adjustment"}
        </button>
      </div>
    </form>
  );
}
