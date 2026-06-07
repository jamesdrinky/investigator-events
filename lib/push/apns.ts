import { createPrivateKey, createSign, KeyObject } from 'node:crypto';
import http2 from 'node:http2';

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

    // Use Node's http2 module directly — Vercel's fetch (undici) doesn't reliably
    // handle HTTP/2 outbound to APNs, every request dies at the TLS layer.
    const body = JSON.stringify(payload);
    const result = await sendViaHttp2(token, jwt, bundleId, body);

    if (result.status === 200) return { token, ok: true, status: 200 };

    const invalid =
      result.status === 410 ||
      result.reason === 'BadDeviceToken' ||
      result.reason === 'Unregistered';

    console.error(
      `[apns] HTTP ${result.status ?? 'n/a'} from APNs | reason=${result.reason ?? 'n/a'} | body=${(result.rawBody ?? '').slice(0, 200)} | host=${APNS_HOST} | bundle=${bundleId} | tokenLen=${token.length} | apns-id=${result.apnsId ?? 'n/a'}`,
    );

    return { token, ok: false, status: result.status, reason: result.reason, invalid };
  } catch (err) {
    const msg = (err as Error)?.message ?? String(err);
    console.error('[apns] outer catch:', msg);
    return { token, ok: false, reason: `outer: ${msg}` };
  }
}

/**
 * Update just the app-icon badge, silently — no alert, no sound. iOS sets the
 * badge to `badge` (0 clears the red dot) without showing a banner. Used when a
 * user reads their notifications/messages and the dot should drop.
 */
export async function sendApnsBadge(token: string, badge: number): Promise<ApnsResult> {
  try {
    const bundleId = process.env.APNS_BUNDLE_ID;
    if (!bundleId) return { token, ok: false, reason: 'APNS_BUNDLE_ID not set' };

    const jwt = getJwt();
    const body = JSON.stringify({ aps: { badge } });
    const result = await sendViaHttp2(token, jwt, bundleId, body);

    if (result.status === 200) return { token, ok: true, status: 200 };

    const invalid =
      result.status === 410 ||
      result.reason === 'BadDeviceToken' ||
      result.reason === 'Unregistered';

    return { token, ok: false, status: result.status, reason: result.reason, invalid };
  } catch (err) {
    return { token, ok: false, reason: `outer: ${(err as Error)?.message ?? String(err)}` };
  }
}

interface Http2Result {
  status?: number;
  reason?: string;
  rawBody?: string;
  apnsId?: string;
}

function sendViaHttp2(token: string, jwt: string, bundleId: string, body: string): Promise<Http2Result> {
  return new Promise((resolve) => {
    const session = http2.connect(`https://${APNS_HOST}`);
    let resolved = false;
    const done = (r: Http2Result) => {
      if (resolved) return;
      resolved = true;
      try { session.close(); } catch {}
      resolve(r);
    };

    session.on('error', (err) => {
      console.error('[apns] http2 session error:', (err as Error).message);
      done({ reason: `session: ${(err as Error).message}` });
    });

    // Hard timeout: APNs is fast (<1s typical). If we hit 8s, something is wrong.
    const timer = setTimeout(() => {
      console.error('[apns] http2 request timed out after 8s');
      done({ reason: 'timeout' });
    }, 8000);

    const req = session.request({
      ':method': 'POST',
      ':path': `/3/device/${token}`,
      'authorization': `bearer ${jwt}`,
      'apns-topic': bundleId,
      'apns-push-type': 'alert',
      'apns-priority': '10',
      'content-type': 'application/json',
      'content-length': Buffer.byteLength(body),
    });

    let status: number | undefined;
    let apnsId: string | undefined;
    let rawBody = '';

    req.on('response', (headers) => {
      status = headers[':status'] as number | undefined;
      apnsId = headers['apns-id'] as string | undefined;
    });
    req.on('data', (chunk) => {
      rawBody += chunk.toString('utf8');
    });
    req.on('end', () => {
      clearTimeout(timer);
      let reason: string | undefined;
      if (rawBody) {
        try { reason = (JSON.parse(rawBody) as { reason?: string }).reason; } catch {}
      }
      done({ status, reason, rawBody, apnsId });
    });
    req.on('error', (err) => {
      clearTimeout(timer);
      console.error('[apns] http2 request error:', (err as Error).message);
      done({ reason: `request: ${(err as Error).message}` });
    });

    req.write(body);
    req.end();
  });
}
