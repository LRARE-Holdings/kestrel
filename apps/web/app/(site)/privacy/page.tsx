import type { Metadata } from "next";
import { EMAILS } from "@kestrel/shared/constants";

export const metadata: Metadata = {
  title: "Privacy Policy — Kestrel",
  description: "How Kestrel handles your personal data under UK GDPR.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-screen-xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="rounded-2xl border border-border-subtle/60 bg-surface/70 p-6 shadow-sm backdrop-blur-xl sm:p-10 lg:p-12">
        <h1 className="font-display text-3xl text-ink sm:text-4xl lg:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-text-muted sm:mt-6">
          Last updated: 6 April 2026
        </p>

        <div className="mt-8 space-y-8 text-text-secondary leading-relaxed sm:mt-12 sm:space-y-10">
          {/* 1 */}
          <section>
            <h2 className="font-display text-xl text-ink">1. Who we are</h2>
            <p className="mt-3">
              Kestrel is operated by OnKestrel Limited, registered in England
              with its registered office in Newcastle-upon-Tyne. We are the data
              controller for personal data processed through the Kestrel
              platform. For data protection enquiries, contact{" "}
              <a
                href={`mailto:${EMAILS.privacy}`}
                className="font-medium text-kestrel hover:text-kestrel-hover transition-colors"
              >
                {EMAILS.privacy}
              </a>
              .
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="font-display text-xl text-ink">2. What we collect and why</h2>
            <div className="mt-3 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-ink">
                  Free tools (no account required)
                </h3>
                <p className="mt-1.5 text-sm">
                  We do not collect personal data when you use our free tools
                  without signing in. Calculations and document generation happen
                  in your browser. We may collect anonymous usage analytics
                  (tool name, session identifier) if you have consented to
                  analytics cookies. Lawful basis: consent.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink">
                  Account registration
                </h3>
                <p className="mt-1.5 text-sm">
                  When you create an account, we collect your email address,
                  display name, and any business details you choose to provide
                  (business name, type, size, industry). Lawful basis: contract
                  performance (providing the service you signed up for).
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink">
                  Dispute resolution
                </h3>
                <p className="mt-1.5 text-sm">
                  When you file or respond to a dispute, we process the
                  information you submit, including respondent details,
                  submissions, evidence files, and communications. Lawful basis:
                  contract performance and legitimate interests (facilitating
                  structured dispute resolution).
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink">
                  Payment information
                </h3>
                <p className="mt-1.5 text-sm">
                  Payment card details are processed directly by Stripe, our
                  payment processor. We do not store or have access to your full
                  card details. We store a Stripe customer identifier to manage
                  your subscription. Lawful basis: contract performance.
                </p>
              </div>
            </div>
          </section>

          {/* 3 */}
          <section>
            <h2 className="font-display text-xl text-ink">3. How we use your data</h2>
            <div className="mt-3 space-y-3">
              <p>We process your data to:</p>
              <ul className="ml-5 list-disc space-y-1.5 text-sm">
                <li>provide, operate, and improve the Kestrel platform;</li>
                <li>manage your account and subscription;</li>
                <li>
                  facilitate dispute resolution between parties, including
                  sending notifications about dispute activity;
                </li>
                <li>send transactional emails (account confirmation, dispute
                  updates, deadline reminders);</li>
                <li>detect and prevent fraud, abuse, and security incidents;</li>
                <li>comply with our legal obligations.</li>
              </ul>
              <p>
                We do not use your data for direct marketing, sell it to third
                parties, or use it to train artificial intelligence models.
              </p>
            </div>
          </section>

          {/* 4 */}
          <section>
            <h2 className="font-display text-xl text-ink">4. Data sharing and sub-processors</h2>
            <div className="mt-3 space-y-3">
              <p>
                We share personal data only with the following categories of
                recipients, under appropriate data processing agreements:
              </p>
              <div className="mt-2 overflow-hidden rounded-lg border border-border-subtle text-sm">
                <table className="w-full text-left">
                  <thead className="border-b border-border-subtle bg-stone/30">
                    <tr>
                      <th className="px-4 py-2.5 font-medium text-ink">Provider</th>
                      <th className="px-4 py-2.5 font-medium text-ink">Purpose</th>
                      <th className="px-4 py-2.5 font-medium text-ink">Data location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    <tr>
                      <td className="px-4 py-2.5">Supabase</td>
                      <td className="px-4 py-2.5">Database, authentication, file storage</td>
                      <td className="px-4 py-2.5">EU (Frankfurt)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5">Vercel</td>
                      <td className="px-4 py-2.5">Application hosting</td>
                      <td className="px-4 py-2.5">EU / UK edge nodes</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5">Resend</td>
                      <td className="px-4 py-2.5">Transactional email delivery</td>
                      <td className="px-4 py-2.5">EU</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5">Stripe</td>
                      <td className="px-4 py-2.5">Payment processing</td>
                      <td className="px-4 py-2.5">EU / UK</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5">Google Analytics</td>
                      <td className="px-4 py-2.5">Website analytics (consent-based)</td>
                      <td className="px-4 py-2.5">EU</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>
                We do not share your data with any other third parties unless
                required to do so by law or a valid court order.
              </p>
            </div>
          </section>

          {/* 5 */}
          <section>
            <h2 className="font-display text-xl text-ink">5. Data retention</h2>
            <div className="mt-3 space-y-2 text-sm">
              <p>
                <strong className="text-ink">Account data:</strong> Retained for
                the lifetime of your account plus 30 days after account deletion
                to allow for recovery.
              </p>
              <p>
                <strong className="text-ink">Dispute records:</strong> Retained
                for 6 years after dispute closure, in line with the limitation
                period for contract claims under the Limitation Act 1980 as it
                applies in England and Wales.
              </p>
              <p>
                <strong className="text-ink">Saved documents:</strong> Retained
                for the lifetime of your account. Unsigned documents from
                unauthenticated users are retained for 90 days.
              </p>
              <p>
                <strong className="text-ink">Payment records:</strong> Retained
                for 7 years as required for tax and accounting purposes.
              </p>
              <p>
                <strong className="text-ink">Audit logs:</strong> Retained for
                6 years for legal compliance and dispute integrity purposes.
              </p>
            </div>
          </section>

          {/* 6 */}
          <section>
            <h2 className="font-display text-xl text-ink">6. Your rights</h2>
            <div className="mt-3 space-y-3">
              <p>
                Under UK GDPR, you have the following rights in relation to your
                personal data:
              </p>
              <ul className="ml-5 list-disc space-y-1.5 text-sm">
                <li>
                  <strong className="text-ink">Right of access:</strong> request
                  a copy of your personal data.
                </li>
                <li>
                  <strong className="text-ink">Right to rectification:</strong>{" "}
                  correct inaccurate or incomplete personal data.
                </li>
                <li>
                  <strong className="text-ink">Right to erasure:</strong> request
                  deletion of your personal data, subject to our retention
                  obligations.
                </li>
                <li>
                  <strong className="text-ink">Right to data portability:</strong>{" "}
                  receive your data in a structured, commonly used format.
                </li>
                <li>
                  <strong className="text-ink">Right to restrict processing:</strong>{" "}
                  request that we limit processing of your data in certain
                  circumstances.
                </li>
                <li>
                  <strong className="text-ink">Right to object:</strong> object
                  to processing based on legitimate interests.
                </li>
                <li>
                  <strong className="text-ink">Right to withdraw consent:</strong>{" "}
                  where processing is based on consent (e.g. analytics), you may
                  withdraw at any time.
                </li>
              </ul>
              <p>
                You can exercise these rights through your account settings or
                by emailing{" "}
                <a
                  href={`mailto:${EMAILS.privacy}`}
                  className="font-medium text-kestrel hover:text-kestrel-hover transition-colors"
                >
                  {EMAILS.privacy}
                </a>
                . We will respond within one month as required by law.
              </p>
            </div>
          </section>

          {/* 7 */}
          <section>
            <h2 className="font-display text-xl text-ink">7. Cookies</h2>
            <div className="mt-3 space-y-3">
              <p>
                We use strictly necessary cookies to maintain your session and
                preferences. We use analytics cookies (Google Analytics, Vercel
                Analytics) only with your explicit consent, collected through our
                cookie consent banner.
              </p>
              <p>
                You can withdraw cookie consent at any time by clearing your
                browser cookies for our domain. Analytics data collected with
                IP anonymisation enabled.
              </p>
            </div>
          </section>

          {/* 8 */}
          <section>
            <h2 className="font-display text-xl text-ink">8. Security</h2>
            <p className="mt-3">
              We implement appropriate technical and organisational measures to
              protect your personal data, including encryption in transit
              (TLS), row-level security at the database layer, access controls,
              and regular security reviews. However, no system is completely
              secure, and we cannot guarantee the absolute security of your
              data.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="font-display text-xl text-ink">
              9. Limitation of liability for data processing
            </h2>
            <div className="mt-3 space-y-3">
              <p>
                While we take reasonable care to protect your data, to the
                fullest extent permitted by applicable law, OnKestrel Limited
                shall not be liable for any indirect, incidental, or
                consequential damages arising from any unauthorised access to or
                alteration of your data, any interruption or cessation of data
                processing, or any data breach caused by circumstances beyond our
                reasonable control.
              </p>
              <p>
                Our total liability for any data protection claim shall not
                exceed the greater of (a) fees paid by you in the twelve months
                preceding the incident, or (b) one hundred pounds sterling
                (&pound;100).
              </p>
              <p className="text-sm">
                Nothing in this policy limits your statutory rights under UK GDPR
                or your right to lodge a complaint with the Information
                Commissioner&rsquo;s Office (ICO).
              </p>
            </div>
          </section>

          {/* 10 */}
          <section>
            <h2 className="font-display text-xl text-ink">10. International transfers</h2>
            <p className="mt-3">
              We endeavour to keep all personal data within the UK and the
              European Economic Area (EEA). Where data is processed outside
              these regions, we ensure appropriate safeguards are in place, such
              as standard contractual clauses approved by the ICO.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="font-display text-xl text-ink">11. Changes to this policy</h2>
            <p className="mt-3">
              We may update this privacy policy from time to time. Material
              changes will be communicated via email or a prominent notice on
              the platform. The &ldquo;last updated&rdquo; date at the top
              reflects the most recent revision.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="font-display text-xl text-ink">12. Complaints</h2>
            <div className="mt-3 space-y-3">
              <p>
                If you are unhappy with how we handle your personal data, please
                contact us at{" "}
                <a
                  href={`mailto:${EMAILS.privacy}`}
                  className="font-medium text-kestrel hover:text-kestrel-hover transition-colors"
                >
                  {EMAILS.privacy}
                </a>{" "}
                and we will do our best to resolve the issue.
              </p>
              <p>
                You also have the right to lodge a complaint with the Information
                Commissioner&rsquo;s Office (ICO), the UK supervisory authority
                for data protection.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
