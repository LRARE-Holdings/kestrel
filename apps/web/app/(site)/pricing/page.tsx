"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ScrollFade,
  ScrollStagger,
  StaggerItem,
  ScrollBlur,
} from "@/components/ui/scroll-animations";
import {
  YEAR_1_TIERS,
  GOOD_FAITH_REFUND_DAYS,
  RESPONDENT_PAYMENT_WINDOW_DAYS,
  MIN_SUBSTANTIVE_RESPONSE_WORDS,
} from "@kestrel/shared/pricing/config";
import {
  formatGBPCompact,
  formatTierRange,
} from "@/lib/pricing/format";
import { quoteFee } from "@/lib/pricing/tiers";

// ---------------------------------------------------------------------------
// Free tools section — listed verbatim from PRICING.md §3
// ---------------------------------------------------------------------------

const freeTools: ReadonlyArray<{ name: string; href: string; description: string }> = [
  { name: "Late payment toolkit", href: "/tools/late-payment", description: "Statutory interest calculator + 4-stage letter generator." },
  { name: "Contract templates", href: "/tools/contracts", description: "Freelancer, services, NDA, SaaS, consulting, subcontractor." },
  { name: "Terms & conditions", href: "/tools/terms", description: "E-commerce, SaaS, professional services. CRA 2015 + UK GDPR." },
  { name: "Handshake", href: "/tools/handshake", description: "Lightweight mutual agreements with shareable confirmation." },
  { name: "Notice log", href: "/tools/notice-log", description: "Five notice types with structured templates." },
  { name: "Milestone tracker", href: "/tools/milestones", description: "Project + milestone tracking with shareable status updates." },
];

// ---------------------------------------------------------------------------
// Tier cards — pulled directly from the shared pricing config so the
// numbers in this UI cannot drift from PRICING.md.
// ---------------------------------------------------------------------------

interface TierCardData {
  id: (typeof YEAR_1_TIERS)[number]["id"];
  label: string;
  range: string;
  perPartyLabel: string;
  totalLabel: string;
  description: string;
  highlight: boolean;
}

function buildTierCards(): TierCardData[] {
  return YEAR_1_TIERS.map((tier) => {
    // For the four headline cards we quote the *base* fee at the lower edge
    // of each tier — this avoids implying any particular dispute value while
    // staying truthful to PRICING.md.
    const sampleValue = tier.minValuePence === 0 ? 0 : tier.minValuePence;
    const quote = quoteFee(tier.id, sampleValue);

    const isComplex = tier.id === "complex";
    const perPartyLabel = isComplex
      ? `${formatGBPCompact(quote.perPartyPence)} + 0.5%`
      : formatGBPCompact(quote.perPartyPence);
    const totalLabel = isComplex
      ? "Capped at £1,500/party"
      : `${formatGBPCompact(quote.totalPence)} total`;

    return {
      id: tier.id,
      label: tier.label,
      range: formatTierRange(tier.id),
      perPartyLabel,
      totalLabel,
      description: descriptionForTier(tier.id),
      // Standard is the volume tier per PRICING.md §4.2 — highlight it.
      highlight: tier.id === "standard",
    };
  });
}

function descriptionForTier(id: string): string {
  switch (id) {
    case "small":
      return "On-ramp for first-time users. Smaller cases, simpler facts.";
    case "standard":
      return "Most SME disputes land here. The wedge of the model.";
    case "larger":
      return "Higher-value cases that warrant a more involved process.";
    case "complex":
      return "High-value or multi-party cases. Per-party fee capped.";
    default:
      return "";
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PricingPage() {
  const tierCards = buildTierCards();

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      {/* Hero */}
      <ScrollBlur className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-kestrel">
          Pricing
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:mt-4 sm:text-4xl lg:text-5xl">
          Free tools. Fair fees only when you need them.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-text-secondary sm:mt-6 sm:text-lg">
          Every contract, T&amp;C and handshake on Kestrel is free, forever, with no
          sign-up. You only pay if a dispute arises &mdash; and even then, the
          respondent&apos;s fee is fully refunded if they engage in good faith.
        </p>
      </ScrollBlur>

      {/* Free tools section */}
      <section className="mt-16 sm:mt-24">
        <ScrollFade className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-kestrel">
            Free, forever
          </p>
          <h2 className="mt-3 font-display text-2xl font-bold text-ink sm:text-3xl">
            The full toolkit
          </h2>
          <p className="mt-3 text-sm text-text-secondary sm:text-base">
            No usage caps. No premium tiers. No sign-up wall. The free tools
            are how Kestrel reaches the businesses that need it.
          </p>
        </ScrollFade>

        <ScrollStagger
          stagger={0.08}
          className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
        >
          {freeTools.map((tool) => (
            <StaggerItem key={tool.name}>
              <Link
                href={tool.href}
                className="group flex h-full flex-col rounded-2xl border border-border-subtle/60 bg-surface/70 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-kestrel/30 hover:shadow-[var(--shadow-md)]"
              >
                <h3 className="font-display text-lg font-bold text-ink group-hover:text-kestrel">
                  {tool.name}
                </h3>
                <p className="mt-2 text-sm text-text-secondary">
                  {tool.description}
                </p>
                <span className="mt-4 text-xs font-semibold uppercase tracking-wider text-kestrel">
                  Free &rarr;
                </span>
              </Link>
            </StaggerItem>
          ))}
        </ScrollStagger>
      </section>

      {/* Dispute fee tiers */}
      <section className="mt-20 sm:mt-28">
        <ScrollFade className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-kestrel">
            Dispute resolution
          </p>
          <h2 className="mt-3 font-display text-2xl font-bold text-ink sm:text-3xl">
            Pay only when something goes wrong
          </h2>
          <p className="mt-3 text-sm text-text-secondary sm:text-base">
            Four tiers, set by the disputed value. Each party pays separately
            for access to structured negotiation. No subscription, no
            hourly rates, no surprise add-ons.
          </p>
        </ScrollFade>

        <ScrollStagger
          stagger={0.1}
          className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
        >
          {tierCards.map((tier) => (
            <StaggerItem key={tier.id}>
              <div
                className={`relative flex h-full flex-col rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] sm:p-8 ${
                  tier.highlight
                    ? "border-kestrel bg-surface shadow-[var(--shadow-lg)] ring-1 ring-kestrel/10"
                    : "border-border-subtle/60 bg-surface/70 shadow-sm backdrop-blur-xl"
                }`}
              >
                {tier.highlight && (
                  <span className="absolute -top-3 left-8 inline-flex items-center rounded-full bg-kestrel px-3 py-0.5 text-xs font-semibold text-white">
                    Most common
                  </span>
                )}

                <h3 className="font-display text-xl font-bold text-ink">
                  {tier.label}
                </h3>
                <p className="mt-1 text-sm text-text-secondary">{tier.range}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold text-ink">
                    {tier.perPartyLabel}
                  </span>
                </div>
                <p className="mt-1 text-xs text-text-muted">per party</p>
                <p className="mt-1 text-xs text-text-muted">{tier.totalLabel}</p>

                <p className="mt-6 flex-1 text-sm text-text-secondary">
                  {tier.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </ScrollStagger>

        {/* Good-faith refund call-out */}
        <ScrollFade delay={0.15}>
          <div className="mt-10 rounded-2xl border border-kestrel/20 bg-kestrel/5 p-6 sm:mt-12 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-6">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-kestrel/10 text-kestrel">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg font-bold text-ink">
                  The good-faith refund
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  If the respondent pays within{" "}
                  {RESPONDENT_PAYMENT_WINDOW_DAYS} days of being notified,
                  submits a substantive response (at least{" "}
                  {MIN_SUBSTANTIVE_RESPONSE_WORDS} words addressing the
                  claim), and the dispute reaches a recorded resolution
                  within {GOOD_FAITH_REFUND_DAYS} days of them joining,{" "}
                  <strong className="text-ink">
                    their fee is refunded in full.
                  </strong>{" "}
                  Engagement is rewarded; defensiveness is not.
                </p>
              </div>
            </div>
          </div>
        </ScrollFade>

        {/* Complex tier footnote */}
        <ScrollFade delay={0.2}>
          <p className="mt-6 text-center text-xs text-text-muted sm:text-sm">
            Complex tier (£25,000+): a flat £250 base plus 0.5% of the value
            above £25,000, capped at £1,500 per party (£3,000 total). No
            percentage-of-claim fees below £25,000.
          </p>
        </ScrollFade>
      </section>

      {/* What the fee buys (PRICING.md §6.4 language) */}
      <section className="mt-20 sm:mt-28">
        <ScrollFade className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-border-subtle/60 bg-surface/70 p-6 shadow-sm backdrop-blur-xl sm:p-10">
            <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">
              What the fee buys
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary sm:text-base">
              The dispute fee buys access to Kestrel&apos;s structured
              communication venue and case management infrastructure. It does
              not buy mediation, legal advice, adjudication, representation,
              or a guaranteed outcome. Kestrel is a venue, not a service.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary sm:text-base">
              For details on how cases are handled and how the platform
              operates, see our{" "}
              <Link
                href="/terms"
                className="font-medium text-kestrel hover:text-kestrel-hover transition-colors"
              >
                terms of service
              </Link>
              .
            </p>
          </div>
        </ScrollFade>
      </section>

      {/* Kestrel Pro placeholder (Year 2) */}
      <section className="mt-20 sm:mt-28">
        <ScrollFade className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-border-subtle/60 bg-surface/40 p-6 shadow-sm backdrop-blur-xl sm:p-10">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-warm/40 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Coming later
              </span>
              <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">
                Kestrel Pro
              </h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary sm:text-base">
              A monthly subscription for businesses with multiple ongoing
              relationships. Document vault with version history, branded
              exports, multi-user accounts, and a priority dispute queue.
              Launching in Year 2 once we have the case data to do it well.
            </p>
            <p className="mt-3 text-sm text-text-secondary">
              Want to be notified at launch?{" "}
              <Link
                href="/contact"
                className="font-medium text-kestrel hover:text-kestrel-hover transition-colors"
              >
                Get in touch
              </Link>
              .
            </p>
          </div>
        </ScrollFade>
      </section>

      {/* CTA */}
      <ScrollFade delay={0.1}>
        <div className="mt-16 text-center sm:mt-20">
          <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
            Start with the free toolkit
          </h2>
          <p className="mt-3 text-sm text-text-secondary sm:text-base">
            No sign-up. No credit card. Generate a contract with the Kestrel
            clause embedded and you&apos;re covered.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/tools">
              <Button>Open the toolkit</Button>
            </Link>
            <Link href="/contact">
              <Button variant="secondary">Talk to us</Button>
            </Link>
          </div>
        </div>
      </ScrollFade>

      {/* Disclaimer */}
      <p className="mt-12 text-center text-xs text-text-muted sm:mt-16">
        Prices shown are introductory Year 1 rates and may change as the
        platform matures. England &amp; Wales only.
      </p>
    </div>
  );
}
