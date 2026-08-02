/**
 * Server-side brand-colour detection: pull the dominant saturated colour out
 * of an association's logo so their partner page loads already wearing their
 * colour. Near-white/near-black/transparent pixels are ignored, saturation is
 * used as the weight, and anything inconclusive falls back to brand navy.
 */

const FALLBACK = '1e3a5f';
const cache = new Map<string, Promise<string>>();

const BASE_URL = 'https://www.investigatorevents.com';

async function detect(logoPath: string): Promise<string> {
  try {
    const url = logoPath.startsWith('http') ? logoPath : `${BASE_URL}${logoPath}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return FALLBACK;
    const raw = Buffer.from(await res.arrayBuffer());

    const { default: sharp } = await import('sharp');
    const { data, info } = await sharp(raw)
      .resize(48, 48, { fit: 'inside' })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Coarse hue histogram (12 buckets), saturation-and-alpha weighted.
    const buckets = new Array(12).fill(0).map(() => ({ w: 0, r: 0, g: 0, b: 0 }));
    for (let i = 0; i < data.length; i += info.channels) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const a = info.channels === 4 ? data[i + 3] / 255 : 1;
      if (a < 0.5) continue;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      const lightness = (max + min) / 510;
      if (lightness > 0.92 || lightness < 0.08) continue; // whites/blacks
      const sat = max === 0 ? 0 : (max - min) / max;
      if (sat < 0.18) continue; // greys
      let hue = 0;
      const d = max - min;
      if (d > 0) {
        if (max === r) hue = ((g - b) / d + 6) % 6;
        else if (max === g) hue = (b - r) / d + 2;
        else hue = (r - g) / d + 4;
      }
      const bucket = buckets[Math.floor(hue) * 2 + (hue % 1 >= 0.5 ? 1 : 0)];
      const w = sat * a;
      bucket.w += w;
      bucket.r += r * w;
      bucket.g += g * w;
      bucket.b += b * w;
    }

    const best = buckets.reduce((a, b) => (b.w > a.w ? b : a));
    if (best.w < 4) return FALLBACK; // logo is basically monochrome

    const toHex = (v: number) => Math.round(v / best.w).toString(16).padStart(2, '0');
    let hex = `${toHex(best.r)}${toHex(best.g)}${toHex(best.b)}`;

    // Very light brand colours can't carry white nav text — darken.
    const [r, g, b] = [0, 2, 4].map((o) => parseInt(hex.slice(o, o + 2), 16));
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    if (luma > 190) {
      hex = [r, g, b].map((v) => Math.round(v * 0.65).toString(16).padStart(2, '0')).join('');
    }
    return hex;
  } catch {
    return FALLBACK;
  }
}

export function detectBrandColor(logoPath?: string): Promise<string> {
  if (!logoPath) return Promise.resolve(FALLBACK);
  let p = cache.get(logoPath);
  if (!p) {
    p = detect(logoPath);
    cache.set(logoPath, p);
  }
  return p;
}
