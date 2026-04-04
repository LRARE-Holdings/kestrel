import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseProxyClient } from "@kestrel/shared/supabase/middleware";

export async function proxy(request: NextRequest) {
  // Supabase sends auth codes to the Site URL root — forward to the callback handler
  const code = request.nextUrl.searchParams.get("code");
  if (code && request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    return NextResponse.redirect(url);
  }

  const { supabase, response, user } = await createSupabaseProxyClient(request);

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
    return NextResponse.redirect(url);
  }

  // If signed in and visiting auth pages, redirect to dashboard
  const isAuthPage = request.nextUrl.pathname === "/sign-in" ||
    request.nextUrl.pathname === "/sign-up" ||
    request.nextUrl.pathname === "/reset-password";

  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
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
