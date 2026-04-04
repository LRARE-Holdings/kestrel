import type { Metadata } from "next";
import { EMAILS } from "@kestrel/shared/constants";

export const metadata: Metadata = {
  title: "Contact — Kestrel",
  description: "Get in touch with the Kestrel team.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-24 sm:px-6 lg:px-8 2xl:px-12">
      <div className="rounded-2xl border border-border-subtle/60 bg-surface/70 p-8 shadow-sm backdrop-blur-xl sm:p-12">
        <h1 className="font-display text-4xl text-ink sm:text-5xl">
          Get in touch
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-text-secondary">
          Questions about the tools, a dispute, or Kestrel itself? Reach out.
        </p>

        <div className="mt-16 grid gap-8 sm:grid-cols-2">
          <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-surface p-6">
            <h2 className="text-base font-semibold text-ink">Email</h2>
            <p className="mt-2 text-sm text-text-secondary">
              For general enquiries, support, or partnership opportunities.
            </p>
            <a
              href={`mailto:${EMAILS.hello}`}
              className="mt-3 inline-block text-sm font-medium text-kestrel hover:text-kestrel-hover transition-colors"
            >
              {EMAILS.hello}
            </a>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-surface p-6">
            <h2 className="text-base font-semibold text-ink">Location</h2>
            <p className="mt-2 text-sm text-text-secondary">
              OnKestrel Limited
            </p>
            <p className="text-sm text-text-muted">Newcastle-upon-Tyne, UK</p>
          </div>
        </div>

        <div className="mt-12 rounded-[var(--radius-lg)] border border-border-subtle bg-cream p-6">
          <h2 className="text-base font-semibold text-ink">Data protection</h2>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            For data protection enquiries, subject access requests, or to exercise
            your rights under UK GDPR, please email{" "}
            <a
              href={`mailto:${EMAILS.privacy}`}
              className="font-medium text-kestrel hover:text-kestrel-hover transition-colors"
            >
              {EMAILS.privacy}
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
