/**
 * Cookie consent management.
 *
 * Stores user choice in a first-party cookie (`kestrel_consent`).
 * Values: "granted" | "denied" | undefined (not yet chosen).
 *
 * GA4 and Vercel Analytics must not load until consent is "granted".
 */

const COOKIE_NAME = "kestrel_consent";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export type ConsentValue = "granted" | "denied";

export function getConsent(): ConsentValue | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  const value = match.split("=")[1];
  return value === "granted" || value === "denied" ? value : null;
}

export function setConsent(value: ConsentValue): void {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax; Secure`;
}

/** Update GA4 consent mode (if gtag is loaded). */
export function updateGtagConsent(value: ConsentValue): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as {
    gtag?: (...args: unknown[]) => void;
  };
  w.gtag?.("consent", "update", {
    analytics_storage: value,
  });
}
