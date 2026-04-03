import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 bg-cream">
      <p className="font-mono text-sm font-semibold text-kestrel">404</p>
      <h1 className="mt-4 font-display text-3xl text-ink sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-4 text-text-secondary">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex items-center gap-4">
        <Link href="/">
          <Button>Go home</Button>
        </Link>
        <Link href="/tools">
          <Button variant="secondary">Browse tools</Button>
        </Link>
      </div>
    </div>
  );
}
