"use server";

import { cache } from "react";
import { createClient } from "@kestrel/shared/supabase/server";
import { redirect } from "next/navigation";

/**
 * Sign in with email and password. Admin panel only supports
 * email+password auth -- no OAuth, no magic link, no sign-up.
 *
 * After successful password authentication, checks MFA status:
 * - No TOTP factor enrolled  -> redirect to /mfa/enroll
 * - TOTP enrolled but aal1   -> redirect to /mfa/verify
 * - Already aal2             -> redirect to /
 */
export async function signInWithPassword(
  _prevState: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message === "Invalid login credentials") {
      return { error: "Invalid email or password." };
    }
    return { error: error.message };
  }

  // Check MFA assurance level
  const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (aalData?.nextLevel === "aal1") {
    // No MFA factor enrolled -- force enrollment
    redirect("/mfa/enroll");
  }

  if (aalData?.currentLevel === "aal1" && aalData?.nextLevel === "aal2") {
    // MFA enrolled but not yet verified this session
    redirect("/mfa/verify");
  }

  // Already aal2 (unlikely on fresh sign-in but handle gracefully)
  redirect("/");
}

/**
 * Sign the admin user out and redirect to the sign-in page.
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}

/**
 * Retrieve the current admin user, or null if:
 * - Not authenticated
 * - Not an admin (missing app_metadata.admin claim)
 * - Session is not aal2 (MFA not verified)
 *
 * Used by the (admin) layout to gate access.
 * Wrapped with React cache() for per-request deduplication.
 */
export const getAdminUser = cache(async (): Promise<{
  id: string;
  email: string;
  role: string;
} | null> => {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  // Check admin claim injected by Custom Access Token Hook
  const isAdmin = user.app_metadata?.admin === true;
  if (!isAdmin) return null;

  // Require aal2 (MFA verified)
  const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aalData?.currentLevel !== "aal2") return null;

  return {
    id: user.id,
    email: user.email ?? "",
    role: (user.app_metadata?.admin_role as string) ?? "admin",
  };
});
