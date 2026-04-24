import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Password reset"
      title="Reset your password"
      body="Enter your account email and we will send you a reset link if the account exists."
      footer={
        <p className="text-sm text-[var(--muted)]">
          Back to{" "}
          <Link href="/login" className="font-medium text-[var(--text)]">
            login
          </Link>
        </p>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
