import { ImageResponse } from 'next/og';
import { fetchAllEvents } from '@/lib/data/events';
import { parseDate } from '@/lib/utils/date';
import { getCountryFlag } from '@/lib/utils/location';

// Square 1080x1080 "month roundup" LinkedIn card — the workhorse post format.
// Lists the month's events in one scannable graphic; the calendar itself is
// the content.
//   /api/og/linkedin/roundup                → next calendar month
//   /api/og/linkedin/roundup?month=2026-09  → specific month
export const runtime = 'nodejs';

const SIZE = { width: 1080, height: 1080 };
const MAX_ROWS = 5;

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

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_SHORT = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

/** "1–6 SEP" / "14 SEP" / "30 SEP – 2 OCT" */
function dateChip(start: string, end?: string): string {
  const s = parseDate(start);
  if (!end || end === start) return `${s.getUTCDate()} ${MONTHS_SHORT[s.getUTCMonth()]}`;
  const e = parseDate(end);
  if (s.getUTCMonth() === e.getUTCMonth()) {
    return `${s.getUTCDate()}–${e.getUTCDate()} ${MONTHS_SHORT[s.getUTCMonth()]}`;
  }
  return `${s.getUTCDate()} ${MONTHS_SHORT[s.getUTCMonth()]} – ${e.getUTCDate()} ${MONTHS_SHORT[e.getUTCMonth()]}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Default to next month — the natural "coming up" post at end of month.
  const now = new Date();
  const monthParam = searchParams.get('month');
  let year: number;
  let month: number; // 0-indexed
  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    year = parseInt(monthParam.slice(0, 4), 10);
    month = parseInt(monthParam.slice(5, 7), 10) - 1;
  } else {
    year = now.getUTCMonth() === 11 ? now.getUTCFullYear() + 1 : now.getUTCFullYear();
    month = (now.getUTCMonth() + 1) % 12;
  }
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

  const [allEvents, [semiBold, extraBold, logoData]] = await Promise.all([fetchAllEvents(), loadStaticAssets()]);

  const monthEvents = allEvents
    .filter((e) => e.eventScope === 'main' && e.date?.startsWith(monthKey))
    .sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());

  const shown = monthEvents.slice(0, MAX_ROWS);
  const overflow = monthEvents.length - shown.length;

  const fonts = [
    { name: 'Jakarta', data: semiBold, weight: 600 as const, style: 'normal' as const },
    { name: 'Jakarta', data: extraBold, weight: 800 as const, style: 'normal' as const },
  ];
  const logoSrc = `data:image/png;base64,${logoData.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(155deg, #06091a 0%, #0c1636 48%, #170f38 100%)',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'Jakarta',
          padding: '56px 60px 48px',
        }}
      >
        {/* Ambient glows */}
        <div
          style={{
            position: 'absolute',
            top: -180,
            right: -140,
            width: 520,
            height: 520,
            borderRadius: 999,
            display: 'flex',
            background: 'radial-gradient(circle, rgba(59,130,246,0.28), rgba(59,130,246,0) 65%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -200,
            left: -160,
            width: 560,
            height: 560,
            borderRadius: 999,
            display: 'flex',
            background: 'radial-gradient(circle, rgba(124,58,237,0.22), rgba(124,58,237,0) 65%)',
          }}
        />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              padding: '12px 24px',
              borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.2)',
              backgroundColor: 'rgba(255,255,255,0.06)',
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
          <div style={{ display: 'flex', fontSize: 19, fontWeight: 600, letterSpacing: 2.5, color: '#8fa3c4' }}>
            THE MONTH AHEAD
          </div>
        </div>

        {/* Title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 28 }}>
          <div
            style={{
              display: 'flex',
              width: 76,
              height: 7,
              borderRadius: 999,
              background: 'linear-gradient(90deg, #3b82f6, #a855f7, #ec4899)',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
            <div style={{ display: 'flex', fontSize: 66, fontWeight: 800, letterSpacing: -2, color: '#ffffff' }}>
              {MONTHS[month]}
            </div>
            <div style={{ display: 'flex', fontSize: 44, fontWeight: 600, color: '#5d6d88' }}>{year}</div>
            <div style={{ display: 'flex', fontSize: 26, fontWeight: 600, color: '#93b4ff', marginLeft: 'auto' }}>
              {monthEvents.length} event{monthEvents.length === 1 ? '' : 's'} worldwide
            </div>
          </div>
        </div>

        {/* Event rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginTop: 26, flexGrow: 1 }}>
          {shown.map((event) => {
            const flag = getCountryFlag(event.country);
            return (
              <div
                key={event.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 22,
                  padding: '16px 24px',
                  borderRadius: 18,
                  border: '1px solid rgba(255,255,255,0.11)',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 168,
                    padding: '10px 16px',
                    borderRadius: 12,
                    backgroundColor: 'rgba(59,130,246,0.2)',
                    fontSize: 22,
                    fontWeight: 800,
                    letterSpacing: 1,
                    color: '#93b4ff',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {dateChip(event.date, event.endDate)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0, flexGrow: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      fontSize: 28,
                      fontWeight: 800,
                      color: '#ffffff',
                      letterSpacing: -0.5,
                      maxHeight: 36,
                      overflow: 'hidden',
                    }}
                  >
                    {event.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 20, fontWeight: 600, color: '#8fa3c4' }}>
                    {flag && <div style={{ display: 'flex', fontSize: 21 }}>{flag}</div>}
                    <div style={{ display: 'flex' }}>{[event.city, event.country].filter(Boolean).join(', ')}</div>
                  </div>
                </div>
              </div>
            );
          })}
          {overflow > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', fontSize: 22, fontWeight: 600, color: '#5d6d88' }}>
              + {overflow} more on the full calendar
            </div>
          )}
          {shown.length === 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0', fontSize: 28, fontWeight: 600, color: '#5d6d88' }}>
              A quieter month — the full calendar has what&apos;s next.
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(255,255,255,0.12)',
            paddingTop: 28,
            marginTop: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} alt="" width={56} height={56} style={{ width: 56, height: 56, borderRadius: 999 }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', fontSize: 26, fontWeight: 800, color: '#ffffff' }}>Investigator Events</div>
              <div style={{ display: 'flex', fontSize: 19, fontWeight: 600, color: '#8fa3c4' }}>
                Every PI conference, one calendar
              </div>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              padding: '14px 28px',
              borderRadius: 999,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              fontSize: 21,
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
