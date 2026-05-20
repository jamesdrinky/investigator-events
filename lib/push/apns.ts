import { createPrivateKey, createSign, KeyObject } from 'node:crypto';

// APNs JWT-based HTTP/2 sender. Self-contained — no external library.
// Caches the JWT for 50 minutes (Apple allows up to 60).
// Works on Vercel serverless (each invocation opens a fresh HTTP connection).

const APNS_HOST = process.env.APNS_HOST ?? 'api.push.apple.com';
const JWT_TTL_MS = 50 * 60 * 1000;

interface CachedJwt {
  token: string;
  expiresAt: number;
}

let cached: CachedJwt | null = null;
let cachedKey: KeyObject | null = null;

function getPrivateKey(): KeyObject {
  if (cachedKey) return cachedKey;
  const raw = process.env.APNS_PRIVATE_KEY;
  if (!raw) throw new Error('APNS_PRIVATE_KEY env var is not set');
  // Vercel env vars often escape newlines as literal "\n" — normalise.
  const pem = raw.includes('\\n') ? raw.replace(/\\n/g, '\n') : raw;
  cachedKey = createPrivateKey({ key: pem, format: 'pem' });
  return cachedKey;
}

function base64url(input: string | Buffer): string {
  return Buffer.from(input).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function signJwt(): string {
  const keyId = process.env.APNS_KEY_ID;
  const teamId = process.env.APNS_TEAM_ID;
  if (!keyId || !teamId) throw new Error('APNS_KEY_ID and APNS_TEAM_ID must be set');

  const header = { alg: 'ES256', kid: keyId, typ: 'JWT' };
  const payload = { iss: teamId, iat: Math.floor(Date.now() / 1000) };

  const headerEnc = base64url(JSON.stringify(header));
  const payloadEnc = base64url(JSON.stringify(payload));
  const data = `${headerEnc}.${payloadEnc}`;

  const signer = createSign('SHA256');
  signer.update(data);
  signer.end();
  // APNs requires P1363 (raw r||s) signature format, not DER.
  const signature = signer.sign({ key: getPrivateKey(), dsaEncoding: 'ieee-p1363' });
  const signatureEnc = signature.toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');

  return `${data}.${signatureEnc}`;
}

function getJwt(): string {
  if (cached && cached.expiresAt > Date.now()) return cached.token;
  const token = signJwt();
  cached = { token, expiresAt: Date.now() + JWT_TTL_MS };
  return token;
}

export interface ApnsAlert {
  title: string;
  body: string;
  url?: string;
  badge?: number;
  sound?: string;
}

export interface ApnsResult {
  token: string;
  ok: boolean;
  status?: number;
  reason?: string;
  /** True when Apple says this token is permanently invalid and should be deleted. */
  invalid?: boolean;
}

/**
 * Send a push notification to a single iOS device token via APNs.
 * Returns a result describing whether it succeeded — never throws.
 */
export async function sendApnsPush(token: string, alert: ApnsAlert): Promise<ApnsResult> {
  try {
    const bundleId = process.env.APNS_BUNDLE_ID;
    if (!bundleId) return { token, ok: false, reason: 'APNS_BUNDLE_ID not set' };

    const jwt = getJwt();

    const payload: Record<string, unknown> = {
      aps: {
        alert: { title: alert.title, body: alert.body },
        sound: alert.sound ?? 'default',
        ...(typeof alert.badge === 'number' ? { badge: alert.badge } : {}),
      },
      ...(alert.url ? { url: alert.url } : {}),
    };

    const res = await fetch(`https://${APNS_HOST}/3/device/${token}`, {
      method: 'POST',
      headers: {
        authorization: `bearer ${jwt}`,
        'apns-topic': bundleId,
        'apns-push-type': 'alert',
        'apns-priority': '10',
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 200) return { token, ok: true, status: 200 };

    // Apple returns a JSON body with { reason } for failures.
    let reason: string | undefined;
    try {
      const body = await res.json();
      reason = body?.reason;
    } catch {}

    const invalid = res.status === 410 || reason === 'BadDeviceToken' || reason === 'Unregistered';
    return { token, ok: false, status: res.status, reason, invalid };
  } catch (err) {
    return { token, ok: false, reason: (err as Error).message };
  }
}
