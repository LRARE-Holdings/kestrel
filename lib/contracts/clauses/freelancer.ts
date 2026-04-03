import type { DocumentSection } from "@/lib/clauses/types";
import type { FreelancerInput } from "@/lib/contracts/schemas";

export function generateScope(data: FreelancerInput): DocumentSection {
  return {
    number: "",
    title: "Scope of Services",
    content: `${data.partyB.businessName} ("the Freelancer") shall provide the following services to ${data.partyA.businessName} ("the Client"): ${data.serviceDescription}. The Freelancer shall perform the services with reasonable skill, care, and diligence and in accordance with good industry practice.`,
    subSections: [],
  };
}

export function generateDeliverables(data: FreelancerInput): DocumentSection {
  const deliverableList = data.deliverables
    .map((d, i) => `${i + 1}. ${d}`)
    .join("\n");

  return {
    number: "",
    title: "Deliverables",
    content: `The Freelancer shall produce and deliver the following deliverables to the Client:\n\n${deliverableList}\n\nAll deliverables shall be provided in a format reasonably acceptable to the Client unless otherwise agreed in writing. The Client shall review each deliverable within 14 days of receipt and shall notify the Freelancer of any reasonable revisions required.`,
    subSections: [],
  };
}

export function generatePayment(data: FreelancerInput): DocumentSection {
  let paymentDetail: string;
  switch (data.paymentType) {
    case "fixed":
      paymentDetail = `a fixed fee of ${formatCurrency(data.paymentAmount)} for the complete scope of services described in this agreement`;
      break;
    case "hourly":
      paymentDetail = `an hourly rate of ${formatCurrency(data.paymentAmount)} for time spent performing the services. The Freelancer shall maintain accurate time records and provide these with each invoice`;
      break;
    case "milestone":
      paymentDetail = `milestone-based payments totalling ${formatCurrency(data.paymentAmount)}, payable upon completion of each agreed milestone as set out in the deliverables`;
      break;
  }

  return {
    number: "",
    title: "Payment",
    content: `The Client shall pay the Freelancer ${paymentDetail}. Payment shall be made within ${data.paymentTermsDays} days of receipt of a valid invoice. All amounts are exclusive of VAT, which shall be charged at the prevailing rate where applicable. The Freelancer shall submit invoices in a form reasonably acceptable to the Client, including a description of the services performed and any supporting documentation.`,
    subSections: [],
  };
}

export function generateIP(data: FreelancerInput): DocumentSection {
  let ipText: string;
  switch (data.ipOwnership) {
    case "client":
      ipText =
        "All intellectual property rights in any work product, materials, deliverables, or other output created by the Freelancer in the course of performing the services under this agreement shall vest in the Client absolutely upon creation. The Freelancer hereby assigns to the Client, by way of present assignment of future rights, all such intellectual property rights. The Freelancer shall execute all documents and do all things necessary to give effect to this assignment.";
      break;
    case "freelancer":
      ipText =
        "All intellectual property rights in any work product, materials, deliverables, or other output created by the Freelancer in the course of performing the services under this agreement shall remain vested in the Freelancer. The Freelancer grants to the Client a non-exclusive, perpetual, royalty-free, worldwide licence to use, copy, modify, and distribute such work product for the Client's business purposes.";
      break;
    case "joint":
      ipText =
        "All intellectual property rights in any work product, materials, deliverables, or other output created by the Freelancer in the course of performing the services under this agreement shall be jointly owned by the Client and the Freelancer. Each party shall be entitled to use, licence, and exploit the jointly owned intellectual property without the consent of or accounting to the other party, save that neither party shall grant an exclusive licence without the prior written consent of the other party.";
      break;
  }

  return {
    number: "",
    title: "Intellectual Property",
    content: `${ipText}\n\nThe Freelancer warrants that the deliverables shall not infringe the intellectual property rights of any third party and shall indemnify the Client against all claims, costs, and expenses arising from any breach of this warranty. Nothing in this agreement shall affect the Freelancer's ownership of any pre-existing intellectual property, which the Freelancer licences to the Client on a non-exclusive, perpetual, royalty-free basis to the extent necessary for the Client to use the deliverables.`,
    subSections: [],
  };
}

export function generateConfidentiality(
  data: FreelancerInput,
): DocumentSection {
  if (!data.confidentiality) {
    return {
      number: "",
      title: "Confidentiality",
      content:
        "Each party acknowledges that in the course of performing this agreement it may receive information of a confidential nature. Each party agrees to treat such information with reasonable care and not to disclose it to any third party without the prior written consent of the disclosing party, save as required by law or regulation.",
      subSections: [],
    };
  }

  const duration = data.confidentialityDurationMonths ?? 24;

  return {
    number: "",
    title: "Confidentiality",
    content: `Each party undertakes that it shall not at any time during the term of this agreement or for a period of ${duration} months after its termination, disclose to any person any confidential information concerning the business, affairs, customers, clients, or suppliers of the other party, except as permitted by this clause.\n\nConfidential information means any information of a confidential nature including, without limitation, trade secrets, technical data, know-how, financial information, business plans, customer lists, and any information that has been identified as confidential or that ought reasonably to be considered confidential.\n\nEach party may disclose the other party's confidential information: (a) to its employees, officers, representatives, or advisers who need to know such information for the purposes of carrying out the party's obligations under this agreement, provided that such persons are bound by obligations of confidentiality no less onerous than this clause; (b) as may be required by law, a court of competent jurisdiction, or any governmental or regulatory authority.`,
    subSections: [],
  };
}

export function generateTermination(data: FreelancerInput): DocumentSection {
  return {
    number: "",
    title: "Termination",
    content: `Either party may terminate this agreement by giving the other party not less than ${data.terminationNoticeDays} days' written notice.\n\nEither party may terminate this agreement with immediate effect by giving written notice to the other party if: (a) the other party commits a material breach of any term of this agreement which is irremediable, or which, if capable of remedy, is not remedied within 14 days of receipt of written notice specifying the breach and requiring its remedy; (b) the other party becomes insolvent, enters administration, goes into liquidation, or has a receiver or administrative receiver appointed over any of its assets.\n\nUpon termination, the Freelancer shall deliver to the Client all completed and partially completed deliverables. The Client shall pay the Freelancer for all services performed and deliverables provided up to the date of termination.`,
    subSections: [],
  };
}

export function generateStatus(): DocumentSection {
  return {
    number: "",
    title: "Freelancer Status",
    content:
      "The Freelancer is an independent contractor and nothing in this agreement shall create or be deemed to create a partnership, joint venture, agency, or employment relationship between the parties. The Freelancer shall be responsible for their own tax affairs, including income tax, National Insurance contributions, and VAT. The Client shall not be required to make any deductions or contributions on behalf of the Freelancer.",
    subSections: [],
  };
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}

export function getAllFreelancerSections(
  data: FreelancerInput,
): DocumentSection[] {
  return [
    generateScope(data),
    generateDeliverables(data),
    generatePayment(data),
    generateIP(data),
    generateConfidentiality(data),
    generateStatus(),
    generateTermination(data),
  ];
}
