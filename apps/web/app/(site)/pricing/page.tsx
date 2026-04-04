"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ScrollFade,
  ScrollSection,
  ScrollStagger,
  StaggerItem,
  ScrollBlur,
  ScrollScale,
} from "@/components/ui/scroll-animations";

const tiers = [
  {
    name: "Free",
    description: "Professional tools for every business.",
    price: "0",
    period: "forever",
    highlight: false,
    cta: "Start using tools",
    ctaHref: "/tools",
    features: [
      "Late payment calculator",
      "Letter generator (4 stages)",
      "Contract templates",
      "Terms & conditions generator",
      "Handshake agreements",
      "Kestrel dispute clause included",
    ],
  },
  {
    name: "Single Case",
    description: "Resolve one dispute. No commitment.",
    price: "49",
    period: "per dispute",
    highlight: false,
    cta: "File a dispute",
    ctaHref: "/sign-in",
    features: [
      "Everything in Free",
      "File one dispute",
      "Structured communication",
      "Evidence uploads",
      "Email notifications",
      "30-day resolution window",
    ],
  },
  {
    name: "Professional",
    description: "Save documents and manage disputes.",
    price: "29",
    period: "/month",
    highlight: true,
    cta: "Get started",
    ctaHref: "/sign-in",
    features: [
      "Everything in Free",
      "Save and manage documents",
      "Unlimited disputes",
      "Structured communication",
      "Evidence management",
      "Email notifications",
      "Document history",
    ],
  },
  {
    name: "Business",
    description: "For teams managing multiple contracts.",
    price: "79",
    period: "/month",
    highlight: false,
    cta: "Get started",
    ctaHref: "/sign-in",
    features: [
      "Everything in Professional",
      "Priority dispute handling",
      "Escalation to vetted mediators",
      "Bulk contract generation",
      "Advanced milestone tracking",
      "API access",
      "Dedicated support",
    ],
  },
] as const;

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-28 sm:px-6 lg:px-8 2xl:px-12">
      <ScrollBlur className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-kestrel">
          Pricing
        </p>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-text-secondary">
          Free tools stay free. Pay only when you need dispute resolution
          and document management.
        </p>
      </ScrollBlur>

      <ScrollStagger stagger={0.1} className="mt-20 grid gap-6 lg:grid-cols-4">
        {tiers.map((tier) => (
          <StaggerItem key={tier.name}>
            <div
              className={`relative flex h-full flex-col rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] ${
                tier.highlight
                  ? "border-kestrel bg-surface shadow-[var(--shadow-lg)] ring-1 ring-kestrel/10"
                  : "border-border-subtle/60 bg-surface/70 shadow-sm backdrop-blur-xl"
              }`}
            >
              {tier.highlight && (
                <span className="absolute -top-3 left-8 inline-flex items-center rounded-full bg-kestrel px-3 py-0.5 text-xs font-semibold text-white">
                  Most popular
                </span>
              )}

              <h2 className="font-display text-xl font-bold text-ink">{tier.name}</h2>
              <p className="mt-1 text-sm text-text-secondary">{tier.description}</p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold text-ink">&pound;{tier.price}</span>
                <span className="text-sm text-text-muted">{tier.period}</span>
              </div>

              <Link href={tier.ctaHref} className="mt-8">
                <Button variant={tier.highlight ? "primary" : "secondary"} className="w-full">
                  {tier.cta}
                </Button>
              </Link>

              <ul className="mt-8 flex-1 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-text-secondary">
                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-kestrel" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </StaggerItem>
        ))}
      </ScrollStagger>

      {/* FAQ-style note */}
      <ScrollFade delay={0.2}>
        <div className="mt-16 rounded-2xl border border-border-subtle/60 bg-surface/70 p-8 text-center shadow-sm backdrop-blur-xl">
          <h3 className="font-display text-lg font-bold text-ink">
            Not sure which plan?
          </h3>
          <p className="mt-2 text-sm text-text-secondary">
            Start with the free tools. Upgrade when you need dispute resolution or document management.{" "}
            <Link href="/contact" className="font-medium text-kestrel hover:text-kestrel-hover transition-colors">
              Get in touch
            </Link>{" "}
            if you have questions.
          </p>
        </div>
      </ScrollFade>
    </div>
  );
}
