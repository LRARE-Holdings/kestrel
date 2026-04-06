import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ScrollProgressBar } from "@/components/ui/scroll-progress-bar";
import { AnnouncementBar } from "@/components/ui/announcement-bar";
import { getUser } from "@/lib/auth/actions";
import { isMaintenanceMode } from "@/lib/maintenance";
import { MaintenanceScreen } from "@/components/maintenance-screen";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const maintenance = await isMaintenanceMode();
  if (maintenance) return <MaintenanceScreen />;

  const user = await getUser();

  return (
    <div className="relative min-h-screen bg-cream">
      <ScrollProgressBar />
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-kestrel/[0.03] blur-[120px] dark:bg-kestrel/[0.08]" />
        <div className="absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-sage/[0.02] blur-[100px] dark:bg-sage/[0.06]" />
        <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-kestrel/[0.015] blur-[100px] dark:bg-kestrel/[0.05]" />
      </div>
      <div className="relative z-10 flex min-h-screen flex-col">
        <AnnouncementBar />
        <Header user={user ? { email: user.email } : null} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
