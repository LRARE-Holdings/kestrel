"use client";

import Link from "next/link";
import {
  IconFileText,
  IconCalculator,
  IconHandshake,
  IconClipboard,
  IconArrowRight,
} from "@/components/ui/icons";

const firstActions = [
  {
    title: "Create your first contract",
    description: "Professional UK contract templates, ready in minutes.",
    href: "/tools/contracts",
    icon: IconFileText,
  },
  {
    title: "Calculate a late payment",
    description: "Statutory interest and compensation under UK law.",
    href: "/tools/late-payment/calculator",
    icon: IconCalculator,
  },
  {
    title: "Set up a handshake",
    description: "Simple, clear agreements between two parties.",
    href: "/tools/handshake",
    icon: IconHandshake,
  },
  {
    title: "Generate terms & conditions",
    description: "UK-compliant T&Cs for your website or service.",
    href: "/tools/terms",
    icon: IconClipboard,
  },
];

export function EmptyDashboard() {
  return (
    <div className="mt-8">
      {/* Greeting section */}
      <div>
        <h2 className="font-display text-2xl text-ink">Welcome to Kestrel</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Get started with the tools below, or explore the full toolkit.
        </p>
      </div>

      {/* Guided action cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {firstActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="group"
            >
              <div className="card-hover flex items-start gap-4 rounded-[var(--radius-xl)] border border-border-subtle bg-surface p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-kestrel/8">
                  <Icon className="h-5 w-5 text-kestrel" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">
                    {action.title}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    {action.description}
                  </p>
                </div>
                <IconArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* What is Kestrel context panel */}
      <div className="mt-8 rounded-[var(--radius-xl)] bg-stone/30 p-6">
        <h3 className="font-display text-lg text-ink">What is Kestrel?</h3>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          Kestrel gives businesses structured tools to prevent and resolve
          disputes. Use the free toolkit to create contracts, chase late
          payments, and set up clear agreements. When disagreements happen,
          Kestrel provides a structured path to resolution -- no courtroom
          required.
        </p>
      </div>
    </div>
  );
}
