import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Creates a Supabase client for use in proxy.ts (Next.js 16+).
 * Handles session refresh by reading/writing cookies on the request/response.
 *
 * Returns the client and the response — each app's proxy.ts adds its own
 * route-specific redirect logic on top.
 */
export async function createSupabaseProxyClient(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
