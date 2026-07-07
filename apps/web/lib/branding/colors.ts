/**
 * Colour helpers for firm-branded login pages.
 *
 * Every value that is ever injected into a `style` attribute MUST pass
 * {@link isValidHex} first — we never inject arbitrary strings into the DOM.
 * All functions here are pure and dependency-free so they can be unit-tested
 * and used on both the server and the client.
 */

/** A 6-digit hex colour, e.g. `#2B5C4F`. Case-insensitive. */
export const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

/** Kestrel's default brand colours (used whenever a firm value is missing/invalid). */
export const DEFAULT_BRAND_COLOR = "#2B5C4F";
export const DEFAULT_BRAND_COLOR_HOVER = "#234A40";

/** Ink — the fallback foreground when a brand colour is too light for white text. */
export const INK = "#0C1311";
export const WHITE = "#FFFFFF";

/** Narrow an unknown value to a valid 6-digit hex string. */
export function isValidHex(value: unknown): value is string {
  return typeof value === "string" && HEX_COLOR_REGEX.test(value);
}

/**
 * Return the hex if valid, otherwise the supplied fallback. Guarantees the
 * result is always safe to place in an inline style.
 */
export function safeHex(value: unknown, fallback: string): string {
  return isValidHex(value) ? (value as string) : fallback;
}

/** Parse a validated hex colour into 0–255 RGB channels. */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const value = hex.replace("#", "");
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

/** Relative luminance per WCAG 2.1 (0 = black, 1 = white). */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const channel = (c: number): number => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio between two validated hex colours (1–21). */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Choose an accessible foreground for text/icons sitting ON a brand colour
 * (e.g. a solid primary button). White is kept only when it clears the WCAG AA
 * threshold for normal text (4.5:1); otherwise we fall back to ink.
 */
export function readableForeground(brandHex: string): string {
  const brand = safeHex(brandHex, DEFAULT_BRAND_COLOR);
  return contrastRatio(brand, WHITE) >= 4.5 ? WHITE : INK;
}

/**
 * Darken a validated hex colour by a fraction (0–1). Used to synthesise a
 * hover colour when a firm has not supplied one.
 */
export function darken(hex: string, amount = 0.12): string {
  const safe = safeHex(hex, DEFAULT_BRAND_COLOR);
  const { r, g, b } = hexToRgb(safe);
  const scale = Math.max(0, Math.min(1, 1 - amount));
  const to2 = (n: number): string =>
    Math.round(n * scale)
      .toString(16)
      .padStart(2, "0");
  return `#${to2(r)}${to2(g)}${to2(b)}`;
}
