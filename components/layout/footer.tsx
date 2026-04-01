import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-cream">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-12 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <span className="font-display text-lg text-kestrel">Kestrel</span>
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} Pellar Technologies. All rights reserved.
          </p>
        </div>

        <nav className="flex items-center gap-6">
          <Link
            href="/privacy"
            className="text-xs text-text-muted transition-colors hover:text-text-secondary"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-xs text-text-muted transition-colors hover:text-text-secondary"
          >
            Terms of Service
          </Link>
          <Link
            href="/contact"
            className="text-xs text-text-muted transition-colors hover:text-text-secondary"
          >
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
}
