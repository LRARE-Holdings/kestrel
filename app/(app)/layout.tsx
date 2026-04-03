import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { getUser } from "@/lib/auth/actions";
import { signOut } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/documents", label: "Documents" },
  { href: "/settings", label: "Settings" },
];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      {/* App header */}
      <header className="sticky top-0 z-50 border-b border-border-subtle bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Logo size="sm" />
            <nav className="hidden items-center gap-1 sm:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-[var(--radius-sm)] px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-stone/60 hover:text-ink"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-text-muted sm:block">
              {user.email}
            </span>
            <form action={signOut}>
              <Button variant="ghost" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
