import { forwardRef, type TextareaHTMLAttributes } from "react";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, error, className = "", id, ...props }, ref) {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-ink"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`w-full rounded-[var(--radius-md)] border bg-white px-3 py-2 text-sm text-ink placeholder:text-text-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-cream focus-visible:border-kestrel disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px] resize-y ${
            error
              ? "border-error focus-visible:ring-error/40 focus-visible:border-error"
              : "border-border focus-visible:ring-kestrel/40"
          } ${className}`}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${textareaId}-error`} className="text-xs text-error">
            {error}
          </p>
        )}
      </div>
    );
  },
);
