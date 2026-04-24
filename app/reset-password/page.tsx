import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token ?? "";

  return (
    <AuthShell
      eyebrow="Password reset"
      title="Choose a new password"
      body="Use the secure link from your email to set a new password."
      footer={
        <p className="text-sm text-[var(--muted)]">
          Need a new link?{" "}
          <Link href="/forgot-password" className="font-medium text-[var(--text)]">
            Request password reset
          </Link>
        </p>
      }
    >
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700">
          This reset link is missing a token. Request a new password reset email.
        </p>
      )}
    </AuthShell>
  );
}
