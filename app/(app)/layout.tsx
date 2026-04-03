import { redirect } from "next/navigation";
import { getUser, getProfile } from "@/lib/auth/actions";
import { AppShell } from "@/components/app/sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) redirect("/sign-in");

  const profile = await getProfile();
  if (!profile || !profile.onboarding_completed) {
    redirect("/onboarding");
  }

  return (
    <AppShell userEmail={user.email ?? ""}>
      {children}
    </AppShell>
  );
}
