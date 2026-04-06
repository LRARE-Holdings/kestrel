import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ScrollProgressBar } from "@/components/ui/scroll-progress-bar";
import { AnnouncementBar } from "@/components/ui/announcement-bar";
import { getUser, getProfile } from "@/lib/auth/actions";
import { AppShell } from "@/components/app/sidebar";
import { isMaintenanceMode } from "@/lib/maintenance";
import { MaintenanceScreen } from "@/components/maintenance-screen";

export default async function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const maintenance = await isMaintenanceMode();
  if (maintenance) return <MaintenanceScreen />;

  const user = await getUser();

  // Authenticated user with completed onboarding: render inside app shell
  if (user) {
    const profile = await getProfile();
    if (profile?.onboarding_completed) {
      return (
        <>
          <AnnouncementBar />
          <AppShell userEmail={user.email ?? ""}>
            {children}
          </AppShell>
        </>
      );
    }
  }

  // Anonymous or pre-onboarding: render with public site layout
  return (
    <div className="relative min-h-screen bg-cream">
      <ScrollProgressBar />
      <div
        className="pointer-events-none fixed inset-0 bg-grid"
        aria-hidden="true"
      />
      <div className="relative z-10 flex min-h-screen flex-col">
        <AnnouncementBar />
        <Header user={user ? { email: user.email } : null} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
