"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { LoadingSpinner, getPrimaryActionButtonClassName } from "@/components/research/ui";

type ProductOption = {
  id: string;
  name: string;
};

export function SalesLogForm({
  products,
}: {
  products: ProductOption[];
}) {
  const router = useRouter();
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [channel, setChannel] = useState("facebook");
  const [status, setStatus] = useState("delivered");
  const [quantity, setQuantity] = useState("1");
  const [sellPrice, setSellPrice] = useState("0");
  const [deliveryCost, setDeliveryCost] = useState("0");
  const [adSpend, setAdSpend] = useState("0");
  const [packagingCost, setPackagingCost] = useState("0");
  const [platformFee, setPlatformFee] = useState("0");
  const [soldAt, setSoldAt] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsPending(true);

    const response = await fetch("/api/business/sales", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId,
        channel,
        status,
        quantity: Number(quantity),
        sellPrice: Number(sellPrice),
        deliveryCost: Number(deliveryCost),
        adSpend: Number(adSpend),
        packagingCost: Number(packagingCost),
        platformFee: Number(platformFee),
        soldAt,
        note,
      }),
    });

    const payload = (await response.json()) as { ok: boolean; error?: string };
    setIsPending(false);

    if (!response.ok || !payload.ok) {
      setError(payload.error ?? "Unable to log sale.");
      return;
    }

    setMessage("Sales log saved.");
    setQuantity("1");
    setSellPrice("0");
    setDeliveryCost("0");
    setAdSpend("0");
    setPackagingCost("0");
    setPlatformFee("0");
    setNote("");
    router.refresh();
  }

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
      <label className="space-y-2">
        <span className="text-sm font-medium text-[var(--text)]">Product</span>
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
        <span className="text-sm font-medium text-[var(--text)]">Channel</span>
        <select
          value={channel}
          onChange={(event) => setChannel(event.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none"
        >
          <option value="facebook">Facebook</option>
          <option value="website">Website</option>
          <option value="marketplace">Marketplace</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="offline">Offline</option>
        </select>
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-[var(--text)]">Status</span>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none"
        >
          <option value="delivered">Delivered</option>
          <option value="returned">Returned</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-[var(--text)]">Quantity</span>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-[var(--text)]">Sell price</span>
        <input
          type="number"
          min="0"
          value={sellPrice}
          onChange={(event) => setSellPrice(event.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-[var(--text)]">Delivery cost</span>
        <input
          type="number"
          min="0"
          value={deliveryCost}
          onChange={(event) => setDeliveryCost(event.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-[var(--text)]">Ad spend</span>
        <input
          type="number"
          min="0"
          value={adSpend}
          onChange={(event) => setAdSpend(event.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-[var(--text)]">Packaging cost</span>
        <input
          type="number"
          min="0"
          value={packagingCost}
          onChange={(event) => setPackagingCost(event.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-[var(--text)]">Platform fee</span>
        <input
          type="number"
          min="0"
          value={platformFee}
          onChange={(event) => setPlatformFee(event.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-[var(--text)]">Sold date</span>
        <input
          type="date"
          value={soldAt}
          onChange={(event) => setSoldAt(event.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none"
        />
      </label>

      <label className="space-y-2 md:col-span-2">
        <span className="text-sm font-medium text-[var(--text)]">Note</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="min-h-24 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none"
          placeholder="Campaign context, customer note, refund issue..."
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
          {isPending ? "Recording sale..." : "Save sales log"}
        </button>
      </div>
    </form>
  );
}
