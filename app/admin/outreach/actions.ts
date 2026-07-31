'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { hasValidAdminSessionCookie } from '@/lib/admin/session';
import { assertSameOriginRequest } from '@/lib/security/server';

const STATUSES = ['not_started', 'sent', 'replied', 'shared', 'partner', 'declined'] as const;
export type OutreachStatus = (typeof STATUSES)[number];

async function ensureAdmin() {
  if (!(await hasValidAdminSessionCookie())) {
    redirect('/admin?error=auth');
  }
}

export async function updateOutreachAction(formData: FormData) {
  assertSameOriginRequest();
  await ensureAdmin();

  const eventId = String(formData.get('eventId') ?? '').trim();
  if (!eventId) throw new Error('Missing eventId');

  const status = String(formData.get('status') ?? '').trim();
  if (!STATUSES.includes(status as OutreachStatus)) throw new Error('Invalid status');

  const contactName = String(formData.get('contactName') ?? '').trim() || null;
  const contactEmail = String(formData.get('contactEmail') ?? '').trim() || null;
  const notes = String(formData.get('notes') ?? '').trim() || null;

  const supabase = createSupabaseAdminServerClient();
  const { error } = await supabase.from('event_outreach').upsert({
    event_id: eventId,
    status,
    contact_name: contactName,
    contact_email: contactEmail,
    notes,
    // Moving into "sent" stamps the contact date; other edits keep it.
    ...(status === 'sent' ? { last_contacted_at: new Date().toISOString() } : {}),
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(`Outreach update failed: ${error.message}`);

  revalidatePath('/admin/outreach');
}
