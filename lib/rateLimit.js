import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let ratelimit = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    }),
    limiter: Ratelimit.slidingWindow(5, "15 m"),
    analytics: false,
    prefix: "kdf",
  });
}

// In-memory fallback for local/dev/small-scale deployments without Redis.
// Not shared across serverless instances — good enough as a floor, not a
// substitute for Upstash in production.
const memoryBuckets = new Map();

function memoryLimit(key, max = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const bucket = memoryBuckets.get(key) || [];
  const recent = bucket.filter((t) => now - t < windowMs);
  recent.push(now);
  memoryBuckets.set(key, recent);
  return { success: recent.length <= max };
}

export async function checkRateLimit(identifier) {
  if (ratelimit) {
    const { success } = await ratelimit.limit(identifier);
    return success;
  }
  const { success } = memoryLimit(identifier);
  return success;
}

export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}
