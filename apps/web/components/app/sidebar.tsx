"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Logo, KestrelMark } from "@/components/ui/logo";
import {
  IconHome,
  IconFileText,
  IconScale,
  IconWrench,
  IconSettings,
  IconChevronLeft,
  IconChevronRight,
  IconMenu,
  IconX,
  IconLogOut,
} from "@/components/ui/icons";
import { signOut } from "@/lib/auth/actions";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
const SIDEBAR_KEY = "kestrel-sidebar";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: IconHome },
  { href: "/documents", label: "Documents", icon: IconFileText },
  { href: "/disputes", label: "Disputes", icon: IconScale },
  { href: "/tools", label: "Tools", icon: IconWrench },
  { href: "/settings", label: "Settings", icon: IconSettings },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

function UserAvatar({ email }: { email: string }) {
  const initial = email.charAt(0).toUpperCase();
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-kestrel/10 text-sm font-medium text-kestrel">
      {initial}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Desktop Sidebar                                                    */
/* ------------------------------------------------------------------ */

function DesktopSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Hydrate from localStorage after mount
  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_KEY);
    if (stored === "collapsed") setCollapsed(true);
  }, []);

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_KEY, next ? "collapsed" : "expanded");
      return next;
    });
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
      className="sticky top-0 hidden h-screen flex-col border-r border-border-subtle bg-white lg:flex"
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-border-subtle px-4">
        {collapsed ? (
          <div className="flex w-full justify-center">
            <KestrelMark className="h-7 w-7 text-kestrel" />
          </div>
        ) : (
          <Logo size="sm" />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-[var(--radius-sm)] text-sm transition-colors ${
                collapsed ? "justify-center px-0 py-2" : "px-3 py-2"
              } ${
                active
                  ? "bg-stone/60 font-medium text-ink"
                  : "text-text-secondary hover:bg-stone/40 hover:text-ink"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border-subtle p-3">
        {/* User info */}
        <div
          className={`flex items-center gap-3 ${
            collapsed ? "flex-col" : ""
          } mb-2`}
        >
          <UserAvatar email={userEmail} />
          {!collapsed && (
            <span className="min-w-0 flex-1 truncate text-xs text-text-muted">
              {userEmail}
            </span>
          )}
          <form action={signOut}>
            <button
              type="submit"
              title="Sign out"
              className="rounded-[var(--radius-sm)] p-1.5 text-text-muted transition-colors hover:bg-stone/40 hover:text-ink"
            >
              <IconLogOut className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={toggle}
          className="flex w-full items-center justify-center rounded-[var(--radius-sm)] py-2 text-text-muted transition-colors hover:text-ink"
        >
          {collapsed ? (
            <IconChevronRight className="h-4 w-4" />
          ) : (
            <IconChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </motion.aside>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile Drawer                                                      */
/* ------------------------------------------------------------------ */

function MobileDrawer({
  isOpen,
  onClose,
  userEmail,
}: {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}) {
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
            className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-lg lg:hidden"
          >
            {/* Header */}
            <div className="flex h-14 items-center justify-between border-b border-border-subtle px-4">
              <Logo size="sm" />
              <button
                onClick={onClose}
                className="rounded-[var(--radius-sm)] p-1.5 text-text-secondary transition-colors hover:text-ink"
              >
                <IconX className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
              {navItems.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-sm transition-colors ${
                      active
                        ? "bg-stone/60 font-medium text-ink"
                        : "text-text-secondary hover:bg-stone/40 hover:text-ink"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Bottom */}
            <div className="border-t border-border-subtle p-4">
              <div className="mb-3 flex items-center gap-3">
                <UserAvatar email={userEmail} />
                <span className="min-w-0 flex-1 truncate text-xs text-text-muted">
                  {userEmail}
                </span>
              </div>
              <form action={signOut}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-stone/40 hover:text-ink"
                >
                  <IconLogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </button>
              </form>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  AppShell (exported)                                                */
/* ------------------------------------------------------------------ */

export function AppShell({
  userEmail,
  children,
}: {
  userEmail: string;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-cream">
      {/* Desktop sidebar */}
      <DesktopSidebar userEmail={userEmail} />

      {/* Mobile drawer */}
      <MobileDrawer
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        userEmail={userEmail}
      />

      {/* Main content area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile header */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border-subtle bg-white/95 px-4 backdrop-blur-sm lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-[var(--radius-sm)] p-1.5 text-text-secondary transition-colors hover:text-ink"
            aria-label="Open menu"
          >
            <IconMenu className="h-5 w-5" />
          </button>
          <KestrelMark className="h-6 w-6 text-kestrel" />
          {/* Spacer for symmetry */}
          <span className="w-8" aria-hidden="true" />
        </header>

        <main className="flex-1">
          <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
