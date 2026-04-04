import { KESTREL_DOMAIN } from "@kestrel/shared/constants";

/**
 * Deterministic consequence text templates per notice type.
 * No AI generation -- all text is human-authored.
 */

export const CONSEQUENCE_TEMPLATES: Record<string, string> = {
  breach:
    "Failure to remedy this breach within the deadline specified may result in termination of the agreement and the exercise of all available legal remedies, including but not limited to a claim for damages.",
  termination:
    "This notice takes effect on the date specified. All obligations arising prior to termination remain in force. Any outstanding payments or deliverables must be settled within 30 days of the termination date.",
  change_request:
    "If no response is received by the deadline specified, the proposed change will be deemed rejected and the existing terms will continue to apply without amendment.",
  payment_demand:
    "If payment is not received by the deadline specified, we reserve the right to exercise our statutory and contractual remedies, including charging interest under the Late Payment of Commercial Debts (Interest) Act 1998.",
  general:
    "Please acknowledge receipt of this notice at your earliest convenience.",
};

export function getConsequenceTemplate(noticeType: string): string {
  return CONSEQUENCE_TEMPLATES[noticeType] ?? CONSEQUENCE_TEMPLATES.general;
}

/**
 * The Kestrel dispute resolution clause inserted at the bottom of notices
 * when the user has opted in.
 */
export const KESTREL_DISPUTE_CLAUSE =
  `Before commencing formal legal proceedings, both parties agree to attempt to resolve any dispute arising from this matter through Kestrel's online dispute resolution platform (${KESTREL_DOMAIN}). This is a voluntary, non-binding process designed to facilitate a fair and efficient resolution without the cost and delay of court proceedings.`;
