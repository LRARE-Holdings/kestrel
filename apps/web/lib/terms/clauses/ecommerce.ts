import type { EcommerceInput } from "../schemas";
import { KESTREL_DOMAIN } from "@kestrel/shared/constants";

interface Section {
  title: string;
  content: string;
}

export function generateEcommerceTerms(data: EcommerceInput): Section[] {
  const biz = data.business;
  const displayName = biz.tradingName || biz.businessName;

  const sections: Section[] = [];

  // 1. Introduction
  sections.push({
    title: "Introduction",
    content: `These terms and conditions ("Terms") govern the sale of ${data.productType === "physical" ? "goods" : data.productType === "digital" ? "digital products" : "goods and digital products"} by ${biz.businessName}${biz.tradingName ? ` (trading as ${biz.tradingName})` : ""} ("we", "us", "our") to you ("you", "your", "the customer").

By placing an order through our website${biz.websiteUrl ? ` at ${biz.websiteUrl}` : ""}, you agree to be bound by these Terms. Please read them carefully before placing an order.

${biz.businessStructure === "limited_company" ? `${biz.businessName} is a company registered in England and Wales${biz.companyNumber ? ` (company number ${biz.companyNumber})` : ""}.` : `${biz.businessName} is a ${biz.businessStructure === "sole_trader" ? "sole trader" : biz.businessStructure === "llp" ? "limited liability partnership" : "partnership"} based in England and Wales.`} Our registered address is ${biz.registeredAddress}.`,
  });

  // 2. Orders and Contract Formation
  sections.push({
    title: "Orders and Contract Formation",
    content: `Your order constitutes an offer to purchase the ${data.productType === "digital" ? "digital products" : "goods"} described. We may accept or decline your order at our discretion.

A binding contract between us is formed when we send you an order confirmation email. Until that point, we are not obligated to supply the ${data.productType === "digital" ? "products" : "goods"}.

All orders are subject to availability. If we are unable to fulfil your order, we will notify you and arrange a full refund of any payment already made.`,
  });

  // 3. Prices and Payment
  sections.push({
    title: "Prices and Payment",
    content: `All prices are quoted in pounds sterling (GBP)${data.pricesIncludeVat ? " and include VAT at the applicable rate" : ". VAT will be added to the total at checkout where applicable"}.

We reserve the right to change our prices at any time, but changes will not affect orders for which we have already sent an order confirmation.

Payment must be made in full at the time of placing your order. We accept the payment methods displayed at checkout.`,
  });

  // 4. Delivery (physical goods)
  if (data.productType !== "digital") {
    sections.push({
      title: "Delivery",
      content: `We deliver to ${data.deliveryScope === "uk_only" ? "addresses within the United Kingdom" : "addresses within the United Kingdom and internationally"}.

Estimated delivery times are provided at checkout and in your order confirmation. These are estimates only and are not guaranteed. Risk in the goods passes to you on delivery.

If delivery is delayed significantly beyond the estimated timeframe, you may contact us at ${biz.contactEmail} to enquire about your order. If we are unable to deliver within a reasonable time, you may cancel the order and receive a full refund.`,
    });
  }

  // 5. Digital Products
  if (data.productType !== "physical") {
    sections.push({
      title: "Digital Products",
      content: `Digital products will be made available to you following receipt of payment and order confirmation. Access details or download links will be sent to the email address provided with your order.

Once a digital product has been accessed or downloaded, the right to cancel under the Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013 may not apply, as set out in the cancellation section below.`,
    });
  }

  // 6. Cancellation and Returns
  const returnsContent =
    data.returnsPolicy === "statutory"
      ? `Under the Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013, you have the right to cancel your order within 14 days of receiving the goods, without giving any reason.

To exercise your right to cancel, you must inform us of your decision by a clear statement (e.g. an email to ${biz.contactEmail}). You must return the goods to us within 14 days of notifying us of your cancellation. The goods must be returned in their original condition. We will reimburse you within 14 days of receiving the returned goods.`
      : `We offer an extended returns period of ${data.extendedReturnsDays || 30} days from the date you receive the goods. This is in addition to your statutory rights under the Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013.

To return an item, please contact us at ${biz.contactEmail}. The goods must be returned in their original condition. We will reimburse you within 14 days of receiving the returned goods.`;

  sections.push({
    title: "Cancellation and Returns",
    content: returnsContent,
  });

  // 7. Consumer Rights
  sections.push({
    title: "Your Consumer Rights",
    content: `Under the Consumer Rights Act 2015, goods must be of satisfactory quality, fit for purpose, and as described. Digital content must be of satisfactory quality, fit for a particular purpose, and as described.

If goods or digital content do not meet these standards, you are entitled to:
- A full refund within 30 days of purchase.
- A repair or replacement if the fault is discovered after 30 days but within 6 months.
- A partial refund if a repair or replacement is not possible after 6 months.

Nothing in these Terms affects your statutory rights as a consumer.`,
  });

  // 8. Age Restrictions
  if (data.ageRestrictions) {
    sections.push({
      title: "Age Restrictions",
      content: `${data.ageRestrictionDetails || "Certain products on our website are subject to age restrictions."} By placing an order for age-restricted products, you confirm that you meet the minimum age requirement. We reserve the right to cancel orders and request proof of age where we reasonably believe an order has been placed by a person below the required age.`,
    });
  }

  // 9. Limitation of Liability
  sections.push({
    title: "Limitation of Liability",
    content: `Nothing in these Terms limits or excludes our liability for death or personal injury caused by our negligence, fraud or fraudulent misrepresentation, or any other liability that cannot be limited or excluded by law.

Subject to the above, our total liability to you in connection with any order shall not exceed the total price paid for that order.

We are not liable for any indirect, consequential, or incidental losses, including but not limited to loss of profit, loss of business, or loss of data.`,
  });

  // 10. Data Protection
  sections.push({
    title: "Data Protection",
    content: `We process your personal data in accordance with applicable data protection legislation, including the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.${data.privacyPolicyUrl ? ` For full details of how we collect, use, and protect your personal data, please see our Privacy Policy at ${data.privacyPolicyUrl}.` : " We recommend that you maintain a separate privacy policy detailing how you collect, use, and protect personal data."}

We act as the data controller for personal data collected through our website and order process.`,
  });

  // 11. Dispute Resolution (Kestrel clause)
  if (data.includeDisputeClause) {
    sections.push({
      title: "Dispute Resolution",
      content: `If a dispute arises in connection with any order or these Terms, both parties agree to first attempt to resolve the dispute through Kestrel's structured online dispute resolution process (${KESTREL_DOMAIN}) before pursuing mediation, arbitration, or court proceedings. Either party may initiate a dispute on Kestrel by filing a structured dispute notice. Both parties agree to engage in good faith with the Kestrel process for a minimum period of 30 days before pursuing other remedies. This clause does not prevent either party from seeking urgent injunctive relief where necessary.`,
    });
  }

  // 12. Governing Law
  sections.push({
    title: "Governing Law",
    content: `These Terms are governed by the laws of England and Wales. The courts of England and Wales shall have exclusive jurisdiction over any disputes arising from or in connection with these Terms${data.includeDisputeClause ? ", subject to the dispute resolution process described above" : ""}.`,
  });

  // 13. Changes to Terms
  sections.push({
    title: "Changes to These Terms",
    content: `We may update these Terms from time to time. Any changes will be posted on our website. The version of the Terms that applies to your order is the version in force at the time you place your order.`,
  });

  // 14. Contact
  sections.push({
    title: "Contact Us",
    content: `If you have any questions about these Terms or wish to make a complaint, please contact us at:

${displayName}
${biz.registeredAddress}
Email: ${biz.contactEmail}`,
  });

  return sections;
}
