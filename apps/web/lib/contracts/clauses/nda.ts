import type { DocumentSection } from "@/lib/clauses/types";
import type { NdaInput } from "@/lib/contracts/schemas";

export function generatePurpose(data: NdaInput): DocumentSection {
  return {
    number: "",
    title: "Purpose",
    content: `${data.partyA.businessName} ("Party A") and ${data.partyB.businessName} ("Party B") wish to explore a potential business relationship and, in connection with this, may disclose confidential information to each other. This agreement sets out the terms on which such confidential information will be disclosed and the obligations of the receiving party.`,
    subSections: [],
  };
}

export function generateDefinition(data: NdaInput): DocumentSection {
  return {
    number: "",
    title: "Definition of Confidential Information",
    content: `For the purposes of this agreement, "Confidential Information" means: ${data.confidentialInfoDescription}.\n\nConfidential Information shall also include any information or material that is derived from or created using Confidential Information, any copies of Confidential Information in whatever form, and the existence and terms of this agreement itself.`,
    subSections: [],
  };
}

export function generateObligations(data: NdaInput): DocumentSection {
  return {
    number: "",
    title: "Obligations of the Receiving Party",
    content: `Each party receiving Confidential Information ("Receiving Party") undertakes to the disclosing party ("Disclosing Party") to:\n\n${data.obligations}\n\nThe Receiving Party shall additionally: (a) keep the Confidential Information secure and protect it against unauthorised access, use, or disclosure using at least the same degree of care as it uses to protect its own confidential information, but in any event no less than reasonable care; (b) not use the Confidential Information for any purpose other than the purpose set out in this agreement; (c) restrict disclosure of the Confidential Information to those of its employees, officers, representatives, or advisers who need to know such information for the purpose, and ensure that such persons are bound by obligations of confidentiality no less onerous than those contained in this agreement; (d) promptly notify the Disclosing Party of any actual or suspected unauthorised disclosure of Confidential Information.`,
    subSections: [],
  };
}

export function generateDuration(data: NdaInput): DocumentSection {
  return {
    number: "",
    title: "Duration",
    content: `The obligations of confidentiality contained in this agreement shall remain in force for a period of ${data.durationMonths} months from the date of this agreement and shall survive the termination or expiry of this agreement for the same period. Upon expiry of the confidentiality period, the obligations under this agreement shall cease, provided that any Confidential Information which constitutes a trade secret shall remain protected for as long as it retains its character as a trade secret.`,
    subSections: [],
  };
}

export function generateExceptions(data: NdaInput): DocumentSection {
  const customExceptions = data.exceptions
    ? `\n\nThe following additional exceptions apply: ${data.exceptions}`
    : "";

  return {
    number: "",
    title: "Exceptions",
    content: `The obligations of confidentiality shall not apply to any information that: (a) is or becomes publicly available through no fault of the Receiving Party; (b) was already in the lawful possession of the Receiving Party before disclosure by the Disclosing Party and was not subject to obligations of confidentiality; (c) is independently developed by the Receiving Party without reference to or use of the Confidential Information; (d) is lawfully received from a third party who is not under an obligation of confidentiality in respect of that information; (e) is required to be disclosed by law, court order, or governmental or regulatory authority, provided that the Receiving Party gives the Disclosing Party prompt written notice of such requirement (to the extent legally permitted) and reasonable assistance in seeking a protective order or other appropriate remedy.${customExceptions}`,
    subSections: [],
  };
}

export function generateReturnAndDestruction(): DocumentSection {
  return {
    number: "",
    title: "Return and Destruction of Confidential Information",
    content:
      "Upon the written request of the Disclosing Party or upon termination or expiry of this agreement, the Receiving Party shall promptly: (a) return to the Disclosing Party all documents and materials containing or reflecting Confidential Information; or (b) destroy all such documents and materials, including all copies, extracts, and summaries thereof, and provide written certification of such destruction. The Receiving Party may retain copies of Confidential Information to the extent required by applicable law or regulation, or by the rules of any relevant professional body, provided that such retained copies remain subject to the obligations of confidentiality contained in this agreement.",
    subSections: [],
  };
}

export function generateRemedies(): DocumentSection {
  return {
    number: "",
    title: "Remedies",
    content:
      "Each party acknowledges that damages alone may not be an adequate remedy for any breach of this agreement by the Receiving Party. Accordingly, the Disclosing Party shall be entitled, without proof of special damages, to seek equitable relief, including injunction and specific performance, for any threatened or actual breach of this agreement, in addition to any other remedies available to it at law or in equity.",
    subSections: [],
  };
}

export function getAllNdaSections(data: NdaInput): DocumentSection[] {
  return [
    generatePurpose(data),
    generateDefinition(data),
    generateObligations(data),
    generateDuration(data),
    generateExceptions(data),
    generateReturnAndDestruction(),
    generateRemedies(),
  ];
}
