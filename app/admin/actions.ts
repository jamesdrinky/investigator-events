'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { timingSafeEqual } from 'crypto';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import type { EventInsert, EventUpdate } from '@/lib/data/events';
import type { EventSubmissionInsert } from '@/lib/data/event-submissions';
import type { Database } from '@/lib/types/database';
import { assertSameOriginRequest, enforceRateLimit } from '@/lib/security/server';
import { slugifyEventTitle } from '@/lib/utils/event-slugs';
import { normalizeRequiredUrl } from '@/lib/utils/url';
import {
  clearAdminSessionCookie,
  createAdminSessionToken,
  hasValidAdminSessionCookie,
  setAdminSessionCookie
} from '@/lib/admin/session';

function ensureAdminSession() {
  if (!hasValidAdminSessionCookie()) {
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
    throw new Error(`Failed to check existing slugs: ${error.message}`);
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
    featured: formData.get('featured') === 'on',
    approved: true
  };
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
  assertSameOriginRequest();
  enforceRateLimit('admin-login', {
    maxRequests: 10,
    windowMs: 15 * 60 * 1000
  });

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

  setAdminSessionCookie(createAdminSessionToken());
  redirect('/admin');
}

export async function adminLogoutAction() {
  clearAdminSessionCookie();
  redirect('/admin');
}

export async function createEventAction(formData: FormData) {
  ensureAdminSession();

  const payload = await parseEventData(formData);
  const supabase = createSupabaseAdminServerClient();
  const { error } = await supabase.from('events').insert(payload);

  if (error) {
    throw new Error(`Failed to create event: ${error.message}`);
  }

  revalidatePath('/');
  revalidatePath('/calendar');
  revalidatePath('/weekly');
  revalidatePath('/admin');
  revalidatePath('/admin/events');
}

export async function updateEventAction(formData: FormData) {
  ensureAdminSession();

  const id = parseRequired(formData, 'id');
  const payload: EventUpdate = await parseEventData(formData, id);
  const supabase = createSupabaseAdminServerClient();
  const { error } = await supabase.from('events').update(payload).eq('id', id);

  if (error) {
    throw new Error(`Failed to update event: ${error.message}`);
  }

  revalidatePath('/');
  revalidatePath('/calendar');
  revalidatePath('/weekly');
  revalidatePath('/admin');
  revalidatePath('/admin/events');
}

export async function deleteEventAction(formData: FormData) {
  ensureAdminSession();

  const id = parseRequired(formData, 'id');
  const supabase = createSupabaseAdminServerClient();
  const { error } = await supabase.from('events').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete event: ${error.message}`);
  }

  revalidatePath('/');
  revalidatePath('/calendar');
  revalidatePath('/weekly');
  revalidatePath('/admin');
  revalidatePath('/admin/events');
}

export async function approveSubmissionAction(formData: FormData) {
  ensureAdminSession();

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
    throw new Error(`Failed to load submission: ${submissionError.message}`);
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
    throw new Error(`Failed to approve event submission: ${createError.message}`);
  }

  const { error: updateError } = await supabase
    .from('event_submissions')
    .update({ status: 'approved' })
    .eq('id', submissionId);

  if (updateError) {
    throw new Error(`Failed to update submission status: ${updateError.message}`);
  }

  revalidatePath('/');
  revalidatePath('/calendar');
  revalidatePath('/weekly');
  revalidatePath('/submit-event');
  revalidatePath('/admin');
  revalidatePath('/admin/events');
}

export async function rejectSubmissionAction(formData: FormData) {
  ensureAdminSession();

  const submissionId = parseRequired(formData, 'submissionId');
  const supabase = createSupabaseAdminServerClient();
  const { error } = await supabase.from('event_submissions').update({ status: 'rejected' }).eq('id', submissionId);

  if (error) {
    throw new Error(`Failed to reject submission: ${error.message}`);
  }

  revalidatePath('/submit-event');
  revalidatePath('/admin');
  revalidatePath('/admin/events');
}
