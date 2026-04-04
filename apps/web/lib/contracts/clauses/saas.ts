import type { DocumentSection } from "@/lib/clauses/types";
import type { SaasInput } from "@/lib/contracts/schemas";

export function generateGrant(data: SaasInput): DocumentSection {
  return {
    number: "",
    title: "Grant of Access",
    content: `${data.partyA.businessName} ("the Provider") grants ${data.partyB.businessName} ("the Subscriber") a non-exclusive, non-transferable right to access and use the following service during the subscription term: ${data.serviceDescription}.\n\nThe Subscriber shall not: (a) sublicense, sell, or otherwise make the service available to any third party; (b) modify, adapt, or create derivative works of the service; (c) reverse engineer, disassemble, or decompile the service; (d) use the service in any way that violates applicable law or infringes the rights of any third party; or (e) attempt to gain unauthorised access to the service or its related systems.`,
    subSections: [],
  };
}

export function generateSubscription(data: SaasInput): DocumentSection {
  const termText =
    data.subscriptionTerm === "monthly"
      ? "monthly, renewing automatically at the end of each month unless cancelled by either party with at least 30 days' written notice"
      : "annual, renewing automatically at the end of each 12-month period unless cancelled by either party with at least 60 days' written notice before the end of the current term";

  return {
    number: "",
    title: "Subscription Term and Fees",
    content: `The subscription term shall be ${termText}.\n\nThe subscription fee is ${formatCurrency(data.subscriptionFee)} per ${data.subscriptionTerm === "monthly" ? "month" : "annum"} (exclusive of VAT). Payment shall be made within ${data.paymentTermsDays} days of the date of invoice. VAT shall be charged at the prevailing rate where applicable.\n\nThe Provider reserves the right to adjust subscription fees upon renewal by giving the Subscriber not less than 60 days' written notice. If the Subscriber does not agree to the revised fees, the Subscriber may terminate this agreement by giving written notice before the start of the new term.`,
    subSections: [],
  };
}

export function generateServiceLevels(data: SaasInput): DocumentSection {
  const uptimeText = data.uptimeCommitment
    ? `The Provider commits to maintaining service availability of ${data.uptimeCommitment} during each calendar month, measured over the entire month, excluding scheduled maintenance windows.`
    : "The Provider shall use commercially reasonable efforts to maintain service availability and shall notify the Subscriber in advance of any scheduled maintenance that may affect service availability.";

  const supportText: Record<string, string> = {
    standard:
      "Standard support is provided during UK business hours (09:00-17:30 GMT/BST, Monday to Friday, excluding bank holidays). The Provider shall use reasonable endeavours to respond to support requests within 2 business days.",
    priority:
      "Priority support is provided during extended hours (08:00-20:00 GMT/BST, Monday to Friday). The Provider shall use reasonable endeavours to respond to support requests within 1 business day and to critical issues within 4 hours.",
    premium:
      "Premium support is provided 24 hours a day, 7 days a week. The Provider shall use reasonable endeavours to respond to support requests within 4 hours and to critical issues within 1 hour.",
  };

  return {
    number: "",
    title: "Service Levels and Support",
    content: `${uptimeText}\n\n${supportText[data.supportLevel]}\n\nScheduled maintenance shall be carried out during off-peak hours where reasonably practicable and the Provider shall give the Subscriber reasonable advance notice. The Provider shall not be liable for any failure to meet the service level commitments to the extent caused by circumstances beyond its reasonable control.`,
    subSections: [],
  };
}

export function generateDataProtection(data: SaasInput): DocumentSection {
  if (!data.dataProcessing) {
    return {
      number: "",
      title: "Data",
      content:
        "The Subscriber retains all rights, title, and interest in and to the data it uploads, creates, or processes through the service (\"Subscriber Data\"). The Provider shall not access, use, or disclose Subscriber Data except as necessary to provide the service or as required by law. Upon termination, the Provider shall make Subscriber Data available for export for a period of 30 days and shall thereafter securely delete all Subscriber Data from its systems.",
      subSections: [],
    };
  }

  return {
    number: "",
    title: "Data Protection",
    content:
      "The Subscriber retains all rights, title, and interest in and to the data it uploads, creates, or processes through the service (\"Subscriber Data\"). The Provider shall not access, use, or disclose Subscriber Data except as necessary to provide the service or as required by law.\n\nTo the extent that the Provider processes personal data on behalf of the Subscriber, the Provider shall act as a data processor and the Subscriber as the data controller within the meaning of the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018. The Provider shall: (a) process personal data only on documented instructions from the Subscriber; (b) ensure that persons authorised to process the personal data have committed themselves to confidentiality; (c) implement appropriate technical and organisational measures to ensure a level of security appropriate to the risk; (d) assist the Subscriber in responding to data subject access requests; (e) notify the Subscriber without undue delay upon becoming aware of a personal data breach; (f) delete or return all personal data upon termination.\n\nUpon termination, the Provider shall make Subscriber Data available for export for a period of 30 days and shall thereafter securely delete all Subscriber Data from its systems.",
    subSections: [],
  };
}

export function generateIP(): DocumentSection {
  return {
    number: "",
    title: "Intellectual Property",
    content:
      "All intellectual property rights in the service, including its source code, design, architecture, documentation, and all updates and modifications, remain vested in the Provider. Nothing in this agreement transfers any intellectual property rights from the Provider to the Subscriber.\n\nThe Provider grants the Subscriber a limited, non-exclusive licence to use the service for the Subscriber's internal business purposes during the subscription term. The Provider warrants that the service does not infringe the intellectual property rights of any third party and shall indemnify the Subscriber against all claims arising from any breach of this warranty.",
    subSections: [],
  };
}

export function generateLimitation(data: SaasInput): DocumentSection {
  return {
    number: "",
    title: "Limitation of Liability",
    content: `The Provider's total aggregate liability under or in connection with this agreement shall not exceed the total subscription fees paid by the Subscriber in the 12-month period immediately preceding the event giving rise to the claim.\n\nNeither party shall be liable for any indirect, consequential, special, or punitive loss or damage, loss of profit, loss of revenue, loss of data, loss of goodwill, or loss of business opportunity, however caused, even if foreseeable.\n\nNothing in this agreement shall limit or exclude either party's liability for: (a) death or personal injury caused by negligence; (b) fraud or fraudulent misrepresentation; or (c) any liability which cannot be limited or excluded by applicable law.`,
    subSections: [],
  };
}

export function generateTermination(data: SaasInput): DocumentSection {
  return {
    number: "",
    title: "Termination",
    content: `Either party may terminate this agreement by giving the other party not less than ${data.terminationNoticeDays} days' written notice.\n\nEither party may terminate this agreement with immediate effect by giving written notice if the other party commits a material breach which is irremediable, or which is not remedied within 14 days of written notice.\n\nThe Provider may suspend the Subscriber's access to the service immediately if the Subscriber fails to pay any fees when due, provided that the Provider gives the Subscriber at least 7 days' written notice of the intended suspension.\n\nUpon termination, the Subscriber's right to access and use the service shall cease. The Provider shall make Subscriber Data available for export for 30 days following termination.`,
    subSections: [],
  };
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}

export function getAllSaasSections(data: SaasInput): DocumentSection[] {
  return [
    generateGrant(data),
    generateSubscription(data),
    generateServiceLevels(data),
    generateDataProtection(data),
    generateIP(),
    generateLimitation(data),
    generateTermination(data),
  ];
}
