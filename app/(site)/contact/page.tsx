import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Kestrel",
  description: "Get in touch with the Kestrel team.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl text-ink sm:text-5xl">
        Get in touch
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-text-secondary">
        Questions about the tools, a dispute, or Kestrel itself? Reach out.
      </p>

      <div className="mt-16 grid gap-8 sm:grid-cols-2">
        <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-white p-6">
          <h2 className="text-base font-semibold text-ink">Email</h2>
          <p className="mt-2 text-sm text-text-secondary">
            For general enquiries, support, or partnership opportunities.
          </p>
          <a
            href="mailto:hello@kestrel.law"
            className="mt-3 inline-block text-sm font-medium text-kestrel hover:text-kestrel-hover transition-colors"
          >
            hello@kestrel.law
          </a>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-white p-6">
          <h2 className="text-base font-semibold text-ink">Location</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Kestrel Solutions Limited
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
            href="mailto:privacy@kestrel.law"
            className="font-medium text-kestrel hover:text-kestrel-hover transition-colors"
          >
            privacy@kestrel.law
          </a>
          .
        </p>
      </div>
    </div>
  );
}
