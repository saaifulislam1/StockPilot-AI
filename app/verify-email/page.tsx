import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { verifyEmailToken } from "@/lib/auth-flow";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token ?? "";
  const isVerified = token ? await verifyEmailToken(token) : false;

  return (
    <AuthShell
      eyebrow="Verification"
      title={isVerified ? "Email verified" : "Verification link invalid"}
      body={
        isVerified
          ? "Your email is confirmed. You can sign in and start saving research records."
          : "This verification link is missing, invalid, or already used."
      }
      footer={
        <p className="text-sm text-[var(--muted)]">
          {isVerified ? (
            <>
              Continue to{" "}
              <Link href="/login?verified=1" className="font-medium text-[var(--text)]">
                login
              </Link>
            </>
          ) : (
            <>
              Need another email?{" "}
              <Link href="/verify-email/request" className="font-medium text-[var(--text)]">
                Resend verification
              </Link>
            </>
          )}
        </p>
      }
    >
      <p
        className={`rounded-2xl border px-4 py-4 text-sm ${
          isVerified
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
            : "border-rose-500/30 bg-rose-500/10 text-rose-700"
        }`}
      >
        {isVerified
          ? "Verification complete."
          : "Try requesting a fresh verification email."}
      </p>
    </AuthShell>
  );
}
