import type { DocumentSection } from "@/lib/clauses/types";
import type { GeneralServiceInput } from "@/lib/contracts/schemas";

export function generateAppointment(
  data: GeneralServiceInput,
): DocumentSection {
  return {
    number: "",
    title: "Appointment and Scope of Services",
    content: `${data.partyA.businessName} ("the Client") hereby appoints ${data.partyB.businessName} ("the Service Provider") to provide the following services: ${data.serviceDescription}.\n\nThe Service Provider shall perform the services with reasonable skill, care, and diligence and in accordance with good industry practice. The Service Provider shall comply with all applicable laws, regulations, and codes of practice in the performance of the services.`,
    subSections: [],
  };
}

export function generateDuration(
  data: GeneralServiceInput,
): DocumentSection {
  return {
    number: "",
    title: "Duration",
    content: `This contract shall commence on the effective date and shall continue for a period of ${data.serviceDuration}, unless terminated earlier in accordance with the termination provisions of this contract.`,
    subSections: [],
  };
}

export function generatePayment(data: GeneralServiceInput): DocumentSection {
  const frequencyText: Record<string, string> = {
    "one-off": "as a single payment upon completion of the services",
    weekly: "on a weekly basis",
    monthly: "on a monthly basis",
    quarterly: "on a quarterly basis",
    annually: "on an annual basis",
  };

  return {
    number: "",
    title: "Payment",
    content: `The Client shall pay the Service Provider ${formatCurrency(data.paymentAmount)} ${frequencyText[data.paymentFrequency]} for the services. Payment shall be made within ${data.paymentTermsDays} days of receipt of a valid invoice. All amounts are exclusive of VAT, which shall be charged at the prevailing rate where applicable.\n\nIf the Client fails to make any payment due under this contract by the due date, the Service Provider shall be entitled to charge interest on the overdue amount in accordance with the Late Payment of Commercial Debts (Interest) Act 1998.`,
    subSections: [],
  };
}

export function generateStandardOfService(): DocumentSection {
  return {
    number: "",
    title: "Standard of Service",
    content:
      "The Service Provider shall perform the services: (a) with reasonable skill, care, and diligence; (b) in accordance with good industry practice; (c) in compliance with all applicable laws and regulations; (d) using suitably qualified and experienced personnel; and (e) in accordance with any specifications, standards, or requirements set out in this contract or otherwise agreed between the parties in writing.",
    subSections: [],
  };
}

export function generateLiability(
  data: GeneralServiceInput,
): DocumentSection {
  const capText = data.liabilityCap
    ? `The total aggregate liability of the Service Provider under or in connection with this contract shall not exceed ${data.liabilityCap}.`
    : "The total aggregate liability of the Service Provider under or in connection with this contract shall not exceed the total fees paid or payable by the Client under this contract in the 12-month period immediately preceding the event giving rise to the claim.";

  return {
    number: "",
    title: "Limitation of Liability",
    content: `${capText}\n\nNothing in this contract shall limit or exclude either party's liability for: (a) death or personal injury caused by its negligence; (b) fraud or fraudulent misrepresentation; or (c) any other liability which cannot be limited or excluded by applicable law.\n\nNeither party shall be liable to the other party for any indirect, consequential, special, or punitive loss or damage, loss of profit, loss of revenue, loss of data, loss of goodwill, or loss of business opportunity, however caused, even if foreseeable.`,
    subSections: [],
  };
}

export function generateTermination(
  data: GeneralServiceInput,
): DocumentSection {
  return {
    number: "",
    title: "Termination",
    content: `Either party may terminate this contract by giving the other party not less than ${data.terminationNoticeDays} days' written notice.\n\nEither party may terminate this contract with immediate effect by giving written notice to the other party if: (a) the other party commits a material breach of any term of this contract which is irremediable, or which, if capable of remedy, is not remedied within 14 days of receipt of written notice specifying the breach and requiring its remedy; (b) the other party becomes insolvent, enters administration, goes into liquidation, or has a receiver or administrative receiver appointed over any of its assets.\n\nUpon termination, the Client shall pay the Service Provider for all services performed up to the date of termination. Any provisions of this contract which expressly or by implication are intended to survive termination shall continue in full force and effect.`,
    subSections: [],
  };
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}

export function getAllGeneralServiceSections(
  data: GeneralServiceInput,
): DocumentSection[] {
  return [
    generateAppointment(data),
    generateDuration(data),
    generatePayment(data),
    generateStandardOfService(),
    generateLiability(data),
    generateTermination(data),
  ];
}
