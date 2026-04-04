import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "@kestrel/shared/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const redirectTo = searchParams.get("redirect");

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });

    if (!error) {
      // Password recovery — redirect to update-password page
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/update-password`);
      }

      // Check if user needs onboarding (same logic as callback route)
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

  return NextResponse.redirect(`${origin}/sign-in`);
}
