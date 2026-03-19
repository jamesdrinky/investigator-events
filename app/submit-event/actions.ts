'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import type { EventSubmissionInsert } from '@/lib/data/event-submissions';
import { normalizeRequiredUrl } from '@/lib/utils/url';

function parseRequired(formData: FormData, key: string): string {
  const value = String(formData.get(key) ?? '').trim();

  if (!value) {
    throw new Error(`Missing required field: ${key}`);
  }

  return value;
}

function parseSubmissionData(formData: FormData): Omit<EventSubmissionInsert, 'id' | 'status' | 'created_at'> {
  const eventName = parseRequired(formData, 'eventName');
  const organiser = parseRequired(formData, 'organiser');
  const city = parseRequired(formData, 'city');
  const region = parseRequired(formData, 'region');
  const country = parseRequired(formData, 'country');
  const startDate = parseRequired(formData, 'startDate');
  const category = parseRequired(formData, 'category');
  const website = normalizeRequiredUrl(parseRequired(formData, 'website'));
  const contactEmail = parseRequired(formData, 'contactEmail');
  const eventScopeRaw = parseRequired(formData, 'eventScope');
  const endDate = String(formData.get('endDate') ?? '').trim();
  const notes = String(formData.get('notes') ?? '').trim();
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

export async function submitEventAction(formData: FormData) {
  const payload = parseSubmissionData(formData);
  const supabase = createSupabaseAdminServerClient();
  const { error } = await supabase.from('event_submissions').insert({
    ...payload,
    status: 'pending'
  });

  if (error) {
    redirect('/submit-event?status=error');
  }

  revalidatePath('/submit-event');
  revalidatePath('/admin');
  revalidatePath('/admin/events');
  redirect('/submit-event?status=success');
}
