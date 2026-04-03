"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { ScrollFade, ScrollStagger, StaggerItem, ScrollSection } from "@/components/ui/scroll-animations";

const footerLinks = {
  product: [
    { href: "/tools", label: "Free Tools" },
    { href: "/tools/late-payment", label: "Late Payment Toolkit" },
    { href: "/tools/contracts", label: "Contract Templates" },
    { href: "/pricing", label: "Pricing" },
  ],
  company: [
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
};

export function Footer() {
  return (
    <footer className="px-4 pb-4 sm:px-6 lg:px-8 2xl:px-12">
      <ScrollSection>
        <div className="mx-auto max-w-screen-2xl rounded-2xl border border-border-subtle/60 bg-white/70 shadow-sm backdrop-blur-xl">
          <div className="px-8 py-12 sm:px-10">
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
              {/* Brand + Social */}
              <div className="lg:col-span-2">
                <ScrollFade direction="up" distance={20}>
                  <Logo />
                </ScrollFade>

                {/* Social bar */}
                <ScrollFade direction="up" delay={0.1} distance={16}>
                  <div className="mt-6 flex items-center gap-3">
                    <a
                      href="https://www.linkedin.com/company/pellartechnologies"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle/60 bg-cream/50 text-text-muted transition-all duration-200 hover:border-kestrel/30 hover:bg-kestrel/5 hover:text-kestrel"
                      aria-label="LinkedIn"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                  </div>
                </ScrollFade>
              </div>

              {/* Product links */}
              <ScrollFade direction="up" delay={0.15} distance={20}>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted">
                    Product
                  </h3>
                  <ul className="mt-4 space-y-2.5">
                    {footerLinks.product.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-sm text-text-secondary transition-colors hover:text-ink"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollFade>

              {/* Company links */}
              <ScrollFade direction="up" delay={0.2} distance={20}>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted">
                    Company
                  </h3>
                  <ul className="mt-4 space-y-2.5">
                    {footerLinks.company.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-sm text-text-secondary transition-colors hover:text-ink"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollFade>
            </div>

            {/* Bottom bar */}
            <ScrollFade direction="none" delay={0.25}>
              <div className="mt-10 flex items-center justify-between border-t border-border-subtle/40 pt-8">
                <p className="text-xs text-text-muted">
                  &copy; {new Date().getFullYear()} Pellar Technologies. All rights reserved.
                </p>
              </div>
            </ScrollFade>
          </div>
        </div>
      </ScrollSection>
    </footer>
  );
}
