import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Skip TS + ESLint during build — run separately with `npm run typecheck` and `npm run lint`.
  // This halves peak RAM since it avoids running tsc + compilation in parallel.
  typescript: { ignoreBuildErrors: true },
  transpilePackages: ["@kestrel/shared"],
  turbopack: {
    // Point to monorepo root so Turbopack can resolve packages/shared
    root: path.resolve(__dirname, "../.."),
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
