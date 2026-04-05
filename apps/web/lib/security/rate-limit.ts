import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

/**
 * Rate limiter backed by Upstash Redis.
 * Falls through gracefully if UPSTASH_REDIS_REST_URL is not configured
 * (e.g. in local development).
 */

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  return redis;
}

/** 10 requests per minute — for public creation endpoints */
export const publicRateLimit = () => {
  const r = getRedis();
  if (!r) return null;
  return new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    prefix: "rl:public",
  });
};

/** 5 requests per minute — for email verification */
export const verifyRateLimit = () => {
  const r = getRedis();
  if (!r) return null;
  return new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
    prefix: "rl:verify",
  });
};

/** 5 requests per minute — for authenticated Stripe endpoints */
export const stripeRateLimit = () => {
  const r = getRedis();
  if (!r) return null;
  return new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
    prefix: "rl:stripe",
  });
};

/**
 * Extract the client IP from request headers.
 * Vercel sets x-forwarded-for; fallback to a generic key.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Apply rate limiting. Returns a 429 response if the limit is exceeded,
 * or null if the request is allowed (or if rate limiting is not configured).
 */
export async function applyRateLimit(
  request: Request,
  limiter: Ratelimit | null,
  identifier?: string,
): Promise<NextResponse | null> {
  if (!limiter) return null;

  const key = identifier ?? getClientIp(request);
  const { success, limit, remaining, reset } = await limiter.limit(key);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": String(reset),
          "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
        },
      },
    );
  }

  return null;
}
