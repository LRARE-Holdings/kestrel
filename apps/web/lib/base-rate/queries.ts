import { createClient } from "@kestrel/shared/supabase/server";

export interface BaseRateRecord {
  rate: number;
  effectiveDate: string;
  fetchedAt: string;
}

/**
 * Get the latest Bank of England base rate from the database.
 * Falls back to a hardcoded value if the query fails (should not
 * happen in production, but prevents the calculator from breaking).
 */
export async function getLatestBaseRate(): Promise<BaseRateRecord> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("base_rates")
      .select("rate, effective_date, fetched_at")
      .order("effective_date", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      console.error("Failed to fetch base rate:", error);
      return FALLBACK_RATE;
    }

    return {
      rate: Number(data.rate),
      effectiveDate: data.effective_date,
      fetchedAt: data.fetched_at,
    };
  } catch (err) {
    console.error("Base rate query error:", err);
    return FALLBACK_RATE;
  }
}

/** Hardcoded fallback — only used if the database is unreachable. */
const FALLBACK_RATE: BaseRateRecord = {
  rate: 3.75,
  effectiveDate: "2025-12-18",
  fetchedAt: new Date().toISOString(),
};
