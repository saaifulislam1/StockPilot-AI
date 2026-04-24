"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { getPrimaryActionButtonClassName, LoadingSpinner } from "@/components/research/ui";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsPending(true);

    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, password }),
    });
    const payload = (await response.json()) as { ok: boolean; error?: string; message?: string };

    setIsPending(false);

    if (!response.ok || !payload.ok) {
      setError(payload.error ?? "Unable to reset password.");
      return;
    }

    setMessage(payload.message ?? "Password updated.");
    setTimeout(() => {
      router.push("/login?reset=1");
    }, 800);
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block space-y-2">
        <span className="text-sm font-medium text-[var(--text)]">New password</span>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
          placeholder="Minimum 8 characters"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-[var(--text)]">Confirm new password</span>
        <input
          type="password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
          placeholder="Repeat your new password"
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
        {isPending ? "Updating password..." : "Reset password"}
      </button>

      <p className="text-sm text-[var(--muted)]">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-[var(--text)]">
          Back to login
        </Link>
      </p>
    </form>
  );
}
