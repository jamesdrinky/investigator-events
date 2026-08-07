import { ImageResponse } from 'next/og';
import { fetchEventBySlug } from '@/lib/data/events';
import { formatEventDate, parseDate } from '@/lib/utils/date';
import { getCountryFlag } from '@/lib/utils/location';

// Square 1080x1080 LinkedIn feed card for an event — the graphic half of the
// "drafted LinkedIn post" workflow. Same engine and brand language as the
// event OG images, recomposed for a square feed placement.
//   /api/og/linkedin/wad-conference-2026
export const runtime = 'nodejs';

const SIZE = { width: 1080, height: 1080 };
const NAVY = 'rgba(5, 11, 27,';

// Assets come from the site's own CDN — fs paths that work in dev aren't
// traced into the serverless bundle on Vercel (see events opengraph-image).
const ASSET_BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.investigatorevents.com';

async function fetchAsset(pathname: string): Promise<Buffer> {
  const res = await fetch(`${ASSET_BASE}${pathname}`, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`asset ${pathname}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

let staticAssets: Promise<[Buffer, Buffer, Buffer]> | null = null;
function loadStaticAssets() {
  staticAssets ??= Promise.all([
    fetchAsset('/og-assets/plus-jakarta-sans-v12-latin-600.ttf'),
    fetchAsset('/og-assets/plus-jakarta-sans-v12-latin-800.ttf'),
    fetchAsset('/icon.png'),
  ]).catch((err) => {
    staticAssets = null;
    throw err;
  });
  return staticAssets;
}

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
    const jpeg = await sharp(raw).resize(1080, 1080, { fit: 'cover' }).jpeg({ quality: 72 }).toBuffer();
    return `data:image/jpeg;base64,${jpeg.toString('base64')}`;
  } catch {
    return null;
  }
}

/** "In 5 weeks" / "In 12 days" / "This week" — the urgency chip. */
function timeUntil(startDate: string): string | null {
  const days = Math.round((parseDate(startDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  if (days < 0) return null;
  if (days <= 7) return 'THIS WEEK';
  if (days <= 21) return `IN ${days} DAYS`;
  return `IN ${Math.round(days / 7)} WEEKS`;
}

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const [event, [semiBold, extraBold, logoData]] = await Promise.all([
    fetchEventBySlug(params.slug),
    loadStaticAssets(),
  ]);

  if (!event) {
    return new Response('Event not found', { status: 404 });
  }

  const fonts = [
    { name: 'Jakarta', data: semiBold, weight: 600 as const, style: 'normal' as const },
    { name: 'Jakarta', data: extraBold, weight: 800 as const, style: 'normal' as const },
  ];
  const logoSrc = `data:image/png;base64,${logoData.toString('base64')}`;

  const flag = getCountryFlag(event.country);
  const dateStr = event.date ? formatEventDate(event) : '';
  const locationStr = [event.city, event.country].filter(Boolean).join(', ');
  const category = (event.category ?? 'Event').toUpperCase();
  const countdown = event.date ? timeUntil(event.date) : null;
  const backdrop = await resolveBackdrop(event.image_path, event.coverImage);
  const titleSize = event.title.length <= 26 ? 88 : event.title.length <= 44 ? 72 : event.title.length <= 66 ? 60 : 50;

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
            width={1080}
            height={1080}
            style={{ position: 'absolute', top: 0, left: 0, width: 1080, height: 1080, objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 1080,
              height: 1080,
              display: 'flex',
              background: 'linear-gradient(155deg, #06091a 0%, #0d1840 55%, #1a1040 100%)',
            }}
          />
        )}

        {/* Legibility scrims — heavy along the base where the type sits */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1080,
            height: 1080,
            display: 'flex',
            background: `linear-gradient(0deg, ${NAVY}0.97) 0%, ${NAVY}0.82) 38%, ${NAVY}0.38) 68%, ${NAVY}0.30) 100%)`,
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
            padding: '56px 60px 52px',
          }}
        >
          {/* Top row: brand badge + countdown */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 11,
                padding: '12px 24px',
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.22)',
                backgroundColor: 'rgba(5,11,27,0.55)',
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
              <div style={{ display: 'flex', fontSize: 19, fontWeight: 600, letterSpacing: 3, color: '#dbeafe' }}>
                INVESTIGATOR EVENTS
              </div>
            </div>
            {countdown && (
              <div
                style={{
                  display: 'flex',
                  padding: '12px 26px',
                  borderRadius: 999,
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                }}
              >
                <div style={{ display: 'flex', fontSize: 20, fontWeight: 800, letterSpacing: 2.5, color: '#ffffff' }}>
                  {countdown}
                </div>
              </div>
            )}
          </div>

          {/* Title block */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  display: 'flex',
                  width: 76,
                  height: 7,
                  borderRadius: 999,
                  background: 'linear-gradient(90deg, #3b82f6, #a855f7, #ec4899)',
                }}
              />
              <div style={{ display: 'flex', fontSize: 20, fontWeight: 600, letterSpacing: 3.5, color: '#93b4ff' }}>
                {category}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: titleSize,
                fontWeight: 800,
                lineHeight: 1.06,
                letterSpacing: -1.5,
                color: '#ffffff',
                maxHeight: titleSize * 3.3,
                overflow: 'hidden',
              }}
            >
              {event.title}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
              {dateStr && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 13,
                    padding: '15px 24px',
                    borderRadius: 16,
                    border: '1px solid rgba(255,255,255,0.16)',
                    backgroundColor: 'rgba(8,15,32,0.6)',
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="5" width="18" height="16" rx="3" stroke="#7fa8ff" strokeWidth="2" />
                    <path d="M3 10h18M8 3v4M16 3v4" stroke="#7fa8ff" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <div style={{ display: 'flex', fontSize: 27, fontWeight: 600, color: '#e2e8f0' }}>{dateStr}</div>
                </div>
              )}
              {locationStr && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 13,
                    padding: '15px 24px',
                    borderRadius: 16,
                    border: '1px solid rgba(255,255,255,0.16)',
                    backgroundColor: 'rgba(8,15,32,0.6)',
                  }}
                >
                  {flag && <div style={{ display: 'flex', fontSize: 28 }}>{flag}</div>}
                  <div style={{ display: 'flex', fontSize: 27, fontWeight: 600, color: '#e2e8f0' }}>{locationStr}</div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid rgba(255,255,255,0.14)',
                paddingTop: 30,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoSrc} alt="" width={56} height={56} style={{ width: 56, height: 56, borderRadius: 999 }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', fontSize: 26, fontWeight: 800, color: '#ffffff' }}>
                    Investigator Events
                  </div>
                  <div style={{ display: 'flex', fontSize: 19, fontWeight: 600, color: '#8fa3c4' }}>
                    The global PI conference calendar
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', fontSize: 22, fontWeight: 800, color: '#93b4ff' }}>
                investigatorevents.com
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...SIZE, fonts }
  );
}
