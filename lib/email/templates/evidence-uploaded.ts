import { emailLayout } from "./layout";
import type { EmailResult } from "../types";

interface EvidenceUploadedParams {
  recipientName: string;
  uploaderName: string;
  referenceNumber: string;
  disputeId: string;
  fileCount: number;
}

/**
 * Email sent to the OTHER party when evidence files are uploaded to a dispute.
 */
export function evidenceUploadedEmail(
  params: EvidenceUploadedParams,
): EmailResult {
  const { recipientName, uploaderName, referenceNumber, disputeId, fileCount } =
    params;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kestrel.law";
  const fileWord = fileCount === 1 ? "file" : "files";

  const content = `
    <p style="margin: 0 0 16px 0;">Dear ${recipientName},</p>
    <p style="margin: 0 0 20px 0;">
      <strong style="color: #0C1311;">${uploaderName}</strong> has uploaded
      <strong style="color: #0C1311;">${fileCount} ${fileWord}</strong> as evidence
      on dispute <strong style="color: #0C1311;">${referenceNumber}</strong>.
    </p>
    <p style="margin: 0 0 8px 0;">
      You can review the uploaded evidence from the dispute page. All evidence
      is securely stored and accessible only to parties involved in this dispute.
    </p>
  `;

  return {
    subject: `New evidence uploaded on ${referenceNumber}`,
    html: emailLayout({
      title: "New evidence uploaded",
      preheader: `${uploaderName} uploaded ${fileCount} ${fileWord} on dispute ${referenceNumber}`,
      content,
      ctaText: "View evidence",
      ctaUrl: `${siteUrl}/disputes/${disputeId}`,
    }),
  };
}
