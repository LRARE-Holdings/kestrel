import { getUser } from "@/lib/auth/actions";
import { OnboardingFlow } from "@/components/app/onboarding/onboarding-flow";

export const metadata = {
  title: "Get started - Kestrel",
};

export default async function OnboardingPage() {
  const user = await getUser();
  const defaultName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    "";

  return <OnboardingFlow defaultName={defaultName} />;
}
