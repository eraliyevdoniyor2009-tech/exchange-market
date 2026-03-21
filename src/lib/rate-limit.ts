// src/lib/rate-limit.ts
/**
 * Simple in-memory sliding-window rate limiter.
 * For multi-instance deployments, swap the Map for Redis.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Prune stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
  const now = Date.now();

  Array.from(store.entries()).forEach(([key, entry]) => {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  });

}, 5 * 60 * 1000); 
}

export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  max: number;
  /** Window length in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
  retryAfterMs: number;
}

export function rateLimit(
  identifier: string,
  config: RateLimitConfig = { max: 60, windowMs: 60_000 }
): RateLimitResult {
  const now  = Date.now();
  const key  = identifier;
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    // New window
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return {
      success: true,
      remaining: config.max - 1,
      resetAt: now + config.windowMs,
      retryAfterMs: 0,
    };
  }

  if (entry.count >= config.max) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfterMs: entry.resetAt - now,
    };
  }

  entry.count++;
  return {
    success: true,
    remaining: config.max - entry.count,
    resetAt: entry.resetAt,
    retryAfterMs: 0,
  };
}

/**
 * Returns rate-limit headers to include in API responses.
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
    ...(result.retryAfterMs > 0
      ? { "Retry-After": String(Math.ceil(result.retryAfterMs / 1000)) }
      : {}),
  };
}
