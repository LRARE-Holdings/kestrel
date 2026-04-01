import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Late Payment Toolkit — Kestrel",
  description:
    "Calculate statutory interest on overdue invoices and generate professional chasing letters under the Late Payment of Commercial Debts (Interest) Act 1998.",
};

export default function LatePaymentPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="mb-12">
        <h1 className="font-display text-4xl tracking-tight text-ink sm:text-5xl">
          Late Payment Toolkit
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-text-secondary leading-relaxed">
          Recover what you are owed. Under the{" "}
          <strong>
            Late Payment of Commercial Debts (Interest) Act 1998
          </strong>
          , businesses in England and Wales can claim statutory interest at 8%
          above the Bank of England base rate, plus fixed-sum compensation,
          on overdue commercial invoices.
        </p>
        <p className="mt-3 text-sm text-text-muted">
          No sign-up required. These tools are completely free.
        </p>
      </section>

      {/* Tool cards */}
      <section className="grid gap-6 sm:grid-cols-2">
        <Link href="/tools/late-payment/calculator" className="group">
          <Card className="h-full transition-shadow group-hover:shadow-[var(--shadow-md)]">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-kestrel/10 text-kestrel">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="4" y="2" width="16" height="20" rx="2" />
                  <line x1="8" y1="6" x2="16" y2="6" />
                  <line x1="16" y1="14" x2="16" y2="18" />
                  <path d="M16 10h.01" />
                  <path d="M12 10h.01" />
                  <path d="M8 10h.01" />
                  <path d="M12 14h.01" />
                  <path d="M8 14h.01" />
                  <path d="M12 18h.01" />
                  <path d="M8 18h.01" />
                </svg>
              </div>
              <CardTitle>Interest Calculator</CardTitle>
              <CardDescription>
                Calculate exactly how much statutory interest and compensation
                you are owed on an overdue invoice.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <span className="text-sm font-medium text-kestrel group-hover:underline">
                Calculate now &rarr;
              </span>
            </CardContent>
          </Card>
        </Link>

        <Link href="/tools/late-payment/letters" className="group">
          <Card className="h-full transition-shadow group-hover:shadow-[var(--shadow-md)]">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-kestrel/10 text-kestrel">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <line x1="10" y1="9" x2="8" y2="9" />
                </svg>
              </div>
              <CardTitle>Letter Generator</CardTitle>
              <CardDescription>
                Generate professional payment chasing letters — from friendly
                reminders to formal demands — in four escalating stages.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <span className="text-sm font-medium text-kestrel group-hover:underline">
                Generate letter &rarr;
              </span>
            </CardContent>
          </Card>
        </Link>
      </section>

      {/* Legal context */}
      <section className="mt-12 rounded-[var(--radius-lg)] border border-border-subtle bg-white p-6">
        <h2 className="font-display text-xl text-ink">
          Your rights under the Late Payment Act
        </h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-text-secondary">
          <p>
            The Late Payment of Commercial Debts (Interest) Act 1998 gives
            businesses in England and Wales a statutory right to claim
            interest on late commercial payments. This right exists
            automatically — you do not need to include it in your contract.
          </p>
          <p>
            <strong>Statutory interest</strong> is calculated at{" "}
            <strong>8% above the Bank of England base rate</strong>, applied
            as simple interest on a daily basis from the date payment was due.
          </p>
          <p>
            <strong>Fixed-sum compensation</strong> is also available: £40 for
            debts under £1,000; £70 for debts between £1,000 and £9,999.99;
            and £100 for debts of £10,000 or more.
          </p>
          <p className="text-xs text-text-muted">
            This information is for general guidance only and does not
            constitute legal advice. If you are uncertain about your rights,
            seek independent legal advice.
          </p>
        </div>
      </section>
    </div>
  );
}
