'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { timingSafeEqual } from 'crypto';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import type { EventInsert, EventUpdate } from '@/lib/data/events';
import type { EventSubmissionInsert } from '@/lib/data/event-submissions';
import type { Database } from '@/lib/types/database';
import { assertSameOriginRequest, enforceRateLimit, RateLimitError } from '@/lib/security/server';
import { slugifyEventTitle } from '@/lib/utils/event-slugs';
import { normalizeRequiredUrl } from '@/lib/utils/url';
import {
  clearAdminSessionCookie,
  createAdminSessionToken,
  hasValidAdminSessionCookie,
  setAdminSessionCookie
} from '@/lib/admin/session';
import { queueApprovalOutreachEmail } from '@/lib/email/association-outreach';
import { buildSubmissionApprovedEmail, buildSubmissionRejectedEmail } from '@/lib/email/submission-confirmation';
import { Resend } from 'resend';

async function ensureAdminSession() {
  if (!await hasValidAdminSessionCookie()) {
    redirect('/admin?error=auth');
  }
}

function parseRequired(formData: FormData, key: string): string {
  const value = String(formData.get(key) ?? '').trim();

  if (!value) {
    throw new Error(`Missing required field: ${key}`);
  }

  return value;
}

type SubmissionRow = Database['public']['Tables']['event_submissions']['Row'];

async function generateUniqueEventSlug(title: string, currentEventId?: string) {
  const baseSlug = slugifyEventTitle(title);
  const supabase = createSupabaseAdminServerClient();
  const { data, error } = await supabase.from('events').select('id, slug').ilike('slug', `${baseSlug}%`);

  if (error) {
    console.error('Slug check failed:', error.message);
    throw new Error('Failed to check existing slugs');
  }

  const existingSlugs = new Set(
    (data ?? [])
      .filter((row) => row.id !== currentEventId)
      .map((row) => row.slug)
  );

  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let attempt = 2;

  while (existingSlugs.has(`${baseSlug}-${attempt}`)) {
    attempt += 1;
  }

  return `${baseSlug}-${attempt}`;
}

function buildDefaultEventDescription({
  title,
  organiser,
  city,
  country,
  date
}: {
  title: string;
  organiser: string;
  city: string;
  country: string;
  date: string;
}) {
  return `${title} organised by ${organiser}, scheduled for ${date} in ${city}, ${country}.`;
}

async function parseEventData(formData: FormData, currentEventId?: string): Promise<Omit<EventInsert, 'id'>> {
  const title = parseRequired(formData, 'title');
  const date = parseRequired(formData, 'date');
  const city = parseRequired(formData, 'city');
  const region = parseRequired(formData, 'region');
  const country = parseRequired(formData, 'country');
  const organiser = parseRequired(formData, 'organiser');
  const association = String(formData.get('association') ?? '').trim();
  const category = parseRequired(formData, 'category');
  const description = String(formData.get('description') ?? '').trim();
  const website = normalizeRequiredUrl(parseRequired(formData, 'website'));
  const endDate = String(formData.get('endDate') ?? '').trim();
  const eventScopeRaw = String(formData.get('eventScope') ?? 'main').trim();
  const eventScope = eventScopeRaw === 'secondary' ? 'secondary' : 'main';
  const imagePath = String(formData.get('imagePath') ?? '').trim();
  const pricing = String(formData.get('pricing') ?? '').trim();
  const timezone = String(formData.get('timezone') ?? '').trim();
  const slug = await generateUniqueEventSlug(title, currentEventId);

  return {
    title,
    slug,
    description: description || buildDefaultEventDescription({ title, organiser, city, country, date }),
    end_date: endDate || null,
    city,
    region,
    country,
    start_date: date,
    organiser,
    association: association || null,
    category,
    event_scope: eventScope,
    website,
    image_path: imagePath || null,
    featured: formData.get('featured') === 'on',
    approved: true,
    pricing: pricing || null,
    timezone: timezone || null,
  } as any;
}

function parseSubmissionData(formData: FormData): Omit<EventSubmissionInsert, 'id' | 'status' | 'created_at'> {
  const eventName = parseRequired(formData, 'eventName');
  const organiser = parseRequired(formData, 'organiser');
  const city = parseRequired(formData, 'city');
  const region = parseRequired(formData, 'region');
  const country = parseRequired(formData, 'country');
  const startDate = parseRequired(formData, 'startDate');
  const endDate = String(formData.get('endDate') ?? '').trim();
  const category = parseRequired(formData, 'category');
  const website = normalizeRequiredUrl(parseRequired(formData, 'website'));
  const contactEmail = parseRequired(formData, 'contactEmail');
  const notes = String(formData.get('notes') ?? '').trim();
  const eventScopeRaw = String(formData.get('eventScope') ?? 'main').trim();
  const eventScope = eventScopeRaw === 'secondary' ? 'secondary' : 'main';

  return {
    event_name: eventName,
    organiser,
    city,
    region,
    country,
    start_date: startDate,
    end_date: endDate || null,
    category,
    website,
    contact_email: contactEmail,
    notes: notes || null,
    event_scope: eventScope
  };
}

function buildDefaultSubmissionDescription(submission: Pick<SubmissionRow, 'event_name' | 'organiser' | 'start_date' | 'city' | 'country'>) {
  return `${submission.event_name} organised by ${submission.organiser}, scheduled for ${submission.start_date} in ${submission.city}, ${submission.country}.`;
}

export async function adminLoginAction(formData: FormData) {
  try {
    assertSameOriginRequest();
    enforceRateLimit('admin-login', {
      maxRequests: 3,
      windowMs: 60 * 60 * 1000
    });
  } catch (err) {
    if (err instanceof RateLimitError) {
      redirect('/admin?error=rate-limited');
    }
    throw err;
  }

  const submittedPassword = String(formData.get('password') ?? '');
  const expectedPassword = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!expectedPassword || !sessionSecret) {
    redirect('/admin?error=config');
  }

  const a = Buffer.from(submittedPassword);
  const b = Buffer.from(expectedPassword);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    redirect('/admin?error=invalid');
  }

  await setAdminSessionCookie(createAdminSessionToken());
  redirect('/admin');
}

export async function adminLogoutAction() {
  await clearAdminSessionCookie();
  redirect('/admin');
}

export async function createEventAction(formData: FormData) {
  await ensureAdminSession();

  const payload = await parseEventData(formData);
  const supabase = createSupabaseAdminServerClient();
  const { error } = await supabase.from('events').insert(payload);

  if (error) {
    console.error('Event create failed:', error.message);
    throw new Error('Failed to create event');
  }

  revalidatePath('/');
  revalidatePath('/calendar');
  revalidatePath('/weekly');
  revalidatePath('/admin');
  revalidatePath('/admin/events');
}

export async function updateEventAction(formData: FormData) {
  await ensureAdminSession();

  const id = parseRequired(formData, 'id');
  const payload: EventUpdate = await parseEventData(formData, id);
  const supabase = createSupabaseAdminServerClient();
  const { error } = await supabase.from('events').update(payload).eq('id', id);

  if (error) {
    console.error('Event update failed:', error.message);
    throw new Error('Failed to update event');
  }

  revalidatePath('/');
  revalidatePath('/calendar');
  revalidatePath('/weekly');
  revalidatePath('/admin');
  revalidatePath('/admin/events');
}

export async function deleteEventAction(formData: FormData) {
  await ensureAdminSession();

  const id = parseRequired(formData, 'id');
  const supabase = createSupabaseAdminServerClient();
  const { error } = await supabase.from('events').delete().eq('id', id);

  if (error) {
    console.error('Event delete failed:', error.message);
    throw new Error('Failed to delete event');
  }

  revalidatePath('/');
  revalidatePath('/calendar');
  revalidatePath('/weekly');
  revalidatePath('/admin');
  revalidatePath('/admin/events');
}

export async function approveSubmissionAction(formData: FormData) {
  await ensureAdminSession();

  const submissionId = parseRequired(formData, 'submissionId');
  const supabase = createSupabaseAdminServerClient();
  const { data, error: submissionError } = await supabase
    .from('event_submissions')
    .select('*')
    .eq('id', submissionId)
    .eq('status', 'pending')
    .maybeSingle();

  const submission = data as SubmissionRow | null;

  if (submissionError) {
    console.error('Load submission failed:', submissionError.message);
    throw new Error('Failed to load submission');
  }

  if (!submission) {
    throw new Error('Submission is no longer pending or could not be found.');
  }

  const payload = await parseEventData(formData);
  const description = payload.description.trim() || submission.notes?.trim() || buildDefaultSubmissionDescription(submission);
  const finalPayload: EventInsert = {
    ...payload,
    description
  };

  const { error: createError } = await supabase.from('events').insert(finalPayload);

  if (createError) {
    console.error('Approve submission failed:', createError.message);
    throw new Error('Failed to approve event submission');
  }

  const { error: updateError } = await supabase
    .from('event_submissions')
    .update({ status: 'approved' })
    .eq('id', submissionId);

  if (updateError) {
    console.error('Update submission status failed:', updateError.message);
    throw new Error('Failed to update submission status');
  }

  // Email the submitter that their event is approved & live (fire-and-forget).
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && submission.contact_email) {
    const eventUrl = finalPayload.slug
      ? `https://investigatorevents.com/events/${finalPayload.slug}`
      : 'https://investigatorevents.com/calendar';
    new Resend(resendKey).emails.send({
      from: 'Investigator Events <info@investigatorevents.com>',
      to: submission.contact_email,
      subject: `Your event is live — ${submission.event_name}`,
      html: buildSubmissionApprovedEmail(submission.event_name, eventUrl),
    }).catch((err) => console.error('Approval email failed:', err));
  }

  // Notify the submitter that their event was approved (fire-and-forget)
  let submitterId: string | null = null;
  try {
    const slug = finalPayload.slug;
    const { data: authUsers } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const submitter = authUsers?.users?.find(u => u.email === submission.contact_email);
    if (submitter) {
      submitterId = submitter.id;
      const { createNotification } = await import('@/lib/notifications');
      await createNotification({
        userId: submitter.id,
        actorId: submitter.id,
        type: 'event_approved',
        title: `Your event "${submission.event_name}" has been approved!`,
        body: 'Your event is now live on Investigator Events.',
        link: slug ? `/events/${slug}` : '/calendar',
      });
    }
  } catch {}

  // Tracks every user_id we've already pushed for this event so the geo push
  // below doesn't double-up on association members already notified.
  const pushedIds = new Set<string>();
  if (submitterId) pushedIds.add(submitterId);

  // Notify members of the event's association (fire-and-forget)
  try {
    const association = finalPayload.association;
    if (association) {
      const { data: members } = await (supabase
        .from('user_associations')
        .select('user_id')
        .eq('association_name', association) as any);
      const memberIds = ((members ?? []) as { user_id: string }[]).map((m) => m.user_id);
      if (memberIds.length > 0) {
        const { sendPushToUser } = await import('@/lib/notifications');
        const slug = finalPayload.slug;
        const link = slug ? `/events/${slug}` : '/calendar';
        const title = `New ${association} event`;
        const body = `${finalPayload.title} — ${finalPayload.city}, ${finalPayload.country}`;
        // Throttle so we don't spike APNs — sequential with a tiny gap.
        for (const uid of memberIds) {
          // Don't push to the submitter twice (they already got the event_approved push above)
          if (pushedIds.has(uid)) continue;
          await sendPushToUser(supabase, uid, title, body, link);
          pushedIds.add(uid);
        }
      }
    }
  } catch (err) {
    console.error('association event push failed:', err);
  }

  // Notify users based in the same country as the event (fire-and-forget).
  // Skipped for US events because we don't have state/city data on profiles —
  // a country-wide US push goes to too many irrelevant people. Once we have
  // location filled in (currently null for everyone), we can revisit US.
  try {
    const country = finalPayload.country;
    const US_VARIANTS = new Set(['United States', 'USA', 'US', 'United States of America']);
    if (country && !US_VARIANTS.has(country)) {
      const { data: locals } = await (supabase
        .from('profiles')
        .select('id')
        .eq('country', country) as any);
      const localIds = ((locals ?? []) as { id: string }[]).map((p) => p.id);
      if (localIds.length > 0) {
        const { sendPushToUser } = await import('@/lib/notifications');
        const slug = finalPayload.slug;
        const link = slug ? `/events/${slug}` : '/calendar';
        const title = `New event in ${country}`;
        const body = `${finalPayload.title} — ${finalPayload.city}`;
        for (const uid of localIds) {
          if (pushedIds.has(uid)) continue;
          await sendPushToUser(supabase, uid, title, body, link);
          pushedIds.add(uid);
        }
      }
    }
  } catch (err) {
    console.error('country event push failed:', err);
  }

  // Send outreach email to association contact (once per association, fire-and-forget)
  if (submission.contact_email) {
    // Extract association name from notes "[Association: XYZ]" or fall back to organiser
    const assocMatch = submission.notes?.match(/\[Association:\s*(.+?)\]/);
    const association = (assocMatch?.[1] && assocMatch[1] !== 'other')
      ? assocMatch[1]
      : submission.organiser;

    queueApprovalOutreachEmail({
      contactEmail: submission.contact_email,
      contactName: submission.organiser,
      eventName: submission.event_name,
      association,
      region: submission.region ?? undefined,
    }).catch((err) => console.error('Approval outreach email failed:', err));
  }

  revalidatePath('/');
  revalidatePath('/calendar');
  revalidatePath('/weekly');
  revalidatePath('/submit-event');
  revalidatePath('/admin');
  revalidatePath('/admin/events');
}

export async function rejectSubmissionAction(formData: FormData) {
  await ensureAdminSession();

  const submissionId = parseRequired(formData, 'submissionId');
  const message = ((formData.get('message') as string | null) ?? '').trim();
  const supabase = createSupabaseAdminServerClient();

  // Load the submission first so we have the submitter's email + event name
  // for the (optional) rejection email.
  const { data: submission } = await supabase
    .from('event_submissions')
    .select('contact_email, event_name')
    .eq('id', submissionId)
    .maybeSingle();

  const { error } = await supabase.from('event_submissions').update({ status: 'rejected' }).eq('id', submissionId);

  if (error) {
    console.error('Reject submission failed:', error.message);
    throw new Error('Failed to reject submission');
  }

  // Only email the submitter if the admin actually wrote a message. Blank =
  // silent reject (the original behaviour). Fire-and-forget — never blocks.
  const resendKey = process.env.RESEND_API_KEY;
  if (message && resendKey && submission?.contact_email) {
    const eventName = submission.event_name ?? 'your event';
    new Resend(resendKey).emails.send({
      from: 'Investigator Events <info@investigatorevents.com>',
      to: submission.contact_email,
      subject: `About your event submission — ${eventName}`,
      html: buildSubmissionRejectedEmail(eventName, message),
    }).catch((err) => console.error('Rejection email failed:', err));
  }

  revalidatePath('/submit-event');
  revalidatePath('/admin');
  revalidatePath('/admin/events');
}

// Move a submission to the archive — a soft hold (not approved, not rejected).
export async function archiveSubmissionAction(formData: FormData) {
  await ensureAdminSession();

  const submissionId = parseRequired(formData, 'submissionId');
  const supabase = createSupabaseAdminServerClient();
  const { error } = await supabase.from('event_submissions').update({ status: 'archived' }).eq('id', submissionId);

  if (error) {
    console.error('Archive submission failed:', error.message);
    throw new Error('Failed to archive submission');
  }

  revalidatePath('/admin');
  revalidatePath('/admin/events');
}

// Pull a submission back out of the archive into the active pending queue.
export async function restoreSubmissionAction(formData: FormData) {
  await ensureAdminSession();

  const submissionId = parseRequired(formData, 'submissionId');
  const supabase = createSupabaseAdminServerClient();
  const { error } = await supabase.from('event_submissions').update({ status: 'pending' }).eq('id', submissionId);

  if (error) {
    console.error('Restore submission failed:', error.message);
    throw new Error('Failed to restore submission');
  }

  revalidatePath('/admin');
  revalidatePath('/admin/events');
}

export async function toggleUserVerifiedAction(formData: FormData) {
  await ensureAdminSession();

  const userId = parseRequired(formData, 'userId');
  const currentlyVerified = formData.get('currentlyVerified') === 'true';
  const supabase = createSupabaseAdminServerClient();

  const { error } = await supabase
    .from('profiles')
    .update({ is_verified: !currentlyVerified } as any)
    .eq('id', userId);

  if (error) {
    console.error('Verification update failed:', error.message);
    throw new Error('Failed to update verification');
  }

  revalidatePath('/admin');
}

export async function toggleUserPublicAction(formData: FormData) {
  await ensureAdminSession();

  const userId = parseRequired(formData, 'userId');
  const currentlyPublic = formData.get('currentlyPublic') === 'true';
  const supabase = createSupabaseAdminServerClient();

  const { error } = await supabase
    .from('profiles')
    .update({ is_public: !currentlyPublic } as any)
    .eq('id', userId);

  if (error) {
    console.error('Privacy toggle failed:', error.message);
    throw new Error('Failed to update privacy');
  }

  revalidatePath('/admin');
}

export async function adminAddAssociationAction(formData: FormData) {
  await ensureAdminSession();

  const userId = parseRequired(formData, 'userId');
  const associationName = parseRequired(formData, 'associationName');
  const supabase = createSupabaseAdminServerClient();

  const slug = associationName.toLowerCase().replace(/\s+/g, '-');

  // Check if already exists
  const { data: existing } = await supabase
    .from('user_associations')
    .select('id')
    .eq('user_id', userId)
    .eq('association_name', associationName)
    .maybeSingle();

  if (existing) {
    revalidatePath('/admin');
    return;
  }

  const { error } = await supabase
    .from('user_associations')
    .insert({ user_id: userId, association_name: associationName, association_slug: slug });

  if (error) {
    console.error('Add association failed:', error.message);
    throw new Error('Failed to add association');
  }

  revalidatePath('/admin');
}

export async function adminRemoveAssociationAction(formData: FormData) {
  await ensureAdminSession();

  const userId = parseRequired(formData, 'userId');
  const associationName = parseRequired(formData, 'associationName');
  const supabase = createSupabaseAdminServerClient();

  const { error } = await supabase
    .from('user_associations')
    .delete()
    .eq('user_id', userId)
    .eq('association_name', associationName);

  if (error) {
    console.error('Remove association failed:', error.message);
    throw new Error('Failed to remove association');
  }

  revalidatePath('/admin');
}
