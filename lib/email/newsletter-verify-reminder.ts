/**
 * DRAFT — not yet wired to any send route or cron.
 *
 * Audience: people who entered an email on the newsletter form but never
 * clicked the confirmation link in the original confirmation-email.ts.
 *
 * Pass the same token used in confirmation-email.ts so the existing
 * /api/newsletter/confirm route handles the click.
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
  white: '#ffffff',
};

export function buildNewsletterVerifyReminderEmail(
  token: string,
  fullName: string | null,
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

        <tr><td style="background-color:${C.white};padding:24px 32px 36px;text-align:center;">
          <p style="margin:0;font-size:22px;font-weight:800;color:${C.dark};letter-spacing:-0.02em;">
            ${greeting} — one click to finish
          </p>
          <p style="margin:16px 0 0;font-size:15px;color:${C.body};line-height:1.6;">
            You signed up for the Investigator Events weekly briefing but haven't confirmed yet, so we haven't sent you a single issue.
          </p>
          <p style="margin:12px 0 0;font-size:15px;color:${C.body};line-height:1.6;">
            One click and you're in — Monday's edition is queued and ready.
          </p>

          <table cellpadding="0" cellspacing="0" role="presentation" style="margin:28px auto 0;">
            <tr><td align="center" style="background-color:${C.dark};border-radius:99px;">
              <a href="${confirmUrl}" style="display:inline-block;padding:14px 36px;background-color:${C.dark};color:${C.white};text-decoration:none;font-size:14px;font-weight:600;border-radius:99px;">
                Confirm subscription
              </a>
            </td></tr>
          </table>

          <p style="margin:20px 0 0;font-size:12px;color:${C.faint};line-height:1.5;">
            Didn't sign up? You can ignore this email — we won't message you again.
          </p>
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
