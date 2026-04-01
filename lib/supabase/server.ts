import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for use in server components, route handlers,
 * and server actions. Uses the Next.js cookie store for session
 * management.
 *
 * Must be called inside a request context (server component,
 * route handler, or server action).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // setAll is called from a Server Component where cookies
            // cannot be modified. This is expected when the middleware
            // refreshes the session — the call from the Server Component
            // is a read-only fallback.
          }
        },
      },
    },
  );
}
