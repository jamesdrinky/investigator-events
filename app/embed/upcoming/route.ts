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
  const compact = searchParams.get('view') === 'compact';
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

  /** "THIS WEEK" / "IN 12 DAYS" / "IN 4 WEEKS" — the pulse that makes cards feel live. */
  const countdown = (date: string): string | null => {
    const days = Math.round((parseDate(date).getTime() - now) / 86_400_000);
    if (days < 0) return null;
    if (days === 0) return 'TODAY';
    if (days <= 7) return 'THIS WEEK';
    if (days <= 21) return `IN ${days} DAYS`;
    if (days <= 56) return `IN ${Math.round(days / 7)} WEEKS`;
    // Far out: the month reads better than "IN 30 WEEKS".
    const d = parseDate(date);
    return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' }).toUpperCase();
  };

  // Subscribe link mirrors the widget's own filters, so "add to calendar"
  // from a WAD widget subscribes to the WAD feed.
  const icsParams = new URLSearchParams();
  if (country) icsParams.set('country', country);
  if (association) icsParams.set('association', association);
  const icsQs = icsParams.toString();
  const webcalUrl = `webcal://www.investigatorevents.com/api/ics${icsQs ? `?${icsQs}` : ''}`;

  const items = events
    .map((e) => {
      const flag = getCountryFlag(e.country ?? '');
      const where = [e.city, e.country].filter(Boolean).join(', ');
      const thumb = thumbUrl(e.image_path, e.coverImage);
      const soon = e.date ? countdown(e.date) : null;

      if (compact) {
        return `<a class="ev" href="${BASE_URL}/events/${esc(e.slug)}?${utm}" target="_blank" rel="noopener">
        <span class="body">
          <span class="date">${esc(e.date ? formatEventDate(e) : 'Date TBC')}</span>
          <span class="title">${esc(e.title)}</span>
          <span class="loc">${flag ? `<span class="flag">${flag}</span>` : ''}${esc(where)}</span>
        </span>
        <svg class="arrow" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </a>`;
      }

      // Standard view: the photo IS the card — dark scrim, white type,
      // accent date chip. Reads premium on any host site.
      const media = thumb
        ? `<img class="card-bg" src="${esc(thumb)}" alt="">`
        : `<span class="card-bg card-bg-fallback"></span>`;
      return `<a class="card" href="${BASE_URL}/events/${esc(e.slug)}?${utm}" target="_blank" rel="noopener">
        ${media}
        <span class="card-scrim"></span>
        ${soon ? `<span class="card-soon">${soon}</span>` : ''}
        <span class="card-body">
          <span class="card-date">${esc(e.date ? formatEventDate(e) : 'Date TBC')}</span>
          <span class="card-title">${esc(e.title)}</span>
          <span class="card-loc">${flag ? `<span class="flag">${flag}</span>` : ''}${esc(where)}</span>
        </span>
        <svg class="card-arrow" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </a>`;
    })
    .join('\n');

  const empty = association
    ? `<p class="empty">No upcoming events listed yet — new ones appear here the moment they're verified.</p>`
    : `<p class="empty">No upcoming events listed${country ? ' for this country' : ''} right now.</p>`;

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
  body { background: ${c.bg}; font-family: 'Jakarta', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 14px; max-width: 780px; margin: 0 auto; }
  @media (min-width: 640px) {
    .ev { padding: 15px 18px; gap: 18px; }
    .date { font-size: 11.5px; }
    .title { font-size: 16px; }
    .loc { font-size: 13px; }
    .card { min-height: 148px; }
    .card-title { font-size: 21px; }
    .card-date { font-size: 11.5px; }
    .card-loc { font-size: 13.5px; }
    .card-body { padding: 18px 52px 17px 22px; }
  }
  /* Compact rows */
  .ev { position: relative; display: flex; align-items: center; gap: 14px; background: ${c.card}; border: 1px solid ${c.border}; border-radius: 16px; padding: 12px; margin-bottom: 10px; text-decoration: none; transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease; overflow: hidden; }
  .ev::before { content: ''; position: absolute; left: 0; top: 12px; bottom: 12px; width: 3.5px; border-radius: 99px; background: ${accent}; opacity: 0; transition: opacity .18s ease; }
  .ev:hover { transform: translateY(-2px); border-color: ${accent}55; box-shadow: ${c.shadow}; background: ${c.cardHover}; }
  .ev:hover::before { opacity: 1; }
  .body { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 3px; }
  .date { font-size: 10.5px; font-weight: 800; letter-spacing: .09em; text-transform: uppercase; color: ${accent}; }
  .title { font-size: 14.5px; font-weight: 800; color: ${c.text}; line-height: 1.3; letter-spacing: -0.01em; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .loc { font-size: 12px; font-weight: 600; color: ${c.sub}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .flag { margin-right: 5px; }
  .arrow { width: 16px; height: 16px; flex-shrink: 0; color: ${c.sub}; opacity: .55; transition: transform .18s ease, color .18s ease, opacity .18s ease; }
  .ev:hover .arrow { transform: translateX(3px); color: ${accent}; opacity: 1; }

  /* Standard view: full-bleed photo cards */
  .card { position: relative; display: flex; align-items: flex-end; min-height: 124px; border-radius: 18px; margin-bottom: 12px; overflow: hidden; text-decoration: none; background: #0a1120; box-shadow: 0 8px 22px -14px rgba(5,11,27,0.45); transition: transform .22s ease, box-shadow .22s ease; }
  .card:hover { transform: translateY(-2px); box-shadow: 0 16px 32px -14px rgba(5,11,27,0.55); }
  .card-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform .5s ease; }
  .card:hover .card-bg { transform: scale(1.05); }
  .card-bg-fallback { position: absolute; inset: 0; background: radial-gradient(circle at 85% 20%, ${accent}59, transparent 55%), radial-gradient(circle at 10% 110%, ${accent}40, transparent 50%), linear-gradient(135deg, #0b132b 0%, #131c3d 100%); }
  .card-scrim { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(5,11,27,0.92) 0%, rgba(5,11,27,0.62) 52%, rgba(5,11,27,0.22) 100%); }
  .card-soon { position: absolute; top: 12px; right: 12px; padding: 5px 12px; border-radius: 99px; background: ${accent}; color: #fff; font-size: 10px; font-weight: 800; letter-spacing: .1em; box-shadow: 0 4px 12px -4px rgba(5,11,27,0.5); }
  .card-body { position: relative; min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 4px; padding: 16px 44px 15px 18px; }
  .card-date { font-size: 10.5px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: color-mix(in srgb, ${accent} 45%, #ffffff); }
  .card-title { font-size: 17px; font-weight: 800; color: #ffffff; line-height: 1.25; letter-spacing: -0.015em; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-shadow: 0 1px 8px rgba(5,11,27,0.5); }
  .card-loc { font-size: 12.5px; font-weight: 600; color: rgba(226,232,240,0.92); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .card-arrow { position: absolute; right: 16px; bottom: 18px; width: 18px; height: 18px; color: rgba(255,255,255,0.75); transition: transform .22s ease, color .22s ease; }
  .card:hover .card-arrow { transform: translateX(3px); color: #ffffff; }
  .empty { color: ${c.sub}; font-size: 13px; font-weight: 600; padding: 10px 4px; }
  .powered { display: flex; align-items: center; gap: 7px; font-size: 11.5px; font-weight: 600; color: ${c.sub}; text-decoration: none; min-width: 0; }
  .powered b { color: ${c.text}; font-weight: 800; }
  .powered img { width: 17px; height: 17px; border-radius: 999px; }
  .footer { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 4px 2px; }
  .subscribe { flex-shrink: 0; display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; color: ${accent}; text-decoration: none; border: 1px solid ${accent}44; border-radius: 999px; padding: 4px 10px; transition: background-color .18s ease; }
  .subscribe:hover { background-color: ${accent}14; }
  ${compact ? `.ev { padding: 9px 12px; margin-bottom: 8px; border-radius: 12px; } .ev::before { top: 9px; bottom: 9px; } .title { font-size: 13px; -webkit-line-clamp: 1; } .date { font-size: 10px; } .body { gap: 2px; }` : ''}
</style>
</head><body>
${items || empty}
<div class="footer">
  <a class="powered" href="${BASE_URL}/?${utm}" target="_blank" rel="noopener">
    <img src="${BASE_URL}/icon.png" alt=""> Powered by <b>Investigator Events</b>
  </a>
  <a class="subscribe" href="${webcalUrl}" title="Subscribe to these events in your own calendar app">&#128197;&nbsp;Subscribe</a>
</div>
<script>
  // Auto-resize support for the script embed (/widget.js). Plain iframe
  // embeds simply ignore these messages.
  (function () {
    var post = function () {
      try {
        parent.postMessage({ source: 'ie-widget', height: document.documentElement.scrollHeight }, '*');
      } catch (e) {}
    };
    window.addEventListener('load', post);
    if (window.ResizeObserver) new ResizeObserver(post).observe(document.body);
  })();
</script>
</body></html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
    },
  });
}
