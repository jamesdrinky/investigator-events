import { ImageResponse } from 'next/og';

// The "live on both stores" end slide, in the same language as the partner
// page hero: two marks either side of a cross, a status pill, one headline.
//   /api/og/stores              → 1080x1920, for a vertical video end card
//   /api/og/stores?size=square  → 1080x1080, for a feed post
export const runtime = 'nodejs';

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
  ]).catch((err) => { staticAssets = null; throw err; });
  return staticAssets;
}

/** A white rounded tile holding one store mark, as on the partner page. */
function Tile({ children, size }: { children: React.ReactNode; size: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: size * 0.26,
        background: '#ffffff',
        boxShadow: '0 24px 60px -20px rgba(0,0,0,0.65)',
      }}
    >
      {children}
    </div>
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const square = searchParams.get('size') === 'square';
  const SIZE = square ? { width: 1080, height: 1080 } : { width: 1080, height: 1920 };

  const [semibold, extrabold, icon] = await loadStaticAssets();
  const fonts = [
    { name: 'Jakarta', data: semibold, weight: 600 as const, style: 'normal' as const },
    { name: 'Jakarta', data: extrabold, weight: 800 as const, style: 'normal' as const },
  ];
  const iconSrc = `data:image/png;base64,${icon.toString('base64')}`;

  const tile = square ? 150 : 176;
  const headline = square ? 78 : 96;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: '#070B18',
          backgroundImage:
            'radial-gradient(circle at 50% 34%, rgba(59,130,246,0.22), transparent 58%), radial-gradient(circle at 78% 82%, rgba(139,92,246,0.16), transparent 55%)',
          fontFamily: 'Jakarta',
          padding: square ? 70 : 90,
        }}
      >
        {/* Store marks either side of a cross */}
        <div style={{ display: 'flex', alignItems: 'center', gap: square ? 34 : 44 }}>
          <Tile size={tile}>
            <svg width={tile * 0.52} height={tile * 0.52} viewBox="0 0 384 512" fill="#0B1020">
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
            </svg>
          </Tile>

          <div style={{ display: 'flex', fontSize: square ? 46 : 56, fontWeight: 600, color: '#5b6b8c' }}>×</div>

          <Tile size={tile}>
            <svg width={tile * 0.5} height={tile * 0.5} viewBox="0 0 512 512">
              <path fill="#00D2FF" d="M47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0z" />
              <path fill="#FFCE00" d="M472.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8z" />
              <path fill="#00F076" d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1z" />
              <path fill="#FF3A44" d="M104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
            </svg>
          </Tile>
        </div>

        {/* Status pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginTop: square ? 44 : 58,
            padding: '14px 30px',
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.14)',
            background: 'rgba(255,255,255,0.06)',
            fontSize: square ? 22 : 26,
            fontWeight: 800,
            letterSpacing: 3,
            color: '#c9d6ee',
          }}
        >
          <div style={{ display: 'flex', width: 12, height: 12, borderRadius: 999, background: '#34d399' }} />
          LIVE ON BOTH STORES
        </div>

        {/* Headline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: square ? 34 : 46,
            fontSize: headline,
            fontWeight: 800,
            letterSpacing: -3,
            lineHeight: 1.06,
            color: '#ffffff',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex' }}>On iPhone.</div>
          <div style={{ display: 'flex', color: '#7dd3fc' }}>And now Android.</div>
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 26,
            fontSize: square ? 27 : 32,
            fontWeight: 600,
            color: '#93a6c6',
            textAlign: 'center',
            maxWidth: 820,
          }}
        >
          The global events calendar for professional investigators.
        </div>

        {/* Stat pills */}
        <div style={{ display: 'flex', gap: 16, marginTop: square ? 40 : 54 }}>
          {['56 associations', '23 countries', 'Free'].map((label) => (
            <div
              key={label}
              style={{
                display: 'flex',
                padding: '14px 26px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.10)',
                fontSize: square ? 23 : 27,
                fontWeight: 600,
                color: '#d7e2f5',
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Footer lockup */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: square ? 52 : 78 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={iconSrc} width={square ? 58 : 68} height={square ? 58 : 68} style={{ borderRadius: 999 }} alt="" />
          <div
            style={{
              display: 'flex',
              padding: '15px 32px',
              borderRadius: 999,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              fontSize: square ? 25 : 29,
              fontWeight: 800,
              color: '#ffffff',
            }}
          >
            investigatorevents.com
          </div>
        </div>
      </div>
    ),
    { ...SIZE, fonts }
  );
}
