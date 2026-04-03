import { redirect } from "next/navigation";
import { getUser, getProfile } from "@/lib/auth/actions";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) redirect("/sign-in");

  const profile = await getProfile();
  if (profile?.onboarding_completed) redirect("/dashboard");

  return <div className="min-h-screen bg-cream">{children}</div>;
}
