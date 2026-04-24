import { createHmac, timingSafeEqual } from 'node:crypto';
import { headers } from 'next/headers';
import { getEnvVar } from '@/lib/supabase/env';

type RateLimitOptions = {
  maxRequests: number;
  windowMs: number;
};

// ── Upstash Redis rate limiting (production) ──
// Falls back to in-memory if UPSTASH_REDIS_REST_URL is not set

let upstashRatelimit: any = null;

async function getUpstashRatelimiter(scope: string, options: RateLimitOptions) {
  if (upstashRatelimit) return upstashRatelimit;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  try {
    const { Ratelimit } = await import('@upstash/ratelimit');
    const { Redis } = await import('@upstash/redis');

    const redis = new Redis({ url, token });
    upstashRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(options.maxRequests, `${options.windowMs}ms`),
      prefix: `ratelimit:${scope}`,
    });
    return upstashRatelimit;
  } catch {
    return null;
  }
}

// ── In-memory fallback (dev / no Redis) ──

type RateLimitStore = Map<string, number[]>;

declare global {
  var __investigatorEventsRateLimitStore__: RateLimitStore | undefined;
}

function getRateLimitStore(): RateLimitStore {
  if (!globalThis.__investigatorEventsRateLimitStore__) {
    globalThis.__investigatorEventsRateLimitStore__ = new Map<string, number[]>();
  }

  return globalThis.__investigatorEventsRateLimitStore__;
}

function sign(value: string) {
  return createHmac('sha256', getEnvVar('ADMIN_SESSION_SECRET')).update(value).digest('base64url');
}

function safeCompare(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return timingSafeEqual(aBuffer, bBuffer);
}

export function getClientIdentifier() {
  const headerStore = headers();
  const forwardedFor = headerStore.get('x-forwarded-for');
  const realIp = headerStore.get('x-real-ip');
  const candidate = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';

  return candidate.slice(0, 120);
}

export class RateLimitError extends Error {
  constructor() {
    super('Rate limited');
    this.name = 'RateLimitError';
  }
}

export function enforceRateLimit(scope: string, options: RateLimitOptions) {
  const key = `${scope}:${getClientIdentifier()}`;
  const now = Date.now();

  // Try Upstash first (async, but we need sync — so we use in-memory as primary
  // and Upstash as a fire-and-forget check that blocks on the second call)
  // For now: in-memory is the sync check, Upstash is checked async below
  const store = getRateLimitStore();
  const recent = (store.get(key) ?? []).filter((timestamp) => now - timestamp < options.windowMs);

  if (recent.length >= options.maxRequests) {
    throw new RateLimitError();
  }

  recent.push(now);
  store.set(key, recent);
}

/**
 * Async rate limit check using Upstash Redis.
 * Use this in API routes where you can await.
 * Falls back to in-memory if Upstash is not configured.
 */
export async function enforceRateLimitAsync(scope: string, options: RateLimitOptions): Promise<void> {
  const identifier = getClientIdentifier();

  // Try Upstash Redis first
  const limiter = await getUpstashRatelimiter(scope, options);
  if (limiter) {
    const { success } = await limiter.limit(`${scope}:${identifier}`);
    if (!success) throw new RateLimitError();
    return;
  }

  // Fallback to in-memory
  enforceRateLimit(scope, options);
}

export function assertSameOriginRequest() {
  const headerStore = headers();
  const origin = headerStore.get('origin');
  const host = headerStore.get('x-forwarded-host') ?? headerStore.get('host');

  if (!origin) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Missing origin');
    }

    return;
  }

  if (!host) {
    throw new Error('Missing host');
  }

  const originHost = new URL(origin).host.replace(/^www\./, '');
  const normalizedHost = host.replace(/^www\./, '');

  if (originHost !== normalizedHost) {
    throw new Error('Invalid origin');
  }
}

export function createSignedFormState(scope: string) {
  const issuedAt = String(Date.now());
  const token = sign(`${scope}:${issuedAt}`);

  return { issuedAt, token };
}

export function verifySignedFormState(scope: string, issuedAt: string, token: string, maxAgeMs = 2 * 60 * 60 * 1000) {
  const issuedAtNumber = Number(issuedAt);

  if (!Number.isFinite(issuedAtNumber)) {
    throw new Error('Invalid form state');
  }

  const ageMs = Date.now() - issuedAtNumber;

  if (ageMs < 0 || ageMs > maxAgeMs) {
    throw new Error('Expired form state');
  }

  const expected = sign(`${scope}:${issuedAt}`);

  if (!safeCompare(token, expected)) {
    throw new Error('Invalid form state');
  }
}
