export interface AiAssessmentEnrichment {
  website_found: boolean;
  website_summary: string | null;
  companies_house_found: boolean;
  company_type: string | null;
  incorporation_date: string | null;
  estimated_size: "micro" | "small" | "medium" | "large" | null;
}

export interface AiAssessment {
  recommended_plan: "free" | "professional" | "business";
  confidence: "high" | "medium" | "low";
  reasoning: string;
  key_signals: string[];
  talking_points: string[];
  enrichment: AiAssessmentEnrichment;
  model_version: string;
  assessed_at: string;
}
