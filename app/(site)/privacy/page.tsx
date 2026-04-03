import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Kestrel",
  description: "How Kestrel handles your personal data under UK GDPR.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl text-ink sm:text-5xl">
        Privacy Policy
      </h1>
      <p className="mt-6 text-sm text-text-muted">
        Last updated: April 2026
      </p>

      <div className="mt-12 space-y-10 text-text-secondary leading-relaxed">
        <section>
          <h2 className="font-display text-xl text-ink">Who we are</h2>
          <p className="mt-3">
            Kestrel is operated by Pellar Technologies, registered in England
            and based in Newcastle-upon-Tyne. We are the data controller for
            personal data processed through the Kestrel platform.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink">What we collect</h2>
          <div className="mt-3 space-y-3">
            <p>
              <strong className="text-ink">Free tools (no account):</strong> We
              do not collect personal data when you use our free tools without
              signing in. Calculations and document generation happen in your
              browser.
            </p>
            <p>
              <strong className="text-ink">Account holders:</strong> When you
              create an account, we collect your email address, display name,
              and business details you choose to provide.
            </p>
            <p>
              <strong className="text-ink">Dispute resolution:</strong> When you
              file or respond to a dispute, we process the information you
              submit, including evidence files and communications.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink">How we use your data</h2>
          <p className="mt-3">
            We process your data to provide our dispute resolution and business
            tools services. Our lawful basis is legitimate interests (providing
            the service you signed up for) and, where appropriate, your consent.
          </p>
          <p className="mt-3">
            We do not use your data for marketing, sell it to third parties, or
            use it to train AI models.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink">Data retention</h2>
          <div className="mt-3 space-y-2 text-sm">
            <p>
              <strong className="text-ink">Account data:</strong> Retained for
              the lifetime of your account plus 30 days after deletion.
            </p>
            <p>
              <strong className="text-ink">Dispute records:</strong> Retained
              for 6 years after dispute closure (England &amp; Wales limitation
              period for contract claims).
            </p>
            <p>
              <strong className="text-ink">Unsigned documents:</strong> 90 days
              for unauthenticated users.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink">Your rights</h2>
          <p className="mt-3">
            Under UK GDPR, you have the right to access, correct, delete, and
            port your personal data. You can exercise these rights through your
            account settings or by contacting{" "}
            <a
              href="mailto:privacy@kestrel.law"
              className="font-medium text-kestrel hover:text-kestrel-hover transition-colors"
            >
              privacy@kestrel.law
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink">Third parties</h2>
          <p className="mt-3">
            We use Supabase (database and authentication), Vercel (hosting), and
            Resend (transactional email). All have signed data processing
            agreements. Your data is stored within the EU/UK.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink">Contact</h2>
          <p className="mt-3">
            For data protection enquiries:{" "}
            <a
              href="mailto:privacy@kestrel.law"
              className="font-medium text-kestrel hover:text-kestrel-hover transition-colors"
            >
              privacy@kestrel.law
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
