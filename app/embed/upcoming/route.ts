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

/** Event photo for a thumbnail; browsers content-sniff the mislabeled
 *  AVIF/WebP "jpg"s in /cities fine, so direct paths are safe here. */
function thumbUrl(imagePath?: string, coverImage?: string): string | null {
  const candidate =
    (imagePath && /^(\/(cities|events|images)\/|https?:\/\/)/.test(imagePath) ? imagePath : coverImage) ?? null;
  if (!candidate) return null;
  return candidate.startsWith('http') ? candidate : `${BASE_URL}${candidate}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country')?.trim().toLowerCase() || null;
  const association = searchParams.get('association')?.trim().toLowerCase() || null;
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') ?? '5', 10) || 5, 1), 20);
  const dark = searchParams.get('theme') === 'dark';
  // Custom accent: strict 6-hex-digit sanitization — this goes into CSS.
  const accentParam = (searchParams.get('accent') ?? '').replace(/^#/, '');
  const accent = /^[0-9a-fA-F]{6}$/.test(accentParam) ? `#${accentParam}` : dark ? '#60a5fa' : '#2563eb';

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
    ? {
        bg: '#0a1120',
        card: '#101a30',
        cardHover: '#152137',
        text: '#f4f7fc',
        sub: '#8fa3c4',
        border: 'rgba(255,255,255,0.09)',
        shadow: '0 10px 24px -12px rgba(0,0,0,0.55)',
      }
    : {
        bg: '#f6f8fc',
        card: '#ffffff',
        cardHover: '#ffffff',
        text: '#0c1526',
        sub: '#5d6d88',
        border: 'rgba(13,28,56,0.08)',
        shadow: '0 10px 24px -14px rgba(13,28,56,0.28)',
      };

  const utm = 'utm_source=widget&utm_medium=embed';

  const items = events
    .map((e) => {
      const flag = getCountryFlag(e.country ?? '');
      const where = [e.city, e.country].filter(Boolean).join(', ');
      const thumb = thumbUrl(e.image_path, e.coverImage);
      const media = thumb
        ? `<img class="thumb" src="${esc(thumb)}" alt="" loading="lazy">`
        : `<span class="thumb thumb-fallback">${esc((e.title || 'E').charAt(0).toUpperCase())}</span>`;
      return `<a class="ev" href="${BASE_URL}/events/${esc(e.slug)}?${utm}" target="_blank" rel="noopener">
        ${media}
        <span class="body">
          <span class="date">${esc(e.date ? formatEventDate(e) : 'Date TBC')}</span>
          <span class="title">${esc(e.title)}</span>
          <span class="loc">${flag ? `<span class="flag">${flag}</span>` : ''}${esc(where)}</span>
        </span>
        <svg class="arrow" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </a>`;
    })
    .join('\n');

  const empty = `<p class="empty">No upcoming events listed${country || association ? ' for this selection' : ''} right now.</p>`;

  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Upcoming investigator events</title>
<style>
  @font-face { font-family: 'Jakarta'; src: url('${BASE_URL}/og-assets/plus-jakarta-sans-v12-latin-600.ttf') format('truetype'); font-weight: 600; font-display: swap; }
  @font-face { font-family: 'Jakarta'; src: url('${BASE_URL}/og-assets/plus-jakarta-sans-v12-latin-800.ttf') format('truetype'); font-weight: 800; font-display: swap; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: ${c.bg}; font-family: 'Jakarta', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 14px; }
  .ev { position: relative; display: flex; align-items: center; gap: 14px; background: ${c.card}; border: 1px solid ${c.border}; border-radius: 16px; padding: 12px; margin-bottom: 10px; text-decoration: none; transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease; overflow: hidden; }
  .ev::before { content: ''; position: absolute; left: 0; top: 12px; bottom: 12px; width: 3.5px; border-radius: 99px; background: ${accent}; opacity: 0; transition: opacity .18s ease; }
  .ev:hover { transform: translateY(-2px); border-color: ${accent}55; box-shadow: ${c.shadow}; background: ${c.cardHover}; }
  .ev:hover::before { opacity: 1; }
  .thumb { width: 64px; height: 64px; flex-shrink: 0; border-radius: 12px; object-fit: cover; background: ${c.border}; }
  .thumb-fallback { display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; color: #fff; background: linear-gradient(135deg, ${accent}, ${accent}99); }
  .body { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 3px; }
  .date { font-size: 10.5px; font-weight: 800; letter-spacing: .09em; text-transform: uppercase; color: ${accent}; }
  .title { font-size: 14.5px; font-weight: 800; color: ${c.text}; line-height: 1.3; letter-spacing: -0.01em; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .loc { font-size: 12px; font-weight: 600; color: ${c.sub}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .flag { margin-right: 5px; }
  .arrow { width: 16px; height: 16px; flex-shrink: 0; color: ${c.sub}; opacity: .55; transition: transform .18s ease, color .18s ease, opacity .18s ease; }
  .ev:hover .arrow { transform: translateX(3px); color: ${accent}; opacity: 1; }
  .empty { color: ${c.sub}; font-size: 13px; font-weight: 600; padding: 10px 4px; }
  .powered { display: flex; align-items: center; gap: 7px; padding: 10px 4px 2px; font-size: 11.5px; font-weight: 600; color: ${c.sub}; text-decoration: none; }
  .powered b { color: ${c.text}; font-weight: 800; }
  .powered img { width: 17px; height: 17px; border-radius: 999px; }
</style>
</head><body>
${items || empty}
<a class="powered" href="${BASE_URL}/?${utm}" target="_blank" rel="noopener">
  <img src="${BASE_URL}/icon.png" alt=""> Powered by <b>Investigator Events</b>&nbsp;— the global PI events calendar
</a>
</body></html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
    },
  });
}
