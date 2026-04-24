import Link from "next/link";

import { HeroArtwork, Icon } from "@/components/app-icons";
import { HeroPanel, MetricTile, SectionCard, ShellCard } from "@/components/research/ui";
import { auth } from "@/lib/auth";

const steps = [
  {
    eyebrow: "Step 01",
    title: "Capture your real unit economics",
    body:
      "Enter the sourcing cost, ad spend, packaging, return loss, and batch size so the model works from actual business inputs instead of guesswork.",
    icon: "box" as const,
  },
  {
    eyebrow: "Step 02",
    title: "Track competitor pricing by channel",
    body:
      "Log website and Facebook prices in one place. The research compares the live market floor, average, and ceiling against your target margin.",
    icon: "list" as const,
  },
  {
    eyebrow: "Step 03",
    title: "Decide whether to stock or hold",
    body:
      "Review recommended sell price, projected profit, loss reserve, and strategy tests before spending on inventory.",
    icon: "chart" as const,
  },
];

export default async function HomePage() {
  const session = await auth();
  const isSignedIn = Boolean(session?.user?.id);

  return (
    <div className="space-y-6">
      <HeroPanel
        title="Research product profitability before you launch."
        body="ProfitResearch helps you compare competitor prices, calculate the real batch cost, and decide whether a product has enough margin to launch, hold, or reject."
      >
        <div className="flex w-full max-w-[480px] flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            <Link
              href="/new-research"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--text)] px-5 py-3 text-sm font-medium text-[var(--bg)] transition hover:opacity-92"
            >
              Start new research
              <Icon name="arrow-right" className="h-4 w-4" />
            </Link>
            {isSignedIn ? (
              <Link
                href="/saved-products"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-medium text-[var(--text)] transition hover:border-[var(--accent)]"
              >
                View saved research
              </Link>
            ) : null}
          </div>
          <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
            <HeroArtwork />
          </div>
        </div>
      </HeroPanel>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricTile
          label="What it solves"
          value="Launch clarity"
          hint="See whether a product can survive ad cost, packaging, delivery, failed orders, and market pressure before you spend on inventory."
        />
        <MetricTile
          label="What you compare"
          value="FB + Website"
          hint="Track Facebook and website prices separately while still getting one market-average view for the final pricing decision."
          icon={<Icon name="facebook" className="h-4 w-4" />}
        />
        <MetricTile
          label="What you decide"
          value="Launch or pass"
          hint="Use the model to set a recommended sell price, estimate profit, and decide whether the product deserves capital."
        />
      </div>

      <ShellCard className="p-4 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.title}
              className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <div className="inline-flex rounded-full bg-[var(--accent-soft)] p-3 text-[var(--accent-strong)]">
                <Icon name={step.icon} className="h-5 w-5" />
              </div>
              <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--muted)]">
                {step.eyebrow}
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--text)]">
                {step.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{step.body}</p>
            </div>
          ))}
        </div>
      </ShellCard>

      <SectionCard
        icon={<Icon name="spark" className="h-5 w-5" />}
        eyebrow="Why teams use it"
        title="One research record keeps the full decision in one place"
        body="Instead of splitting supplier cost notes, competitor links, and pricing math across chats and spreadsheets, each product gets one record with inputs, tracked competition, and the final launch view."
        action={
          <Link
            href="/new-research"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--text)] transition hover:border-[var(--accent)]"
          >
            Create research
            <Icon name="arrow-right" className="h-4 w-4" />
          </Link>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-sm font-semibold text-[var(--text)]">For sourcing decisions</p>
            <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
              See how far your buying cost can move before profit becomes too thin, and compare the market average against your own target sell plan.
            </p>
          </div>
          <div className="rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-sm font-semibold text-[var(--text)]">For repeatable records</p>
            <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
              Save the research, reopen it later, edit it when market prices shift, and keep the decision history attached to the product.
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
