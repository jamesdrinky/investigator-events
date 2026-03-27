import { createHmac, timingSafeEqual } from 'node:crypto';
import { headers } from 'next/headers';
import { getEnvVar } from '@/lib/supabase/env';

type RateLimitOptions = {
  maxRequests: number;
  windowMs: number;
};

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

export function enforceRateLimit(scope: string, options: RateLimitOptions) {
  const key = `${scope}:${getClientIdentifier()}`;
  const now = Date.now();
  const store = getRateLimitStore();
  const recent = (store.get(key) ?? []).filter((timestamp) => now - timestamp < options.windowMs);

  if (recent.length >= options.maxRequests) {
    throw new Error('Rate limited');
  }

  recent.push(now);
  store.set(key, recent);
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

  const originHost = new URL(origin).host;

  if (originHost !== host) {
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
