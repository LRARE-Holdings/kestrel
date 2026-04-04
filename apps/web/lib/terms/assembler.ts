import type { EcommerceInput, SaasInput, ProfessionalInput, BusinessType } from "./schemas";
import { generateEcommerceTerms } from "./clauses/ecommerce";
import { generateSaasTerms } from "./clauses/saas";
import { generateProfessionalTerms } from "./clauses/professional";

export interface AssembledTerms {
  title: string;
  businessName: string;
  businessType: BusinessType;
  sections: { number: string; title: string; content: string }[];
  includesDisputeClause: boolean;
  generatedAt: string;
}

export function assembleTerms(
  type: BusinessType,
  data: EcommerceInput | SaasInput | ProfessionalInput,
): AssembledTerms {
  let rawSections: { title: string; content: string }[];
  let businessName: string;

  switch (type) {
    case "ecommerce": {
      const d = data as EcommerceInput;
      rawSections = generateEcommerceTerms(d);
      businessName = d.business.tradingName || d.business.businessName;
      break;
    }
    case "saas": {
      const d = data as SaasInput;
      rawSections = generateSaasTerms(d);
      businessName = d.business.tradingName || d.business.businessName;
      break;
    }
    case "professional": {
      const d = data as ProfessionalInput;
      rawSections = generateProfessionalTerms(d);
      businessName = d.business.tradingName || d.business.businessName;
      break;
    }
    default:
      throw new Error(`Unknown business type: ${type}`);
  }

  const sections = rawSections.map((s, i) => ({
    number: String(i + 1),
    title: s.title,
    content: s.content,
  }));

  const titles: Record<BusinessType, string> = {
    ecommerce: "Terms and Conditions",
    saas: "Terms of Service",
    professional: "Terms and Conditions for Professional Services",
  };

  return {
    title: titles[type],
    businessName,
    businessType: type,
    sections,
    includesDisputeClause: data.includeDisputeClause,
    generatedAt: new Date().toISOString(),
  };
}

/** Convert assembled terms to Markdown for website embedding. */
export function termsToMarkdown(terms: AssembledTerms): string {
  const lines: string[] = [
    `# ${terms.title}`,
    "",
    `**${terms.businessName}**`,
    "",
    `Last updated: ${new Date(terms.generatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`,
    "",
  ];

  for (const section of terms.sections) {
    lines.push(`## ${section.number}. ${section.title}`);
    lines.push("");
    lines.push(section.content);
    lines.push("");
  }

  return lines.join("\n");
}

/** Convert assembled terms to clean HTML for website embedding. */
export function termsToHtml(terms: AssembledTerms): string {
  const sectionHtml = terms.sections
    .map(
      (s) =>
        `<section>\n<h2>${s.number}. ${s.title}</h2>\n${s.content
          .split("\n\n")
          .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
          .join("\n")}\n</section>`,
    )
    .join("\n\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${terms.title} — ${terms.businessName}</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; color: #333; }
  h1 { font-size: 1.5rem; }
  h2 { font-size: 1.1rem; margin-top: 2rem; }
  p { margin: 0.5rem 0; }
</style>
</head>
<body>
<h1>${terms.title}</h1>
<p><strong>${terms.businessName}</strong></p>
<p><em>Last updated: ${new Date(terms.generatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</em></p>

${sectionHtml}
</body>
</html>`;
}
