import { forwardRef, type SelectHTMLAttributes } from "react";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ label, error, className = "", id, children, ...props }, ref) {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-ink"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`w-full appearance-none rounded-[var(--radius-md)] border bg-white px-3 py-2 pr-8 text-sm text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-kestrel/40 focus:border-kestrel disabled:cursor-not-allowed disabled:opacity-50 ${
              error
                ? "border-error focus:ring-error/40 focus:border-error"
                : "border-border"
            } ${className}`}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? `${selectId}-error` : undefined}
            {...props}
          >
            {children}
          </select>
          <svg
            className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {error && (
          <p id={`${selectId}-error`} className="text-xs text-error">
            {error}
          </p>
        )}
      </div>
    );
  },
);
