import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDocument } from "@/lib/documents/actions";
import { renderSavedDocument, type SavedDocumentRow } from "@/lib/documents/render";
import { getLatestBaseRate } from "@/lib/base-rate/queries";
import { DocumentView } from "@/components/app/documents/document-view";

export const metadata: Metadata = {
  title: "Document — Kestrel",
};

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const doc = await getDocument(id);
  if (!doc) notFound();

  // Only late-payment letters need the base rate; fetch once, cheaply.
  const baseRate = await getLatestBaseRate();

  const rendered = renderSavedDocument(doc as SavedDocumentRow, baseRate.rate);

  return (
    <DocumentView
      rendered={rendered}
      includesDisputeClause={doc.includes_dispute_clause}
    />
  );
}
