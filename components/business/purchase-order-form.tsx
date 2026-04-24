"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { LoadingSpinner, getPrimaryActionButtonClassName } from "@/components/research/ui";

type ProductOption = {
  id: string;
  name: string;
  supplier: string;
};

export function PurchaseOrderForm({
  products,
}: {
  products: ProductOption[];
}) {
  const router = useRouter();
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [supplier, setSupplier] = useState(products[0]?.supplier ?? "");
  const [status, setStatus] = useState("planned");
  const [units, setUnits] = useState("50");
  const [unitCost, setUnitCost] = useState("0");
  const [shippingCost, setShippingCost] = useState("0");
  const [orderedAt, setOrderedAt] = useState(new Date().toISOString().slice(0, 10));
  const [expectedAt, setExpectedAt] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  function syncSupplier(nextProductId: string) {
    setProductId(nextProductId);
    const nextProduct = products.find((product) => product.id === nextProductId);
    setSupplier(nextProduct?.supplier ?? "");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsPending(true);

    const response = await fetch("/api/business/purchases", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId,
        supplier,
        status,
        units: Number(units),
        unitCost: Number(unitCost),
        shippingCost: Number(shippingCost),
        orderedAt,
        expectedAt: expectedAt || null,
        note,
      }),
    });

    const payload = (await response.json()) as { ok: boolean; error?: string };
    setIsPending(false);

    if (!response.ok || !payload.ok) {
      setError(payload.error ?? "Unable to create purchase order.");
      return;
    }

    setMessage("Purchase order recorded.");
    setStatus("planned");
    setUnits("50");
    setUnitCost("0");
    setShippingCost("0");
    setExpectedAt("");
    setNote("");
    router.refresh();
  }

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
      <label className="space-y-2">
        <span className="text-sm font-medium text-[var(--text)]">Product</span>
        <select
          value={productId}
          onChange={(event) => syncSupplier(event.target.value)}
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
        <span className="text-sm font-medium text-[var(--text)]">Supplier</span>
        <input
          value={supplier}
          onChange={(event) => setSupplier(event.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-[var(--text)]">Status</span>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none"
        >
          <option value="planned">Planned</option>
          <option value="ordered">Ordered</option>
          <option value="received">Received</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-[var(--text)]">Units</span>
        <input
          type="number"
          min="1"
          value={units}
          onChange={(event) => setUnits(event.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-[var(--text)]">Unit cost</span>
        <input
          type="number"
          min="0"
          value={unitCost}
          onChange={(event) => setUnitCost(event.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-[var(--text)]">Shipping or import cost</span>
        <input
          type="number"
          min="0"
          value={shippingCost}
          onChange={(event) => setShippingCost(event.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-[var(--text)]">Ordered date</span>
        <input
          type="date"
          value={orderedAt}
          onChange={(event) => setOrderedAt(event.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-[var(--text)]">Expected delivery</span>
        <input
          type="date"
          value={expectedAt}
          onChange={(event) => setExpectedAt(event.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none"
        />
      </label>

      <label className="space-y-2 md:col-span-2">
        <span className="text-sm font-medium text-[var(--text)]">Note</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="min-h-24 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none"
          placeholder="MOQ, payment terms, quality notes..."
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
          {isPending ? "Saving purchase..." : "Create purchase order"}
        </button>
      </div>
    </form>
  );
}
