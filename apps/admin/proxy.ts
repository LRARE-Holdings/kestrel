import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseProxyClient } from "@kestrel/shared/supabase/middleware";

export async function proxy(request: NextRequest) {
  const { supabase, response, user } = await createSupabaseProxyClient(request);
  const pathname = request.nextUrl.pathname;

  // Helper: create a redirect that preserves the Supabase session cookies.
  // Without this, cookie updates from session refresh are lost on redirect,
  // which causes an infinite redirect loop.
  function redirectTo(path: string) {
    const redirectResponse = NextResponse.redirect(new URL(path, request.url));
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  // Public routes: sign-in page and MFA pages
  const isPublicRoute = pathname === "/sign-in" ||
    pathname.startsWith("/mfa");

  // API routes handle their own auth — skip proxy checks
  if (pathname.startsWith("/api/")) return response;

  // Not signed in → redirect to sign-in
  if (!user && !isPublicRoute) {
    return redirectTo("/sign-in");
  }

  // Signed in but on sign-in page
  if (user && pathname === "/sign-in") {
    // Check if fully authenticated (aal2)
    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aalData?.currentLevel === "aal2") {
      return redirectTo("/");
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
        return redirectTo("/mfa/enroll");
      }
      // Has MFA but not verified this session
      return redirectTo("/mfa/verify");
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
