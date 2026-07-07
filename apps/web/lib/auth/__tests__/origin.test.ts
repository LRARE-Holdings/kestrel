import { describe, it, expect } from "vitest";
import { resolveOrigin } from "@/lib/auth/origin";

describe("resolveOrigin", () => {
  it("prefers x-forwarded-host with x-forwarded-proto", () => {
    expect(
      resolveOrigin({
        forwardedHost: "app.example.com",
        forwardedProto: "https",
        siteUrl: "https://stale.example.org",
      }),
    ).toBe("https://app.example.com");
  });

  it("defaults the protocol to https when only forwarded host is present", () => {
    expect(resolveOrigin({ forwardedHost: "app.example.com" })).toBe(
      "https://app.example.com",
    );
  });

  it("respects a non-https forwarded protocol (local dev)", () => {
    expect(
      resolveOrigin({
        forwardedHost: "localhost:3000",
        forwardedProto: "http",
      }),
    ).toBe("http://localhost:3000");
  });

  it("takes only the first value from comma-separated forwarded headers", () => {
    expect(
      resolveOrigin({
        forwardedHost: "app.example.com, internal.proxy",
        forwardedProto: "https, http",
      }),
    ).toBe("https://app.example.com");
  });

  it("falls back to the Origin header when no forwarded host is present", () => {
    expect(
      resolveOrigin({ origin: "https://origin.example.com" }),
    ).toBe("https://origin.example.com");
  });

  it("falls back to the Host header when no origin is present", () => {
    expect(
      resolveOrigin({ host: "host.example.com", forwardedProto: "https" }),
    ).toBe("https://host.example.com");
  });

  it("falls back to NEXT_PUBLIC_SITE_URL when there are no request headers", () => {
    expect(resolveOrigin({ siteUrl: "https://configured.example.com" })).toBe(
      "https://configured.example.com",
    );
  });

  it("normalises a SITE_URL that omits the protocol", () => {
    expect(resolveOrigin({ siteUrl: "configured.example.com" })).toBe(
      "https://configured.example.com",
    );
  });

  it("falls back to the shared KESTREL_DOMAIN when nothing else resolves", () => {
    expect(resolveOrigin({})).toBe("https://onkestrel.com");
  });

  it("ignores a malformed SITE_URL and uses the domain constant", () => {
    expect(resolveOrigin({ siteUrl: "http://" })).toBe("https://onkestrel.com");
  });
});
