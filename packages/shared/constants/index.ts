// ── Site Configuration ──────────────────────────────────────────────────────
// Single source of truth for domain references. Change these when moving
// to the final domain — every email, clause, and page references these.

/** The primary domain (no protocol). Change this ONE value when you buy the domain. */
export const KESTREL_DOMAIN = "onkestrel.com";

/** Full site URL, respects env var override for local dev / preview deploys. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || `https://${KESTREL_DOMAIN}`;

/** Admin panel URL. */
export const ADMIN_URL =
  process.env.NEXT_PUBLIC_ADMIN_URL || `https://admin.${KESTREL_DOMAIN}`;

/** Resend "from" domain for transactional email. */
export const EMAIL_FROM_DOMAIN =
  process.env.RESEND_FROM_DOMAIN || KESTREL_DOMAIN;

/** Hosted logo for email templates and public assets. */
export const LOGO_URL =
  "https://zyebrpcjdoyrckxbpicz.supabase.co/storage/v1/object/public/logo/kpm.png";

/** Standard email addresses — derived from the domain. */
export const EMAILS = {
  notifications: `notifications@${EMAIL_FROM_DOMAIN}`,
  auth: `auth@${EMAIL_FROM_DOMAIN}`,
  admin: `admin@${EMAIL_FROM_DOMAIN}`,
  security: `security@${KESTREL_DOMAIN}`,
  privacy: `privacy@${KESTREL_DOMAIN}`,
  hello: `hello@${KESTREL_DOMAIN}`,
} as const;

// ── Shared Dropdown Options ─────────────────────────────────────────────────
// Used by onboarding, settings, and profile forms.

export const BUSINESS_TYPES = [
  { value: "", label: "Select type..." },
  { value: "sole_trader", label: "Sole trader" },
  { value: "limited_company", label: "Limited company" },
  { value: "partnership", label: "Partnership" },
  { value: "llp", label: "LLP" },
  { value: "charity", label: "Charity" },
  { value: "other", label: "Other" },
];

export const COMPANY_SIZES = [
  { value: "", label: "Select size..." },
  { value: "solo", label: "Solo (just me)" },
  { value: "2-10", label: "2\u201310 employees" },
  { value: "11-50", label: "11\u201350 employees" },
  { value: "51-200", label: "51\u2013200 employees" },
  { value: "200+", label: "200+ employees" },
];

export const INDUSTRIES = [
  { value: "", label: "Select industry..." },
  { value: "construction", label: "Construction" },
  { value: "consulting", label: "Consulting" },
  { value: "retail", label: "Retail" },
  { value: "tech", label: "Technology" },
  { value: "creative", label: "Creative & Media" },
  { value: "legal", label: "Legal" },
  { value: "professional_services", label: "Professional Services" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "other", label: "Other" },
];

export const USE_CASES = [
  { value: "contracts", label: "Contracts & agreements", description: "Generate and manage professional contracts" },
  { value: "disputes", label: "Dispute resolution", description: "Structured resolution for business disputes" },
  { value: "late_payments", label: "Late payment recovery", description: "Chase overdue invoices with statutory backing" },
  { value: "general", label: "All of the above", description: "I need the full toolkit" },
];

export const DISPUTE_ESTIMATES = [
  { value: "0", label: "None yet" },
  { value: "1-5", label: "1\u20135 per year" },
  { value: "6-20", label: "6\u201320 per year" },
  { value: "20+", label: "20+ per year" },
];

export const REFERRAL_SOURCES = [
  { value: "", label: "Select..." },
  { value: "search_engine", label: "Search engine (Google, Bing)" },
  { value: "social_media", label: "Social media" },
  { value: "word_of_mouth", label: "Word of mouth" },
  { value: "event_conference", label: "Event or conference" },
  { value: "news_press", label: "News or press" },
  { value: "other", label: "Other" },
];
