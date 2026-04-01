import type { LetterInput } from "./schemas";
import {
  calculateStatutoryInterest,
  CURRENT_BASE_RATE,
  STATUTORY_RATE,
} from "./calculator";

export interface LetterOutput {
  subject: string;
  body: string;
  stage: number;
  stageName: string;
}

const STAGE_NAMES: Record<number, string> = {
  1: "Friendly Reminder",
  2: "Firm Reminder",
  3: "Formal Demand / Letter Before Action",
  4: "Notice of Intent to Commence Proceedings",
};

/**
 * Generate a late-payment letter for the given stage.
 * All legal text is deterministic — no AI generation.
 */
export function generateLetter(data: LetterInput): LetterOutput {
  switch (data.letterStage) {
    case 1:
      return generateStage1(data);
    case 2:
      return generateStage2(data);
    case 3:
      return generateStage3(data);
    case 4:
      return generateStage4(data);
    default:
      throw new Error(`Invalid letter stage: ${data.letterStage}`);
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}

function getDueDate(invoiceDate: string, termsDays: number): Date {
  const date = new Date(invoiceDate + "T00:00:00");
  date.setDate(date.getDate() + termsDays);
  return date;
}

function kestrelClause(data: LetterInput): string {
  if (!data.includeKestrelClause) return "";
  return `\nBefore commencing formal proceedings, ${data.creditor.businessName} invites ${data.debtor.businessName} to resolve this matter through Kestrel's structured dispute resolution process at kestrel.law.\n`;
}

function letterHeader(data: LetterInput): string {
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return [
    data.creditor.businessName,
    data.creditor.address,
    "",
    today,
    "",
    `${data.debtor.name}`,
    data.debtor.businessName,
    data.debtor.address,
    "",
  ].join("\n");
}

function previousCorrespondenceNote(data: LetterInput): string {
  if (!data.previousCorrespondenceDates?.length) return "";
  const dates = data.previousCorrespondenceDates.map(formatDate).join(", ");
  return `We refer to our previous correspondence dated ${dates} regarding this matter.\n\n`;
}

// ── Stage 1: Friendly Reminder ──────────────────────────────────────────────

function generateStage1(data: LetterInput): LetterOutput {
  const dueDate = getDueDate(data.invoiceDate, data.paymentTermsDays);
  const dueDateStr = dueDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const subject = `Payment Reminder — Invoice ${data.invoiceNumber}`;

  const body = [
    letterHeader(data),
    `Dear ${data.debtor.name},`,
    "",
    `Re: Invoice ${data.invoiceNumber} — ${formatCurrency(data.amountOwed)}`,
    "",
    previousCorrespondenceNote(data),
    `We are writing to remind you that payment of ${formatCurrency(data.amountOwed)} in respect of invoice ${data.invoiceNumber}, dated ${formatDate(data.invoiceDate)}, was due on ${dueDateStr}.`,
    "",
    "Our records indicate that this payment has not yet been received. We would be grateful if you could arrange payment at your earliest convenience.",
    "",
    `If payment has already been made, please disregard this letter and accept our apologies. Otherwise, we would appreciate payment within 7 days of the date of this letter.`,
    "",
    `Should you wish to discuss this matter, please do not hesitate to contact us at ${data.creditor.email}.`,
    kestrelClause(data),
    "Yours sincerely,",
    "",
    data.creditor.name,
    data.creditor.businessName,
  ].join("\n");

  return { subject, body, stage: 1, stageName: STAGE_NAMES[1] };
}

// ── Stage 2: Firm Reminder ──────────────────────────────────────────────────

function generateStage2(data: LetterInput): LetterOutput {
  const dueDate = getDueDate(data.invoiceDate, data.paymentTermsDays);
  const dueDateStr = dueDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const subject = `Overdue Payment — Invoice ${data.invoiceNumber} — Immediate Attention Required`;

  const body = [
    letterHeader(data),
    `Dear ${data.debtor.name},`,
    "",
    `Re: Overdue Invoice ${data.invoiceNumber} — ${formatCurrency(data.amountOwed)}`,
    "",
    previousCorrespondenceNote(data),
    `Despite our previous reminder, we have not yet received payment of ${formatCurrency(data.amountOwed)} for invoice ${data.invoiceNumber}, dated ${formatDate(data.invoiceDate)}. This payment was due on ${dueDateStr} in accordance with our agreed payment terms of ${data.paymentTermsDays} days.`,
    "",
    "We must now ask that you treat this matter as urgent and arrange payment within 7 days of the date of this letter.",
    "",
    "Please be aware that under the Late Payment of Commercial Debts (Interest) Act 1998, we are entitled to charge statutory interest and claim fixed-sum compensation on overdue commercial debts. We would prefer to resolve this matter without recourse to these measures.",
    "",
    `If there is any reason why payment cannot be made, please contact us immediately at ${data.creditor.email} so that we may discuss the matter.`,
    kestrelClause(data),
    "Yours sincerely,",
    "",
    data.creditor.name,
    data.creditor.businessName,
  ].join("\n");

  return { subject, body, stage: 2, stageName: STAGE_NAMES[2] };
}

// ── Stage 3: Formal Demand / Letter Before Action ───────────────────────────

function generateStage3(data: LetterInput): LetterOutput {
  const dueDate = getDueDate(data.invoiceDate, data.paymentTermsDays);
  const interest = calculateStatutoryInterest(data.amountOwed, dueDate);

  const subject = `Formal Demand for Payment — Invoice ${data.invoiceNumber} — Letter Before Action`;

  const body = [
    letterHeader(data),
    `Dear ${data.debtor.name},`,
    "",
    `Re: FORMAL DEMAND — Invoice ${data.invoiceNumber} — ${formatCurrency(data.amountOwed)}`,
    "",
    "LETTER BEFORE ACTION",
    "",
    previousCorrespondenceNote(data),
    `Despite our previous correspondence, the sum of ${formatCurrency(data.amountOwed)} in respect of invoice ${data.invoiceNumber}, dated ${formatDate(data.invoiceDate)}, remains outstanding. Payment was due on ${dueDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.`,
    "",
    "We hereby give you formal notice that we are exercising our rights under the Late Payment of Commercial Debts (Interest) Act 1998 to claim:",
    "",
    `1. The outstanding principal: ${formatCurrency(data.amountOwed)}`,
    `2. Statutory interest at ${interest.annualRate}% per annum (Bank of England base rate of ${CURRENT_BASE_RATE}% + ${STATUTORY_RATE}%): ${formatCurrency(interest.interestAccrued)} (${interest.daysOverdue} days at ${formatCurrency(interest.dailyRate)} per day, continuing to accrue)`,
    `3. Fixed-sum compensation: ${formatCurrency(interest.compensationAmount)}`,
    "",
    `Total currently owed: ${formatCurrency(interest.totalOwed)}`,
    "",
    "This letter constitutes a formal letter before action in accordance with the Practice Direction on Pre-Action Conduct and Protocols. We require payment of the total sum within 14 days of the date of this letter.",
    "",
    "If payment is not received within this period, we reserve the right to commence legal proceedings to recover the debt, interest, compensation, and costs without further notice to you.",
    "",
    "We strongly recommend that you seek independent legal advice regarding this matter.",
    kestrelClause(data),
    "Yours sincerely,",
    "",
    data.creditor.name,
    data.creditor.businessName,
  ].join("\n");

  return { subject, body, stage: 3, stageName: STAGE_NAMES[3] };
}

// ── Stage 4: Notice of Intent to Commence Proceedings ───────────────────────

function generateStage4(data: LetterInput): LetterOutput {
  const dueDate = getDueDate(data.invoiceDate, data.paymentTermsDays);
  const interest = calculateStatutoryInterest(data.amountOwed, dueDate);

  const subject = `Final Notice — Invoice ${data.invoiceNumber} — Proceedings Will Be Commenced`;

  const body = [
    letterHeader(data),
    `Dear ${data.debtor.name},`,
    "",
    `Re: FINAL NOTICE — Invoice ${data.invoiceNumber} — ${formatCurrency(data.amountOwed)}`,
    "",
    "NOTICE OF INTENT TO COMMENCE PROCEEDINGS",
    "",
    previousCorrespondenceNote(data),
    `We refer to our letter before action regarding the outstanding sum of ${formatCurrency(data.amountOwed)} for invoice ${data.invoiceNumber}. The prescribed period for response has now elapsed and no payment or satisfactory proposal for payment has been received.`,
    "",
    "We now write to inform you that we intend to commence proceedings in the County Court to recover:",
    "",
    `1. The outstanding principal: ${formatCurrency(data.amountOwed)}`,
    `2. Statutory interest pursuant to the Late Payment of Commercial Debts (Interest) Act 1998: ${formatCurrency(interest.interestAccrued)} (continuing to accrue at ${formatCurrency(interest.dailyRate)} per day)`,
    `3. Fixed-sum compensation: ${formatCurrency(interest.compensationAmount)}`,
    `4. Court fees and costs of these proceedings`,
    "",
    `Total currently owed (excluding court fees and costs): ${formatCurrency(interest.totalOwed)}`,
    "",
    "This is your final opportunity to settle this debt before proceedings are issued. Payment must be received within 7 days of the date of this letter.",
    "",
    "A County Court Judgment (CCJ) may affect your credit rating and your ability to obtain credit in the future. If a judgment is obtained and you fail to comply, enforcement action may be taken against you.",
    "",
    "We urge you to seek independent legal advice without delay.",
    kestrelClause(data),
    "Yours sincerely,",
    "",
    data.creditor.name,
    data.creditor.businessName,
  ].join("\n");

  return { subject, body, stage: 4, stageName: STAGE_NAMES[4] };
}
