"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ScrollFade,
  ScrollScale,
  ScrollSection,
  ScrollStagger,
  StaggerItem,
  ScrollBlur,
  ScrollReveal,
} from "@/components/ui/scroll-animations";

const values = [
  {
    title: "Deterministic, not generative",
    description:
      "Kestrel assembles documents from human-authored, auditable legal text. Same inputs, same output. No AI writes your legal content.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
  },
  {
    title: "Privacy by architecture",
    description:
      "Row-level security policies enforce data isolation at the database level. Party A cannot see Party B's data.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    title: "Jurisdiction-specific",
    description:
      "Built for the legal framework of England and Wales. One jurisdiction, done right.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
      </svg>
    ),
  },
  {
    title: "Free tools, no gates",
    description:
      "Use any tool without signing up. Create an account to save documents. The tools work either way.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
] as const;

const timeline = [
  {
    label: "Before the dispute",
    title: "Tools that protect",
    description:
      "Contract templates, late payment calculators, and terms generators. Each embeds a Kestrel dispute clause by default.",
  },
  {
    label: "When it happens",
    title: "Structured initiation",
    description:
      "Either party starts the process. No angry emails, no immediate solicitor letters. A structured path both sides already agreed to.",
  },
  {
    label: "Through resolution",
    title: "Clear communication",
    description:
      "Evidence sharing, guided dialogue, defined escalation paths to qualified professionals.",
  },
] as const;

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
      {/* ═══ HERO ═══ */}
      <section className="relative flex min-h-[40vh] items-center overflow-hidden py-12 sm:min-h-[50vh] sm:py-16 lg:min-h-[60vh]">
        <div className="absolute -top-24 right-1/4 h-[280px] w-[280px] rounded-full bg-kestrel/[0.03] blur-[100px] sm:h-[400px] sm:w-[400px]" />
        <div className="absolute -bottom-32 left-1/3 h-[200px] w-[200px] rounded-full bg-sage/[0.05] blur-[80px] sm:h-[300px] sm:w-[300px]" />

        <div className="relative z-10 max-w-3xl">
          <p className="animate-fade-up text-xs font-semibold uppercase tracking-[0.2em] text-kestrel">
            About Kestrel
          </p>
          <h1 className="animate-fade-up delay-100 mt-4 font-display text-3xl font-bold leading-[1.1] tracking-tight text-ink sm:mt-6 sm:text-5xl lg:text-6xl">
            The space between
            <br />
            <span className="text-kestrel">angry email</span> and
            <br />
            <span className="text-kestrel">solicitor&apos;s letter.</span>
          </h1>
          <p className="animate-fade-up delay-200 mt-5 max-w-xl text-base leading-relaxed text-text-secondary sm:mt-8 sm:text-lg">
            Kestrel is online dispute resolution infrastructure for businesses
            in England and Wales. We provide the structured middle ground that
            doesn&apos;t currently exist.
          </p>
        </div>
      </section>

      {/* ═══ THE PROBLEM — Card ═══ */}
      <ScrollSection className="pb-4 sm:pb-6">
        <div className="rounded-2xl border border-border-subtle/60 bg-surface/70 p-6 shadow-sm backdrop-blur-xl sm:p-10 lg:p-12">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-24">
            <ScrollFade direction="left" distance={30}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-kestrel">
                The problem
              </p>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink sm:mt-4 sm:text-3xl lg:text-4xl">
                Small businesses have no practical middle ground.
              </h2>
            </ScrollFade>
            <ScrollFade direction="right" delay={0.15} distance={30}>
              <div className="flex flex-col justify-center space-y-4 sm:space-y-6">
                <p className="text-sm leading-relaxed text-text-secondary sm:text-base">
                  Court is slow, expensive, and adversarial. Mediation requires
                  both parties to agree after things have escalated. Most
                  businesses absorb the loss or damage the relationship.
                </p>
                <p className="text-sm leading-relaxed text-text-secondary sm:text-base">
                  Kestrel gives you a structured early-stage resolution process
                  that both parties opted into before the dispute began.
                </p>
              </div>
            </ScrollFade>
          </div>
        </div>
      </ScrollSection>

      {/* ═══ HOW KESTREL WORKS — TIMELINE — Card ═══ */}
      <ScrollSection className="pb-4 sm:pb-6">
        <div className="rounded-2xl border border-border-subtle/60 bg-surface/70 p-6 shadow-sm backdrop-blur-xl sm:p-10 lg:p-12">
          <ScrollBlur className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-kestrel">
              How it works
            </p>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink sm:mt-4 sm:text-3xl lg:text-4xl">
              You agree to the process before you need it.
            </h2>
            <p className="mt-3 text-sm text-text-secondary sm:mt-4 sm:text-base">
              The free tools embed a dispute clause by default. By the time a
              disagreement arises, both parties have agreed to resolve it
              on Kestrel first.
            </p>
          </ScrollBlur>

          <div className="relative mt-12 sm:mt-20">
            {/* Vertical line */}
            <div className="absolute bottom-0 left-[19px] top-0 w-px bg-border sm:left-1/2 sm:-ml-px" />

            <div className="space-y-12 sm:space-y-24">
              {timeline.map((step, i) => (
                <ScrollFade
                  key={step.label}
                  direction={i % 2 === 0 ? "left" : "right"}
                  delay={i * 0.1}
                  distance={24}
                >
                  <div
                    className={`relative flex flex-col gap-8 sm:flex-row sm:items-start ${
                      i % 2 === 1 ? "sm:flex-row-reverse" : ""
                    }`}
                  >
                    {/* Dot */}
                    <div className="absolute left-[12px] top-1 z-10 h-[15px] w-[15px] rounded-full border-[3px] border-kestrel bg-cream sm:left-1/2 sm:-ml-[7.5px]" />

                    {/* Content */}
                    <div
                      className={`ml-12 sm:ml-0 sm:w-[calc(50%-40px)] ${
                        i % 2 === 1 ? "sm:mr-auto sm:text-right" : "sm:ml-auto"
                      }`}
                    >
                      <span className="font-mono text-xs font-semibold text-kestrel/60">
                        {step.label}
                      </span>
                      <h3 className="mt-2 text-lg font-semibold text-ink sm:text-xl">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </ScrollFade>
              ))}
            </div>
          </div>
        </div>
      </ScrollSection>

      {/* ═══ WHAT KESTREL IS NOT — Card ═══ */}
      <ScrollSection className="pb-4 sm:pb-6">
        <div className="rounded-2xl border border-border-subtle/60 bg-surface/70 p-6 shadow-sm backdrop-blur-xl sm:p-10 lg:p-12">
          <ScrollFade direction="none" className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-kestrel">
              Clear boundaries
            </p>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink sm:mt-4 sm:text-3xl lg:text-4xl">
              Kestrel is a communication venue.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-text-secondary sm:mt-6 sm:text-base">
              We provide structured communication and escalation paths to
              qualified professionals. We do not give legal advice, mediate
              disputes, or take sides.
            </p>
          </ScrollFade>

          <ScrollStagger stagger={0.1} className="mx-auto mt-10 grid max-w-3xl gap-3 sm:mt-16 sm:grid-cols-2 sm:gap-4">
            {[
              { no: "Legal advice", yes: "Legal tools" },
              { no: "Mediation", yes: "Structured communication" },
              { no: "Taking sides", yes: "Fair process" },
              { no: "Replacing solicitors", yes: "Escalation paths" },
            ].map((item) => (
              <StaggerItem key={item.no}>
                <div className="rounded-xl border border-border-subtle/60 bg-cream/50 p-5 transition-all duration-300 hover:border-kestrel/20 hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)] sm:p-6">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-error/10">
                      <svg className="h-3 w-3 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </span>
                    <span className="text-sm text-text-muted line-through decoration-text-muted/30">
                      {item.no}
                    </span>
                  </div>
                  <div className="mt-3 flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-kestrel/10">
                      <svg className="h-3 w-3 text-kestrel" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </span>
                    <span className="text-sm font-medium text-ink">
                      {item.yes}
                    </span>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </ScrollStagger>
        </div>
      </ScrollSection>

      {/* ═══ VALUES — Card ═══ */}
      <ScrollSection className="pb-4 sm:pb-6">
        <div className="rounded-2xl border border-border-subtle/60 bg-surface/70 p-6 shadow-sm backdrop-blur-xl sm:p-10 lg:p-12">
          <ScrollFade direction="up" className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-kestrel">
              Principles
            </p>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink sm:mt-4 sm:text-3xl lg:text-4xl">
              Four commitments
            </h2>
          </ScrollFade>

          <ScrollStagger stagger={0.12} className="mt-8 grid gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-4">
            {values.map((value) => (
              <StaggerItem key={value.title}>
                <div className="group relative rounded-xl border border-border-subtle/60 bg-cream/50 p-5 transition-all duration-300 hover:border-kestrel/20 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] sm:p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-kestrel/8 text-kestrel transition-colors group-hover:bg-kestrel group-hover:text-white">
                    {value.icon}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-ink">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    {value.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </ScrollStagger>
        </div>
      </ScrollSection>

      {/* ═══ COMPANY — Card ═══ */}
      <ScrollSection className="pb-4 sm:pb-6">
        <div className="rounded-2xl border border-border-subtle/60 bg-surface/70 p-6 shadow-sm backdrop-blur-xl sm:p-10 lg:p-12">
          <div className="grid gap-8 lg:grid-cols-5 lg:gap-24">
            <ScrollFade direction="left" distance={30} className="lg:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-kestrel">
                Company
              </p>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink sm:mt-4 sm:text-3xl lg:text-4xl">
                Built in Newcastle
              </h2>
            </ScrollFade>
            <ScrollFade direction="right" delay={0.15} distance={30} className="lg:col-span-3">
              <div className="flex flex-col justify-center space-y-4 sm:space-y-6">
                <p className="text-sm leading-relaxed text-text-secondary sm:text-base">
                  Kestrel is based in Newcastle-upon-Tyne. We believe that
                  access to fair dispute resolution shouldn&apos;t require deep
                  pockets or legal expertise.
                </p>
                <p className="text-sm leading-relaxed text-text-secondary sm:text-base">
                  We&apos;re building the infrastructure that sits between the
                  tools businesses already use and the legal system they hope
                  they&apos;ll never need.
                </p>
                <ScrollReveal direction="left" delay={0.3}>
                  <div className="flex flex-wrap items-center gap-4 pt-2 sm:gap-6">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs text-text-muted">
                        Jurisdiction
                      </span>
                      <span className="mt-1 text-sm font-medium text-ink">
                        England &amp; Wales
                      </span>
                    </div>
                    <div className="hidden h-8 w-px bg-border-subtle sm:block" />
                    <div className="flex flex-col">
                      <span className="font-mono text-xs text-text-muted">
                        Based in
                      </span>
                      <span className="mt-1 text-sm font-medium text-ink">
                        Newcastle-upon-Tyne
                      </span>
                    </div>
                    <div className="hidden h-8 w-px bg-border-subtle sm:block" />
                    <div className="flex flex-col">
                      <span className="font-mono text-xs text-text-muted">
                        Tools
                      </span>
                      <span className="mt-1 text-sm font-medium text-ink">
                        Free forever
                      </span>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </ScrollFade>
          </div>
        </div>
      </ScrollSection>

      {/* ═══ CTA — Card ═══ */}
      <ScrollScale className="pb-4 sm:pb-6" from={0.96}>
        <div className="relative overflow-hidden rounded-2xl bg-ink p-8 text-center shadow-sm sm:p-12 lg:p-16">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-kestrel/20 blur-[80px]" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-sage/15 blur-[60px]" />

          <div className="relative z-10">
            <ScrollFade direction="none" delay={0.1}>
              <h2 className="font-display text-2xl font-bold tracking-tight text-cream sm:text-3xl lg:text-4xl">
                Start now
              </h2>
            </ScrollFade>
            <ScrollFade direction="up" delay={0.2} distance={20}>
              <p className="mt-3 text-sm text-cream/70 sm:mt-4 sm:text-base">
                Use the free tools. Add a Kestrel dispute clause to your
                next contract.
              </p>
            </ScrollFade>
            <ScrollFade direction="up" delay={0.3} distance={20}>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:mt-8 sm:flex-row sm:gap-4">
                <Link href="/tools" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full bg-cream text-ink hover:bg-surface sm:w-auto sm:min-w-[180px]"
                  >
                    Explore free tools
                  </Button>
                </Link>
                <Link href="/contact" className="w-full sm:w-auto">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full border border-cream/30 !text-cream hover:bg-cream/10 sm:w-auto sm:min-w-[180px]"
                  >
                    Get in touch
                  </Button>
                </Link>
              </div>
            </ScrollFade>
          </div>
        </div>
      </ScrollScale>
    </div>
  );
}
