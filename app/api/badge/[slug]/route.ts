import { NextResponse } from 'next/server';
import { fetchEventBySlug } from '@/lib/data/events';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';

// Embeddable event badge — organisers put it on their own site:
//   <a href="https://www.investigatorevents.com/events/<slug>">
//     <img src="https://www.investigatorevents.com/api/badge/<slug>" ...>
//   </a>
// With reviews it reads "Rated 4.8 ★ by investigators"; without, "Listed on
// Investigator Events". Social proof for them, a permanent backlink for us.
export const revalidate = 3600;

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const event = await fetchEventBySlug(params.slug);
  if (!event) return new NextResponse('Not found', { status: 404 });

  const supabase = createSupabaseAdminServerClient();
  const { data: reviews } = await (supabase
    .from('event_reviews')
    .select('rating')
    .eq('event_id', event.id) as any);

  const ratings = ((reviews ?? []) as { rating: number | null }[])
    .map((r) => r.rating)
    .filter((r): r is number => typeof r === 'number');
  const avg = ratings.length > 0 ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : null;

  const headline = avg !== null ? `Rated ${avg.toFixed(1)} by investigators` : 'Listed on Investigator Events';
  const sub = avg !== null ? `${ratings.length} verified review${ratings.length === 1 ? '' : 's'} · investigatorevents.com` : 'The global PI conference calendar';

  // Width scales with the headline so nothing clips.
  const width = Math.max(232, 96 + headline.length * 7.4);

  const star =
    avg !== null
      ? `<path transform="translate(20,17) scale(0.9)" d="M10 0l2.9 6.2 6.6.8-4.9 4.6 1.3 6.6L10 15.9 4.1 18.2l1.3-6.6L.5 7l6.6-.8z" fill="#facc15"/>`
      : `<circle cx="29" cy="26" r="8" fill="none" stroke="#60a5fa" stroke-width="2.5"/><path d="M29 21v5l3.5 2" stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round" fill="none"/>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(width)}" height="52" viewBox="0 0 ${Math.round(width)} 52" role="img" aria-label="${esc(headline)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0a1120"/>
      <stop offset="1" stop-color="#131c3d"/>
    </linearGradient>
    <linearGradient id="bar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#3b82f6"/>
      <stop offset="0.5" stop-color="#a855f7"/>
      <stop offset="1" stop-color="#06b6d4"/>
    </linearGradient>
  </defs>
  <rect width="${Math.round(width)}" height="52" rx="12" fill="url(#bg)"/>
  <rect x="0" y="49" width="${Math.round(width)}" height="3" fill="url(#bar)"/>
  ${star}
  <text x="48" y="23" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif" font-size="13.5" font-weight="700" fill="#ffffff">${esc(headline)}</text>
  <text x="48" y="39" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif" font-size="9.5" font-weight="600" fill="#8fa3c4">${esc(sub)}</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
