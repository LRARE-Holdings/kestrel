"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signInWithMagicLink(formData: FormData) {
  const email = formData.get("email") as string;
  const redirectTo = formData.get("redirect") as string | null;

  if (!email) {
    return { error: "Email is required" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback${
        redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ""
      }`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
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
      email: user.email!,
      onboarding_completed: true,
    });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
