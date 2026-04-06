"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroBirdAnimation } from "@/components/ui/hero-bird-animation";
import {
  ScrollFade,
  ScrollScale,
  ScrollSection,
  ScrollStagger,
  StaggerItem,
  ScrollBlur,
} from "@/components/ui/scroll-animations";

const steps = [
  {
    number: "01",
    title: "Embed the clause",
    description:
      "Add a Kestrel dispute resolution clause to your contracts. One click with our templates — or copy it into your own.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Dispute arises",
    description:
      "Either party starts resolution through Kestrel. Structured, evidence-based.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Resolve on Kestrel",
    description:
      "Share evidence, communicate, reach an outcome. No solicitors or courts.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
] as const;

const tools = [
  {
    title: "Late Payment Toolkit",
    description: "Calculate statutory interest and generate chaser letters under the Late Payment Act.",
    href: "/tools/late-payment",
  },
  {
    title: "Contract Templates",
    description: "Freelancer, SaaS, consulting, and service agreements. Assembled from vetted clauses.",
    href: "/tools/contracts",
  },
  {
    title: "Terms & Conditions",
    description: "UK-compliant T&Cs for e-commerce, SaaS, and professional services.",
    href: "/tools/terms",
  },
  {
    title: "Handshake",
    description: "Lightweight shareable agreements. Create, share a link, get confirmation.",
    href: "/tools/handshake",
  },
  {
    title: "Notice Log",
    description: "Timestamped, immutable records of formal notices between parties.",
    href: "/tools/notice-log",
  },
  {
    title: "Milestone Tracker",
    description: "Track deliverables against agreed timelines with shared visibility.",
    href: "/tools/milestones",
  },
] as const;

const trustSignals = [
  {
    title: "Grounded in English law",
    description: "Built on English legal frameworks. Precise, specific, reviewed by professionals.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
      </svg>
    ),
  },
  {
    title: "GDPR compliant",
    description: "Encrypted, isolated, handled under UK data protection law.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    title: "No AI legal advice",
    description: "Documents assembled from human-authored, auditable legal text. Same inputs produce the same output.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
  },
] as const;

export default function HomePage() {
  return (
    <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
      {/* ═══ HERO ═══ */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden py-16 sm:min-h-[75vh] sm:py-20 lg:min-h-[85vh]">
        <HeroBirdAnimation />

        <div className="absolute -top-24 right-1/4 h-[320px] w-[320px] rounded-full bg-kestrel/[0.04] blur-[100px] sm:h-[480px] sm:w-[480px]" />
        <div className="absolute -bottom-32 left-1/4 h-[280px] w-[280px] rounded-full bg-sage/[0.06] blur-[80px] sm:h-[400px] sm:w-[400px]" />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-kestrel/15 bg-surface/80 px-3.5 py-1.5 text-xs font-medium text-kestrel backdrop-blur-sm sm:px-4">
            <span className="h-1.5 w-1.5 rounded-full bg-kestrel animate-pulse" />
            Structured dispute resolution for business
          </div>

          <h1 className="animate-fade-up delay-100 mt-6 font-display text-4xl font-bold leading-[1.08] tracking-tight text-ink sm:mt-8 sm:text-6xl lg:text-7xl">
            Resolve it
            <br />
            <span className="text-kestrel">on Kestrel.</span>
          </h1>

          <p className="animate-fade-up delay-200 mx-auto mt-5 max-w-xl text-base leading-relaxed text-text-secondary sm:mt-6 sm:text-lg lg:text-xl">
            Free tools to protect your contracts.
            A structured path when things go wrong.
          </p>

          <div className="animate-fade-up delay-300 mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
            <Link href="/tools" className="w-full sm:w-auto">
              <Button size="lg" className="w-full shadow-[var(--shadow-md)] transition-shadow hover:shadow-[var(--shadow-lg)] sm:w-auto sm:min-w-[200px]">
                Explore free tools
              </Button>
            </Link>
            <Link href="/about" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto sm:min-w-[200px]">
                How it works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <ScrollSection className="pb-4 sm:pb-6">
        <div className="rounded-2xl border border-border-subtle/60 bg-surface/70 p-6 shadow-sm backdrop-blur-xl sm:p-10 lg:p-12">
          <ScrollFade direction="none" className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-kestrel">How it works</p>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink sm:mt-4 sm:text-3xl lg:text-4xl">Three steps to resolution</h2>
            <p className="mt-3 text-sm text-text-secondary sm:mt-4 sm:text-base">From contract clause to structured outcome.</p>
          </ScrollFade>

          <ScrollStagger stagger={0.15} className="mt-10 grid gap-8 sm:mt-14 sm:grid-cols-3 sm:gap-8">
            {steps.map((step) => (
              <StaggerItem key={step.number}>
                <div className="relative flex flex-col items-start">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-kestrel/15 bg-kestrel/5 text-kestrel">{step.icon}</span>
                    <span className="font-mono text-xs font-semibold text-kestrel/60">{step.number}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-ink">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">{step.description}</p>
                </div>
              </StaggerItem>
            ))}
          </ScrollStagger>
        </div>
      </ScrollSection>

      {/* ═══ FREE TOOLS ═══ */}
      <ScrollSection className="pb-4 sm:pb-6" delay={0.05}>
        <div className="rounded-2xl border border-border-subtle/60 bg-surface/70 p-6 shadow-sm backdrop-blur-xl sm:p-10 lg:p-12">
          <ScrollFade direction="none" className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-kestrel">Free tools</p>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink sm:mt-4 sm:text-3xl lg:text-4xl">Use them now. No sign-up.</h2>
            <p className="mt-3 text-sm text-text-secondary sm:mt-4 sm:text-base">Six tools built for businesses. Free forever.</p>
          </ScrollFade>

          <ScrollStagger stagger={0.08} className="mt-8 grid gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {tools.map((tool) => (
              <StaggerItem key={tool.href}>
                <Link href={tool.href} className="group block">
                  <div className="relative h-full rounded-xl border border-border-subtle/60 bg-cream/50 p-5 transition-all duration-300 hover:border-kestrel/20 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] sm:p-6">
                    <h3 className="text-base font-semibold text-ink transition-colors group-hover:text-kestrel">{tool.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-text-secondary sm:mt-2">{tool.description}</p>
                    <div className="mt-3 flex items-center text-xs font-medium text-kestrel opacity-0 transition-opacity group-hover:opacity-100 sm:mt-4">
                      <span>Open tool</span>
                      <svg className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </ScrollStagger>

          <ScrollFade delay={0.3} className="mt-8 text-center sm:mt-10">
            <Link href="/tools">
              <Button variant="secondary">View all tools</Button>
            </Link>
          </ScrollFade>
        </div>
      </ScrollSection>

      {/* ═══ TRUST ═══ */}
      <ScrollSection className="pb-4 sm:pb-6" delay={0.05}>
        <div className="rounded-2xl border border-border-subtle/60 bg-surface/70 p-6 shadow-sm backdrop-blur-xl sm:p-10 lg:p-12">
          <ScrollBlur className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-kestrel">Trust</p>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink sm:mt-4 sm:text-3xl lg:text-4xl">Grounded in English law</h2>
            <p className="mt-3 text-sm text-text-secondary sm:mt-4 sm:text-base">Jurisdiction-specific. Built for professionals who handle contracts.</p>
          </ScrollBlur>

          <ScrollStagger stagger={0.12} className="mt-8 grid gap-3 sm:mt-12 sm:grid-cols-3 sm:gap-6">
            {trustSignals.map((signal) => (
              <StaggerItem key={signal.title}>
                <div className="flex flex-col gap-3 rounded-xl border border-border-subtle/60 bg-cream/50 p-5 transition-all duration-300 hover:border-kestrel/20 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] sm:gap-4 sm:p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-kestrel/8 text-kestrel">{signal.icon}</span>
                  <h3 className="text-base font-semibold text-ink">{signal.title}</h3>
                  <p className="text-sm leading-relaxed text-text-secondary">{signal.description}</p>
                </div>
              </StaggerItem>
            ))}
          </ScrollStagger>
        </div>
      </ScrollSection>

      {/* ═══ CTA ═══ */}
      <ScrollScale className="pb-4 sm:pb-6" from={0.96}>
        <div className="relative overflow-hidden rounded-2xl bg-ink p-8 text-center shadow-sm sm:p-12 lg:p-16">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-kestrel/20 blur-[80px]" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-sage/15 blur-[60px]" />
          <div className="relative z-10">
            <ScrollFade direction="none" delay={0.1}>
              <h2 className="font-display text-2xl font-bold tracking-tight text-cream sm:text-3xl lg:text-4xl">Start now</h2>
            </ScrollFade>
            <ScrollFade direction="up" delay={0.2} distance={20}>
              <p className="mt-3 text-sm text-cream/70 sm:mt-4 sm:text-base">Use the free tools. Add a Kestrel dispute clause to your next contract.</p>
            </ScrollFade>
            <ScrollFade direction="up" delay={0.3} distance={20}>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:mt-8 sm:flex-row sm:gap-4">
                <Link href="/tools" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full !bg-cream !text-ink shadow-[0_2px_12px_rgba(246,243,238,0.25)] transition-all duration-300 hover:!bg-surface hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(246,243,238,0.35)] sm:w-auto sm:min-w-[180px]">Explore free tools</Button>
                </Link>
                <Link href="/sign-in" className="w-full sm:w-auto">
                  <Button variant="ghost" size="lg" className="w-full border border-cream/25 !text-cream transition-all duration-300 hover:border-cream/50 hover:bg-cream/10 hover:-translate-y-0.5 sm:w-auto sm:min-w-[180px]">Create account</Button>
                </Link>
              </div>
            </ScrollFade>
          </div>
        </div>
      </ScrollScale>
    </div>
  );
}
