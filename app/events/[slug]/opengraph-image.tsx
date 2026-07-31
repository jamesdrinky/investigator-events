import { ImageResponse } from 'next/og';
import { fetchEventBySlug } from '@/lib/data/events';
import { formatEventDate } from '@/lib/utils/date';
import { getCountryFlag } from '@/lib/utils/location';

export const runtime = 'nodejs';
export const alt = 'Event preview';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const NAVY = 'rgba(5, 11, 27,';

// Assets are fetched from the site's own CDN rather than read from disk:
// fs paths that work in dev silently aren't traced into the serverless
// bundle on Vercel (this exact route 500'd in production because of it).
const ASSET_BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.investigatorevents.com';

async function fetchAsset(pathname: string): Promise<Buffer> {
  const res = await fetch(`${ASSET_BASE}${pathname}`, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`asset ${pathname}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

// Fonts + logo never change within a deployment — cache per instance.
let staticAssets: Promise<[Buffer, Buffer, Buffer]> | null = null;
function loadStaticAssets() {
  staticAssets ??= Promise.all([
    fetchAsset('/og-assets/plus-jakarta-sans-v12-latin-600.ttf'),
    fetchAsset('/og-assets/plus-jakarta-sans-v12-latin-800.ttf'),
    fetchAsset('/icon.png'),
  ]).catch((err) => {
    staticAssets = null; // don't cache a transient failure
    throw err;
  });
  return staticAssets;
}

/** Resolve the event's photo to something satori can render. Many of the
 *  repo's "jpg"s are actually AVIF/WebP (satori chokes on AVIF), and remote
 *  images can be anything — so every backdrop is normalized through sharp
 *  into a cover-cropped 1200x630 JPEG. Failures fall back to the gradient. */
async function resolveBackdrop(imagePath?: string, coverImage?: string): Promise<string | null> {
  const candidate =
    (imagePath && /^(\/(cities|events|images)\/|https?:\/\/)/.test(imagePath) ? imagePath : coverImage) ?? null;
  if (!candidate) return null;
  try {
    const raw = candidate.startsWith('http')
      ? await (async () => {
          const res = await fetch(candidate, { signal: AbortSignal.timeout(8000) });
          if (!res.ok) throw new Error(`backdrop ${res.status}`);
          return Buffer.from(await res.arrayBuffer());
        })()
      : await fetchAsset(candidate);
    const { default: sharp } = await import('sharp');
    const jpeg = await sharp(raw).resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 72 }).toBuffer();
    return `data:image/jpeg;base64,${jpeg.toString('base64')}`;
  } catch {
    return null;
  }
}

export default async function OGImage({ params }: { params: { slug: string } }) {
  const [event, [semiBold, extraBold, logoData]] = await Promise.all([
    fetchEventBySlug(params.slug),
    loadStaticAssets(),
  ]);

  const fonts = [
    { name: 'Jakarta', data: semiBold, weight: 600 as const, style: 'normal' as const },
    { name: 'Jakarta', data: extraBold, weight: 800 as const, style: 'normal' as const },
  ];
  const logoSrc = `data:image/png;base64,${logoData.toString('base64')}`;

  if (!event) {
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 28,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(145deg, #06091a 0%, #0d1840 55%, #1a1040 100%)',
            fontFamily: 'Jakarta',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} alt="" width={96} height={96} style={{ width: 96, height: 96, borderRadius: 999 }} />
          <div style={{ display: 'flex', color: 'white', fontSize: 52, fontWeight: 800 }}>Investigator Events</div>
          <div style={{ display: 'flex', color: '#8fa3c4', fontSize: 26, fontWeight: 600 }}>
            The global calendar for the investigations profession
          </div>
        </div>
      ),
      { ...size, fonts }
    );
  }

  const flag = getCountryFlag(event.country);
  const dateStr = event.date ? formatEventDate(event) : '';
  const locationStr = [event.city, event.country].filter(Boolean).join(', ');
  const category = (event.category ?? 'Event').toUpperCase();
  const backdrop = await resolveBackdrop(event.image_path, event.coverImage);
  const titleSize = event.title.length <= 32 ? 74 : event.title.length <= 52 ? 62 : event.title.length <= 76 ? 52 : 44;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#050b1b',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'Jakarta',
        }}
      >
        {backdrop ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={backdrop}
            alt=""
            width={1200}
            height={630}
            style={{ position: 'absolute', top: 0, left: 0, width: 1200, height: 630, objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 1200,
              height: 630,
              display: 'flex',
              background: 'linear-gradient(145deg, #06091a 0%, #0d1840 55%, #1a1040 100%)',
            }}
          />
        )}

        {/* Legibility scrims — heavy from the left, lift along the base */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: 'flex',
            background: `linear-gradient(100deg, ${NAVY}0.97) 0%, ${NAVY}0.88) 42%, ${NAVY}0.45) 76%, ${NAVY}0.32) 100%)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: 'flex',
            background: `linear-gradient(0deg, ${NAVY}0.88) 0%, ${NAVY}0) 40%)`,
          }}
        />

        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            height: '100%',
            padding: '52px 64px 44px',
          }}
        >
          {/* Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 11,
                padding: '10px 22px',
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.22)',
                backgroundColor: 'rgba(255,255,255,0.09)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: 'linear-gradient(90deg, #38bdf8, #a855f7)',
                }}
              />
              <div style={{ display: 'flex', fontSize: 17, fontWeight: 600, letterSpacing: 3, color: '#dbeafe' }}>
                INVESTIGATOR EVENTS
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                padding: '10px 20px',
                borderRadius: 999,
                backgroundColor: 'rgba(59,130,246,0.28)',
              }}
            >
              <div style={{ display: 'flex', fontSize: 17, fontWeight: 600, letterSpacing: 2.5, color: '#bfdbfe' }}>
                {category}
              </div>
            </div>
          </div>

          {/* Title + meta */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 26, maxWidth: 1000 }}>
            <div
              style={{
                display: 'flex',
                width: 84,
                height: 7,
                borderRadius: 999,
                background: 'linear-gradient(90deg, #3b82f6, #a855f7, #ec4899)',
              }}
            />
            <div
              style={{
                display: 'flex',
                fontSize: titleSize,
                fontWeight: 800,
                lineHeight: 1.07,
                letterSpacing: -1,
                color: '#ffffff',
                maxHeight: titleSize * 2.35,
                overflow: 'hidden',
              }}
            >
              {event.title}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              {dateStr && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '13px 22px',
                    borderRadius: 16,
                    border: '1px solid rgba(255,255,255,0.16)',
                    backgroundColor: 'rgba(8,15,32,0.55)',
                  }}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="5" width="18" height="16" rx="3" stroke="#7fa8ff" strokeWidth="2" />
                    <path d="M3 10h18M8 3v4M16 3v4" stroke="#7fa8ff" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <div style={{ display: 'flex', fontSize: 24, fontWeight: 600, color: '#e2e8f0' }}>{dateStr}</div>
                </div>
              )}
              {locationStr && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '13px 22px',
                    borderRadius: 16,
                    border: '1px solid rgba(255,255,255,0.16)',
                    backgroundColor: 'rgba(8,15,32,0.55)',
                  }}
                >
                  {flag && <div style={{ display: 'flex', fontSize: 26 }}>{flag}</div>}
                  <div style={{ display: 'flex', fontSize: 24, fontWeight: 600, color: '#e2e8f0' }}>{locationStr}</div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid rgba(255,255,255,0.14)',
              paddingTop: 26,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoSrc} alt="" width={52} height={52} style={{ width: 52, height: 52, borderRadius: 999 }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', fontSize: 25, fontWeight: 800, color: '#ffffff' }}>
                  Investigator Events
                </div>
                <div style={{ display: 'flex', fontSize: 18, fontWeight: 600, color: '#8fa3c4' }}>
                  investigatorevents.com
                </div>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                padding: '13px 28px',
                borderRadius: 999,
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              }}
            >
              <div style={{ display: 'flex', fontSize: 20, fontWeight: 600, color: '#ffffff' }}>View Event Details</div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
