import { getBranding } from "@/lib/branding/server";
import { BrandedAuthShell } from "@/components/auth/branded-auth-shell";

/**
 * Layout for firm-branded routes (`/f/[slug]/...`). Resolves branding once per
 * request (shared with the page via a cached fetch) and renders the branded
 * auth shell. An unknown slug or an unavailable/absent branding backend simply
 * yields the default Kestrel appearance — never a dead end.
 */
export default async function BrandedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const branding = await getBranding(slug);

  return <BrandedAuthShell branding={branding}>{children}</BrandedAuthShell>;
}
