import type { AssembledDocument, DocumentSection, PartyDetails } from "@/lib/clauses/types";
import {
  getDisputeResolutionClause,
  getGoverningLawClause,
} from "@/lib/clauses/shared/dispute-resolution";
import { getAllBoilerplateClauses } from "@/lib/clauses/shared/boilerplate";
import { getAllFreelancerSections } from "@/lib/contracts/clauses/freelancer";
import { getAllNdaSections } from "@/lib/contracts/clauses/nda";
import { getAllGeneralServiceSections } from "@/lib/contracts/clauses/general-service";
import { getAllConsultingSections } from "@/lib/contracts/clauses/consulting";
import { getAllSaasSections } from "@/lib/contracts/clauses/saas";
import { getAllSubcontractorSections } from "@/lib/contracts/clauses/subcontractor";
import {
  CONTRACT_TYPES,
  type ContractType,
  type FreelancerInput,
  type NdaInput,
  type GeneralServiceInput,
  type ConsultingInput,
  type SaasInput,
  type SubcontractorInput,
} from "@/lib/contracts/schemas";

type ContractDataMap = {
  freelancer: FreelancerInput;
  nda: NdaInput;
  "general-service": GeneralServiceInput;
  consulting: ConsultingInput;
  saas: SaasInput;
  subcontractor: SubcontractorInput;
};

/**
 * Assemble a complete contract document from validated form data.
 *
 * All text is deterministic — no AI generation. Same inputs produce
 * the same output every time.
 */
export function assembleContract<T extends ContractType>(
  type: T,
  data: ContractDataMap[T],
): AssembledDocument {
  const config = CONTRACT_TYPES[type];

  // Get type-specific sections
  const coreSections = getCoreSections(type, data);

  // Optionally add dispute resolution clause (Kestrel clause)
  const includesDisputeClause = getIncludeKestrelClause(data);

  // Add boilerplate
  const boilerplate = getAllBoilerplateClauses();

  // Build the full section list
  const allSections: DocumentSection[] = [...coreSections];

  if (includesDisputeClause) {
    allSections.push(getDisputeResolutionClause(config.toolContext));
  }

  // Governing law always included
  allSections.push(getGoverningLawClause());

  // Boilerplate at the end
  allSections.push(...boilerplate);

  // Number sections sequentially
  const numberedSections = allSections.map((section, index) => ({
    ...section,
    number: `${index + 1}`,
    subSections: section.subSections?.map((sub, subIndex) => ({
      ...sub,
      number: `${index + 1}.${subIndex + 1}`,
    })),
  }));

  // Extract party details
  const parties = getParties(data);

  // Format effective date
  const effectiveDate = getEffectiveDate(data);

  return {
    title: config.title,
    date: effectiveDate,
    parties,
    sections: numberedSections,
    includesDisputeClause,
    generatedAt: new Date().toISOString(),
  };
}

function getCoreSections(
  type: ContractType,
  data: ContractDataMap[typeof type],
): DocumentSection[] {
  switch (type) {
    case "freelancer":
      return getAllFreelancerSections(data as FreelancerInput);
    case "nda":
      return getAllNdaSections(data as NdaInput);
    case "general-service":
      return getAllGeneralServiceSections(data as GeneralServiceInput);
    case "consulting":
      return getAllConsultingSections(data as ConsultingInput);
    case "saas":
      return getAllSaasSections(data as SaasInput);
    case "subcontractor":
      return getAllSubcontractorSections(data as SubcontractorInput);
    default:
      throw new Error(`Unknown contract type: ${type}`);
  }
}

function getIncludeKestrelClause(data: Record<string, unknown>): boolean {
  return data.includeKestrelClause === true;
}

function getParties(
  data: Record<string, unknown>,
): { a: PartyDetails; b: PartyDetails } {
  const partyA = data.partyA as PartyDetails;
  const partyB = data.partyB as PartyDetails;
  return { a: partyA, b: partyB };
}

function getEffectiveDate(data: Record<string, unknown>): string {
  const dateStr = data.effectiveDate as string;
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Render an assembled document to plain text for clipboard copy.
 */
export function renderDocumentToText(doc: AssembledDocument): string {
  const lines: string[] = [];

  // Title
  lines.push(doc.title.toUpperCase());
  lines.push("");

  // Date
  lines.push(`Date: ${doc.date}`);
  lines.push("");

  // Parties
  lines.push("PARTIES");
  lines.push("");
  lines.push(`(1) ${doc.parties.a.businessName}`);
  if (doc.parties.a.companyNumber) {
    lines.push(`    Company No. ${doc.parties.a.companyNumber}`);
  }
  lines.push(`    ${doc.parties.a.address}`);
  lines.push(`    Contact: ${doc.parties.a.name} (${doc.parties.a.email})`);
  lines.push("");
  lines.push(`(2) ${doc.parties.b.businessName}`);
  if (doc.parties.b.companyNumber) {
    lines.push(`    Company No. ${doc.parties.b.companyNumber}`);
  }
  lines.push(`    ${doc.parties.b.address}`);
  lines.push(`    Contact: ${doc.parties.b.name} (${doc.parties.b.email})`);
  lines.push("");
  lines.push("---");
  lines.push("");

  // Sections
  for (const section of doc.sections) {
    lines.push(`${section.number}. ${section.title.toUpperCase()}`);
    lines.push("");
    lines.push(section.content);
    lines.push("");

    if (section.subSections) {
      for (const sub of section.subSections) {
        lines.push(`${sub.number} ${sub.content}`);
        lines.push("");
      }
    }
  }

  // Footer
  lines.push("---");
  lines.push("");
  lines.push(
    "This document was generated using Kestrel (kestrel.law). It is provided as a starting point and should be reviewed by a qualified legal professional before execution.",
  );

  return lines.join("\n");
}
