import { NextResponse } from 'next/server';
import { hasValidAdminSessionCookie } from '@/lib/admin/session';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { assertSameOriginRequest } from '@/lib/security/server';
import { slugifyEventTitle } from '@/lib/utils/event-slugs';

// Review queue for AI-drafted events. Approving a draft (with any admin
// edits applied) publishes it straight onto the live calendar.

// Same-origin check only on mutating methods — browsers omit the Origin
// header on same-origin GETs, so asserting there would 500 in production.
async function requireAdmin(mutating = true) {
  if (mutating) assertSameOriginRequest();
  if (!(await hasValidAdminSessionCookie())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const denied = await requireAdmin(false);
  if (denied) return denied;

  const supabase = createSupabaseAdminServerClient();
  const { data, error } = await (supabase
    .from('event_drafts' as any)
    .select('*, event_sources(name)')
    .in('status', ['pending'])
    .order('created_at', { ascending: false })
    .limit(100) as any);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ drafts: data ?? [] });
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  const id = body?.id;
  const action = body?.action;
  if (!id || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const supabase = createSupabaseAdminServerClient();

  if (action === 'reject') {
    const { error } = await (supabase.from('event_drafts' as any) as any)
      .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
      .eq('id', id)
      .eq('status', 'pending');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // Approve: merge the admin's edits over the draft, validate the fields the
  // events table requires, publish, then mark the draft.
  const { data: draft, error: draftError } = await (supabase
    .from('event_drafts' as any)
    .select('*')
    .eq('id', id)
    .eq('status', 'pending')
    .single() as any);
  if (draftError || !draft) return NextResponse.json({ error: 'Draft not found' }, { status: 404 });

  const overrides = body.fields ?? {};
  const merged = {
    title: (overrides.title ?? draft.title ?? '').trim(),
    start_date: overrides.start_date ?? draft.start_date,
    end_date: overrides.end_date ?? draft.end_date,
    city: (overrides.city ?? draft.city ?? '').trim(),
    region: (overrides.region ?? draft.region ?? '').trim(),
    country: (overrides.country ?? draft.country ?? '').trim(),
    organiser: (overrides.organiser ?? draft.organiser ?? '').trim(),
    association: (overrides.association ?? draft.association ?? '')?.trim() || null,
    category: (overrides.category ?? draft.category ?? 'Conference').trim(),
    description: (overrides.description ?? draft.description ?? '').trim(),
    website: (overrides.website ?? draft.website ?? '').trim(),
  };

  const missing = (['title', 'start_date', 'city', 'region', 'country', 'organiser', 'website'] as const).filter(
    (key) => !merged[key]
  );
  if (missing.length > 0) {
    return NextResponse.json({ error: `Missing required fields: ${missing.join(', ')}` }, { status: 400 });
  }

  const { data: created, error: insertError } = await (supabase.from('events') as any)
    .insert({
      title: merged.title,
      slug: slugifyEventTitle(merged.title),
      date: merged.start_date,
      start_date: merged.start_date,
      end_date: merged.end_date,
      city: merged.city,
      region: merged.region,
      country: merged.country,
      organiser: merged.organiser,
      association: merged.association,
      category: merged.category,
      description: merged.description || `${merged.title} — details on the event website.`,
      website: merged.website,
      event_scope: 'main',
      approved: true,
      featured: false,
    })
    .select('id, slug')
    .single();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  await (supabase.from('event_drafts' as any) as any)
    .update({ status: 'approved', reviewed_at: new Date().toISOString(), created_event_id: created.id })
    .eq('id', id);

  return NextResponse.json({ ok: true, eventId: created.id, slug: created.slug });
}
