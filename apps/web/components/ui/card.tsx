import type { HTMLAttributes } from "react";

export type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] border border-border-subtle bg-white shadow-[var(--shadow-sm)] ${className}`}
      {...props}
    />
  );
}

export function CardHeader({ className = "", ...props }: CardProps) {
  return (
    <div
      className={`flex flex-col gap-1.5 p-6 pb-0 ${className}`}
      {...props}
    />
  );
}

export function CardTitle({ className = "", ...props }: CardProps) {
  return (
    <h3
      className={`text-lg font-semibold text-ink ${className}`}
      {...props}
    />
  );
}

export function CardDescription({ className = "", ...props }: CardProps) {
  return (
    <p
      className={`text-sm text-text-secondary ${className}`}
      {...props}
    />
  );
}

export function CardContent({ className = "", ...props }: CardProps) {
  return <div className={`p-6 ${className}`} {...props} />;
}

export function CardFooter({ className = "", ...props }: CardProps) {
  return (
    <div
      className={`flex items-center p-6 pt-0 ${className}`}
      {...props}
    />
  );
}
