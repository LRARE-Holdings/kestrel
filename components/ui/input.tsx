import { forwardRef, type InputHTMLAttributes } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, error, className = "", id, ...props }, ref) {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-ink"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-[var(--radius-md)] border bg-white px-3 py-2 text-sm text-ink placeholder:text-text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-kestrel/40 focus:border-kestrel disabled:cursor-not-allowed disabled:opacity-50 ${
            error
              ? "border-error focus:ring-error/40 focus:border-error"
              : "border-border"
          } ${className}`}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-error">
            {error}
          </p>
        )}
      </div>
    );
  },
);
