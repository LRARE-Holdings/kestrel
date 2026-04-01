"use client";

import { useState } from "react";
import Link from "next/link";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-subtle bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-2xl text-kestrel">Kestrel</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/tools"
            className="text-sm font-medium text-text-secondary transition-colors hover:text-ink"
          >
            Tools
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-text-secondary transition-colors hover:text-ink"
          >
            Pricing
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-text-secondary transition-colors hover:text-ink"
          >
            About
          </Link>
        </nav>

        {/* Desktop sign in */}
        <div className="hidden items-center md:flex">
          <Link
            href="/sign-in"
            className="rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium text-kestrel transition-colors hover:bg-stone/60"
          >
            Sign in
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-[var(--radius-sm)] p-2 text-text-secondary hover:bg-stone/60 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border-subtle bg-white px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-1">
            <Link
              href="/tools"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-stone/60 hover:text-ink"
            >
              Tools
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-stone/60 hover:text-ink"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-stone/60 hover:text-ink"
            >
              About
            </Link>
            <Link
              href="/sign-in"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium text-kestrel transition-colors hover:bg-stone/60"
            >
              Sign in
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
