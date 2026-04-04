"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@kestrel/shared/supabase/server";

export async function signInWithPassword(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = formData.get("redirect") as string | null;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message === "Invalid login credentials") {
      return { error: "Invalid email or password" };
    }
    if (error.message === "Email not confirmed") {
      return { error: "Please check your email and confirm your account before signing in" };
    }
    return { error: error.message };
  }

  redirect(redirectTo || "/dashboard");
}

export async function signUpWithPassword(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = formData.get("redirect") as string | null;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  const supabase = await createClient();

  const confirmUrl = new URL("/auth/confirm", process.env.NEXT_PUBLIC_SITE_URL);
  if (redirectTo) {
    confirmUrl.searchParams.set("redirect", redirectTo);
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: confirmUrl.toString(),
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "An account with this email already exists" };
    }
    return { error: error.message };
  }

  return { success: true };
}

export async function resetPassword(formData: FormData) {
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email is required" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?redirect=/update-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const password = formData.get("password") as string;

  if (!password) {
    return { error: "Password is required" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  // Clear the recovery flag — the user has set their new password and
  // is now allowed to access protected routes normally.
  const cookieStore = await cookies();
  cookieStore.delete("kestrel_password_recovery");

  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Clear any leftover recovery flag
  const cookieStore = await cookies();
  cookieStore.delete("kestrel_password_recovery");

  redirect("/");
}

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const displayName = formData.get("display_name") as string;
  const businessName = formData.get("business_name") as string;
  const businessType = formData.get("business_type") as string;
  const companySize = formData.get("company_size") as string;
  const industry = formData.get("industry") as string;

  if (!displayName) {
    return { error: "Display name is required" };
  }

  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      display_name: displayName,
      business_name: businessName || null,
      business_type: businessType || null,
      company_size: companySize || null,
      industry: industry || null,
      email: user.email!,
      onboarding_completed: true,
    });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function completeOnboarding(data: {
  display_name: string;
  business_name?: string;
  business_type?: string;
  company_size?: string;
  industry?: string;
  primary_use_case?: string;
  estimated_disputes_per_year?: string;
  referral_source?: string;
  referral_code?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email!,
    display_name: data.display_name,
    business_name: data.business_name || null,
    business_type: data.business_type || null,
    company_size: data.company_size || null,
    industry: data.industry || null,
    onboarding_completed: true,
  });

  if (profileError) {
    return { error: profileError.message };
  }

  const hasOnboardingResponses =
    data.primary_use_case ||
    data.estimated_disputes_per_year ||
    data.referral_source ||
    data.referral_code;

  if (hasOnboardingResponses) {
    const { error: onboardingError } = await supabase
      .from("onboarding_responses")
      .upsert(
        {
          profile_id: user.id,
          primary_use_case: data.primary_use_case || null,
          estimated_disputes_per_year:
            data.estimated_disputes_per_year || null,
          referral_source: data.referral_source || null,
          referral_code: data.referral_code || null,
        },
        { onConflict: "profile_id" }
      );

    if (onboardingError) {
      return { error: onboardingError.message };
    }
  }

  return { success: true };
}
