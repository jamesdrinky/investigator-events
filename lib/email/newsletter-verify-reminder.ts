/**
 * DRAFT — not yet wired to any bulk send route or cron.
 *
 * Audience: people who entered an email on the newsletter form but never
 * clicked the confirmation link in the original confirmation-email.ts
 * (newsletter_subscribers.status = 'pending', confirmed_at IS NULL).
 *
 * Goal: a warm "last chance to confirm before we remove you from the list"
 * nudge — persuasive, not scary, so they confirm rather than ignore it.
 *
 * The CTA points at the existing /api/newsletter/confirm route using the same
 * token issued in confirmation-email.ts.
 */

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
  amber: '#b45309',
  amberSoft: '#fef3c7',
  amberBorder: '#fcd34d',
  white: '#ffffff',
};

function bullet(emoji: string, title: string, desc: string) {
  return `
  <tr><td style="padding:10px 0;border-bottom:1px solid ${C.border};">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td width="36" style="vertical-align:top;padding-right:12px;font-size:20px;line-height:1;">${emoji}</td>
      <td style="vertical-align:top;">
        <p style="margin:0;font-size:14px;font-weight:600;color:${C.dark};">${title}</p>
        <p style="margin:3px 0 0;font-size:12px;color:${C.muted};line-height:1.4;">${desc}</p>
      </td>
    </tr></table>
  </td></tr>`;
}

export function buildNewsletterVerifyReminderEmail(
  token: string,
  fullName: string | null,
  deadlineLabel: string = 'the end of the month',
): string {
  const confirmUrl = `${SITE}/api/newsletter/confirm?token=${token}`;
  const greeting = fullName ? `Hi ${fullName}` : 'Hi';

  return `<!DOCTYPE html>
<html lang="en">
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

        <tr><td style="background-color:${C.white};padding:24px 32px 8px;text-align:center;">
          <p style="margin:0;font-size:22px;font-weight:800;color:${C.dark};letter-spacing:-0.02em;line-height:1.25;">
            ${greeting} — you’re one click away
          </p>
          <p style="margin:16px 0 0;font-size:15px;color:${C.body};line-height:1.6;">
            You signed up for the <strong>Investigator Events</strong> weekly briefing, but your
            email was never confirmed — so you haven’t received a single issue, and right now you’re
            not on the active list.
          </p>
          <p style="margin:12px 0 0;font-size:15px;color:${C.body};line-height:1.6;">
            Confirm below and you’re in — the next edition lands straight in your inbox.
          </p>
        </td></tr>

        <tr><td style="background-color:${C.white};padding:18px 32px 0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${bullet('&#128197;', 'Every confirmed event, every Monday', 'Conferences, AGMs and training across 40+ PI associations worldwide.')}
            ${bullet('&#127919;', 'Featured &amp; just added', 'See what&rsquo;s new before it sells out.')}
            ${bullet('&#11088;', 'Reviews from fellow investigators', 'Real takes on which events are worth your time.')}
            ${bullet('&#128640;', 'First to know', 'New features and the things shaping the profession.')}
          </table>
        </td></tr>

        <tr><td style="background-color:${C.white};padding:22px 32px 4px;text-align:center;">
          <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto;">
            <tr><td align="center" style="background-color:${C.dark};border-radius:99px;">
              <!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${confirmUrl}" style="height:48px;v-text-anchor:middle;width:260px;" arcsize="50%" fillcolor="${C.dark}" stroke="false">
                <v:textbox inset="0,0,0,0"><center style="color:#ffffff;font-family:sans-serif;font-size:15px;font-weight:600;">Confirm my subscription</center></v:textbox>
              </v:roundrect>
              <![endif]-->
              <!--[if !mso]><!-->
              <a href="${confirmUrl}" style="display:inline-block;padding:15px 40px;background-color:${C.dark};color:${C.white};text-decoration:none;font-size:15px;font-weight:600;border-radius:99px;">
                Confirm my subscription
              </a>
              <!--<![endif]-->
            </td></tr>
          </table>
          <p style="margin:12px 0 0;font-size:12px;color:${C.faint};line-height:1.5;">
            Takes one click. One email a week. Unsubscribe any time.
          </p>
        </td></tr>

        <tr><td style="background-color:${C.white};padding:18px 32px 28px;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:${C.amberSoft};border:1px solid ${C.amberBorder};border-radius:12px;">
            <tr><td style="padding:14px 18px;">
              <p style="margin:0;font-size:13px;color:${C.amber};line-height:1.55;">
                <strong>Heads up:</strong> we’re tidying our list and will remove unconfirmed
                sign-ups around <strong>${deadlineLabel}</strong>. Confirm now and you’ll keep your
                place — no need to sign up again later.
              </p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td>
          <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td width="33%" style="height:3px;background-color:${C.blue};font-size:0;line-height:0;">&nbsp;</td>
            <td width="34%" style="height:3px;background-color:${C.purple};font-size:0;line-height:0;">&nbsp;</td>
            <td width="33%" style="height:3px;background-color:#06b6d4;font-size:0;line-height:0;">&nbsp;</td>
          </tr></table>
        </td></tr>

        <tr><td style="padding:20px 8px 8px;text-align:center;">
          <p style="margin:0;font-size:11px;color:${C.faint};">
            Investigator Events &middot;
            <a href="mailto:info@investigatorevents.com" style="color:${C.faint};text-decoration:none;">info@investigatorevents.com</a>
          </p>
          <p style="margin:4px 0 0;font-size:10px;color:${C.faint};line-height:1.5;">
            You received this because you entered your email to subscribe to the Investigator Events
            weekly briefing. Didn’t sign up? Ignore this email and you’ll be removed automatically —
            we won’t message you again.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
