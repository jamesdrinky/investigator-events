import { NextRequest, NextResponse } from 'next/server';
import { fetchAllEvents } from '@/lib/data/events';
import { formatEventDate, parseDate } from '@/lib/utils/date';
import { getCountryFlag } from '@/lib/utils/location';
import { countrySlug } from '@/lib/utils/country-pages';

// A raw-HTML route handler rather than a page: it bypasses the root layout
// (no navbar/tab bar in an iframe) and ships zero JavaScript to the host
// site. Partners embed it with a plain <iframe>.
export const revalidate = 1800;

const BASE_URL = 'https://www.investigatorevents.com';

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country')?.trim().toLowerCase() || null;
  const association = searchParams.get('association')?.trim().toLowerCase() || null;
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') ?? '5', 10) || 5, 1), 20);
  const dark = searchParams.get('theme') === 'dark';

  const now = Date.now();
  const events = (await fetchAllEvents())
    .filter((e) => e.eventScope === 'main' && parseDate(e.date).getTime() >= now)
    .filter((e) => !country || countrySlug(e.country ?? '') === country)
    .filter(
      (e) =>
        !association ||
        (e.association ?? '').toLowerCase().includes(association) ||
        (e.organiser ?? '').toLowerCase().includes(association)
    )
    .sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime())
    .slice(0, limit);

  const c = dark
    ? { bg: '#0b1220', card: '#111a2e', text: '#f1f5f9', sub: '#94a3b8', border: '#1e293b', accent: '#60a5fa' }
    : { bg: '#ffffff', card: '#f8fafc', text: '#0f172a', sub: '#64748b', border: '#e2e8f0', accent: '#2563eb' };

  const utm = 'utm_source=widget&utm_medium=embed';

  const items = events
    .map((e) => {
      const flag = getCountryFlag(e.country ?? '');
      const where = [e.city, e.country].filter(Boolean).join(', ');
      return `<a class="ev" href="${BASE_URL}/events/${esc(e.slug)}?${utm}" target="_blank" rel="noopener">
        <span class="date">${esc(e.date ? formatEventDate(e) : 'TBC')}</span>
        <span class="title">${esc(e.title)}</span>
        <span class="loc">${flag ? `${flag} ` : ''}${esc(where)}</span>
      </a>`;
    })
    .join('\n');

  const empty = `<p class="empty">No upcoming events listed${country ? ' for this region' : ''} right now.</p>`;

  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Upcoming investigator events</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: ${c.bg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 12px; }
  .ev { display: block; background: ${c.card}; border: 1px solid ${c.border}; border-radius: 12px; padding: 12px 14px; margin-bottom: 8px; text-decoration: none; transition: border-color .15s; }
  .ev:hover { border-color: ${c.accent}; }
  .date { display: block; font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: ${c.accent}; }
  .title { display: block; margin-top: 3px; font-size: 14px; font-weight: 700; color: ${c.text}; line-height: 1.35; }
  .loc { display: block; margin-top: 3px; font-size: 12px; color: ${c.sub}; }
  .empty { color: ${c.sub}; font-size: 13px; padding: 8px 2px; }
  .powered { display: flex; align-items: center; gap: 6px; padding: 8px 2px 2px; font-size: 11.5px; color: ${c.sub}; text-decoration: none; }
  .powered b { color: ${c.text}; font-weight: 700; }
  .powered img { width: 16px; height: 16px; border-radius: 999px; }
</style>
</head><body>
${items || empty}
<a class="powered" href="${BASE_URL}/?${utm}" target="_blank" rel="noopener">
  <img src="${BASE_URL}/icon.png" alt=""> Powered by <b>Investigator Events</b> — the global PI events calendar
</a>
</body></html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
    },
  });
}
