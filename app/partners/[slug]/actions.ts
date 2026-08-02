'use server';

import { Resend } from 'resend';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { assertSameOriginRequest, escapeHtml } from '@/lib/security/server';

export interface PartnerRequestResult {
  ok: boolean;
  error?: string;
}

export async function submitPartnerRequestAction(formData: FormData): Promise<PartnerRequestResult> {
  assertSameOriginRequest();

  // Honeypot — real users never fill this hidden field.
  if (String(formData.get('website_url') ?? '').trim()) return { ok: true };

  const associationSlug = String(formData.get('associationSlug') ?? '').trim();
  const associationName = String(formData.get('associationName') ?? '').trim();
  const contactName = String(formData.get('contactName') ?? '').trim();
  const contactEmail = String(formData.get('contactEmail') ?? '').trim();
  const webmasterEmail = String(formData.get('webmasterEmail') ?? '').trim() || null;
  const message = String(formData.get('message') ?? '').trim().slice(0, 2000) || null;

  if (!associationSlug || !associationName || !contactName || !contactEmail) {
    return { ok: false, error: 'Please fill in your name and email.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
    return { ok: false, error: 'That email address doesn’t look right.' };
  }

  const supabase = createSupabaseAdminServerClient();
  const { error } = await supabase.from('partner_requests').insert({
    association_slug: associationSlug,
    association_name: associationName,
    contact_name: contactName,
    contact_email: contactEmail,
    webmaster_email: webmasterEmail,
    message,
  });
  if (error) return { ok: false, error: 'Something went wrong — please try again or email us.' };

  // Alert the team; a lost partner request is a lost association.
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'Investigator Events <info@investigatorevents.com>',
      to: 'info@investigatorevents.com',
      subject: `🤝 Widget request from ${associationName}`,
      html: `<p><b>${escapeHtml(associationName)}</b> wants the events widget on their site.</p>
<p>Contact: ${escapeHtml(contactName)} &lt;${escapeHtml(contactEmail)}&gt;<br>
Web person: ${webmasterEmail ? escapeHtml(webmasterEmail) : '—'}<br>
Message: ${message ? escapeHtml(message) : '—'}</p>
<p>Partner page: https://www.investigatorevents.com/partners/${escapeHtml(associationSlug)}</p>`,
    });
  } catch {
    /* the DB row is the source of truth; email is best-effort */
  }

  return { ok: true };
}
