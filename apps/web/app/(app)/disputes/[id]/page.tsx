import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/auth/actions";
import {
  getDispute,
  getSubmissions,
  getEvidenceFiles,
} from "@/lib/disputes/actions";
import { DisputeDetail } from "@/components/app/disputes/dispute-detail";

interface DisputePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: DisputePageProps): Promise<Metadata> {
  const { id } = await params;
  const { data: dispute } = await getDispute(id);

  if (!dispute) {
    return { title: "Dispute not found — Kestrel" };
  }

  return {
    title: `${dispute.subject} — Kestrel`,
  };
}

export default async function DisputeDetailPage({
  params,
}: DisputePageProps) {
  const { id } = await params;

  const user = await getUser();
  if (!user) redirect("/sign-in");

  const { data: dispute, role, error: disputeError } = await getDispute(id);

  if (!dispute || disputeError) {
    notFound();
  }

  const [submissionsResult, evidenceResult] = await Promise.all([
    getSubmissions(id),
    getEvidenceFiles(id),
  ]);

  const submissions = submissionsResult.data ?? [];
  const evidenceFiles = evidenceResult.data ?? [];

  // Feature flag for mediator marketplace (not yet implemented)
  const mediatorMarketplaceEnabled = false;

  return (
    <DisputeDetail
      dispute={dispute}
      submissions={submissions}
      evidenceFiles={evidenceFiles}
      userRole={role ?? null}
      currentUserId={user.id}
      mediatorMarketplaceEnabled={mediatorMarketplaceEnabled}
    />
  );
}
