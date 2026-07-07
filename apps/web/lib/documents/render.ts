import { assembleContract, renderDocumentToText } from "@/lib/contracts/assembler";
import { CONTRACT_TYPES, type ContractType } from "@/lib/contracts/schemas";
import { assembleTerms, termsToMarkdown, type AssembledTerms } from "@/lib/terms/assembler";
import {
  ecommerceSchema,
  saasSchema,
  professionalSchema,
  type BusinessType,
} from "@/lib/terms/schemas";
import { generateLetter, type LetterOutput } from "@/lib/late-payment/letters";
import { letterSchema } from "@/lib/late-payment/schemas";
import type { AssembledDocument } from "@/lib/clauses/types";

/**
 * Deterministic re-rendering of a saved document.
 *
 * Saved documents store the exact form `configuration` that produced them. We
 * recover the document by feeding that configuration back through the SAME
 * deterministic assembler the originating tool used at creation time — no AI,
 * same inputs, same output. Unknown or legacy shapes degrade to an
 * "unavailable" result rather than throwing.
 */

export interface SavedDocumentRow {
  id: string;
  document_type: string;
  title: string;
  configuration: unknown;
  clause_versions?: unknown;
  includes_dispute_clause: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export type RenderKind = "contract" | "terms" | "letter" | "unavailable";

export interface RenderedDocument {
  kind: RenderKind;
  documentType: string;
  title: string;
  subtitle?: string;
  /** Plain-text / markdown rendering for the copy-to-clipboard action. */
  plainText?: string;
  /** Link back to the originating tool, pre-scoped to the right type. */
  editHref?: string;
  editLabel?: string;
  /** Human-readable reason when the document cannot be re-rendered. */
  reason?: string;
  /** PDF payloads — exactly one is populated, matching `kind`. */
  contractDoc?: AssembledDocument;
  termsDoc?: AssembledTerms;
  letterDoc?: LetterOutput;
}

// Reverse-map a saved contract title back to its type. The saved `title` is
// always `CONTRACT_TYPES[type].title`, so this is exact.
const TITLE_TO_CONTRACT_TYPE: Record<string, ContractType> = Object.entries(
  CONTRACT_TYPES,
).reduce(
  (acc, [key, cfg]) => {
    acc[cfg.title] = key as ContractType;
    return acc;
  },
  {} as Record<string, ContractType>,
);

function unavailable(
  row: SavedDocumentRow,
  reason: string,
  editHref?: string,
  editLabel?: string,
): RenderedDocument {
  return {
    kind: "unavailable",
    documentType: row.document_type,
    title: row.title,
    reason,
    editHref,
    editLabel,
  };
}

function inferBusinessType(config: Record<string, unknown>): BusinessType | null {
  if ("productType" in config || "deliveryScope" in config || "returnsPolicy" in config) {
    return "ecommerce";
  }
  if ("billingCycle" in config || "uptimeCommitment" in config || "hasFreeTier" in config) {
    return "saas";
  }
  if ("liabilityCapMultiple" in config || "serviceDescription" in config) {
    return "professional";
  }
  return null;
}

const TERMS_SCHEMAS = {
  ecommerce: ecommerceSchema,
  saas: saasSchema,
  professional: professionalSchema,
} as const;

/**
 * Re-render a saved document. `baseRate` is only needed for late-payment
 * letters (statutory interest); pass the current Bank of England base rate.
 */
export function renderSavedDocument(
  row: SavedDocumentRow,
  baseRate: number,
): RenderedDocument {
  const config =
    row.configuration && typeof row.configuration === "object"
      ? (row.configuration as Record<string, unknown>)
      : null;

  switch (row.document_type) {
    case "contract": {
      const type = TITLE_TO_CONTRACT_TYPE[row.title];
      if (!type || !config) {
        return unavailable(
          row,
          "We couldn't identify this contract's type from the saved record. You can recreate it from the contract builder.",
          "/tools/contracts",
          "Open contract builder",
        );
      }
      const parsed = CONTRACT_TYPES[type].schema.safeParse(config);
      if (!parsed.success) {
        return unavailable(
          row,
          "This saved contract uses an older format we can no longer re-render. You can recreate it from the contract builder.",
          `/tools/contracts/${type}`,
          "Open contract builder",
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const doc = assembleContract(type, parsed.data as any);
      return {
        kind: "contract",
        documentType: row.document_type,
        title: doc.title,
        subtitle: `${doc.parties.a.businessName} and ${doc.parties.b.businessName}`,
        plainText: renderDocumentToText(doc),
        editHref: `/tools/contracts/${type}`,
        editLabel: "Edit in contract builder",
        contractDoc: doc,
      };
    }

    case "terms_and_conditions": {
      const businessType = config ? inferBusinessType(config) : null;
      if (!businessType || !config) {
        return unavailable(
          row,
          "We couldn't identify this document's business type from the saved record. You can recreate it from the T&C generator.",
          "/tools/terms",
          "Open T&C generator",
        );
      }
      const parsed = TERMS_SCHEMAS[businessType].safeParse(config);
      if (!parsed.success) {
        return unavailable(
          row,
          "This saved document uses an older format we can no longer re-render. You can recreate it from the T&C generator.",
          `/tools/terms/${businessType}`,
          "Open T&C generator",
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const doc = assembleTerms(businessType, parsed.data as any);
      return {
        kind: "terms",
        documentType: row.document_type,
        title: doc.title,
        subtitle: doc.businessName,
        plainText: termsToMarkdown(doc),
        editHref: `/tools/terms/${businessType}`,
        editLabel: "Edit in T&C generator",
        termsDoc: doc,
      };
    }

    case "late_payment_letter": {
      const parsed = config ? letterSchema.safeParse(config) : null;
      if (!parsed || !parsed.success) {
        return unavailable(
          row,
          "This saved letter uses an older format we can no longer re-render. You can recreate it from the letter generator.",
          "/tools/late-payment/letters",
          "Open letter generator",
        );
      }
      const letter = generateLetter(parsed.data, { baseRate });
      return {
        kind: "letter",
        documentType: row.document_type,
        title: letter.subject,
        subtitle: `Stage ${letter.stage} — ${letter.stageName}`,
        plainText: `${letter.subject}\n\n${letter.body}`,
        editHref: "/tools/late-payment/letters",
        editLabel: "Edit in letter generator",
        letterDoc: letter,
      };
    }

    default:
      // handshake / notice / milestone_tracker are not stored as saved
      // documents, but guard the enum exhaustively anyway.
      return unavailable(
        row,
        "This document type can't be previewed here. Use the relevant tool to view or manage it.",
        "/tools",
        "Browse tools",
      );
  }
}
