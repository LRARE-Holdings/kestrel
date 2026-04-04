import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseProxyClient } from "@kestrel/shared/supabase/middleware";

export async function proxy(request: NextRequest) {
  // Supabase sends auth codes to the Site URL root — forward to the callback handler.
  // Preserve ALL query params (e.g. redirect=/update-password for recovery flow).
  const code = request.nextUrl.searchParams.get("code");
  if (code && request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    // All existing searchParams (code, redirect, etc.) are already on the cloned URL
    return NextResponse.redirect(url);
  }

  const { supabase, response, user } = await createSupabaseProxyClient(request);

  // Helper: create a redirect that preserves the Supabase session cookies.
  // Without this, cookie updates from session refresh are lost on redirect,
  // which causes an infinite redirect loop.
  function redirectTo(url: URL) {
    const redirectResponse = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  // The update-password page requires authentication (you need a recovery session)
  // but must NOT redirect to dashboard — the user needs to set their new password first.
  if (request.nextUrl.pathname === "/update-password") {
    if (!user) {
      // No session — they can't update a password without a recovery session
      const url = request.nextUrl.clone();
      url.pathname = "/reset-password";
      return redirectTo(url);
    }
    // Authenticated via recovery link — let them through to set their password
    return response;
  }

  // Protected routes: redirect to sign-in if not authenticated
  const isAppRoute = request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/documents") ||
    request.nextUrl.pathname.startsWith("/settings") ||
    request.nextUrl.pathname.startsWith("/onboarding") ||
    request.nextUrl.pathname.startsWith("/disputes");

  if (isAppRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return redirectTo(url);
  }

  // SECURITY: If a recovery session is active (cookie set by auth/callback or auth/confirm),
  // block access to ALL protected routes. The user MUST set a new password first.
  // This prevents clicking a reset link and navigating straight to /dashboard.
  if (isAppRoute && request.cookies.get("kestrel_password_recovery")?.value === "true") {
    const url = request.nextUrl.clone();
    url.pathname = "/update-password";
    return redirectTo(url);
  }

  // If signed in and visiting auth pages (sign-in, sign-up, reset-password),
  // redirect to dashboard. Does NOT include /update-password (handled above).
  const isAuthPage = request.nextUrl.pathname === "/sign-in" ||
    request.nextUrl.pathname === "/sign-up" ||
    request.nextUrl.pathname === "/reset-password";

  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return redirectTo(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, icon.svg (browser metadata)
     * - Public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
