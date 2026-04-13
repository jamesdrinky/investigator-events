import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { getEnvVar } from '@/lib/supabase/env';

export const ADMIN_SESSION_COOKIE = 'investigator_events_admin_session';
const ADMIN_SESSION_DURATION_SECONDS = 60 * 60 * 8;

type AdminSessionPayload = {
  exp: number;
};

function sign(value: string, secret: string): string {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

function safeCompare(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return timingSafeEqual(aBuffer, bBuffer);
}

export function createAdminSessionToken(): string {
  const secret = getEnvVar('ADMIN_SESSION_SECRET');
  const payload: AdminSessionPayload = {
    exp: Date.now() + ADMIN_SESSION_DURATION_SECONDS * 1000
  };

  const payloadEncoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = sign(payloadEncoded, secret);

  return `${payloadEncoded}.${signature}`;
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
  const secret = process.env.ADMIN_SESSION_SECRET ?? '';

  if (!token || !secret) {
    return false;
  }

  const [payloadEncoded, signature] = token.split('.');

  if (!payloadEncoded || !signature) {
    return false;
  }

  const expectedSignature = sign(payloadEncoded, secret);

  if (!safeCompare(signature, expectedSignature)) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadEncoded, 'base64url').toString('utf8')) as AdminSessionPayload;
    return typeof payload.exp === 'number' && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export function setAdminSessionCookie(token: string) {
  const cookieStore = cookies() as any;
  const store = typeof cookieStore.then === 'function' ? null : cookieStore;
  if (store) {
    store.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: ADMIN_SESSION_DURATION_SECONDS,
      priority: 'high'
    });
  }
}

export function clearAdminSessionCookie() {
  const cookieStore = cookies() as any;
  const store = typeof cookieStore.then === 'function' ? null : cookieStore;
  if (store) {
    store.set(ADMIN_SESSION_COOKIE, '', {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      priority: 'high',
      expires: new Date(0)
    });
  }
}

export function hasValidAdminSessionCookie(): boolean {
  const cookieStore = cookies() as any;
  const store = typeof cookieStore.then === 'function' ? null : cookieStore;
  if (!store) return false;
  const token = store.get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}
