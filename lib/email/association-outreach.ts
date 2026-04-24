import { Resend } from 'resend';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';

const SITE = 'https://investigatorevents.com';
const LOGO = `${SITE}/logo/ielogo1.PNG`;
const WAVE = `${SITE}/email/wave-banner.png`;

const C = {
  blue: '#2563eb',
  purple: '#7c3aed',
  dark: '#0f172a',
  body: '#334155',
  muted: '#64748b',
  faint: '#94a3b8',
  border: '#e2e8f0',
  white: '#ffffff',
};

function signatureBlock() {
  return `
  <table cellpadding="0" cellspacing="0" border="0" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:13px;color:${C.dark};line-height:1.4;">
    <tr>
      <td colspan="2" style="padding-bottom:14px;">
        <!-- Gradient divider with solid fallback for Outlook -->
        <table cellpadding="0" cellspacing="0" border="0" width="320"><tr>
          <td width="107" style="height:2px;background-color:${C.blue};font-size:0;line-height:0;">&nbsp;</td>
          <td width="106" style="height:2px;background-color:${C.purple};font-size:0;line-height:0;">&nbsp;</td>
          <td width="107" style="height:2px;background-color:#06b6d4;font-size:0;line-height:0;">&nbsp;</td>
        </tr></table>
      </td>
    </tr>
    <tr>
      <td width="56" valign="top" style="padding-right:14px;">
        <img src="${LOGO}" alt="IE" width="48" height="48" style="display:block;width:48px;height:48px;border-radius:50%;border:0;" />
      </td>
      <td valign="top">
        <table cellpadding="0" cellspacing="0" border="0">
          <tr><td style="font-size:14px;font-weight:700;color:${C.dark};padding-bottom:1px;">Mike LaCorte</td></tr>
          <tr><td style="font-size:12px;color:${C.muted};padding-bottom:6px;">Founder, Investigator Events</td></tr>
          <tr><td style="font-size:12px;color:${C.body};">
            <a href="mailto:info@investigatorevents.com" style="color:${C.blue};text-decoration:none;">info@investigatorevents.com</a>
            &nbsp;&middot;&nbsp;
            <a href="${SITE}" style="color:${C.blue};text-decoration:none;">investigatorevents.com</a>
          </td></tr>
        </table>
      </td>
    </tr>
  </table>`;
}

interface ApprovalOutreachParams {
  contactEmail: string;
  contactName: string;
  eventName: string;
  association: string;
  region?: string;
}

export function buildApprovalOutreachEmail(params: ApprovalOutreachParams): string {
  const { contactName, eventName, association } = params;

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f0f4f8;padding:24px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;width:100%;">

        <!-- Wave banner header -->
        <tr><td>
          <img src="${WAVE}" alt="" width="560" style="display:block;width:100%;height:auto;" />
        </td></tr>

        <!-- Logo bar -->
        <tr><td style="background-color:${C.white};padding:20px 0 0;text-align:center;">
          <img src="${LOGO}" alt="Investigator Events" width="40" height="40" style="display:inline-block;width:40px;height:40px;border-radius:50%;" />
        </td></tr>

        <!-- Body -->
        <tr><td style="background-color:${C.white};padding:20px 32px 32px;">
          <p style="margin:0;font-size:15px;color:${C.body};line-height:1.7;">
            Dear ${contactName},
          </p>

          <p style="margin:16px 0 0;font-size:15px;color:${C.body};line-height:1.7;">
            Thank you for getting in touch and for submitting <strong>${eventName}</strong> to Investigator Events. I'm delighted to confirm that your event is now approved and live on the calendar at <a href="${SITE}" style="color:${C.blue};text-decoration:none;">investigatorevents.com</a>.
          </p>

          <p style="margin:16px 0 0;font-size:15px;color:${C.body};line-height:1.7;">
            Investigator Events was founded to give our profession a single, freely accessible home for conferences, training and community gatherings worldwide. It is open to every investigator, whether they belong to an association or not, and it exists to support associations like yours rather than compete with them. The more associations that list their events with us, the stronger the global calendar becomes for everyone.
          </p>

          <p style="margin:16px 0 0;font-size:15px;color:${C.body};line-height:1.7;">
            With that in mind, I would be very grateful if you could send a short circular to your members encouraging them to do three things. First, to visit <a href="${SITE}" style="color:${C.blue};text-decoration:none;">investigatorevents.com</a> and take a look at the calendar. Second, to subscribe so they receive notifications of upcoming events. And third, to set up a profile, which lets them connect with fellow investigators across jurisdictions and follow the events and associations that matter to them.
          </p>

          <p style="margin:16px 0 0;font-size:15px;color:${C.body};line-height:1.7;">
            To make that easier, I've drafted a short paragraph below that you are welcome to use as it stands, adapt, or rewrite entirely as you see fit.
          </p>

          <!-- Suggested copy block -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
            <tr>
              <td width="3" style="background-color:${C.blue};">&nbsp;</td>
              <td style="padding:20px 24px;background-color:#f8fafc;">
                <p style="margin:0;font-size:13px;font-weight:600;color:${C.muted};text-transform:uppercase;letter-spacing:0.05em;">
                  Suggested copy for members
                </p>
                <p style="margin:12px 0 0;font-size:14px;color:${C.body};line-height:1.7;font-style:italic;">
                  We are pleased to let you know that our events are now listed on Investigator Events (<a href="${SITE}" style="color:${C.blue};text-decoration:none;">investigatorevents.com</a>), a free global calendar and community platform for the private investigations profession. We encourage you to visit the site, subscribe for event updates and set up a profile so you can connect with colleagues worldwide and stay informed of what is happening across our industry.
                </p>
              </td>
            </tr>
          </table>

          <p style="margin:16px 0 0;font-size:15px;color:${C.body};line-height:1.7;">
            If there is anything I can help with as you get going, whether that's adding further events, updating listings or exploring any of the community features, please just drop me a line.
          </p>

          <p style="margin:16px 0 0;font-size:15px;color:${C.body};line-height:1.7;">
            Thank you again for supporting the platform. I look forward to working with ${association}.
          </p>

          <p style="margin:24px 0 0;font-size:15px;color:${C.body};line-height:1.7;">
            Warm regards,
          </p>

          <!-- Signature -->
          <table cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;"><tr><td>
            ${signatureBlock()}
          </td></tr></table>
        </td></tr>

        <!-- Thin brand divider -->
        <tr><td>
          <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td width="33%" style="height:3px;background-color:${C.blue};font-size:0;line-height:0;">&nbsp;</td>
            <td width="34%" style="height:3px;background-color:${C.purple};font-size:0;line-height:0;">&nbsp;</td>
            <td width="33%" style="height:3px;background-color:#06b6d4;font-size:0;line-height:0;">&nbsp;</td>
          </tr></table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 8px 8px;text-align:center;">
          <p style="margin:0;font-size:11px;color:${C.faint};">
            Investigator Events &middot;
            <a href="mailto:info@investigatorevents.com" style="color:${C.faint};text-decoration:none;">info@investigatorevents.com</a>
          </p>
          <p style="margin:4px 0 0;font-size:10px;color:${C.faint};">
            The global PI conference calendar.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * Queue the approval outreach email with a random 2-6 hour delay.
 * Only queues once per association — skips if already queued or sent.
 */
export async function queueApprovalOutreachEmail(params: ApprovalOutreachParams): Promise<boolean> {
  const supabase = createSupabaseAdminServerClient();

  // Check if we've already queued or sent an outreach to this association
  const normalizedAssociation = params.association.trim().toLowerCase();
  const { data: existing } = await supabase
    .from('outreach_sends')
    .select('id')
    .ilike('association', normalizedAssociation)
    .limit(1)
    .maybeSingle();

  if (existing) {
    console.log(`Outreach already queued/sent to "${params.association}" — skipping`);
    return false;
  }

  // Random delay: 2-6 hours from now
  const delayMs = (2 + Math.random() * 4) * 60 * 60 * 1000;
  const sendAfter = new Date(Date.now() + delayMs).toISOString();
  const subject = `${params.eventName} is live on Investigator Events`;
  const html = buildApprovalOutreachEmail(params);

  const { error } = await supabase.from('outreach_sends').insert({
    recipient_email: params.contactEmail,
    recipient_name: params.contactName,
    association: params.association,
    region: params.region ?? null,
    sender: 'mike',
    subject,
    event_name: params.eventName,
    html,
    status: 'pending',
    send_after: sendAfter,
  } as any);

  if (error) {
    console.error('Failed to queue outreach email:', error.message);
    return false;
  }

  console.log(`Outreach to "${params.association}" queued — will send after ${sendAfter}`);
  return true;
}

/**
 * Process the outreach queue — sends any emails where send_after has passed.
 * Called by the cron job.
 */
export async function processOutreachQueue(): Promise<{ sent: number; failed: number }> {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.warn('RESEND_API_KEY not set — skipping outreach queue');
    return { sent: 0, failed: 0 };
  }

  const supabase = createSupabaseAdminServerClient();
  const resend = new Resend(resendKey);

  // Get all pending sends where send_after has passed
  const { data: pending, error: fetchError } = await supabase
    .from('outreach_sends')
    .select('*')
    .eq('status', 'pending')
    .lte('send_after', new Date().toISOString())
    .order('send_after', { ascending: true })
    .limit(10);

  if (fetchError || !pending?.length) {
    return { sent: 0, failed: 0 };
  }

  let sent = 0;
  let failed = 0;

  for (const row of pending as any[]) {
    const { data, error } = await resend.emails.send({
      from: 'Mike LaCorte <info@investigatorevents.com>',
      to: row.recipient_email,
      subject: row.subject,
      html: row.html,
      tags: [
        { name: 'type', value: 'approval-outreach' },
        { name: 'association', value: row.association },
        ...(row.region ? [{ name: 'region', value: row.region }] : []),
      ],
    });

    if (error) {
      console.error(`Outreach to "${row.association}" failed:`, error.message);
      try {
        await supabase.from('outreach_sends')
          .update({ status: 'failed' } as any)
          .eq('id', row.id);
      } catch (dbErr) {
        console.error(`Failed to mark outreach as failed for "${row.association}":`, dbErr);
      }
      failed++;
    } else {
      try {
        await supabase.from('outreach_sends')
          .update({ status: 'sent', resend_id: data?.id, sent_at: new Date().toISOString() } as any)
          .eq('id', row.id);
      } catch (dbErr) {
        console.error(`Failed to mark outreach as sent for "${row.association}":`, dbErr);
      }
      sent++;
    }
  }

  return { sent, failed };
}
