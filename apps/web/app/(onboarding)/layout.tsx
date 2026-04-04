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
  if (profile?.onboarding_completed) {
    // Redirect param is handled client-side by the onboarding flow;
    // if the user lands here with onboarding already completed,
    // send them to the dashboard (the redirect param in the URL will
    // be picked up by the client component if needed).
    redirect("/dashboard");
  }

  return <div className="min-h-screen bg-cream">{children}</div>;
}
