import { redirect } from "next/navigation";

/** `/f/[slug]` has no content of its own — send visitors to the sign-in page. */
export default async function FirmIndexPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/f/${slug}/sign-in`);
}
