import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { validateOrigin } from "@/lib/security/csrf";

function makeRequest(headers: Record<string, string>): Request {
  return new Request("https://app.example.com/api/handshake", {
    method: "POST",
    headers,
  });
}

describe("validateOrigin", () => {
  beforeEach(() => {
    // Exercise the production path — the dev bypass would allow everything.
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("allows a same-origin request matching the Host header", () => {
    const result = validateOrigin(
      makeRequest({
        origin: "https://app.example.com",
        host: "app.example.com",
      }),
    );
    expect(result).toBeNull();
  });

  it("allows a same-origin request matching x-forwarded-host", () => {
    const result = validateOrigin(
      makeRequest({
        origin: "https://app.example.com",
        "x-forwarded-host": "app.example.com",
        host: "internal-loadbalancer",
      }),
    );
    expect(result).toBeNull();
  });

  it("allows same-origin even when NEXT_PUBLIC_SITE_URL is stale", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://old-domain.example.org");
    const result = validateOrigin(
      makeRequest({
        origin: "https://app.example.com",
        host: "app.example.com",
      }),
    );
    expect(result).toBeNull();
  });

  it("allows a request whose Origin matches the configured SITE_URL", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://app.example.com");
    const result = validateOrigin(
      makeRequest({
        origin: "https://app.example.com",
        host: "some-internal-host",
      }),
    );
    expect(result).toBeNull();
  });

  it("rejects a genuine cross-origin request", async () => {
    const result = validateOrigin(
      makeRequest({
        origin: "https://evil.example.net",
        host: "app.example.com",
      }),
    );
    expect(result).not.toBeNull();
    expect(result?.status).toBe(403);
    await expect(result?.json()).resolves.toEqual({ error: "Forbidden" });
  });

  it("rejects a malformed Origin header", () => {
    const result = validateOrigin(
      makeRequest({ origin: "not a url", host: "app.example.com" }),
    );
    expect(result?.status).toBe(403);
  });

  it("allows requests with no Origin header (server-to-server)", () => {
    const result = validateOrigin(makeRequest({ host: "app.example.com" }));
    expect(result).toBeNull();
  });

  it("allows everything in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    const result = validateOrigin(
      makeRequest({
        origin: "https://evil.example.net",
        host: "app.example.com",
      }),
    );
    expect(result).toBeNull();
  });
});
