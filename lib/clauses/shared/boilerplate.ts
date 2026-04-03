import type { DocumentSection } from "@/lib/clauses/types";

export function getEntireAgreementClause(): DocumentSection {
  return {
    number: "",
    title: "Entire Agreement",
    content:
      "This agreement constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, warranties, commitments, and understandings, whether written or oral, relating to its subject matter. Each party acknowledges that in entering into this agreement it does not rely on any statement, representation, assurance, or warranty other than those set out in this agreement.",
    subSections: [],
  };
}

export function getSeverabilityClause(): DocumentSection {
  return {
    number: "",
    title: "Severability",
    content:
      "If any provision of this agreement is held to be invalid, illegal, or unenforceable by any court of competent jurisdiction, such provision shall be severed from this agreement and the remaining provisions shall continue in full force and effect. The parties shall negotiate in good faith to replace the severed provision with a valid provision that achieves, to the extent possible, the original commercial intent.",
    subSections: [],
  };
}

export function getWaiverClause(): DocumentSection {
  return {
    number: "",
    title: "Waiver",
    content:
      "No failure or delay by a party to exercise any right or remedy provided under this agreement or by law shall constitute a waiver of that or any other right or remedy, nor shall it prevent or restrict the further exercise of that or any other right or remedy. No single or partial exercise of such right or remedy shall prevent or restrict the further exercise of that or any other right or remedy.",
    subSections: [],
  };
}

export function getAmendmentsClause(): DocumentSection {
  return {
    number: "",
    title: "Amendments",
    content:
      "No amendment or variation of this agreement shall be effective unless it is in writing and signed by or on behalf of each of the parties.",
    subSections: [],
  };
}

export function getNoticesClause(): DocumentSection {
  return {
    number: "",
    title: "Notices",
    content: [
      "Any notice required or permitted to be given under this agreement shall be in writing and shall be delivered by hand, sent by pre-paid first class post, recorded delivery, or by email to the address of the relevant party as set out in this agreement or to such other address as that party may have notified to the other party in writing.",
      "",
      "A notice shall be deemed to have been received: if delivered by hand, at the time of delivery; if sent by pre-paid first class post or recorded delivery, at 9:00am on the second business day after posting; or if sent by email, at the time of transmission provided no delivery failure notification is received.",
    ].join("\n"),
    subSections: [],
  };
}

export function getForceMajeureClause(): DocumentSection {
  return {
    number: "",
    title: "Force Majeure",
    content:
      "Neither party shall be in breach of this agreement nor liable for delay in performing, or failure to perform, any of its obligations under this agreement if such delay or failure results from events, circumstances, or causes beyond its reasonable control, including but not limited to acts of God, flood, fire, earthquake, epidemic, pandemic, acts of war, terrorism, governmental action, labour disputes, or failure of utility services or transportation. The affected party shall notify the other party as soon as reasonably practicable and shall use reasonable endeavours to mitigate the effect of the force majeure event. If the force majeure event continues for a period exceeding 90 days, either party may terminate this agreement by giving 30 days' written notice to the other party.",
    subSections: [],
  };
}

/**
 * Returns all boilerplate clauses as an ordered array.
 */
export function getAllBoilerplateClauses(): DocumentSection[] {
  return [
    getEntireAgreementClause(),
    getSeverabilityClause(),
    getWaiverClause(),
    getAmendmentsClause(),
    getNoticesClause(),
    getForceMajeureClause(),
  ];
}
