"use client";

import { FormEvent, useState } from "react";

import { getPrimaryActionButtonClassName, LoadingSpinner } from "@/components/research/ui";

export function ResendVerificationForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsPending(true);

    const response = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    const payload = (await response.json()) as { ok: boolean; error?: string; message?: string };

    setIsPending(false);

    if (!response.ok || !payload.ok) {
      setError(payload.error ?? "Unable to resend verification email.");
      return;
    }

    setMessage(payload.message ?? "Verification email sent.");
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block space-y-2">
        <span className="text-sm font-medium text-[var(--text)]">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
          placeholder="owner@example.com"
        />
      </label>

      {error ? (
        <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}

      <button type="submit" disabled={isPending} className={`${getPrimaryActionButtonClassName()} w-full`}>
        {isPending ? <LoadingSpinner className="h-4 w-4" /> : null}
        {isPending ? "Sending..." : "Resend verification email"}
      </button>
    </form>
  );
}
