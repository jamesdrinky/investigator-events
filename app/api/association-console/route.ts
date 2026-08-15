import { NextResponse } from 'next/server';
import { createSupabaseSSRServerClient } from '@/lib/supabase/ssr-server';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { assertSameOriginRequest } from '@/lib/security/server';
import { fetchAssociationPageBySlug, isAssociationAdmin } from '@/lib/data/association-console';

// Association Console actions. Everything an association admin does here
// flows through IE review — nothing goes live unverified.
//   action: 'request-access'  → signed-in user asks to manage an association
//   action: 'submit-event'    → admin adds an event → event_submissions queue
//   action: 'change-request'  → admin asks for an edit/removal of a live event

const REGIONS = ['Europe', 'North America', 'Asia-Pacific', 'Middle East', 'Latin America', 'Africa'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

async function notifyTeam(subject: string, html: string) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;
  const { Resend } = await import('resend');
  await new Resend(resendKey).emails
    .send({
      from: 'Investigator Events <info@investigatorevents.com>',
      to: 'info@investigatorevents.com',
      subject,
      html,
    })
    .catch(() => {});
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function POST(request: Request) {
  assertSameOriginRequest();

  const body = await request.json().catch(() => null);
  if (!body?.action || typeof body.slug !== 'string') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const ssr = await createSupabaseSSRServerClient();
  const {
    data: { user },
  } = await ssr.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in first' }, { status: 401 });

  const page = await fetchAssociationPageBySlug(body.slug);
  if (!page) return NextResponse.json({ error: 'Association not found' }, { status: 404 });

  const admin = createSupabaseAdminServerClient();

  // ── Request access ────────────────────────────────────────────────────────
  if (body.action === 'request-access') {
    const note = typeof body.note === 'string' ? body.note.slice(0, 500) : '';
    await notifyTeam(
      `Console access request — ${page.name}`,
      `<p><strong>${esc(user.email ?? user.id)}</strong> is requesting manager access to <strong>${esc(page.name)}</strong> (${esc(page.slug)}).</p>
       ${note ? `<p>Note: ${esc(note)}</p>` : ''}
       <p>Grant it in Admin → Verification Codes → Association managers.</p>`
    );
    return NextResponse.json({ ok: true });
  }

  // Everything below requires the user to already be a manager.
  if (!(await isAssociationAdmin(user.id, page.id))) {
    return NextResponse.json({ error: 'Not a manager of this association' }, { status: 403 });
  }

  // ── Submit an event into the review queue ────────────────────────────────
  if (body.action === 'submit-event') {
    const f = body.fields ?? {};
    const eventName = String(f.eventName ?? '').trim();
    const startDate = String(f.startDate ?? '');
    const endDate = f.endDate ? String(f.endDate) : null;
    const city = String(f.city ?? '').trim();
    const country = String(f.country ?? '').trim();
    const region = String(f.region ?? '').trim();
    const category = String(f.category ?? 'Conference').trim();
    const website = String(f.website ?? '').trim();
    const notes = String(f.notes ?? '').trim().slice(0, 1500);

    if (!eventName || !city || !country || !website || !DATE_RE.test(startDate) || (endDate && !DATE_RE.test(endDate)) || !REGIONS.includes(region)) {
      return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
    }

    const { error } = await (admin.from('event_submissions') as any).insert({
      event_name: eventName,
      organiser: page.name,
      city,
      country,
      region,
      start_date: startDate,
      end_date: endDate,
      category,
      website,
      contact_email: user.email ?? page.contact_email ?? 'info@investigatorevents.com',
      notes: `[Association console — ${page.name}]${notes ? ` ${notes}` : ''}`,
      event_scope: 'main',
      status: 'pending',
    });
    if (error) return NextResponse.json({ error: 'Could not save the event' }, { status: 500 });

    await notifyTeam(
      `Console submission — ${page.name}: ${eventName}`,
      `<p><strong>${esc(page.name)}</strong> submitted <strong>${esc(eventName)}</strong> (${esc(startDate)}, ${esc(city)}, ${esc(country)}) via their console.</p>
       <p>Review it in Admin → Submissions.</p>`
    );
    return NextResponse.json({ ok: true });
  }

  // ── Direct edit of a live event ──────────────────────────────────────────
  // Verified managers edit their own events in place — no review round-trip.
  // Every edit is emailed to the team as an audit trail, and only events that
  // actually belong to the association are editable. Title edits keep the
  // existing slug so links never break.
  if (body.action === 'update-event') {
    const eventId = typeof body.eventId === 'string' ? body.eventId : '';
    const f = body.fields ?? {};
    if (!eventId) return NextResponse.json({ error: 'Missing event' }, { status: 400 });

    const { data: event } = await (admin
      .from('events')
      .select('id, title, slug, association, organiser')
      .eq('id', eventId)
      .maybeSingle() as any);
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

    const { eventMatchesAssociation } = await import('@/lib/data/association-console');
    if (!eventMatchesAssociation({ association: event.association, organiser: event.organiser }, page)) {
      return NextResponse.json({ error: 'Not your association’s event' }, { status: 403 });
    }

    const updates: Record<string, unknown> = {};
    const setText = (key: string, value: unknown, max = 300) => {
      if (typeof value === 'string' && value.trim()) updates[key] = value.trim().slice(0, max);
    };
    setText('title', f.title, 200);
    setText('city', f.city, 100);
    setText('country', f.country, 100);
    setText('category', f.category, 60);
    setText('description', f.description, 4000);
    if (typeof f.website === 'string' && /^https?:\/\//.test(f.website.trim())) updates.website = f.website.trim().slice(0, 500);
    if (typeof f.startDate === 'string' && DATE_RE.test(f.startDate)) {
      updates.start_date = f.startDate;
      updates.date = f.startDate;
    }
    if (typeof f.endDate === 'string' && DATE_RE.test(f.endDate)) updates.end_date = f.endDate;
    if (f.endDate === null || f.endDate === '') updates.end_date = null;
    if (typeof f.region === 'string' && REGIONS.includes(f.region)) updates.region = f.region;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    const { error } = await (admin.from('events') as any).update(updates).eq('id', eventId);
    if (error) return NextResponse.json({ error: 'Could not save changes' }, { status: 500 });

    await notifyTeam(
      `Console edit — ${page.name}: ${event.title}`,
      `<p><strong>${esc(user.email ?? '')}</strong> (${esc(page.name)}) edited <strong>${esc(event.title)}</strong> via the console:</p>
       <ul>${Object.entries(updates)
         .map(([key, value]) => `<li><strong>${esc(key)}</strong>: ${esc(String(value ?? '—')).slice(0, 200)}</li>`)
         .join('')}</ul>
       <p><a href="https://www.investigatorevents.com/events/${esc(event.slug)}">View the event</a></p>`
    );
    return NextResponse.json({ ok: true });
  }

  // ── Request a change/removal of a live event ─────────────────────────────
  if (body.action === 'change-request') {
    const eventTitle = String(body.eventTitle ?? '').slice(0, 200);
    const kind = body.kind === 'remove' ? 'remove' : 'edit';
    const message = String(body.message ?? '').trim().slice(0, 1000);
    if (!eventTitle || !message) return NextResponse.json({ error: 'Say what needs changing' }, { status: 400 });

    await notifyTeam(
      `Console ${kind} request — ${page.name}: ${eventTitle}`,
      `<p><strong>${esc(page.name)}</strong> (${esc(user.email ?? '')}) requests a <strong>${kind}</strong> for <strong>${esc(eventTitle)}</strong>:</p>
       <p>${esc(message)}</p>`
    );
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
