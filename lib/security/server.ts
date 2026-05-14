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
  const userAgent = headerStore.get('user-agent') ?? '';

  // iOS Capacitor's WKWebView often omits the Origin header on same-origin
  // POSTs (browser-spec optional). Detect via UA so the native app isn't
  // locked out of endpoints like /api/delete-account. The endpoint's own
  // auth check is the real protection; this header check is defense-in-depth.
  const isNativeApp = /CapacitorWebView|InvestigatorEvents|Capacitor/i.test(userAgent);

  if (!origin) {
    if (isNativeApp) return;
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

/**
 * Validate file content matches an allowed image type by checking magic bytes.
 * Prevents MIME type spoofing where client sends a non-image with a fake content type.
 */
/**
 * Verify a request has a valid CRON_SECRET bearer token.
 * Returns a 401 Response if invalid, or null if authorized.
 */
export function verifyCronSecret(request: Request): Response | null {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}

export function validateImageMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return true;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return true;

  // WebP: RIFF....WEBP
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) return true;

  // AVIF: ....ftypavif or ....ftypavis
  if (buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70) {
    const brand = buffer.toString('ascii', 8, 12);
    if (brand === 'avif' || brand === 'avis') return true;
  }

  return false;
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
