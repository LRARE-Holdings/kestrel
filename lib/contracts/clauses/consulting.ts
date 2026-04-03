import type { DocumentSection } from "@/lib/clauses/types";
import type { ConsultingInput } from "@/lib/contracts/schemas";

export function generateEngagement(data: ConsultingInput): DocumentSection {
  return {
    number: "",
    title: "Engagement",
    content: `${data.partyA.businessName} ("the Client") hereby engages ${data.partyB.businessName} ("the Consultant") to provide consulting services in connection with the following: ${data.engagementScope}.\n\nThe Consultant shall perform the services personally unless otherwise agreed in writing with the Client. The Consultant shall apply such professional skill and care as would reasonably be expected of a competent consultant in the relevant field.`,
    subSections: [],
  };
}

export function generateDeliverables(data: ConsultingInput): DocumentSection {
  const deliverableList = data.deliverables
    .map((d, i) => `${i + 1}. ${d}`)
    .join("\n");

  return {
    number: "",
    title: "Deliverables",
    content: `The Consultant shall produce and deliver the following:\n\n${deliverableList}\n\nAll deliverables shall be provided in a professional format suitable for the Client's intended use. The Client shall review each deliverable within 14 days of receipt and shall provide written feedback, including any reasonable revisions required. The Consultant shall make up to two rounds of revisions at no additional cost.`,
    subSections: [],
  };
}

export function generateFees(data: ConsultingInput): DocumentSection {
  const totalEstimate = data.dayRate * data.estimatedDays;

  return {
    number: "",
    title: "Fees and Payment",
    content: `The Client shall pay the Consultant at a day rate of ${formatCurrency(data.dayRate)} (exclusive of VAT). The estimated number of days for this engagement is ${data.estimatedDays} days, giving an estimated total fee of ${formatCurrency(totalEstimate)} (exclusive of VAT). This estimate is provided in good faith but is not a fixed price commitment unless expressly stated.\n\nThe Consultant shall submit invoices monthly in arrears, detailing the number of days worked and a summary of activities performed. Payment shall be made within ${data.paymentTermsDays} days of receipt of a valid invoice. VAT shall be charged at the prevailing rate where applicable.\n\nReasonable expenses incurred by the Consultant in connection with the engagement shall be reimbursed by the Client, provided that expenses exceeding a reasonable threshold are approved by the Client in advance and supported by receipts.`,
    subSections: [],
  };
}

export function generateIP(data: ConsultingInput): DocumentSection {
  let ipText: string;
  switch (data.ipOwnership) {
    case "client":
      ipText =
        "All intellectual property rights in any work product, reports, analyses, recommendations, or other output created by the Consultant in the course of this engagement shall vest in the Client absolutely upon creation. The Consultant hereby assigns to the Client all such rights by way of present assignment of future rights and shall execute all documents necessary to perfect this assignment.";
      break;
    case "consultant":
      ipText =
        "All intellectual property rights in any work product, reports, analyses, recommendations, or other output created by the Consultant in the course of this engagement shall remain vested in the Consultant. The Consultant grants the Client a non-exclusive, perpetual, royalty-free, worldwide licence to use, copy, and distribute such work product for the Client's internal business purposes.";
      break;
    case "joint":
      ipText =
        "All intellectual property rights in any work product, reports, analyses, recommendations, or other output created by the Consultant in the course of this engagement shall be jointly owned by the Client and the Consultant. Each party may use the jointly owned intellectual property for their own business purposes without the consent of or accounting to the other party.";
      break;
  }

  return {
    number: "",
    title: "Intellectual Property",
    content: `${ipText}\n\nNothing in this engagement letter shall affect the Consultant's ownership of pre-existing intellectual property, methodologies, frameworks, or tools, which are licensed to the Client on a non-exclusive, royalty-free basis to the extent necessary for the Client to use the deliverables.`,
    subSections: [],
  };
}

export function generateConfidentiality(
  data: ConsultingInput,
): DocumentSection {
  if (!data.confidentiality) {
    return {
      number: "",
      title: "Confidentiality",
      content:
        "Each party acknowledges that in the course of this engagement it may receive information of a confidential nature. Each party agrees to treat such information with reasonable care and not to disclose it to any third party without the prior written consent of the disclosing party, except as required by law or regulation.",
      subSections: [],
    };
  }

  return {
    number: "",
    title: "Confidentiality",
    content:
      "Each party undertakes that it shall not at any time during the term of this engagement or for a period of 24 months after its termination, disclose to any person any confidential information concerning the business, affairs, customers, or suppliers of the other party, except as permitted by this clause.\n\nEach party may disclose the other party's confidential information: (a) to its employees, officers, or professional advisers who need to know such information, provided they are bound by equivalent obligations of confidentiality; (b) as may be required by law, court order, or regulatory authority.\n\nThe Consultant acknowledges that the Client's business strategies, financial data, and client information are confidential and shall be treated with the utmost discretion.",
    subSections: [],
  };
}

export function generateStatus(): DocumentSection {
  return {
    number: "",
    title: "Consultant Status",
    content:
      "The Consultant is engaged as an independent contractor and nothing in this engagement letter shall create or be deemed to create a partnership, joint venture, agency, or employment relationship between the parties. The Consultant shall be responsible for their own tax affairs, including income tax, National Insurance contributions, and VAT.",
    subSections: [],
  };
}

export function generateTermination(data: ConsultingInput): DocumentSection {
  return {
    number: "",
    title: "Termination",
    content: `Either party may terminate this engagement by giving the other party not less than ${data.terminationNoticeDays} days' written notice.\n\nEither party may terminate this engagement with immediate effect by written notice if the other party commits a material breach which is irremediable, or which is not remedied within 14 days of written notice.\n\nUpon termination, the Client shall pay the Consultant for all days worked and expenses properly incurred up to the date of termination. The Consultant shall deliver to the Client all completed and partially completed deliverables and all Client materials in the Consultant's possession.`,
    subSections: [],
  };
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}

export function getAllConsultingSections(
  data: ConsultingInput,
): DocumentSection[] {
  return [
    generateEngagement(data),
    generateDeliverables(data),
    generateFees(data),
    generateIP(data),
    generateConfidentiality(data),
    generateStatus(),
    generateTermination(data),
  ];
}
