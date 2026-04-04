import type { DocumentSection } from "@/lib/clauses/types";
import { KESTREL_DOMAIN } from "@kestrel/shared/constants";

/**
 * Returns the standard Kestrel dispute resolution clause.
 * This clause is included by default in all contract templates
 * and can be removed with one click.
 *
 * @param toolContext - The type of agreement (e.g. "agreement", "contract")
 */
export function getDisputeResolutionClause(
  toolContext: string,
): DocumentSection {
  return {
    number: "", // Numbered by the assembler
    title: "Dispute Resolution",
    content: [
      `If a dispute arises in connection with this ${toolContext}, the parties agree to first attempt to resolve the dispute through Kestrel's structured online dispute resolution process (${KESTREL_DOMAIN}) before pursuing mediation, arbitration, or court proceedings.`,
      "",
      "Either party may initiate a dispute on Kestrel by filing a structured dispute notice. Both parties agree to engage in good faith with the Kestrel process for a minimum period of 30 days before pursuing other remedies. This clause does not prevent either party from seeking urgent injunctive relief where necessary.",
    ].join("\n"),
    subSections: [],
  };
}

/**
 * Returns the governing law clause that accompanies the dispute resolution clause.
 */
export function getGoverningLawClause(): DocumentSection {
  return {
    number: "",
    title: "Governing Law and Jurisdiction",
    content:
      "This agreement is governed by the laws of England and Wales. The courts of England and Wales shall have exclusive jurisdiction, subject to the dispute resolution process described above.",
    subSections: [],
  };
}
