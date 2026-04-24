"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

import { Icon } from "@/components/app-icons";
import { LoadingSpinner } from "@/components/research/ui";

export function GoogleAuthButton({
  callbackUrl,
  label,
}: {
  callbackUrl: string;
  label: string;
}) {
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    setIsPending(true);
    await signIn("google", { callbackUrl });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-medium text-[var(--text)] shadow-[var(--shadow-soft)] transition hover:border-[var(--border-strong)] hover:shadow-[0_10px_24px_rgba(15,23,42,0.06)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? <LoadingSpinner className="h-4 w-4" /> : <Icon name="google" className="h-5 w-5" />}
      {isPending ? "Redirecting..." : label}
    </button>
  );
}
