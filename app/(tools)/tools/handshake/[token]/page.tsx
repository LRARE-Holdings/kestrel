import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { HandshakeView } from "@/components/tools/handshake/handshake-view";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;

  if (!UUID_REGEX.test(token)) {
    return { title: "Not Found — Kestrel" };
  }

  const supabase = createServiceClient();
  const { data: handshake } = await supabase
    .from("handshakes")
    .select("title")
    .eq("access_token", token)
    .single();

  if (!handshake) {
    return { title: "Not Found — Kestrel" };
  }

  return {
    title: `${handshake.title} — Handshake — Kestrel`,
    description:
      "Review and respond to this handshake agreement on Kestrel.",
  };
}

export default async function HandshakeTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (!UUID_REGEX.test(token)) {
    notFound();
  }

  const supabase = createServiceClient();

  const { data: handshake, error } = await supabase
    .from("handshakes")
    .select("*, handshake_terms(*)")
    .eq("access_token", token)
    .single();

  if (error || !handshake) {
    notFound();
  }

  // Sort terms by sort_order
  if (handshake.handshake_terms) {
    handshake.handshake_terms.sort(
      (a: { sort_order: number }, b: { sort_order: number }) =>
        a.sort_order - b.sort_order,
    );
  }

  // Fetch latest response if one exists
  const { data: responses } = await supabase
    .from("handshake_responses")
    .select("*")
    .eq("handshake_id", handshake.id)
    .order("created_at", { ascending: false })
    .limit(1);

  const response =
    responses && responses.length > 0 ? responses[0] : null;

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-12 sm:px-6 lg:px-8 2xl:px-12">
      <div className="rounded-2xl border border-border-subtle/60 bg-white/70 p-8 shadow-sm backdrop-blur-xl sm:p-12">
        <HandshakeView
          handshake={handshake}
          response={response}
          token={token}
        />
      </div>
    </div>
  );
}
