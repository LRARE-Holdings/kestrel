/**
 * Relative date formatting utilities for the Kestrel dashboard.
 * Past dates ("3 days ago") and future deadlines ("Due in 2 days").
 */

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDeadline(dateStr: string): {
  text: string;
  urgent: boolean;
} {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { text: "Overdue", urgent: true };
  if (diffDays === 0) return { text: "Due today", urgent: true };
  if (diffDays === 1) return { text: "Due tomorrow", urgent: true };
  if (diffDays <= 3) return { text: `Due in ${diffDays} days`, urgent: true };

  return {
    text: `Due ${date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`,
    urgent: false,
  };
}

export function formatCurrency(
  amount: number,
  currency: string = "GBP",
): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDisputeType(type: string): string {
  const labels: Record<string, string> = {
    payment: "Payment",
    deliverables: "Deliverables",
    service_quality: "Service quality",
    contract_interpretation: "Contract interpretation",
    other: "Other",
  };
  return labels[type] ?? type;
}

export function formatDocumentType(type: string): string {
  const labels: Record<string, string> = {
    contract: "Contract",
    terms_and_conditions: "T&Cs",
    handshake: "Handshake",
    notice: "Notice",
    milestone_tracker: "Milestone tracker",
    late_payment_letter: "Late payment letter",
  };
  return labels[type] ?? type;
}

export function formatStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
