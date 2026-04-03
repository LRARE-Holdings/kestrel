"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/actions";

interface HeaderProps {
  user?: { email?: string; displayName?: string } | null;
}

export function Header({ user }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full px-4 pt-4 sm:px-6 lg:px-8 2xl:px-12">
      <div className="mx-auto max-w-screen-2xl rounded-2xl border border-border-subtle/60 bg-white/70 shadow-sm backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-5">
          <Logo />

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {[
              { href: "/tools", label: "Tools" },
              { href: "/pricing", label: "Pricing" },
              { href: "/about", label: "About" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-ink/[0.04] hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop auth */}
          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">Dashboard</Button>
                </Link>
                <form action={signOut}>
                  <Button variant="secondary" size="sm" type="submit">Sign out</Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link href="/sign-in">
                  <Button size="sm">Get started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-ink/[0.04] md:hidden"
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
          <div className="border-t border-border-subtle/40 px-5 pb-4 pt-3 md:hidden">
            <nav className="flex flex-col gap-0.5">
              {[
                { href: "/tools", label: "Tools" },
                { href: "/pricing", label: "Pricing" },
                { href: "/about", label: "About" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-ink/[0.04] hover:text-ink"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-3 border-t border-border-subtle/40 pt-3">
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm font-medium text-kestrel"
                    >
                      Dashboard
                    </Link>
                    <form action={signOut}>
                      <button
                        type="submit"
                        className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-text-secondary transition-colors hover:text-ink"
                      >
                        Sign out
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full" size="sm">Get started</Button>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
