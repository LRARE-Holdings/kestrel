export interface TimelineItem {
  id: string;
  type: string;
  content: string;
  date: string;
  author?: string;
}

const typeIcons: Record<string, { bg: string; dot: string }> = {
  email: { bg: "bg-blue-50", dot: "bg-blue-500" },
  call: { bg: "bg-green-50", dot: "bg-green-500" },
  meeting: { bg: "bg-purple-50", dot: "bg-purple-500" },
  note: { bg: "bg-stone", dot: "bg-text-muted" },
  linkedin: { bg: "bg-blue-50", dot: "bg-blue-600" },
  // audit log types
  dispute_filed: { bg: "bg-kestrel/5", dot: "bg-kestrel" },
  status_changed: { bg: "bg-amber-50", dot: "bg-amber-500" },
  submission_added: { bg: "bg-blue-50", dot: "bg-blue-500" },
  evidence_uploaded: { bg: "bg-sage/20", dot: "bg-sage" },
  escalated: { bg: "bg-red-50", dot: "bg-error" },
  resolved: { bg: "bg-green-50", dot: "bg-green-600" },
};

function formatTimelineDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatType(type: string): string {
  return type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function Timeline({ items }: { items: TimelineItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-text-muted text-sm py-4">No activity recorded yet.</p>
    );
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />

      <div className="space-y-4">
        {items.map((item) => {
          const style = typeIcons[item.type] ?? {
            bg: "bg-stone",
            dot: "bg-text-muted",
          };

          return (
            <div key={item.id} className="relative flex gap-4 pl-0">
              {/* Dot */}
              <div
                className={`relative z-10 mt-1.5 w-[23px] h-[23px] rounded-full ${style.bg} flex items-center justify-center shrink-0`}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
                    {formatType(item.type)}
                  </span>
                  <span className="text-xs text-text-muted">
                    {formatTimelineDate(item.date)}
                  </span>
                  {item.author && (
                    <span className="text-xs text-text-muted">
                      by {item.author}
                    </span>
                  )}
                </div>
                <p className="text-sm text-ink mt-0.5 leading-relaxed">
                  {item.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
