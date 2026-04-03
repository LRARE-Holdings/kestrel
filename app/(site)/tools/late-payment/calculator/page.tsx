import { getLatestBaseRate } from "@/lib/base-rate/queries";
import { CalculatorForm } from "@/components/tools/late-payment/calculator-form";

export const metadata = {
  title: "Statutory Interest Calculator — Late Payment Toolkit — Kestrel",
  description:
    "Calculate statutory interest and fixed-sum compensation on overdue commercial invoices under the Late Payment of Commercial Debts (Interest) Act 1998.",
};

export default async function CalculatorPage() {
  const baseRate = await getLatestBaseRate();

  return (
    <CalculatorForm
      baseRate={baseRate.rate}
      baseRateEffectiveDate={baseRate.effectiveDate}
    />
  );
}
