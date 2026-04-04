import type { Metadata } from "next";
import { getDisputes } from "@/lib/disputes/actions";
import { getUser } from "@/lib/auth/actions";
import { DisputeList } from "@/components/app/disputes/dispute-list";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Disputes — Kestrel",
};

export default async function DisputesPage() {
  const user = await getUser();
  if (!user) redirect("/sign-in");

  const { data: disputes } = await getDisputes();

  return <DisputeList disputes={disputes ?? []} currentUserId={user.id} />;
}
