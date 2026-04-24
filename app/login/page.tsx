import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { isGoogleOAuthEnabled } from "@/lib/auth-env";
import { auth } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reset?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const googleEnabled = isGoogleOAuthEnabled();

  if (session?.user?.id) {
    redirect("/saved-products");
  }

  const callbackUrl = params.next ?? "/saved-products";

  return (
    <AuthShell
      eyebrow="Login"
      title="Access your private research workspace"
      body="Sign in to view only your own saved products, pricing analysis, and competitor tracking."
      footer={
        <p className="text-sm text-[var(--muted)]">
          Need an account?{" "}
          <Link
            href={`/signup?next=${encodeURIComponent(callbackUrl)}`}
            className="font-medium text-[var(--text)]"
          >
            Create one
          </Link>
        </p>
      }
    >
      <div className="space-y-4">
        {params.reset === "1" ? (
          <p className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
            Password updated. Sign in with your new password.
          </p>
        ) : null}
        <LoginForm callbackUrl={callbackUrl} googleEnabled={googleEnabled} />
      </div>
    </AuthShell>
  );
}
