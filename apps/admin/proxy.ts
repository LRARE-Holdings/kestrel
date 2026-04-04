import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseProxyClient } from "@kestrel/shared/supabase/middleware";

export async function proxy(request: NextRequest) {
  const { supabase, response, user } = await createSupabaseProxyClient(request);
  const pathname = request.nextUrl.pathname;

  // Public routes: sign-in page and MFA pages
  const isPublicRoute = pathname === "/sign-in" ||
    pathname.startsWith("/mfa");

  // Not signed in → redirect to sign-in
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Signed in but on sign-in page
  if (user && pathname === "/sign-in") {
    // Check if fully authenticated (aal2)
    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aalData?.currentLevel === "aal2") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    // Still needs MFA — let them through to complete it
  }

  // For all protected routes (not sign-in, not MFA):
  // Check aal2 requirement
  if (user && !isPublicRoute) {
    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (aalData?.currentLevel !== "aal2") {
      if (aalData?.nextLevel === "aal1") {
        // No MFA enrolled — force enrollment
        return NextResponse.redirect(new URL("/mfa/enroll", request.url));
      }
      // Has MFA but not verified this session
      return NextResponse.redirect(new URL("/mfa/verify", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
