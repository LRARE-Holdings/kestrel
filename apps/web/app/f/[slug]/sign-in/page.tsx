import type { Metadata } from "next";
import { getBranding } from "@/lib/branding/server";
import { SignInForm } from "@/components/auth/sign-in-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const branding = await getBranding(slug);
  return {
    title: branding.isBranded
      ? `Sign in — ${branding.displayName}`
      : "Sign in — Kestrel",
  };
}

export default async function BrandedSignInPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const branding = await getBranding(slug);

  return (
    <>
      <SignInForm
        heading={
          branding.isBranded
            ? `Sign in to ${branding.displayName}`
            : "Sign in to Kestrel"
        }
        subheading="Welcome back. Choose how you'd like to sign in."
        accentForeground={branding.accentForeground}
      />

      {!branding.isBranded && (
        <p className="mt-6 text-center text-xs leading-relaxed text-text-muted">
          This firm&apos;s branded page isn&apos;t available right now — you can
          still sign in to Kestrel above.
        </p>
      )}
    </>
  );
}
