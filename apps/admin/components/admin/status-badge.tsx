interface StatusBadgeProps {
  status: string;
  variant?: "dispute" | "lead" | "default";
}

const disputeStatusColors: Record<string, string> = {
  draft: "bg-stone text-text-secondary",
  filed: "bg-blue-50 text-blue-700",
  awaiting_response: "bg-amber-50 text-amber-700",
  in_progress: "bg-kestrel/10 text-kestrel",
  resolved: "bg-sage/20 text-green-700",
  escalated: "bg-red-50 text-error",
  withdrawn: "bg-stone text-text-muted",
  expired: "bg-stone text-text-muted",
};

const leadStageColors: Record<string, string> = {
  lead: "bg-blue-50 text-blue-700",
  contacted: "bg-amber-50 text-amber-700",
  qualified: "bg-kestrel/10 text-kestrel",
  proposal: "bg-purple-50 text-purple-700",
  won: "bg-green-50 text-green-700",
  lost: "bg-stone text-text-muted",
};

const leadStatusColors: Record<string, string> = {
  active: "bg-kestrel/10 text-kestrel",
  archived: "bg-stone text-text-muted",
};

function formatLabel(status: string): string {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function StatusBadge({ status, variant = "default" }: StatusBadgeProps) {
  let colorClass = "bg-stone text-text-secondary";

  if (variant === "dispute") {
    colorClass = disputeStatusColors[status] ?? colorClass;
  } else if (variant === "lead") {
    colorClass =
      leadStageColors[status] ?? leadStatusColors[status] ?? colorClass;
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${colorClass}`}
    >
      {formatLabel(status)}
    </span>
  );
}
