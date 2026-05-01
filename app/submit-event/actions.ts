'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Resend } from 'resend';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import type { EventSubmissionInsert } from '@/lib/data/event-submissions';
import { eventRegions } from '@/lib/forms/event-form-options';
import { assertSameOriginRequest, enforceRateLimit, verifySignedFormState } from '@/lib/security/server';
import { normalizeRequiredUrl } from '@/lib/utils/url';
import { buildSubmissionConfirmationEmail } from '@/lib/email/submission-confirmation';

const categories = new Set(['Conference', 'Training', 'Association Meeting', 'Seminar', 'Expo', 'Summit']);
const regions = new Set(eventRegions);
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;

function sanitizeText(value: string, maxLength: number) {
  return value.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function parseRequired(formData: FormData, key: string, maxLength: number): string {
  const value = sanitizeText(String(formData.get(key) ?? ''), maxLength);

  if (!value) {
    throw new Error(`Missing required field: ${key}`);
  }

  return value;
}

function parseOptional(formData: FormData, key: string, maxLength: number): string {
  return sanitizeText(String(formData.get(key) ?? ''), maxLength);
}

function parseEmail(formData: FormData, key: string) {
  const value = parseRequired(formData, key, 160).toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new Error('Invalid email');
  }

  return value;
}

function parseDateValue(formData: FormData, key: string, required = true) {
  const value = parseOptional(formData, key, 10);

  if (!value) {
    if (required) {
      throw new Error(`Missing required field: ${key}`);
    }

    return '';
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value))) {
    throw new Error(`Invalid date: ${key}`);
  }

  return value;
}

function parseSubmissionData(formData: FormData): Omit<EventSubmissionInsert, 'id' | 'status' | 'created_at'> {
  assertSameOriginRequest();
  enforceRateLimit('submit-event', {
    maxRequests: RATE_LIMIT_MAX_REQUESTS,
    windowMs: RATE_LIMIT_WINDOW_MS
  });

  const honeypot = parseOptional(formData, 'companyWebsite', 200);
  if (honeypot) {
    throw new Error('Bot submission');
  }

  verifySignedFormState(
    'submit-event',
    parseRequired(formData, 'issuedAt', 20),
    parseRequired(formData, 'formToken', 200)
  );

  const eventName = parseRequired(formData, 'eventName', 140);
  const organiser = parseRequired(formData, 'organiser', 140);
  const city = parseRequired(formData, 'city', 120);
  const region = parseRequired(formData, 'region', 40);
  const country = parseRequired(formData, 'country', 120);
  const startDate = parseDateValue(formData, 'startDate');
  const category = parseRequired(formData, 'category', 60);
  const website = normalizeRequiredUrl(parseRequired(formData, 'website', 300));
  const contactEmail = parseEmail(formData, 'contactEmail');
  const eventScopeRaw = parseRequired(formData, 'eventScope', 20);
  const endDate = parseDateValue(formData, 'endDate', false);
  const association = parseOptional(formData, 'association', 140);
  const rawNotes = parseOptional(formData, 'notes', 2000);
  const notes = association && association !== 'other'
    ? `[Association: ${association}]\n${rawNotes}`.trim()
    : rawNotes;
  const eventScope = eventScopeRaw === 'secondary' ? 'secondary' : 'main';

  if (!regions.has(region as (typeof eventRegions)[number])) {
    throw new Error('Invalid region');
  }

  if (!categories.has(category)) {
    throw new Error('Invalid category');
  }

  if (endDate && new Date(endDate).getTime() < new Date(startDate).getTime()) {
    throw new Error('Invalid end date');
  }

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

export async function submitEventAction(formData: FormData) {
  try {
    const payload = parseSubmissionData(formData);
    const supabase = createSupabaseAdminServerClient();
    const { error } = await supabase.from('event_submissions').insert({
      ...payload,
      status: 'pending'
    });

    if (error) {
      console.error('submitEventAction insert failed', error);
      redirect('/submit-event?status=error');
    }

    // Send confirmation email to submitter (fire-and-forget)
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const resend = new Resend(resendKey);
      resend.emails.send({
        from: 'Investigator Events <info@investigatorevents.com>',
        to: payload.contact_email,
        subject: `Event received — ${payload.event_name}`,
        html: buildSubmissionConfirmationEmail(payload.event_name),
      }).catch((err) => console.error('Submission confirmation email failed:', err));
    }

    revalidatePath('/submit-event');
    revalidatePath('/list-your-event');
    revalidatePath('/admin');
    revalidatePath('/admin/events');
    redirect('/submit-event?status=success');
  } catch (error) {
    // Re-throw Next.js redirect errors — they use error.digest, not error.message
    if (error instanceof Error && 'digest' in error && typeof (error as any).digest === 'string' && (error as any).digest.startsWith('NEXT_REDIRECT')) {
      throw error;
    }

    console.error('submitEventAction failed', error instanceof Error ? error.message : error);
    redirect('/submit-event?status=error');
  }
}
