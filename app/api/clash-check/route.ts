import { NextResponse } from 'next/server';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { assertSameOriginRequest } from '@/lib/security/server';

// Server-side date clash check. Returns direct overlaps AND near misses
// (events within a week either side — back-to-back conferences split
// attendance even without a literal overlap). Every check is logged to
// clash_checks; organisers can optionally leave an email to be alerted if
// a clashing event is added later ("date watch").

interface ClashEvent {
  id: string;
  title: string;
  slug: string | null;
  start_date: string | null;
  end_date: string | null;
  city: string;
  country: string;
  region: string;
  association: string | null;
}

const NEAR_MISS_DAYS = 7;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function shiftDate(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  assertSameOriginRequest();

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  const startDate = typeof body.startDate === 'string' ? body.startDate : '';
  const endDate = typeof body.endDate === 'string' ? body.endDate : startDate;
  const region = typeof body.region === 'string' && body.region ? body.region : null;
  const email = typeof body.email === 'string' && body.email.includes('@') ? body.email.trim().toLowerCase() : null;
  const eventName = typeof body.eventName === 'string' ? body.eventName.trim().slice(0, 200) : null;

  if (!DATE_RE.test(startDate) || !DATE_RE.test(endDate) || endDate < startDate) {
    return NextResponse.json({ error: 'Invalid dates' }, { status: 400 });
  }

  const supabase = createSupabaseAdminServerClient();

  // One query over the widened window, split into direct/nearby in code.
  const windowStart = shiftDate(startDate, -NEAR_MISS_DAYS);
  const windowEnd = shiftDate(endDate, NEAR_MISS_DAYS);

  let query = supabase
    .from('events')
    .select('id, title, slug, start_date, end_date, city, country, region, association')
    .eq('approved', true)
    .eq('event_scope', 'main')
    .lte('start_date', windowEnd)
    .gte('start_date', shiftDate(windowStart, -60)); // events can span up to ~60 days back

  if (region) query = query.eq('region', region);

  const { data, error } = await query.order('start_date');
  if (error) return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });

  const direct: ClashEvent[] = [];
  const nearby: ClashEvent[] = [];

  for (const e of (data ?? []) as ClashEvent[]) {
    const eStart = e.start_date;
    if (!eStart) continue;
    const eEnd = e.end_date ?? eStart;
    if (eStart <= endDate && eEnd >= startDate) {
      direct.push(e);
    } else if (eStart <= windowEnd && eEnd >= windowStart) {
      nearby.push(e);
    }
  }

  // Log the check (and the date watch if an email was left). Errors here
  // shouldn't fail the user-facing check.
  await supabase
    .from('clash_checks' as any)
    .insert({
      proposed_start: startDate,
      proposed_end: endDate,
      region,
      email,
      event_name: eventName || null,
      notify: Boolean(email),
      clashing_events: direct.map((e) => ({ id: e.id, title: e.title, start_date: e.start_date, end_date: e.end_date })),
    } as any)
    .then(
      () => {},
      () => {}
    );

  return NextResponse.json({ direct, nearby });
}
