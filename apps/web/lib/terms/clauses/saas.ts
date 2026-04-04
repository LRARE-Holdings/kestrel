import type { SaasInput } from "../schemas";
import { KESTREL_DOMAIN } from "@kestrel/shared/constants";

interface Section {
  title: string;
  content: string;
}

export function generateSaasTerms(data: SaasInput): Section[] {
  const biz = data.business;
  const displayName = biz.tradingName || biz.businessName;

  const sections: Section[] = [];

  // 1. Introduction
  sections.push({
    title: "Introduction",
    content: `These terms of service ("Terms") govern your access to and use of the software and digital services provided by ${biz.businessName}${biz.tradingName ? ` (trading as ${biz.tradingName})` : ""} ("we", "us", "our", "the Provider").

By creating an account or using our services${biz.websiteUrl ? ` at ${biz.websiteUrl}` : ""}, you agree to be bound by these Terms. If you are entering into these Terms on behalf of an organisation, you represent that you have the authority to bind that organisation.

${biz.businessStructure === "limited_company" ? `${biz.businessName} is a company registered in England and Wales${biz.companyNumber ? ` (company number ${biz.companyNumber})` : ""}.` : `${biz.businessName} is a ${biz.businessStructure === "sole_trader" ? "sole trader" : biz.businessStructure === "llp" ? "limited liability partnership" : "partnership"} based in England and Wales.`} Our registered address is ${biz.registeredAddress}.`,
  });

  // 2. Service Description
  sections.push({
    title: "The Service",
    content: `We provide a software-as-a-service platform accessible via the internet. The specific features and functionality available to you depend on your subscription plan.

We reserve the right to modify, update, or discontinue features of the service at any time. We will provide reasonable notice of material changes where practicable.`,
  });

  // 3. Account Registration
  sections.push({
    title: "Account Registration",
    content: `To access the service, you must create an account and provide accurate, complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.

You must notify us immediately at ${biz.contactEmail} if you become aware of any unauthorised use of your account.`,
  });

  // 4. Free Tier / Trial
  if (data.hasFreeTier || (data.trialPeriodDays && data.trialPeriodDays > 0)) {
    let content = "";
    if (data.hasFreeTier) {
      content += "We offer a free tier of the service with limited features. The free tier is provided without charge and may be modified or discontinued at any time.\n\n";
    }
    if (data.trialPeriodDays && data.trialPeriodDays > 0) {
      content += `We offer a ${data.trialPeriodDays}-day free trial of the paid service. At the end of the trial period, ${data.autoRenewal ? "your subscription will automatically convert to a paid subscription unless you cancel before the trial ends" : "you will need to subscribe to a paid plan to continue using the service"}.`;
    }
    sections.push({
      title: data.hasFreeTier ? "Free Tier and Trial" : "Free Trial",
      content: content.trim(),
    });
  }

  // 5. Subscription and Billing
  const billingText =
    data.billingCycle === "monthly"
      ? "Subscriptions are billed monthly"
      : data.billingCycle === "annual"
        ? "Subscriptions are billed annually"
        : "Subscriptions are available on monthly or annual billing cycles";

  sections.push({
    title: "Subscription and Billing",
    content: `${billingText}. All fees are quoted in pounds sterling (GBP) and are exclusive of VAT unless stated otherwise.

${data.autoRenewal ? "Your subscription will automatically renew at the end of each billing period unless you cancel before the renewal date. We will charge the payment method on file at the then-current subscription rate." : "Your subscription does not renew automatically. You will need to renew your subscription before it expires to maintain access to the service."}

We may change our subscription fees with at least 30 days' notice. Fee changes will take effect at the start of your next billing period following the notice.`,
  });

  // 6. Cancellation
  sections.push({
    title: "Cancellation",
    content: `You may cancel your subscription at any time by contacting us at ${biz.contactEmail} or through your account settings.

If you cancel, your subscription will remain active until the end of the current billing period. We do not offer prorated refunds for partial billing periods.

Upon cancellation, your access to paid features will end at the conclusion of the billing period${data.hasFreeTier ? ". You will retain access to free tier features" : ""}.`,
  });

  // 7. Acceptable Use
  sections.push({
    title: "Acceptable Use",
    content: `You agree to use the service only for lawful purposes and in accordance with these Terms. You must not:

- Use the service in any way that violates any applicable law or regulation.
- Attempt to gain unauthorised access to any part of the service, other accounts, or computer systems.
- Interfere with or disrupt the integrity or performance of the service.
- Upload or transmit any malicious code, viruses, or harmful content.
- Use the service to send unsolicited communications.
- Reverse engineer, decompile, or disassemble any part of the service.
- Resell, sublicense, or redistribute the service without our written consent.

We reserve the right to suspend or terminate your access if you breach these acceptable use provisions.`,
  });

  // 8. Service Level
  if (data.uptimeCommitment !== "none") {
    sections.push({
      title: "Service Availability",
      content: `We aim to maintain service availability of ${data.uptimeCommitment}% during each calendar month, excluding scheduled maintenance windows.

Scheduled maintenance will be communicated in advance where practicable. We are not liable for service unavailability caused by circumstances beyond our reasonable control, including third-party service failures, network issues, or force majeure events.

${data.uptimeCommitment === "99.99" ? "If we fail to meet the uptime commitment in any calendar month, you may be eligible for a service credit. Please contact us for details." : ""}`,
    });
  }

  // 9. Data and Privacy
  sections.push({
    title: "Data and Privacy",
    content: `You retain ownership of all data you upload to or create within the service ("Your Data"). We do not claim ownership of Your Data.

We process Your Data solely for the purpose of providing the service to you. We act as a data processor in respect of Your Data, and you act as the data controller.

${data.dataHostingLocation ? `Your Data is hosted in ${data.dataHostingLocation}.` : ""}

${data.privacyPolicyUrl ? `For full details of how we handle personal data, please see our Privacy Policy at ${data.privacyPolicyUrl}.` : "We recommend that you maintain a separate privacy policy. We process personal data in accordance with the UK GDPR and the Data Protection Act 2018."}`,
  });

  // 10. Intellectual Property
  sections.push({
    title: "Intellectual Property",
    content: `The service, including its design, features, code, documentation, and all related intellectual property, is owned by ${biz.businessName} and is protected by copyright, trademark, and other intellectual property laws.

We grant you a limited, non-exclusive, non-transferable licence to access and use the service for the duration of your subscription, subject to these Terms.

You retain all intellectual property rights in Your Data.`,
  });

  // 11. Limitation of Liability
  sections.push({
    title: "Limitation of Liability",
    content: `Nothing in these Terms limits or excludes our liability for death or personal injury caused by our negligence, fraud or fraudulent misrepresentation, or any other liability that cannot be limited or excluded by law.

Subject to the above, our total aggregate liability to you under or in connection with these Terms shall not exceed the total fees paid by you in the 12 months preceding the claim.

We are not liable for any indirect, consequential, or incidental losses, including but not limited to loss of profit, loss of data, loss of business opportunity, or business interruption.`,
  });

  // 12. Dispute Resolution
  if (data.includeDisputeClause) {
    sections.push({
      title: "Dispute Resolution",
      content: `If a dispute arises in connection with the service or these Terms, both parties agree to first attempt to resolve the dispute through Kestrel's structured online dispute resolution process (${KESTREL_DOMAIN}) before pursuing mediation, arbitration, or court proceedings. Either party may initiate a dispute on Kestrel by filing a structured dispute notice. Both parties agree to engage in good faith with the Kestrel process for a minimum period of 30 days before pursuing other remedies. This clause does not prevent either party from seeking urgent injunctive relief where necessary.`,
    });
  }

  // 13. Governing Law
  sections.push({
    title: "Governing Law",
    content: `These Terms are governed by the laws of England and Wales. The courts of England and Wales shall have exclusive jurisdiction over any disputes arising from or in connection with these Terms${data.includeDisputeClause ? ", subject to the dispute resolution process described above" : ""}.`,
  });

  // 14. Changes
  sections.push({
    title: "Changes to These Terms",
    content: `We may update these Terms from time to time. We will notify you of material changes by email or through the service. Your continued use of the service after changes take effect constitutes acceptance of the updated Terms.`,
  });

  // 15. Contact
  sections.push({
    title: "Contact Us",
    content: `If you have any questions about these Terms, please contact us at:

${displayName}
${biz.registeredAddress}
Email: ${biz.contactEmail}`,
  });

  return sections;
}
