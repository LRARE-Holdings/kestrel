import { NextResponse } from "next/server";
import { createServiceClient } from "@kestrel/shared/supabase/service";
import { EMAILS } from "@kestrel/shared/constants";

const BOE_RATE_URL =
  "https://www.bankofengland.co.uk/boeapps/database/Bank-Rate.asp";

/**
 * Called by Vercel Cron (weekly) to check for BoE base rate changes.
 * Scrapes the BoE Bank Rate page, parses the current rate, and
 * inserts a new row into base_rates if the rate has changed.
 */
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch BoE page
    const response = await fetch(BOE_RATE_URL, {
      headers: {
        "User-Agent":
          `Kestrel/1.0 (Legal toolkit; base rate monitoring; ${EMAILS.hello})`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch BoE page", status: response.status },
        { status: 502 },
      );
    }

    const html = await response.text();

    // Parse rate from the BoE page
    // The page contains a table with rows like: <td>18 Dec 25</td><td>3.75</td>
    const parsed = parseRateFromHtml(html);

    if (!parsed) {
      return NextResponse.json(
        { error: "Failed to parse rate from BoE page — structure may have changed" },
        { status: 500 },
      );
    }

    const supabase = createServiceClient();

    // Check the latest stored rate
    const { data: existing } = await supabase
      .from("base_rates")
      .select("rate, effective_date")
      .order("effective_date", { ascending: false })
      .limit(1)
      .single();

    // If rate is unchanged, skip
    if (
      existing &&
      Number(existing.rate) === parsed.rate &&
      existing.effective_date === parsed.effectiveDate
    ) {
      return NextResponse.json({
        message: "Rate unchanged",
        rate: parsed.rate,
        effectiveDate: parsed.effectiveDate,
      });
    }

    // Insert new rate
    const { data: inserted, error } = await supabase
      .from("base_rates")
      .insert({
        rate: parsed.rate,
        source_url: BOE_RATE_URL,
        effective_date: parsed.effectiveDate,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to insert rate" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Rate updated",
      rate: parsed.rate,
      effectiveDate: parsed.effectiveDate,
      record: inserted,
    });
  } catch (err) {
    console.error("BoE rate fetch error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ── HTML Parser ─────────────────────────────────────────────────────────────

interface ParsedRate {
  rate: number;
  effectiveDate: string; // YYYY-MM-DD
}

function parseRateFromHtml(html: string): ParsedRate | null {
  // The BoE Bank Rate page has a table with date and rate columns.
  // Each row is roughly: <td ...>DD Mon YY</td> ... <td ...>X.XX</td>
  // We look for the first data row which has the most recent rate.

  // Match patterns like "18 Dec 25" followed by a rate like "3.75"
  const rowPattern =
    /(\d{1,2}\s+\w{3}\s+\d{2,4})\s*<\/td>\s*<td[^>]*>\s*([\d.]+)\s*<\/td>/gi;

  const match = rowPattern.exec(html);
  if (!match) return null;

  const dateStr = match[1].trim();
  const rateStr = match[2].trim();
  const rate = parseFloat(rateStr);

  if (isNaN(rate)) return null;

  // Parse the date — BoE uses "DD Mon YY" format
  const effectiveDate = parseBoeDate(dateStr);
  if (!effectiveDate) return null;

  return { rate, effectiveDate };
}

function parseBoeDate(dateStr: string): string | null {
  // Handle "18 Dec 25" or "18 Dec 2025"
  const months: Record<string, string> = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04",
    May: "05", Jun: "06", Jul: "07", Aug: "08",
    Sep: "09", Oct: "10", Nov: "11", Dec: "12",
  };

  const parts = dateStr.split(/\s+/);
  if (parts.length !== 3) return null;

  const day = parts[0].padStart(2, "0");
  const month = months[parts[1]];
  if (!month) return null;

  let year = parts[2];
  if (year.length === 2) {
    year = `20${year}`;
  }

  return `${year}-${month}-${day}`;
}
