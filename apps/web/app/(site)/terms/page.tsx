import type { Metadata } from "next";
import { EMAILS } from "@kestrel/shared/constants";

export const metadata: Metadata = {
  title: "Terms of Service — Kestrel",
  description: "Terms of service for the Kestrel platform.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-24 sm:px-6 lg:px-8 2xl:px-12">
      <div className="rounded-2xl border border-border-subtle/60 bg-surface/70 p-8 shadow-sm backdrop-blur-xl sm:p-12">
        <h1 className="font-display text-4xl text-ink sm:text-5xl">
          Terms of Service
        </h1>
        <p className="mt-6 text-sm text-text-muted">
          Last updated: April 2026
        </p>

        <div className="mt-12 space-y-10 text-text-secondary leading-relaxed">
          <section>
            <h2 className="font-display text-xl text-ink">Overview</h2>
            <p className="mt-3">
              These terms govern your use of the Kestrel platform, operated by
              OnKestrel Limited. By using Kestrel, you agree to these terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">Free tools</h2>
            <p className="mt-3">
              Our free tools (calculators, letter generators, contract templates)
              are provided for informational purposes. They do not constitute
              legal advice. You should seek professional legal advice for your
              specific circumstances.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">Dispute resolution</h2>
            <p className="mt-3">
              Kestrel is a structured communication venue. We do not provide legal
              advice, mediate disputes, or act as an arbitrator. We facilitate
              structured communication between parties who have agreed to use the
              platform.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">Document generation</h2>
            <p className="mt-3">
              Documents generated through Kestrel are assembled from pre-written
              legal text using deterministic logic. While our templates are
              reviewed for accuracy, they are general-purpose and may not be
              suitable for all situations. We recommend having important
              agreements reviewed by a solicitor.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">Accounts</h2>
            <p className="mt-3">
              You are responsible for maintaining the security of your account.
              You must provide accurate information when creating an account. We
              may suspend accounts that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">Governing law</h2>
            <p className="mt-3">
              These terms are governed by the laws of England and Wales. Any
              disputes arising from these terms shall be subject to the exclusive
              jurisdiction of the courts of England and Wales.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">Contact</h2>
            <p className="mt-3">
              Questions about these terms?{" "}
              <a
                href={`mailto:${EMAILS.hello}`}
                className="font-medium text-kestrel hover:text-kestrel-hover transition-colors"
              >
                {EMAILS.hello}
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
