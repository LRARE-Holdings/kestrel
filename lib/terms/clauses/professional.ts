import type { ProfessionalInput } from "../schemas";

interface Section {
  title: string;
  content: string;
}

export function generateProfessionalTerms(data: ProfessionalInput): Section[] {
  const biz = data.business;
  const displayName = biz.tradingName || biz.businessName;

  const sections: Section[] = [];

  // 1. Introduction
  sections.push({
    title: "Introduction",
    content: `These terms and conditions ("Terms") govern the provision of professional services by ${biz.businessName}${biz.tradingName ? ` (trading as ${biz.tradingName})` : ""} ("we", "us", "our", "the Provider") to you ("you", "your", "the Client").

By engaging our services, you agree to be bound by these Terms. These Terms apply unless expressly superseded by a separate written agreement or engagement letter.

${biz.businessStructure === "limited_company" ? `${biz.businessName} is a company registered in England and Wales${biz.companyNumber ? ` (company number ${biz.companyNumber})` : ""}.` : `${biz.businessName} is a ${biz.businessStructure === "sole_trader" ? "sole trader" : biz.businessStructure === "llp" ? "limited liability partnership" : "partnership"} based in England and Wales.`} Our registered address is ${biz.registeredAddress}.`,
  });

  // 2. Services
  sections.push({
    title: "Services",
    content: `We provide the following professional services: ${data.serviceDescription}

The specific scope, deliverables, and timeline for each engagement will be agreed in writing before work commences. Any changes to the agreed scope must be confirmed in writing by both parties and may result in adjustments to fees and timelines.`,
  });

  // 3. Fees and Payment
  sections.push({
    title: "Fees and Payment",
    content: `Our fees will be agreed in writing before each engagement commences. All fees are quoted in pounds sterling (GBP) and are exclusive of VAT unless stated otherwise.

Invoices are payable within ${data.paymentTermsDays} days of the invoice date. We reserve the right to charge interest on overdue payments in accordance with the Late Payment of Commercial Debts (Interest) Act 1998.

We may require a deposit or advance payment before commencing work on certain engagements. Any deposit requirements will be communicated in writing.`,
  });

  // 4. Client Obligations
  sections.push({
    title: "Client Obligations",
    content: `To enable us to perform the services effectively, you agree to:

- Provide all necessary information, materials, and access in a timely manner.
- Make decisions and provide approvals promptly when requested.
- Ensure that any information you provide is accurate and complete.
- Designate a primary contact person for day-to-day communication.

Delays caused by failure to meet these obligations may result in revised timelines and additional fees.`,
  });

  // 5. Intellectual Property
  const ipContent =
    data.ipOwnership === "client"
      ? `All intellectual property created by us in the course of providing the services ("Work Product") shall, upon payment in full, vest in you. We assign to you all rights, title, and interest in the Work Product.

We retain the right to use general knowledge, skills, and experience acquired during the engagement, provided that we do not disclose your confidential information.`
      : data.ipOwnership === "provider"
        ? `All intellectual property created by us in the course of providing the services ("Work Product") remains our property. Upon payment in full, we grant you a non-exclusive, perpetual licence to use the Work Product for your business purposes.

You may not sublicense, resell, or distribute the Work Product without our written consent.`
        : `Intellectual property created by us in the course of providing the services ("Work Product") shall be jointly owned by both parties. Each party may use the Work Product for their own business purposes without restriction, but neither party may grant exclusive rights to a third party without the other's written consent.`;

  sections.push({
    title: "Intellectual Property",
    content: ipContent,
  });

  // 6. Confidentiality
  if (data.confidentiality) {
    sections.push({
      title: "Confidentiality",
      content: `Both parties agree to keep confidential all information received from the other party that is designated as confidential or that would reasonably be understood to be confidential ("Confidential Information").

Confidential Information does not include information that: (a) is or becomes publicly available through no fault of the receiving party; (b) was already known to the receiving party before disclosure; (c) is independently developed by the receiving party; or (d) is required to be disclosed by law or regulation.

The obligations of confidentiality shall survive the termination of the engagement for a period of two years.`,
    });
  }

  // 7. Limitation of Liability
  sections.push({
    title: "Limitation of Liability",
    content: `Nothing in these Terms limits or excludes our liability for death or personal injury caused by our negligence, fraud or fraudulent misrepresentation, or any other liability that cannot be limited or excluded by law.

Subject to the above, our total liability to you in connection with any engagement shall not exceed ${data.liabilityCapMultiple} times the fees paid or payable for that engagement.

We are not liable for any indirect, consequential, or incidental losses, including but not limited to loss of profit, loss of data, loss of business opportunity, or business interruption.

We are not liable for any losses arising from your use of our work product in a manner not contemplated by the agreed scope of services.`,
  });

  // 8. Termination
  sections.push({
    title: "Termination",
    content: `Either party may terminate an engagement by giving written notice to the other party. Unless otherwise agreed in writing, a notice period of 14 days applies.

Upon termination, you shall pay for all services performed and expenses incurred up to the date of termination. We shall deliver to you all completed and partially completed work product for which payment has been made.

Termination does not affect any rights or obligations that have accrued prior to the date of termination.`,
  });

  // 9. Data Protection
  sections.push({
    title: "Data Protection",
    content: `We process personal data in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.

Where we process personal data on your behalf in the course of providing the services, we act as a data processor and you act as the data controller. We will only process such data in accordance with your instructions and applicable law.

${data.privacyPolicyUrl ? `For full details of how we handle personal data, please see our Privacy Policy at ${data.privacyPolicyUrl}.` : ""}`,
  });

  // 10. Dispute Resolution
  if (data.includeDisputeClause) {
    sections.push({
      title: "Dispute Resolution",
      content: `If a dispute arises in connection with the services or these Terms, both parties agree to first attempt to resolve the dispute through Kestrel's structured online dispute resolution process (kestrel.law) before pursuing mediation, arbitration, or court proceedings. Either party may initiate a dispute on Kestrel by filing a structured dispute notice. Both parties agree to engage in good faith with the Kestrel process for a minimum period of 30 days before pursuing other remedies. This clause does not prevent either party from seeking urgent injunctive relief where necessary.`,
    });
  }

  // 11. Governing Law
  sections.push({
    title: "Governing Law",
    content: `These Terms are governed by the laws of England and Wales. The courts of England and Wales shall have exclusive jurisdiction${data.includeDisputeClause ? ", subject to the dispute resolution process described above" : ""}.`,
  });

  // 12. General
  sections.push({
    title: "General Provisions",
    content: `These Terms, together with any written engagement letter or scope of work, constitute the entire agreement between the parties.

If any provision of these Terms is found to be unenforceable, the remaining provisions shall continue in full force and effect.

No waiver of any provision of these Terms shall be effective unless made in writing.

We may update these Terms from time to time. The version that applies to each engagement is the version in force at the time the engagement is agreed.`,
  });

  // 13. Contact
  sections.push({
    title: "Contact Us",
    content: `If you have any questions about these Terms, please contact us at:

${displayName}
${biz.registeredAddress}
Email: ${biz.contactEmail}`,
  });

  return sections;
}
