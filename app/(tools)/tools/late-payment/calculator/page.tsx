"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { calculatorSchema, type CalculatorInput } from "@/lib/late-payment/schemas";
import {
  calculateStatutoryInterest,
  CURRENT_BASE_RATE,
  BASE_RATE_LAST_UPDATED,
  STATUTORY_RATE,
  type StatutoryInterestResult,
} from "@/lib/late-payment/calculator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const PAYMENT_TERMS_OPTIONS = [
  { value: 14, label: "14 days" },
  { value: 30, label: "30 days" },
  { value: 45, label: "45 days" },
  { value: 60, label: "60 days" },
  { value: 90, label: "90 days" },
  { value: -1, label: "Custom" },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function CalculatorPage() {
  const [result, setResult] = useState<StatutoryInterestResult | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showCustomTerms, setShowCustomTerms] = useState(false);
  const [selectedTerms, setSelectedTerms] = useState(30);

  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CalculatorInput>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      paymentTermsDays: 30,
      calculationDate: today,
    },
  });

  const invoiceAmount = watch("invoiceAmount");

  function onSubmit(data: CalculatorInput) {
    const invoiceDate = new Date(data.invoiceDate + "T00:00:00");
    const due = new Date(invoiceDate);
    due.setDate(due.getDate() + data.paymentTermsDays);
    setDueDate(due);

    const calcDate = data.calculationDate
      ? new Date(data.calculationDate + "T00:00:00")
      : new Date();

    const calcResult = calculateStatutoryInterest(
      data.invoiceAmount,
      due,
      calcDate,
    );
    setResult(calcResult);
  }

  function handleTermsChange(value: string) {
    const numValue = parseInt(value, 10);
    setSelectedTerms(numValue);
    if (numValue === -1) {
      setShowCustomTerms(true);
    } else {
      setShowCustomTerms(false);
      setValue("paymentTermsDays", numValue);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/tools/late-payment"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-kestrel transition-colors"
      >
        &larr; Late Payment Toolkit
      </Link>

      <h1 className="font-display text-3xl tracking-tight text-ink sm:text-4xl">
        Statutory Interest Calculator
      </h1>
      <p className="mt-3 text-text-secondary leading-relaxed">
        Calculate how much statutory interest and fixed-sum compensation you
        can claim on an overdue commercial invoice under the Late Payment of
        Commercial Debts (Interest) Act 1998.
      </p>

      <div className="mt-2 inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-stone px-3 py-1.5 text-xs text-text-muted">
        <span>
          Bank of England base rate: <strong>{CURRENT_BASE_RATE}%</strong>
        </span>
        <span className="text-border">|</span>
        <span>
          Last updated:{" "}
          {new Date(BASE_RATE_LAST_UPDATED + "T00:00:00").toLocaleDateString(
            "en-GB",
            { day: "numeric", month: "long", year: "numeric" },
          )}
        </span>
      </div>

      {/* Calculator form */}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Invoice amount (GBP)"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="e.g. 5000.00"
              error={errors.invoiceAmount?.message}
              {...register("invoiceAmount", { valueAsNumber: true })}
            />

            <Input
              label="Invoice date"
              type="date"
              max={today}
              error={errors.invoiceDate?.message}
              {...register("invoiceDate")}
            />

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="terms-select"
                className="text-sm font-medium text-ink"
              >
                Payment terms
              </label>
              <select
                id="terms-select"
                value={selectedTerms}
                onChange={(e) => handleTermsChange(e.target.value)}
                className="w-full rounded-[var(--radius-md)] border border-border bg-white px-3 py-2 text-sm text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-kestrel/40 focus:border-kestrel"
              >
                {PAYMENT_TERMS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {showCustomTerms && (
              <Input
                label="Custom payment terms (days)"
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 45"
                error={errors.paymentTermsDays?.message}
                {...register("paymentTermsDays", { valueAsNumber: true })}
              />
            )}

            <Input
              label="Calculation date"
              type="date"
              defaultValue={today}
              error={errors.calculationDate?.message}
              {...register("calculationDate")}
            />
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full sm:w-auto">
          Calculate interest
        </Button>
      </form>

      {/* Results */}
      {result && dueDate && (
        <section className="mt-10">
          <Card>
            <CardHeader>
              <CardTitle>Calculation Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 divide-y divide-border-subtle">
              <ResultRow label="Original debt" value={formatCurrency(invoiceAmount)} />
              <ResultRow label="Payment due date" value={formatDate(dueDate)} />
              <ResultRow
                label="Days overdue"
                value={`${result.daysOverdue} days`}
              />
              <ResultRow
                label="Statutory interest rate"
                value={`${result.annualRate}% per annum (${CURRENT_BASE_RATE}% + ${STATUTORY_RATE}%)`}
              />
              <ResultRow
                label="Daily interest"
                value={`${formatCurrency(result.dailyRate)} per day`}
              />
              <ResultRow
                label="Total interest accrued"
                value={formatCurrency(result.interestAccrued)}
                highlight
              />
              <ResultRow
                label="Fixed-sum compensation"
                value={formatCurrency(result.compensationAmount)}
                highlight
              />

              <div className="flex items-center justify-between py-4">
                <span className="text-base font-semibold text-ink">
                  Total now owed
                </span>
                <span className="text-xl font-semibold text-kestrel">
                  {formatCurrency(result.totalOwed)}
                </span>
              </div>
            </CardContent>
          </Card>

          {result.daysOverdue > 0 && (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/tools/late-payment/letters">
                <Button size="lg">Generate a chasing letter</Button>
              </Link>
              <Link href="/tools/late-payment/letters">
                <Button variant="secondary" size="lg">
                  Learn about your options
                </Button>
              </Link>
            </div>
          )}

          {result.daysOverdue === 0 && (
            <p className="mt-6 rounded-[var(--radius-md)] border border-sage/30 bg-sage/10 px-4 py-3 text-sm text-text-secondary">
              This invoice is not yet overdue. Interest will begin to accrue
              from{" "}
              <strong>{formatDate(dueDate)}</strong>.
            </p>
          )}
        </section>
      )}

      {/* Disclaimer */}
      <p className="mt-12 text-xs leading-relaxed text-text-muted">
        This calculator is provided for informational purposes only and does
        not constitute legal advice. Calculations are based on the Late
        Payment of Commercial Debts (Interest) Act 1998 as applicable in
        England and Wales. The Bank of England base rate used is{" "}
        {CURRENT_BASE_RATE}% as of{" "}
        {new Date(BASE_RATE_LAST_UPDATED + "T00:00:00").toLocaleDateString(
          "en-GB",
          { day: "numeric", month: "long", year: "numeric" },
        )}
        . Verify the current rate before relying on these figures in formal
        correspondence.
      </p>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function ResultRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-text-secondary">{label}</span>
      <span
        className={`text-sm font-medium ${highlight ? "text-kestrel" : "text-ink"}`}
      >
        {value}
      </span>
    </div>
  );
}
