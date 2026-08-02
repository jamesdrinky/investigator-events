import { ImageResponse } from 'next/og';
import { fetchAllEvents } from '@/lib/data/events';
import { buildAssociationDirectory } from '@/lib/data/associations';

export const runtime = 'nodejs';
export const alt = 'Your events calendar, done for you — Investigator Events';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const BASE_URL = 'https://www.investigatorevents.com';

async function fetchAsset(pathname: string): Promise<Buffer> {
  const res = await fetch(`${BASE_URL}${pathname}`, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`asset ${pathname}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Normalize any logo (webp/odd formats) to PNG for satori. */
async function logoDataUri(logoPath: string | undefined): Promise<string | null> {
  if (!logoPath) return null;
  try {
    const raw = await fetchAsset(logoPath);
    const { default: sharp } = await import('sharp');
    const png = await sharp(raw).resize(160, 160, { fit: 'inside' }).png().toBuffer();
    return `data:image/png;base64,${png.toString('base64')}`;
  } catch {
    return null;
  }
}

let fontsPromise: Promise<[Buffer, Buffer, Buffer]> | null = null;
function loadStatics() {
  fontsPromise ??= Promise.all([
    fetchAsset('/og-assets/plus-jakarta-sans-v12-latin-600.ttf'),
    fetchAsset('/og-assets/plus-jakarta-sans-v12-latin-800.ttf'),
    fetchAsset('/icon.png'),
  ]).catch((err) => {
    fontsPromise = null;
    throw err;
  });
  return fontsPromise;
}

export default async function PartnerOGImage({ params }: { params: { slug: string } }) {
  const [events, [semiBold, extraBold, ieIcon]] = await Promise.all([fetchAllEvents(), loadStatics()]);
  const assoc = buildAssociationDirectory(events).find((a) => a.slug === params.slug) ?? null;
  const assocLogo = assoc ? await logoDataUri(assoc.logoSrc) : null;
  const ieLogoSrc = `data:image/png;base64,${ieIcon.toString('base64')}`;
  const shortName = assoc?.shortName ?? 'Your association';

  const fonts = [
    { name: 'Jakarta', data: semiBold, weight: 600 as const, style: 'normal' as const },
    { name: 'Jakarta', data: extraBold, weight: 800 as const, style: 'normal' as const },
  ];

  const logoBox = (src: string | null, label: string) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 130,
        height: 130,
        borderRadius: 28,
        backgroundColor: '#ffffff',
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 18px 40px -18px rgba(0,0,0,0.6)',
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" width={96} height={96} style={{ width: 96, height: 96, objectFit: 'contain' }} />
      ) : (
        <div style={{ display: 'flex', fontSize: 44, fontWeight: 800, color: '#1e3a5f' }}>{label.charAt(0)}</div>
      )}
    </div>
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#050b1b',
          backgroundImage:
            'radial-gradient(55% 60% at 18% 0%, rgba(59,130,246,0.30), transparent), radial-gradient(50% 55% at 85% 100%, rgba(139,92,246,0.26), transparent)',
          fontFamily: 'Jakarta',
          padding: '56px 70px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 30, marginBottom: 44 }}>
          {logoBox(assocLogo, shortName)}
          <div style={{ display: 'flex', fontSize: 42, fontWeight: 600, color: 'rgba(255,255,255,0.35)' }}>×</div>
          {logoBox(ieLogoSrc, 'IE')}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 26px',
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.22)',
            backgroundColor: 'rgba(255,255,255,0.08)',
            marginBottom: 30,
          }}
        >
          <div
            style={{
              display: 'flex',
              width: 11,
              height: 11,
              borderRadius: 999,
              background: 'linear-gradient(90deg, #38bdf8, #a855f7)',
            }}
          />
          <div style={{ display: 'flex', fontSize: 19, fontWeight: 600, letterSpacing: 4, color: '#dbeafe' }}>
            BUILT FOR {shortName.toUpperCase()} — ALREADY LIVE
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontSize: 62,
            fontWeight: 800,
            lineHeight: 1.12,
            color: '#ffffff',
            textAlign: 'center',
            letterSpacing: -1,
          }}
        >
          <div style={{ display: 'flex' }}>Your events calendar.</div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ display: 'flex' }}>On your website.</div>
            <div
              style={{
                display: 'flex',
                background: 'linear-gradient(90deg, #38bdf8, #a78bfa, #f472b6)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Done for you.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 26, marginTop: 40 }}>
          {['Free, forever', 'Updates itself', 'One line of code'].map((t) => (
            <div
              key={t}
              style={{
                display: 'flex',
                padding: '10px 22px',
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.16)',
                backgroundColor: 'rgba(255,255,255,0.06)',
                fontSize: 21,
                fontWeight: 600,
                color: '#c7d4ea',
              }}
            >
              {t}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 46 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ieLogoSrc} alt="" width={30} height={30} style={{ width: 30, height: 30, borderRadius: 999 }} />
          <div style={{ display: 'flex', fontSize: 22, fontWeight: 800, color: '#ffffff' }}>Investigator Events</div>
          <div style={{ display: 'flex', fontSize: 20, fontWeight: 600, color: '#8fa3c4' }}>
            · investigatorevents.com
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
