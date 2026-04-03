/**
 * SHA-256 content hashing for dispute submissions.
 * Uses the Web Crypto API (available in Node.js 18+ and all modern browsers).
 * Produces a deterministic hex digest for content integrity verification.
 */
export async function hashContent(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
