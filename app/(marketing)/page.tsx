import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    number: "01",
    title: "Embed the clause",
    description:
      "Add a Kestrel dispute resolution clause to your contracts. One click when using our contract templates — or copy it into your own.",
  },
  {
    number: "02",
    title: "Dispute arises",
    description:
      "When a disagreement occurs, either party can initiate resolution through Kestrel. Structured, calm, and evidence-based from the start.",
  },
  {
    number: "03",
    title: "Resolve on Kestrel",
    description:
      "Work through a guided resolution process. Share evidence, communicate clearly, and reach an outcome — without solicitors or courts.",
  },
] as const;

const toolsPreview = [
  {
    title: "Late Payment Toolkit",
    description: "Calculate statutory interest and generate chaser letters.",
    href: "/tools/late-payment",
  },
  {
    title: "Contract Templates",
    description: "Professional contracts tailored to your business.",
    href: "/tools/contracts",
  },
  {
    title: "Handshake",
    description: "Lightweight shareable agreements between two parties.",
    href: "/tools/handshake",
  },
  {
    title: "Terms & Conditions",
    description: "UK-compliant T&Cs customised to your business.",
    href: "/tools/terms",
  },
  {
    title: "Notice Log",
    description: "Timestamped records of formal notices.",
    href: "/tools/notice-log",
  },
  {
    title: "Milestone Tracker",
    description: "Track deliverables against agreed timelines.",
    href: "/tools/milestones",
  },
] as const;

const trustSignals = [
  {
    title: "England & Wales law",
    description:
      "Built specifically for the legal framework of England and Wales. No generic multi-jurisdiction compromises.",
  },
  {
    title: "GDPR compliant",
    description:
      "Registered with the ICO. Your data is encrypted, isolated, and handled in accordance with UK data protection law.",
  },
  {
    title: "No AI legal advice",
    description:
      "Every document is assembled from human-authored legal text. Deterministic, auditable, and reliable.",
  },
] as const;

export function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-5xl leading-tight text-ink sm:text-6xl lg:text-7xl">
            Resolve it on Kestrel.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-text-secondary">
            Online dispute resolution for businesses in England and Wales.
            Free tools to protect your contracts, and a structured path to
            resolution when things go wrong.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/tools">
              <Button size="lg">Explore Free Tools</Button>
            </Link>
            <Link href="/about">
              <Button variant="secondary" size="lg">
                Learn more
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border-subtle bg-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl text-ink sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-text-secondary">
              Three steps from contract to resolution.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col gap-4">
                <span className="font-mono text-sm font-semibold text-kestrel">
                  {step.number}
                </span>
                <h3 className="text-lg font-semibold text-ink">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free tools preview */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl text-ink sm:text-4xl">
            Free tools, no sign-up
          </h2>
          <p className="mt-4 text-text-secondary">
            Professional-grade tools for businesses. Use them right now — no
            account needed.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {toolsPreview.map((tool) => (
            <Link key={tool.href} href={tool.href} className="group">
              <Card className="h-full transition-shadow hover:shadow-[var(--shadow-md)] group-hover:border-kestrel/30">
                <CardContent>
                  <h3 className="text-base font-semibold text-ink group-hover:text-kestrel transition-colors">
                    {tool.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-text-secondary">
                    {tool.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/tools">
            <Button variant="secondary">View all tools</Button>
          </Link>
        </div>
      </section>

      {/* Trust signals */}
      <section className="border-t border-border-subtle bg-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl text-ink sm:text-4xl">
              Built for businesses in England and Wales
            </h2>
            <p className="mt-4 text-text-secondary">
              Not a generic platform. Purpose-built for the legal framework you
              operate in.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {trustSignals.map((signal) => (
              <div
                key={signal.title}
                className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-border-subtle bg-cream p-6"
              >
                <h3 className="text-base font-semibold text-ink">
                  {signal.title}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {signal.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-[var(--radius-xl)] border border-border-subtle bg-white p-12 text-center shadow-[var(--shadow-sm)]">
          <h2 className="font-display text-3xl text-ink">
            Ready to get started?
          </h2>
          <p className="mt-4 text-text-secondary">
            Explore our free tools or add a Kestrel dispute clause to your next
            contract.
          </p>
          <div className="mt-8">
            <Link href="/tools">
              <Button size="lg">Explore Free Tools</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
