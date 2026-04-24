"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { getPrimaryActionButtonClassName, LoadingSpinner } from "@/components/research/ui";

export function LoginForm({
  callbackUrl,
  googleEnabled,
}: {
  callbackUrl: string;
  googleEnabled: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsPending(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setIsPending(false);

    if (!result || result.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push(result.url ?? callbackUrl);
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {googleEnabled ? (
        <>
          <GoogleAuthButton callbackUrl={callbackUrl} label="Continue with Google" />
          <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.22em] text-[var(--muted)]">
            <span className="h-px flex-1 bg-[var(--border)]" />
            Or use email
            <span className="h-px flex-1 bg-[var(--border)]" />
          </div>
        </>
      ) : null}

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

      <label className="block space-y-2">
        <span className="text-sm font-medium text-[var(--text)]">Password</span>
        <input
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
          placeholder="Enter your password"
        />
      </label>

      {error ? (
        <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={isPending} className={`${getPrimaryActionButtonClassName()} w-full`}>
        {isPending ? <LoadingSpinner className="h-4 w-4" /> : null}
        {isPending ? "Signing in..." : "Login"}
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--muted)]">
        <Link href="/forgot-password" className="hover:text-[var(--text)]">
          Forgot password?
        </Link>
      </div>
    </form>
  );
}
