import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Pinned model version per agents.md Rule 6
const CLAUDE_MODEL = "claude-sonnet-4-20250514";

interface LeadRecord {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  phone: string | null;
  source: string | null;
  notes: string | null;
  score: number | null;
  score_breakdown: Record<string, number> | null;
}

interface WebhookPayload {
  type: string;
  table: string;
  record: LeadRecord;
  schema: string;
}

// --- Web Enrichment ---

async function fetchCompaniesHouse(companyName: string): Promise<{
  found: boolean;
  company_type: string | null;
  incorporation_date: string | null;
}> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(
      `https://api.company-information.service.gov.uk/search/companies?q=${encodeURIComponent(companyName)}&items_per_page=1`,
      {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      },
    );
    clearTimeout(timeout);
    if (!res.ok)
      return { found: false, company_type: null, incorporation_date: null };
    const data = await res.json();
    const item = data.items?.[0];
    if (!item)
      return { found: false, company_type: null, incorporation_date: null };
    return {
      found: true,
      company_type: item.company_type ?? null,
      incorporation_date: item.date_of_creation ?? null,
    };
  } catch {
    return { found: false, company_type: null, incorporation_date: null };
  }
}

async function fetchWebsiteText(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Kestrel-Lead-Scorer/1.0" },
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const html = await res.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 2000);
    return text || null;
  } catch {
    return null;
  }
}

function extractWebsiteUrl(notes: string | null): string | null {
  if (!notes) return null;
  const match = notes.match(/Website:\s*(https?:\/\/\S+)/i);
  return match?.[1] ?? null;
}

// --- Claude API Call ---

async function callClaude(
  lead: LeadRecord,
  enrichment: {
    websiteText: string | null;
    companiesHouse: {
      found: boolean;
      company_type: string | null;
      incorporation_date: string | null;
    };
  },
): Promise<Record<string, unknown>> {
  let enrichmentSection = "";
  if (enrichment.websiteText) {
    enrichmentSection += `\nWebsite content (excerpt): ${enrichment.websiteText}\n`;
  }
  if (enrichment.companiesHouse.found) {
    enrichmentSection += `\nCompanies House data:\n- Company type: ${enrichment.companiesHouse.company_type}\n- Incorporated: ${enrichment.companiesHouse.incorporation_date}\n`;
  }

  const systemPrompt = `You are a sales intelligence assistant for Kestrel, an online dispute resolution platform for businesses in England and Wales.

Kestrel has three plans:
- Free: Late payment calculator, letter generator, contract templates, T&C generator, handshake agreements
- Professional (paid): Save/manage documents, file disputes, structured communication, evidence management, email notifications
- Business (paid): Priority dispute handling, escalation to mediators, bulk contract generation, API access, dedicated support

Given lead information, recommend which plan is the best fit for upselling. Consider:
- Business size and type (sole trader vs limited company vs larger)
- Industry and likely dispute exposure (construction, consulting, and creative sectors have higher dispute rates)
- Signals of complexity (multiple contracts, ongoing relationships, high-value work)
- Current engagement level with Kestrel's free tools
- Whether they would benefit from dispute resolution or just documentation tools

Be specific and practical. Base recommendations on evidence, not assumptions. If very little information is available, set confidence to "low".

Respond ONLY with a valid JSON object. No markdown, no code fences, no explanation outside the JSON.`;

  const userMessage = `Lead data:
- Name: ${lead.name}
- Company: ${lead.company ?? "Not provided"}
- Email: ${lead.email ?? "Not provided"}
- Source: ${lead.source ?? "Not provided"}
- Notes: ${lead.notes ?? "None"}
- Deterministic score: ${lead.score ?? "Not scored"}/120
- Score breakdown: ${lead.score_breakdown ? JSON.stringify(lead.score_breakdown) : "Not available"}
${enrichmentSection ? `\nWeb enrichment data:${enrichmentSection}` : ""}

Respond with a JSON object with these exact fields:
{
  "recommended_plan": "free" | "professional" | "business",
  "confidence": "high" | "medium" | "low",
  "reasoning": "2-3 sentences explaining the recommendation",
  "key_signals": ["3-5 bullet points of what informed the decision"],
  "talking_points": ["2-4 suggested conversation starters for the sales outreach"],
  "enrichment": {
    "website_found": boolean,
    "website_summary": "Brief description of what the business does, or null",
    "companies_house_found": boolean,
    "company_type": "e.g. Private limited company, or null",
    "incorporation_date": "e.g. 2019-03-15, or null",
    "estimated_size": "micro" | "small" | "medium" | "large" | null
  }
}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      temperature: 0,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  const content = data.content?.[0]?.text;
  if (!content) throw new Error("Empty response from Claude");

  return JSON.parse(content);
}

// --- Handler ---

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const payload: WebhookPayload = await req.json();
    const lead = payload.record;

    if (!lead?.id) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`[score-lead] Scoring lead ${lead.id} (${lead.name})`);

    // 1. Web enrichment (parallel, best-effort)
    const websiteUrl = extractWebsiteUrl(lead.notes);
    const [websiteText, companiesHouse] = await Promise.all([
      websiteUrl ? fetchWebsiteText(websiteUrl) : Promise.resolve(null),
      lead.company
        ? fetchCompaniesHouse(lead.company)
        : Promise.resolve({
            found: false,
            company_type: null,
            incorporation_date: null,
          }),
    ]);

    // 2. Call Claude
    const assessment = await callClaude(lead, { websiteText, companiesHouse });

    // 3. Add metadata
    const now = new Date().toISOString();
    const fullAssessment = {
      ...assessment,
      model_version: CLAUDE_MODEL,
      assessed_at: now,
    };

    // 4. Write back to database
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { error } = await supabase
      .from("leads")
      .update({
        ai_assessment: fullAssessment,
        ai_assessed_at: now,
      })
      .eq("id", lead.id);

    if (error) {
      console.error("[score-lead] Write-back failed:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(
      `[score-lead] Scored lead ${lead.id}: ${assessment.recommended_plan} (${assessment.confidence})`,
    );
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[score-lead] Error:", err);
    // Return 200 to acknowledge webhook even on error (prevent infinite retries)
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
});
