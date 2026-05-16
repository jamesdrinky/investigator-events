import { createHmac, timingSafeEqual } from 'node:crypto';
import { getEnvVar } from '@/lib/supabase/env';

type TokenPayload = {
  uid: string;
  email: string;
  exp: number;
};

function signPayload(payload: string) {
  return createHmac('sha256', getEnvVar('ADMIN_SESSION_SECRET')).update(payload).digest('base64url');
}

function safeCompare(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function createPublicEmailVerificationToken(userId: string, email: string) {
  const payload = Buffer.from(JSON.stringify({
    uid: userId,
    email: email.toLowerCase(),
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
  } satisfies TokenPayload)).toString('base64url');

  return `${payload}.${signPayload(payload)}`;
}

export function verifyPublicEmailVerificationToken(token: string): TokenPayload | null {
  const [payload, signature] = token.split('.');
  if (!payload || !signature || !safeCompare(signature, signPayload(payload))) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as TokenPayload;
    if (!parsed.uid || !parsed.email || !parsed.exp || parsed.exp < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}
