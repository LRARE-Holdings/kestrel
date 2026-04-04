interface BarItem {
  label: string;
  value: number;
  colour?: string;
}

interface HorizontalBarChartProps {
  title: string;
  items: BarItem[];
}

const DEFAULT_COLOURS = [
  "bg-kestrel",
  "bg-sage",
  "bg-warm",
  "bg-kestrel/60",
  "bg-sage/60",
  "bg-warm/60",
  "bg-kestrel/40",
  "bg-sage/40",
];

export function HorizontalBarChart({ title, items }: HorizontalBarChartProps) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  if (items.length === 0) {
    return (
      <div className="bg-surface rounded-xl border border-border p-6">
        <h3 className="text-sm font-medium text-text-muted mb-4">{title}</h3>
        <p className="text-sm text-text-muted">No data yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <h3 className="text-sm font-medium text-text-muted mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={item.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-ink">{item.label}</span>
              <span className="text-sm font-medium text-text-secondary tabular-nums">
                {item.value}
              </span>
            </div>
            <div className="h-2 rounded-full bg-stone/60 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  item.colour ?? DEFAULT_COLOURS[index % DEFAULT_COLOURS.length]
                }`}
                style={{
                  width: `${Math.max((item.value / maxValue) * 100, 2)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
