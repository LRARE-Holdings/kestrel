import { forwardRef, type ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-kestrel text-white hover:bg-kestrel-hover focus-visible:ring-kestrel/40",
  secondary:
    "border border-border bg-transparent text-ink hover:bg-stone focus-visible:ring-kestrel/40",
  ghost:
    "bg-transparent text-ink hover:bg-stone/60 focus-visible:ring-kestrel/40",
  destructive:
    "bg-error text-white hover:bg-error/90 focus-visible:ring-error/40",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm rounded-[var(--radius-sm)]",
  md: "px-4 py-2 text-sm rounded-[var(--radius-md)]",
  lg: "px-6 py-3 text-base rounded-[var(--radius-lg)]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", size = "md", className = "", ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      />
    );
  },
);
