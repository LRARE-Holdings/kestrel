import { describe, it, expect } from "vitest";
import {
  contrastRatio,
  darken,
  isValidHex,
  readableForeground,
  relativeLuminance,
  safeHex,
  INK,
  WHITE,
  DEFAULT_BRAND_COLOR,
} from "@/lib/branding/colors";
import { generateSlug, isValidSlug } from "@/lib/branding/slug";
import { resolveBranding, DEFAULT_BRANDING } from "@/lib/branding/types";

describe("hex validation", () => {
  it("accepts valid 6-digit hex, either case", () => {
    expect(isValidHex("#2B5C4F")).toBe(true);
    expect(isValidHex("#abcdef")).toBe(true);
    expect(isValidHex("#000000")).toBe(true);
  });

  it("rejects malformed or unsafe values", () => {
    expect(isValidHex("#2B5C4")).toBe(false); // 5 digits
    expect(isValidHex("2B5C4F")).toBe(false); // no hash
    expect(isValidHex("#2B5C4FF")).toBe(false); // 7 digits
    expect(isValidHex("#xyzxyz")).toBe(false);
    expect(isValidHex("red")).toBe(false);
    expect(isValidHex("javascript:alert(1)")).toBe(false);
    expect(isValidHex(null)).toBe(false);
    expect(isValidHex(undefined)).toBe(false);
    expect(isValidHex(123)).toBe(false);
  });

  it("safeHex returns the value when valid, else the fallback", () => {
    expect(safeHex("#123456", "#000000")).toBe("#123456");
    expect(safeHex("nope", "#000000")).toBe("#000000");
    expect(safeHex(undefined, DEFAULT_BRAND_COLOR)).toBe(DEFAULT_BRAND_COLOR);
  });
});

describe("contrast + luminance helpers", () => {
  it("computes luminance at the extremes", () => {
    expect(relativeLuminance("#000000")).toBeCloseTo(0, 5);
    expect(relativeLuminance("#FFFFFF")).toBeCloseTo(1, 5);
  });

  it("contrast is maximal between black and white", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 1);
    expect(contrastRatio("#123456", "#123456")).toBeCloseTo(1, 5);
  });

  it("contrast is symmetric", () => {
    expect(contrastRatio("#2B5C4F", "#FFFFFF")).toBeCloseTo(
      contrastRatio("#FFFFFF", "#2B5C4F"),
      6,
    );
  });
});

describe("readableForeground", () => {
  it("keeps white text on a dark brand colour", () => {
    // Kestrel green is dark enough for white text.
    expect(readableForeground(DEFAULT_BRAND_COLOR)).toBe(WHITE);
    expect(readableForeground("#000000")).toBe(WHITE);
  });

  it("falls back to ink on a light brand colour", () => {
    expect(readableForeground("#FFFF00")).toBe(INK); // yellow — poor contrast w/ white
    expect(readableForeground("#F6F3EE")).toBe(INK); // cream
    expect(readableForeground("#FFFFFF")).toBe(INK);
  });

  it("is resilient to invalid input (uses default brand colour)", () => {
    expect(readableForeground("not-a-colour")).toBe(WHITE);
  });
});

describe("darken", () => {
  it("produces a darker, valid hex", () => {
    const result = darken("#2B5C4F", 0.2);
    expect(isValidHex(result)).toBe(true);
    expect(relativeLuminance(result)).toBeLessThan(relativeLuminance("#2B5C4F"));
  });

  it("falls back safely for invalid input", () => {
    expect(isValidHex(darken("garbage"))).toBe(true);
  });
});

describe("generateSlug", () => {
  it("lowercases and hyphenates names", () => {
    expect(generateSlug("Northumbria Legal LLP")).toBe("northumbria-legal-llp");
    expect(generateSlug("  Acme  &  Co.  ")).toBe("acme-co");
    expect(generateSlug("Smith_&_Jones")).toBe("smith-jones");
  });

  it("strips accents and punctuation", () => {
    expect(generateSlug("Café Légal")).toBe("cafe-legal");
    expect(generateSlug("A.B.C!!!")).toBe("abc");
  });

  it("returns empty string for input with no usable characters", () => {
    expect(generateSlug("!!!")).toBe("");
    expect(generateSlug("   ")).toBe("");
  });

  it("output is always a valid slug when non-empty", () => {
    const slug = generateSlug("Hello, World 123");
    expect(slug).toBe("hello-world-123");
    expect(isValidSlug(slug)).toBe(true);
  });
});

describe("isValidSlug", () => {
  it("accepts well-formed slugs", () => {
    expect(isValidSlug("acme")).toBe(true);
    expect(isValidSlug("acme-legal-123")).toBe(true);
  });

  it("rejects malformed slugs", () => {
    expect(isValidSlug("a")).toBe(false); // too short
    expect(isValidSlug("-acme")).toBe(false); // leading hyphen
    expect(isValidSlug("acme-")).toBe(false); // trailing hyphen
    expect(isValidSlug("Acme")).toBe(false); // uppercase
    expect(isValidSlug("acme--legal")).toBe(false); // double hyphen
    expect(isValidSlug("acme legal")).toBe(false); // space
    expect(isValidSlug("a".repeat(64))).toBe(false); // too long
    expect(isValidSlug(null)).toBe(false);
    expect(isValidSlug(123)).toBe(false);
  });
});

describe("resolveBranding — fallback behaviour", () => {
  it("returns default Kestrel branding for null (unknown slug / RPC failure)", () => {
    const branding = resolveBranding(null);
    expect(branding).toEqual(DEFAULT_BRANDING);
    expect(branding.isBranded).toBe(false);
    expect(branding.displayName).toBe("Kestrel");
    expect(branding.brandColor).toBe(DEFAULT_BRAND_COLOR);
  });

  it("returns default branding for undefined / non-object", () => {
    expect(resolveBranding(undefined).isBranded).toBe(false);
    // @ts-expect-error — exercising defensive runtime guard
    expect(resolveBranding("nonsense").isBranded).toBe(false);
  });

  it("passes through a fully valid row", () => {
    const branding = resolveBranding({
      slug: "acme-legal",
      display_name: "Acme Legal",
      logo_url: "https://cdn.example.com/logo.png",
      brand_color: "#123456",
      brand_color_hover: "#0A1A2A",
      tagline: "Straight-talking advice",
    });
    expect(branding.isBranded).toBe(true);
    expect(branding.slug).toBe("acme-legal");
    expect(branding.displayName).toBe("Acme Legal");
    expect(branding.logoUrl).toBe("https://cdn.example.com/logo.png");
    expect(branding.brandColor).toBe("#123456");
    expect(branding.brandColorHover).toBe("#0A1A2A");
    expect(branding.tagline).toBe("Straight-talking advice");
  });

  it("falls back per-field for invalid colours while staying branded", () => {
    const branding = resolveBranding({
      slug: "acme",
      display_name: "Acme",
      brand_color: "not-a-hex",
      brand_color_hover: "also-bad",
    });
    expect(branding.isBranded).toBe(true);
    expect(branding.brandColor).toBe(DEFAULT_BRAND_COLOR);
    // Hover is synthesised (darker) from the resolved brand colour.
    expect(isValidHex(branding.brandColorHover)).toBe(true);
  });

  it("synthesises a hover colour when only the brand colour is given", () => {
    const branding = resolveBranding({
      slug: "acme",
      display_name: "Acme",
      brand_color: "#3366CC",
    });
    expect(isValidHex(branding.brandColorHover)).toBe(true);
    expect(relativeLuminance(branding.brandColorHover)).toBeLessThan(
      relativeLuminance("#3366CC"),
    );
  });

  it("rejects unsafe logo URLs (non-http protocols)", () => {
    const branding = resolveBranding({
      slug: "acme",
      display_name: "Acme",
      brand_color: "#123456",
      logo_url: "javascript:alert(1)",
    });
    expect(branding.logoUrl).toBeNull();
  });

  it("treats a row without a slug as unbranded", () => {
    const branding = resolveBranding({
      display_name: "No Slug Co",
      brand_color: "#123456",
    });
    expect(branding.isBranded).toBe(false);
    expect(branding.slug).toBeNull();
  });

  it("computes an accessible foreground for the resolved brand colour", () => {
    const dark = resolveBranding({
      slug: "a",
      display_name: "A",
      brand_color: "#0C1311",
    });
    expect(dark.accentForeground).toBe(WHITE);

    const light = resolveBranding({
      slug: "b",
      display_name: "B",
      brand_color: "#FFFF00",
    });
    expect(light.accentForeground).toBe(INK);
  });
});
