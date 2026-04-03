import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ToolsCta() {
  return (
    <section className="pb-6">
      <div className="relative overflow-hidden rounded-2xl bg-ink p-12 text-center shadow-sm sm:p-16">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-kestrel/20 blur-[80px]" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-sage/15 blur-[60px]" />
        <div className="relative z-10">
          <h2 className="font-display text-3xl font-bold tracking-tight text-cream sm:text-4xl">
            Protect your contracts
          </h2>
          <p className="mt-4 text-base text-cream/70">
            Every tool includes a Kestrel dispute clause by default. One-click
            removable, always transparent.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link href="/tools/late-payment">
              <Button
                size="lg"
                className="min-w-[200px] bg-cream text-ink hover:bg-white"
              >
                Try the Late Payment Toolkit
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                variant="ghost"
                size="lg"
                className="min-w-[180px] border border-cream/30 !text-cream hover:bg-cream/10"
              >
                View pricing
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
