import Link from "next/link";
import { getUser } from "@/lib/auth/actions";
import { ToolsGrid } from "@/components/tools/tools-grid";
import { ToolsCta } from "@/components/tools/tools-cta";

export const metadata = {
  title: "Free Business Tools — Kestrel",
  description:
    "Free tools for businesses in England and Wales. Contract templates, late payment calculators, and more. No sign-up required.",
};

export default async function ToolsPage() {
  const user = await getUser();

  return (
    <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 2xl:px-12">
      {/* Hero */}
      <section className="pb-6 pt-8 sm:pt-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-kestrel">
            Free tools
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Free Business Tools
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-text-secondary">
            Tools for businesses in England and Wales. No sign-up required.
          </p>
        </div>
      </section>

      {/* Tools grid */}
      <ToolsGrid />

      {/* CTA — only show for anonymous users */}
      {!user && <ToolsCta />}
    </div>
  );
}
