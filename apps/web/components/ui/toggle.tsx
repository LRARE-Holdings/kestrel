"use client";

import type { InputHTMLAttributes } from "react";

export type ToggleProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "role"
> & {
  label?: string;
};

export function Toggle({
  label,
  checked,
  onChange,
  disabled,
  className = "",
  id,
  ...props
}: ToggleProps) {
  const toggleId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <label
      htmlFor={toggleId}
      className={`inline-flex items-center gap-3 ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${className}`}
    >
      <div className="relative">
        <input
          type="checkbox"
          role="switch"
          id={toggleId}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only peer"
          aria-checked={checked}
          {...props}
        />
        <div
          className={`h-6 w-11 rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-kestrel/40 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-cream ${
            checked ? "bg-kestrel" : "bg-border"
          }`}
        />
        <div
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-surface shadow-[var(--shadow-sm)] transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
      {label && <span className="text-sm text-ink">{label}</span>}
    </label>
  );
}
