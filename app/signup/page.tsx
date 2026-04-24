import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/signup-form";
import { isGoogleOAuthEnabled } from "@/lib/auth-env";
import { auth } from "@/lib/auth";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const callbackUrl = params.next ?? "/saved-products";
  const googleEnabled = isGoogleOAuthEnabled();

  if (session?.user?.id) {
    redirect("/saved-products");
  }

  return (
    <AuthShell
      eyebrow="Signup"
      title="Create your ProfitResearch account"
      body="Your product research, competitor tracking, and pricing decisions stay private to your account."
      footer={
        <p className="text-sm text-[var(--muted)]">
          Already registered?{" "}
          <Link href={`/login?next=${encodeURIComponent(callbackUrl)}`} className="font-medium text-[var(--text)]">
            Go to login
          </Link>
        </p>
      }
    >
      <SignUpForm callbackUrl={callbackUrl} googleEnabled={googleEnabled} />
    </AuthShell>
  );
}
