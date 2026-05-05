import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { hasValidAdminSessionCookie } from '@/lib/admin/session';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { buildIntroductionOutreachEmail, buildColdOutreachEmail, buildApprovalOutreachEmail } from '@/lib/email/association-outreach';
import { assertSameOriginRequest } from '@/lib/security/server';

export async function POST(request: Request) {
  assertSameOriginRequest();
  if (!await hasValidAdminSessionCookie()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
  }

  const body = await request.json();
  const { recipientEmail, contactName, association, template, eventNames, eventSlugs, slug, memberCount } = body;

  if (!recipientEmail || !association || !template) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Build the email
  let html: string;
  let subject: string;

  if (template === 'cold') {
    html = buildColdOutreachEmail({ contactName: contactName || 'The Team', association, slug, memberCount: memberCount ?? 0 });
    subject = `Introducing Investigator Events — free global PI calendar`;
  } else if (template === 'introduction') {
    html = buildIntroductionOutreachEmail({ contactName: contactName || association, association, eventNames: eventNames ?? [], eventSlugs: eventSlugs ?? [], memberCount: memberCount ?? 0, slug });
    subject = `${association}'s events are live on Investigator Events`;
  } else {
    // approval template
    html = buildApprovalOutreachEmail({ contactEmail: recipientEmail, contactName: contactName || association, eventName: eventNames?.[0] ?? 'your event', association });
    subject = `${eventNames?.[0] ?? 'Your event'} is live on Investigator Events`;
  }

  // Send via Resend
  const resend = new Resend(resendKey);
  const { error: sendError } = await resend.emails.send({
    from: 'Mike LaCorte <info@investigatorevents.com>',
    to: [recipientEmail],
    subject,
    html,
  });

  if (sendError) {
    console.error('Outreach send failed:', sendError);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }

  // Log to outreach_sends
  const supabase = createSupabaseAdminServerClient();
  await (supabase.from('outreach_sends' as any).insert({
    recipient_email: recipientEmail,
    recipient_name: contactName || association,
    association,
    sender: 'mike',
    subject,
    event_name: eventNames?.[0] ?? null,
    html,
    status: 'sent',
    send_after: new Date().toISOString(),
    sent_at: new Date().toISOString(),
  } as any) as any).then(() => {}).catch(() => {});

  return NextResponse.json({ ok: true });
}
