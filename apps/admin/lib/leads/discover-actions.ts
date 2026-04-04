"use server";

import { getAdminUser } from "@/lib/auth/actions";
import { createClient } from "@kestrel/shared/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export interface PlaceResult {
  place_id: string;
  name: string;
  address: string;
  phone: string | null;
  website: string | null;
  rating: number | null;
  review_count: number;
}

const searchSchema = z.object({
  query: z.string().min(2, "Query must be at least 2 characters"),
  location: z.string().min(2, "Location is required"),
  radius: z.coerce.number().min(1000).max(50000),
});

export async function searchGooglePlaces(
  _prev: { results?: PlaceResult[]; error?: string } | null,
  formData: FormData,
): Promise<{ results?: PlaceResult[]; error?: string }> {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey)
    return {
      error:
        "Google Places API key not configured. Add GOOGLE_PLACES_API_KEY to .env.local",
    };

  const parsed = searchSchema.safeParse({
    query: formData.get("query"),
    location: formData.get("location"),
    radius: formData.get("radius"),
  });
  if (!parsed.success)
    return { error: parsed.error.errors[0]?.message ?? "Validation failed" };

  try {
    const textQuery = `${parsed.data.query} in ${parsed.data.location}`;
    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount",
        },
        body: JSON.stringify({
          textQuery,
          locationBias: { circle: { radius: parsed.data.radius } },
          maxResultCount: 20,
        }),
      },
    );

    if (!response.ok) {
      console.error("[discover] Google Places error:", await response.text());
      return { error: "Google Places search failed" };
    }

    const data = await response.json();
    const results: PlaceResult[] = (
      data.places ?? []
    ).map((place: Record<string, unknown>) => ({
      place_id: place.id as string,
      name:
        (place.displayName as Record<string, string>)?.text ?? "Unknown",
      address: (place.formattedAddress as string) ?? "",
      phone: (place.nationalPhoneNumber as string) ?? null,
      website: (place.websiteUri as string) ?? null,
      rating: (place.rating as number) ?? null,
      review_count: (place.userRatingCount as number) ?? 0,
    }));

    return { results };
  } catch (error) {
    console.error("[discover] Error:", error);
    return { error: "Search failed. Check API key and try again." };
  }
}

export async function addPlaceAsLead(
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  const company = formData.get("company") as string;
  const phone = formData.get("phone") as string;
  const website = formData.get("website") as string;
  const address = formData.get("address") as string;
  const placeId = formData.get("place_id") as string;

  if (!name) return { error: "Name is required" };

  const supabase = await createClient();

  // Deduplication: check if a lead already exists for this company
  if (company) {
    const { data: existing } = await supabase
      .from("leads")
      .select("id")
      .ilike("company", company)
      .limit(1)
      .maybeSingle();
    if (existing) return { error: `Lead already exists for "${company}"` };
  }

  const notes = [
    website ? `Website: ${website}` : null,
    address ? `Address: ${address}` : null,
    placeId ? `Place ID: ${placeId}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const { error } = await supabase.from("leads").insert({
    name,
    company: company || null,
    phone: phone || null,
    source: "google_places",
    notes: notes || null,
    stage: "lead",
    status: "active",
    created_by: admin.id,
  });

  if (error) return { error: error.message };
  revalidatePath("/leads");
  return { success: true };
}
