import { NextResponse } from "next/server";
import { createClient } from "@kestrel/shared/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirect");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Password recovery — send straight to update-password, skip everything else
      if (redirectTo === "/update-password") {
        return NextResponse.redirect(`${origin}/update-password`);
      }

      // Check if user has a profile (onboarding completed)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", user.id)
          .single();

        if (!profile || !profile.onboarding_completed) {
          const onboardingUrl = new URL("/onboarding", origin);
          if (redirectTo) {
            onboardingUrl.searchParams.set("redirect", redirectTo);
          }
          return NextResponse.redirect(onboardingUrl.toString());
        }
      }

      const destination = redirectTo || "/dashboard";
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  // Auth error — redirect to sign-in with error
  return NextResponse.redirect(`${origin}/sign-in`);
}
