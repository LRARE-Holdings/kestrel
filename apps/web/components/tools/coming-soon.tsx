import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ComingSoonProps {
  title: string;
  description: string;
  features: string[];
}

export function ComingSoon({ title, description, features }: ComingSoonProps) {
  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-24 text-center sm:px-6 lg:px-8 2xl:px-12">
      <div className="rounded-2xl border border-border-subtle/60 bg-white/70 p-8 shadow-sm backdrop-blur-xl sm:p-12">
        <div className="inline-flex items-center rounded-full border border-kestrel/20 bg-kestrel/5 px-3 py-1 text-xs font-medium text-kestrel">
          Coming soon
        </div>

        <h1 className="mt-6 font-display text-4xl text-ink sm:text-5xl">
          {title}
        </h1>

        <p className="mt-6 text-lg leading-relaxed text-text-secondary">
          {description}
        </p>

        <ul className="mx-auto mt-10 max-w-md space-y-3 text-left">
          {features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-3 text-sm text-text-secondary"
            >
              <svg
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-sage"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {feature}
            </li>
          ))}
        </ul>

        <div className="mt-12 flex items-center justify-center gap-4">
          <Link href="/tools/late-payment">
            <Button>Try Late Payment Toolkit</Button>
          </Link>
          <Link href="/tools">
            <Button variant="secondary">View all tools</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
