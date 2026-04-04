import type { HTMLAttributes } from "react";

export type BadgeVariant = "default" | "sage" | "warm" | "outline" | "destructive";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-kestrel text-white",
  sage: "bg-sage/20 text-kestrel",
  warm: "bg-warm/30 text-ink",
  outline: "border border-border bg-transparent text-text-secondary",
  destructive: "bg-error/10 text-error",
};

export function Badge({
  variant = "default",
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
