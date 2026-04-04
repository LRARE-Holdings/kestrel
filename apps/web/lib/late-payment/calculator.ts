/**
 * Late Payment of Commercial Debts (Interest) Act 1998
 * Statutory interest calculator for England and Wales.
 *
 * Statutory rate = Bank of England base rate + 8%
 * Interest is calculated on a simple daily basis.
 */

/** The statutory supplement added to the base rate under the 1998 Act. */
export const STATUTORY_RATE = 8;

/**
 * Returns the number of calendar days between `dueDate` and `calcDate`.
 * Returns 0 if the debt is not yet overdue.
 */
export function calculateDaysOverdue(
  dueDate: Date,
  calcDate: Date = new Date(),
): number {
  const due = stripTime(dueDate);
  const calc = stripTime(calcDate);
  const diffMs = calc.getTime() - due.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
}

/**
 * Fixed-sum compensation under the 1998 Act.
 *   - Debt < £1,000        → £40
 *   - £1,000 – £9,999.99   → £70
 *   - £10,000+             → £100
 */
export function getCompensationAmount(debtAmount: number): number {
  if (debtAmount < 1_000) return 40;
  if (debtAmount < 10_000) return 70;
  return 100;
}

export interface StatutoryInterestResult {
  /** The combined annual rate (base + 8%) as a percentage. */
  annualRate: number;
  /** Daily interest in pounds. */
  dailyRate: number;
  /** Number of calendar days the debt has been overdue. */
  daysOverdue: number;
  /** Total simple interest accrued. */
  interestAccrued: number;
  /** Fixed-sum compensation. */
  compensationAmount: number;
  /** Original debt + interest + compensation. */
  totalOwed: number;
}

/**
 * Calculate full statutory interest breakdown.
 *
 * @param amount       Original debt in GBP
 * @param dueDate      Date payment was due
 * @param calcDate     Date to calculate to (defaults to today)
 * @param baseRate     BoE base rate as a percentage (fetched from base_rates table)
 */
export function calculateStatutoryInterest(
  amount: number,
  dueDate: Date,
  calcDate: Date = new Date(),
  baseRate: number,
): StatutoryInterestResult {
  const annualRate = baseRate + STATUTORY_RATE;
  const dailyRate = round((amount * (annualRate / 100)) / 365);
  const daysOverdue = calculateDaysOverdue(dueDate, calcDate);
  const interestAccrued = round(dailyRate * daysOverdue);
  const compensationAmount = getCompensationAmount(amount);
  const totalOwed = round(amount + interestAccrued + compensationAmount);

  return {
    annualRate,
    dailyRate,
    daysOverdue,
    interestAccrued,
    compensationAmount,
    totalOwed,
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Round to 2 decimal places. */
function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Strip the time component from a Date, returning midnight UTC. */
function stripTime(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}
