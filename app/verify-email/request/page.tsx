import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { ResendVerificationForm } from "@/components/auth/resend-verification-form";

export default function ResendVerificationPage() {
  return (
    <AuthShell
      eyebrow="Verification"
      title="Resend verification email"
      body="If your account exists and still needs verification, we will send another email."
      footer={
        <p className="text-sm text-[var(--muted)]">
          Already verified?{" "}
          <Link href="/login" className="font-medium text-[var(--text)]">
            Go to login
          </Link>
        </p>
      }
    >
      <ResendVerificationForm />
    </AuthShell>
  );
}
