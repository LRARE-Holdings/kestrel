import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ScrollProgressBar } from "@/components/ui/scroll-progress-bar";
import { AnnouncementBar } from "@/components/ui/announcement-bar";
import { getUser } from "@/lib/auth/actions";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();

  return (
    <div className="relative min-h-screen bg-cream">
      <ScrollProgressBar />
      <div className="pointer-events-none fixed inset-0 bg-grid" aria-hidden="true" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <AnnouncementBar />
        <Header user={user ? { email: user.email } : null} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
