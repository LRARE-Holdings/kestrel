import Link from "next/link";
import { KestrelMark } from "@/components/ui/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-screen overflow-hidden items-center justify-center bg-cream px-4 py-12">

      {/* Subtle orbs */}
      <div className="pointer-events-none absolute -top-32 right-1/3 h-[400px] w-[400px] rounded-full bg-kestrel/[0.03] blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-[300px] w-[300px] rounded-full bg-sage/[0.04] blur-[80px]" />

      <div className="relative z-10 w-full max-w-[400px]">
        {/* Logo mark */}
        <div className="mb-8 flex justify-center">
          <Link href="/" className="text-kestrel transition-colors hover:text-kestrel-hover">
            <KestrelMark className="h-10 w-auto" />
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border-subtle/60 bg-surface shadow-[var(--shadow-lg)] backdrop-blur-xl">
          <div className="p-8">
            {children}
          </div>
        </div>

        {/* Footer links */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-text-muted">
          <Link href="/privacy" className="transition-colors hover:text-ink">Privacy</Link>
          <span className="text-border">&middot;</span>
          <Link href="/terms" className="transition-colors hover:text-ink">Terms</Link>
          <span className="text-border">&middot;</span>
          <Link href="/" className="transition-colors hover:text-ink">Home</Link>
        </div>
      </div>
    </div>
  );
}
