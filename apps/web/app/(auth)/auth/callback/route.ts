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
      // Password recovery — set a flag cookie and redirect to update-password.
      // The cookie prevents the user from navigating to the dashboard (or any
      // other protected route) until they have actually set a new password.
      if (redirectTo === "/update-password") {
        const res = NextResponse.redirect(`${origin}/update-password`);
        res.cookies.set("kestrel_password_recovery", "true", {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 15, // 15 minutes — generous limit for setting a new password
        });
        return res;
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

      const isInternalPath =
        redirectTo?.startsWith("/") && !redirectTo.startsWith("//") && !redirectTo.includes("\\");
      const destination = isInternalPath ? redirectTo : "/dashboard";
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  // Auth error — redirect to sign-in with error
  return NextResponse.redirect(`${origin}/sign-in`);
}
