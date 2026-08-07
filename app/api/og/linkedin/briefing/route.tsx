import { ImageResponse } from 'next/og';
import { fetchAllEvents } from '@/lib/data/events';
import { parseDate } from '@/lib/utils/date';

// The scroll-stopper: the month's events as a declassified case file.
// Manila dossier, typewriter type, red stamp, redaction bars — content only
// an investigations platform can post with a straight face.
//   /api/og/linkedin/briefing                → next calendar month
//   /api/og/linkedin/briefing?month=2026-09  → specific month
export const runtime = 'nodejs';

const SIZE = { width: 1080, height: 1080 };
const MAX_ROWS = 5;

const PAPER = '#ece4d0';
const PAPER_EDGE = '#ddd2b8';
const INK = '#211d16';
const INK_SOFT = '#4a4335';
const STAMP_RED = '#a8231f';

/** Google Fonts css2 returns TTF URLs when the client doesn't advertise
 *  woff2 support — satori can't parse woff2, so that's exactly what we want. */
async function fetchGoogleFont(family: string, weight: number): Promise<Buffer> {
  const cssRes = await fetch(
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}`,
    { headers: { 'User-Agent': 'curl/8' }, signal: AbortSignal.timeout(15000) }
  );
  if (!cssRes.ok) throw new Error(`font css ${family}: ${cssRes.status}`);
  const css = await cssRes.text();
  const match = css.match(/url\((https:[^)]+\.ttf)\)/);
  if (!match) throw new Error(`no ttf url for ${family}`);
  const fontRes = await fetch(match[1], { signal: AbortSignal.timeout(15000) });
  if (!fontRes.ok) throw new Error(`font ttf ${family}: ${fontRes.status}`);
  return Buffer.from(await fontRes.arrayBuffer());
}

let fontCache: Promise<[Buffer, Buffer, Buffer]> | null = null;
function loadFonts() {
  fontCache ??= Promise.all([
    fetchGoogleFont('Special Elite', 400), // typewriter display
    fetchGoogleFont('Courier Prime', 400), // dossier body
    fetchGoogleFont('Courier Prime', 700),
  ]).catch((err) => {
    fontCache = null;
    throw err;
  });
  return fontCache;
}

const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
const MONTHS_SHORT = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function dateChip(start: string, end?: string): string {
  const s = parseDate(start);
  const pad = (n: number) => String(n).padStart(2, '0');
  if (!end || end === start) return `${pad(s.getUTCDate())} ${MONTHS_SHORT[s.getUTCMonth()]}`;
  const e = parseDate(end);
  if (s.getUTCMonth() === e.getUTCMonth()) {
    return `${pad(s.getUTCDate())}–${pad(e.getUTCDate())} ${MONTHS_SHORT[s.getUTCMonth()]}`;
  }
  return `${pad(s.getUTCDate())} ${MONTHS_SHORT[s.getUTCMonth()]}–${pad(e.getUTCDate())} ${MONTHS_SHORT[e.getUTCMonth()]}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const now = new Date();
  const monthParam = searchParams.get('month');
  let year: number;
  let month: number;
  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    year = parseInt(monthParam.slice(0, 4), 10);
    month = parseInt(monthParam.slice(5, 7), 10) - 1;
  } else {
    year = now.getUTCMonth() === 11 ? now.getUTCFullYear() + 1 : now.getUTCFullYear();
    month = (now.getUTCMonth() + 1) % 12;
  }
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

  const [allEvents, [specialElite, courier, courierBold]] = await Promise.all([fetchAllEvents(), loadFonts()]);

  const monthEvents = allEvents
    .filter((e) => e.eventScope === 'main' && e.date?.startsWith(monthKey))
    .sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());

  const countryCount = new Set(monthEvents.map((e) => e.country).filter(Boolean)).size;
  const shown = monthEvents.slice(0, MAX_ROWS);
  const overflow = monthEvents.length - shown.length;

  const fonts = [
    { name: 'Elite', data: specialElite, weight: 400 as const, style: 'normal' as const },
    { name: 'Courier', data: courier, weight: 400 as const, style: 'normal' as const },
    { name: 'Courier', data: courierBold, weight: 700 as const, style: 'normal' as const },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: PAPER,
          backgroundImage: `linear-gradient(160deg, ${PAPER} 0%, ${PAPER} 55%, ${PAPER_EDGE} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'Courier',
          padding: '52px 64px 46px',
          color: INK,
        }}
      >
        {/* Aged-paper vignette */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1080,
            height: 1080,
            display: 'flex',
            background: 'radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 55%, rgba(74,60,30,0.16) 100%)',
          }}
        />

        {/* Punch holes */}
        <div style={{ position: 'absolute', top: 340, left: 26, width: 26, height: 26, borderRadius: 999, display: 'flex', backgroundColor: '#c9bda0', boxShadow: 'inset 0 2px 3px rgba(0,0,0,0.3)' }} />
        <div style={{ position: 'absolute', top: 700, left: 26, width: 26, height: 26, borderRadius: 999, display: 'flex', backgroundColor: '#c9bda0', boxShadow: 'inset 0 2px 3px rgba(0,0,0,0.3)' }} />

        {/* Top classification bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: INK,
            color: PAPER,
            padding: '14px 26px',
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 5,
          }}
        >
          <div style={{ display: 'flex' }}>FIELD BRIEFING</div>
          <div style={{ display: 'flex' }}>REF. IE-{String(month + 1).padStart(2, '0')}/{year}</div>
        </div>

        {/* File meta */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 30, fontSize: 21, color: INK_SOFT, letterSpacing: 1 }}>
          <div style={{ display: 'flex' }}>SUBJECT: GATHERINGS OF THE PROFESSION</div>
          <div style={{ display: 'flex' }}>DIST: ALL AGENTS</div>
        </div>

        {/* Month title + stamp */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontFamily: 'Elite', fontSize: 84, color: INK, letterSpacing: 2, lineHeight: 1, maxWidth: 760 }}>
              {MONTHS[month]} {year}
            </div>
            <div style={{ display: 'flex', fontSize: 24, fontWeight: 700, letterSpacing: 3, color: INK_SOFT, marginTop: 12 }}>
              {monthEvents.length} KNOWN EVENTS · {countryCount} COUNTRIES
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              top: 176,
              right: 66,
              border: `6px solid ${STAMP_RED}`,
              borderRadius: 10,
              padding: '12px 20px',
              transform: 'rotate(-9deg)',
              color: STAMP_RED,
              opacity: 0.85,
            }}
          >
            <div style={{ display: 'flex', fontFamily: 'Elite', fontSize: 30, letterSpacing: 3 }}>DECLASSIFIED</div>
            <div style={{ display: 'flex', fontSize: 15, fontWeight: 700, letterSpacing: 1.5, marginTop: 2 }}>
              INVESTIGATOREVENTS.COM
            </div>
          </div>
        </div>

        {/* Dossier rows */}
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 26, flexGrow: 1 }}>
          {shown.map((event, i) => (
            <div
              key={event.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                padding: '17px 4px',
                borderBottom: `2px dashed rgba(33,29,22,0.28)`,
                borderTop: i === 0 ? `2px dashed rgba(33,29,22,0.28)` : 'none',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  minWidth: 190,
                  fontSize: 24,
                  fontWeight: 700,
                  letterSpacing: 1,
                  color: STAMP_RED,
                  whiteSpace: 'nowrap',
                }}
              >
                {dateChip(event.date, event.endDate)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flexGrow: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    fontSize: 29,
                    fontWeight: 700,
                    color: INK,
                    maxHeight: 38,
                    overflow: 'hidden',
                    letterSpacing: -0.5,
                  }}
                >
                  {event.title.toUpperCase()}
                </div>
                <div style={{ display: 'flex', fontSize: 21, color: INK_SOFT, marginTop: 2 }}>
                  LOCATION: {[event.city, event.country].filter(Boolean).join(', ').toUpperCase()}
                </div>
              </div>
            </div>
          ))}

          {/* Redacted overflow line */}
          {overflow > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '17px 4px', borderBottom: `2px dashed rgba(33,29,22,0.28)` }}>
              <div style={{ display: 'flex', minWidth: 190 }}>
                <div style={{ display: 'flex', width: 150, height: 26, backgroundColor: INK }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ display: 'flex', width: 340, height: 26, backgroundColor: INK }} />
                  <div style={{ display: 'flex', fontSize: 22, fontWeight: 700, color: STAMP_RED, letterSpacing: 1 }}>
                    +{overflow} WITHHELD
                  </div>
                </div>
                <div style={{ display: 'flex', fontSize: 20, color: INK_SOFT }}>
                  DECLASSIFY THE FULL LIST AT INVESTIGATOREVENTS.COM
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 26 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontFamily: 'Elite', fontSize: 30, color: INK, letterSpacing: 1 }}>
              INVESTIGATOR EVENTS
            </div>
            <div style={{ display: 'flex', fontSize: 19, color: INK_SOFT, letterSpacing: 1, marginTop: 2 }}>
              EVERY PI CONFERENCE. ONE CALENDAR. FREE.
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: INK,
              color: PAPER,
              padding: '14px 26px',
              fontSize: 21,
              fontWeight: 700,
              letterSpacing: 3,
            }}
          >
            INVESTIGATOREVENTS.COM
          </div>
        </div>
      </div>
    ),
    { ...SIZE, fonts }
  );
}
