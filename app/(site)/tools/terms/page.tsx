import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { BUSINESS_TYPES } from "@/lib/terms/schemas";

export const metadata: Metadata = {
  title: "Terms & Conditions Generator — Kestrel",
  description:
    "Generate UK-compliant terms and conditions customised to your business type. E-commerce, SaaS, or professional services.",
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  ecommerce: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
    </svg>
  ),
  saas: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" />
    </svg>
  ),
  professional: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
    </svg>
  ),
};

export default function TermsGeneratorPage() {
  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-16 sm:px-6 lg:px-8 2xl:px-12">
      <Link
        href="/tools"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-kestrel transition-colors"
      >
        &larr; All tools
      </Link>

      <div className="rounded-2xl border border-border-subtle/60 bg-white/70 p-8 shadow-sm backdrop-blur-xl sm:p-12">
        <h1 className="font-display text-4xl text-ink sm:text-5xl">
          Terms & Conditions Generator
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-text-secondary leading-relaxed">
          Generate UK-compliant terms and conditions customised to your business
          type. Includes Consumer Rights Act 2015 compliance, GDPR sections, and
          optional dispute resolution.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {BUSINESS_TYPES.map((type) => (
            <Link key={type.value} href={`/tools/terms/${type.value}`} className="group">
              <Card className="h-full transition-shadow hover:shadow-[var(--shadow-md)] group-hover:border-kestrel/30">
                <CardContent className="flex flex-col gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-kestrel/10 text-kestrel">
                    {TYPE_ICONS[type.value]}
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-ink group-hover:text-kestrel transition-colors">
                      {type.label}
                    </h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                      {type.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-12 rounded-[var(--radius-lg)] border border-border-subtle bg-white p-6">
          <h3 className="text-sm font-semibold text-ink">How it works</h3>
          <ul className="mt-3 space-y-2 text-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-kestrel/10 text-xs font-medium text-kestrel">1</span>
              Select your business type above
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-kestrel/10 text-xs font-medium text-kestrel">2</span>
              Answer a short questionnaire about your business
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-kestrel/10 text-xs font-medium text-kestrel">3</span>
              Preview your terms, then download as PDF, DOCX, Markdown, or HTML
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
