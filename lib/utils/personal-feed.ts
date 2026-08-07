// Tokenized personal calendar feeds. Calendar apps can't authenticate, so the
// feed URL itself carries a signed token: userId + a truncated HMAC. Knowing a
// user's UUID alone is not enough to fetch their feed.
import { createHmac } from 'node:crypto';

function secret(): string {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value) throw new Error('ADMIN_SESSION_SECRET not configured');
  return `personal-feed:${value}`;
}

function sign(userId: string): string {
  return createHmac('sha256', secret()).update(userId).digest('hex').slice(0, 20);
}

export function makeFeedToken(userId: string): string {
  return `${userId}.${sign(userId)}`;
}

/** Returns the userId if the token is valid, else null. */
export function verifyFeedToken(token: string): string | null {
  const dot = token.lastIndexOf('.');
  if (dot === -1) return null;
  const userId = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  if (!/^[0-9a-f-]{36}$/.test(userId) || !/^[0-9a-f]{20}$/.test(mac)) return null;
  return mac === sign(userId) ? userId : null;
}
