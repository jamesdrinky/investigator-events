/**
 * The weekly "send us a video for your conference" nudge.
 *
 * Shape of the thing: when an event is approved we enqueue the whole sequence
 * up front (see VIDEO_REMINDER_STEPS) rather than scheduling the next one each
 * time a send succeeds. Enqueuing up front means a missed cron run delays a
 * nudge instead of silently ending the sequence.
 *
 * The sequence stops the moment a video lands — that is the entire point, and
 * organisers who have already done the thing must never be asked again.
 */
import { Resend } from 'resend';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { escapeHtml } from '@/lib/security/server';
import { isFeatureEnabled, VIDEO_REMINDERS_FLAG } from '@/lib/data/feature-flags';

const SITE = 'https://investigatorevents.com';
const LOGO = `${SITE}/logo/ielogo1.PNG`;
const WAVE = `${SITE}/email/wave-banner.png`;
const FROM = 'Investigator Events <info@investigatorevents.com>';

const C = {
  blue: '#2563eb',
  dark: '#0f172a',
  body: '#334155',
  muted: '#64748b',
  faint: '#94a3b8',
  border: '#e2e8f0',
  white: '#ffffff',
};

/**
 * Four nudges over four weeks, then silence. The copy escalates from offer to
 * last-call rather than repeating itself — the same email four times is how a
 * sequence gets marked as spam.
 */
export const VIDEO_REMINDER_STEPS: Array<{
  step: number;
  afterDays: number;
  subject: (eventName: string) => string;
  lead: (eventName: string) => string;
}> = [
  {
    step: 1,
    afterDays: 7,
    subject: (e) => `Want a video for ${e}?`,
    lead: (e) =>
      `${e} is live on Investigator Events and people are already finding it. The listings that fill rooms are the ones with a face and a voice attached — so we would like to put a short video of yours on the page, free.`,
  },
  {
    step: 2,
    afterDays: 14,
    subject: (e) => `A 45-second clip for ${e}`,
    lead: (e) =>
      `No studio needed for this. A phone, good light, 45 seconds of you saying who ${e} is for and why someone should come. That is genuinely all it takes, and we handle the rest.`,
  },
  {
    step: 3,
    afterDays: 21,
    subject: (e) => `Still happy to feature ${e}`,
    lead: (e) =>
      `The offer on ${e} is still open. Associations that added a video saw their event page hold attention several times longer than the text-only listings — it is the single cheapest thing you can do for turnout.`,
  },
  {
    step: 4,
    afterDays: 28,
    subject: (e) => `Last call on the video for ${e}`,
    lead: (e) =>
      `This is the last time we will raise it — no hard feelings either way. If you would still like a video on the ${e} page, the upload link below stays open.`,
  },
];

export function buildVideoReminderEmail(opts: {
  eventName: string;
  recipientName: string | null;
  uploadUrl: string;
  optOutUrl: string;
  lead: string;
  isFinal: boolean;
}): string {
  const safeName = escapeHtml(opts.eventName);
  const greeting = opts.recipientName ? `Hi ${escapeHtml(opts.recipientName)},` : 'Hi,';
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f0f4f8;padding:24px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;width:100%;">

        <tr><td>
          <img src="${WAVE}" alt="" width="560" style="display:block;width:100%;height:auto;" />
        </td></tr>

        <tr><td style="background-color:${C.white};padding:20px 0 0;text-align:center;">
          <img src="${LOGO}" alt="Investigator Events" width="40" height="40" style="display:inline-block;width:40px;height:40px;border-radius:50%;" />
        </td></tr>

        <tr><td style="background-color:${C.white};padding:24px 32px 8px;">
          <p style="margin:0;font-size:15px;color:${C.body};line-height:1.6;">${greeting}</p>
          <p style="margin:14px 0 0;font-size:15px;color:${C.body};line-height:1.6;">${escapeHtml(opts.lead)}</p>
        </td></tr>

        <!-- What we need -->
        <tr><td style="background-color:${C.white};padding:20px 32px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border:1px solid ${C.border};border-radius:12px;">
            <tr><td style="padding:18px 20px;">
              <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${C.muted};">What we need</p>
              <p style="margin:10px 0 0;font-size:14px;color:${C.body};line-height:1.7;">
                Up to 45 seconds &middot; filmed on a phone is fine &middot; landscape if you can<br />
                Who ${safeName} is for, what they will get, and when it is
              </p>
            </td></tr>
          </table>
        </td></tr>

        <!-- CTA -->
        <tr><td style="background-color:${C.white};padding:24px 32px 0;text-align:center;">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${opts.uploadUrl}" style="height:46px;v-text-anchor:middle;width:220px;" arcsize="50%" fillcolor="${C.dark}" stroke="false">
            <w:anchorlock/>
            <center style="color:#ffffff;font-family:sans-serif;font-size:14px;font-weight:600;">Upload your video</center>
          </v:roundrect>
          <![endif]-->
          <!--[if !mso]><!-- -->
          <a href="${opts.uploadUrl}" style="display:inline-block;padding:14px 36px;background-color:${C.dark};color:${C.white};text-decoration:none;font-size:14px;font-weight:600;border-radius:99px;">
            Upload your video
          </a>
          <!--<![endif]-->
        </td></tr>

        <tr><td style="background-color:${C.white};padding:20px 32px 32px;text-align:center;">
          <p style="margin:0;font-size:13px;color:${C.muted};line-height:1.6;">
            Free while we build the video library. Reply to this email if you would rather we helped put it together.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 32px 0;text-align:center;">
          <p style="margin:0;font-size:12px;color:${C.faint};line-height:1.6;">
            ${
              opts.isFinal
                ? 'This is the last reminder we will send about this event.'
                : `<a href="${opts.optOutUrl}" style="color:${C.faint};text-decoration:underline;">Stop reminders about this event</a>`
            }
          </p>
          <p style="margin:8px 0 0;font-size:12px;color:${C.faint};">
            <a href="mailto:info@investigatorevents.com" style="color:${C.faint};text-decoration:none;">info@investigatorevents.com</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export interface EnqueueVideoRemindersInput {
  eventSubmissionId: string | null;
  eventName: string;
  eventSlug: string | null;
  associationSlug: string | null;
  recipientEmail: string;
  recipientName: string | null;
}

/**
 * Book the whole sequence at approval time. Idempotent via the unique index on
 * (recipient_email, event_name, step) — re-approving a submission is a no-op
 * rather than a second sequence.
 */
export async function enqueueVideoReminders(input: EnqueueVideoRemindersInput): Promise<{ queued: number }> {
  if (!input.recipientEmail) return { queued: 0 };

  const supabase = createSupabaseAdminServerClient();
  const now = Date.now();
  const rows = VIDEO_REMINDER_STEPS.map((s) => ({
    event_submission_id: input.eventSubmissionId,
    event_name: input.eventName,
    event_slug: input.eventSlug,
    association_slug: input.associationSlug,
    recipient_email: input.recipientEmail.toLowerCase(),
    recipient_name: input.recipientName,
    step: s.step,
    send_after: new Date(now + s.afterDays * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
  }));

  const { data, error } = await (supabase
    .from('video_reminders' as never)
    .upsert(rows as never, { onConflict: 'recipient_email,event_name,step', ignoreDuplicates: true })
    .select('id') as unknown as Promise<{ data: unknown[] | null; error: { message: string } | null }>);

  if (error) {
    console.error('Enqueue video reminders failed:', error.message);
    return { queued: 0 };
  }
  return { queued: data?.length ?? 0 };
}

/** Stop every remaining nudge in a sequence. */
async function cancelRemaining(
  supabase: ReturnType<typeof createSupabaseAdminServerClient>,
  recipientEmail: string,
  eventName: string,
  reason: string
): Promise<void> {
  await (supabase
    .from('video_reminders' as never)
    .update({ status: 'cancelled', cancelled_reason: reason } as never)
    .eq('recipient_email', recipientEmail)
    .eq('event_name', eventName)
    .eq('status', 'pending') as unknown as Promise<unknown>);
}

/**
 * Has this organiser already sent us something? Any video at all — pending or
 * approved — counts. Someone who uploaded a clip that we later rejected should
 * hear about the rejection, not get nudged as though they never bothered.
 */
async function videoAlreadySubmitted(
  supabase: ReturnType<typeof createSupabaseAdminServerClient>,
  row: { association_slug: string | null; recipient_email: string; event_submission_id: string | null }
): Promise<boolean> {
  const checks: Array<Promise<{ data: unknown[] | null }>> = [];

  if (row.event_submission_id) {
    checks.push(
      (supabase
        .from('association_videos' as never)
        .select('id')
        .eq('event_submission_id', row.event_submission_id)
        .limit(1) as unknown as Promise<{ data: unknown[] | null }>)
    );
  }

  checks.push(
    (supabase
      .from('association_videos' as never)
      .select('id')
      .ilike('submitter_email', row.recipient_email)
      .limit(1) as unknown as Promise<{ data: unknown[] | null }>)
  );

  const results = await Promise.all(checks);
  return results.some((r) => (r.data?.length ?? 0) > 0);
}

/**
 * Drain the due queue. Called from the daily cron.
 */
export async function processVideoReminders(): Promise<{
  sent: number;
  cancelled: number;
  failed: number;
}> {
  // Disarmed by default. Queued reminders simply wait — turning the flag on
  // later picks them up, so nothing is lost by shipping this switched off.
  if (!(await isFeatureEnabled(VIDEO_REMINDERS_FLAG, false))) {
    return { sent: 0, cancelled: 0, failed: 0 };
  }

  const resendKey = process.env.RESEND_API_KEY;
  const supabase = createSupabaseAdminServerClient();

  const { data: due } = await (supabase
    .from('video_reminders' as never)
    .select('*')
    .eq('status', 'pending')
    .lte('send_after', new Date().toISOString())
    .order('send_after', { ascending: true })
    .limit(200) as unknown as Promise<{ data: Record<string, unknown>[] | null }>);

  if (!due || due.length === 0) return { sent: 0, cancelled: 0, failed: 0 };
  if (!resendKey) {
    console.error('processVideoReminders: RESEND_API_KEY missing, leaving queue untouched');
    return { sent: 0, cancelled: 0, failed: 0 };
  }

  const resend = new Resend(resendKey);
  let sent = 0;
  let cancelled = 0;
  let failed = 0;

  // Sequences cancelled inside this run, so a later step of the same sequence
  // in this same batch doesn't get re-checked or sent.
  const stopped = new Set<string>();

  for (const raw of due) {
    const row = {
      id: String(raw.id),
      event_name: String(raw.event_name),
      event_slug: (raw.event_slug as string | null) ?? null,
      association_slug: (raw.association_slug as string | null) ?? null,
      event_submission_id: (raw.event_submission_id as string | null) ?? null,
      recipient_email: String(raw.recipient_email),
      recipient_name: (raw.recipient_name as string | null) ?? null,
      step: Number(raw.step),
      opt_out_token: String(raw.opt_out_token),
    };
    const key = `${row.recipient_email}::${row.event_name}`;
    if (stopped.has(key)) continue;

    if (await videoAlreadySubmitted(supabase, row)) {
      await cancelRemaining(supabase, row.recipient_email, row.event_name, 'video_submitted');
      stopped.add(key);
      cancelled += 1;
      continue;
    }

    const config = VIDEO_REMINDER_STEPS.find((s) => s.step === row.step) ?? VIDEO_REMINDER_STEPS[0];
    // Prefer the event-specific upload page; fall back to the association's.
    const uploadUrl = row.event_slug
      ? `${SITE}/events/${row.event_slug}/submit-video`
      : row.association_slug
        ? `${SITE}/associations/${row.association_slug}/submit-video`
        : `${SITE}/list-your-event`;

    try {
      const result = await resend.emails.send({
        from: FROM,
        to: row.recipient_email,
        subject: config.subject(row.event_name),
        html: buildVideoReminderEmail({
          eventName: row.event_name,
          recipientName: row.recipient_name,
          uploadUrl,
          optOutUrl: `${SITE}/api/video-reminders/stop?token=${row.opt_out_token}`,
          lead: config.lead(row.event_name),
          isFinal: row.step === VIDEO_REMINDER_STEPS[VIDEO_REMINDER_STEPS.length - 1].step,
        }),
      });

      await (supabase
        .from('video_reminders' as never)
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          resend_id: result.data?.id ?? null,
        } as never)
        .eq('id', row.id) as unknown as Promise<unknown>);
      sent += 1;
    } catch (err) {
      await (supabase
        .from('video_reminders' as never)
        .update({ status: 'failed', error: String(err) } as never)
        .eq('id', row.id) as unknown as Promise<unknown>);
      failed += 1;
    }

    // Same throttle the other senders use, to stay inside Resend's rate limit.
    await new Promise((r) => setTimeout(r, 220));
  }

  return { sent, cancelled, failed };
}
