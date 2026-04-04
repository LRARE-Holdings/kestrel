interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
}

export function StatCard({ label, value, subtitle, trend }: StatCardProps) {
  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <p className="text-sm text-text-muted font-medium">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-3xl font-display font-bold text-ink">{value}</p>
        {trend && trend !== "neutral" && (
          <span
            className={`text-sm font-medium ${
              trend === "up" ? "text-sage" : "text-error"
            }`}
          >
            {trend === "up" ? "\u2191" : "\u2193"}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
      )}
    </div>
  );
}
