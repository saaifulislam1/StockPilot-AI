"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { getPrimaryActionButtonClassName, LoadingSpinner } from "@/components/research/ui";

export function SignUpForm({
  callbackUrl,
  googleEnabled,
}: {
  callbackUrl: string;
  googleEnabled: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
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

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });
    const payload = (await response.json()) as { ok: boolean; error?: string; message?: string };

    if (!response.ok || !payload.ok) {
      setIsPending(false);
      setError(payload.error ?? "Unable to create account.");
      return;
    }

    const signInResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (!signInResult || signInResult.error) {
      setIsPending(false);
      setError("Account created. Please log in to continue.");
      return;
    }

    setMessage(payload.message ?? "Account created. Redirecting to your workspace...");
    setPassword("");
    setConfirmPassword("");

    router.push(signInResult?.url ?? callbackUrl);
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {googleEnabled ? (
        <>
          <GoogleAuthButton callbackUrl={callbackUrl} label="Sign up with Google" />
          <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.22em] text-[var(--muted)]">
            <span className="h-px flex-1 bg-[var(--border)]" />
            Or create with email
            <span className="h-px flex-1 bg-[var(--border)]" />
          </div>
        </>
      ) : null}

      <label className="block space-y-2">
        <span className="text-sm font-medium text-[var(--text)]">Name</span>
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
          placeholder="Inventory owner"
        />
      </label>

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
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
          placeholder="Minimum 8 characters"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-[var(--text)]">Confirm password</span>
        <input
          type="password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
          placeholder="Repeat your password"
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
        {isPending ? "Creating account..." : "Sign up"}
      </button>

      <p className="text-sm text-[var(--muted)]">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[var(--text)]">
          Log in
        </Link>
      </p>
    </form>
  );
}
