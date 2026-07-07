import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Log the missing-configuration warning once per process rather than on every
// request, so a misconfigured deployment produces one clear signal, not noise.
let warnedMissingEnv = false;

/**
 * Creates a Supabase client for use in proxy.ts (Next.js 16+).
 * Handles session refresh by reading/writing cookies on the request/response.
 *
 * Returns the client and the response — each app's proxy.ts adds its own
 * route-specific redirect logic on top.
 *
 * If the Supabase environment variables are missing, the request is passed
 * through without session handling (supabase and user are null) instead of
 * throwing. Auth-gated routes then bounce to /sign-in rather than returning a
 * 500 for the whole site.
 */
export async function createSupabaseProxyClient(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (!warnedMissingEnv) {
      warnedMissingEnv = true;
      console.error(
        "Supabase environment variables are not configured — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. Passing requests through without session handling.",
      );
    }
    return { supabase: null, response: supabaseResponse, user: null };
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Refresh the session — required for Server Components to read updated cookies.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, response: supabaseResponse, user };
}
