/**
 * DRAFT — not yet wired to any send route or cron.
 *
 * Audience: people who already have an Investigator Events account but
 * did NOT tick the newsletter opt-in on signup / sign-in.
 *
 * Needs a one-click subscribe URL — TBD: either a new
 * /api/newsletter/one-click-subscribe?token=... route that flips the
 * profile flag without re-asking for the email, or a pre-filled
 * /newsletter?email=... page. Leaving as a placeholder param.
 */

const SITE = 'https://investigatorevents.com';
const LOGO = `${SITE}/logo/ielogo1.PNG`;
const WAVE = `${SITE}/email/wave-banner.png`;

const C = {
  blue: '#2563eb',
  blueLight: '#dbeafe',
  blueBg: '#eff6ff',
  purple: '#7c3aed',
  dark: '#0f172a',
  body: '#334155',
  muted: '#64748b',
  faint: '#94a3b8',
  border: '#e2e8f0',
  bgSoft: '#f8fafc',
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

export function buildNewsletterOptInPitchEmail(
  oneClickSubscribeUrl: string,
  fullName: string | null,
): string {
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

        <tr><td style="background-color:${C.white};padding:24px 32px 36px;">
          <p style="margin:0;font-size:22px;font-weight:800;color:${C.dark};letter-spacing:-0.02em;text-align:center;">
            ${greeting} — get the weekly briefing
          </p>
          <p style="margin:16px 0 0;font-size:15px;color:${C.body};line-height:1.6;text-align:center;">
            You’re on Investigator Events, but you’re not yet getting our Monday weekly briefing. Here’s what your inbox is missing:
          </p>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0;">
            ${bullet('&#128197;', 'Every confirmed event, every Monday', 'Conferences, AGMs, training — across 40+ associations worldwide.')}
            ${bullet('&#127919;', 'Featured + just added', 'See what dropped this week before it sells out.')}
            ${bullet('&#11088;', 'Past-event review prompts', 'Help fellow PIs choose where to go next.')}
            ${bullet('&#128640;', 'Product updates', 'Be first to hear about new features.')}
          </table>

          <table cellpadding="0" cellspacing="0" role="presentation" style="margin:28px auto 0;">
            <tr><td align="center" style="background-color:${C.dark};border-radius:99px;">
              <a href="${oneClickSubscribeUrl}" style="display:inline-block;padding:14px 36px;background-color:${C.dark};color:${C.white};text-decoration:none;font-size:14px;font-weight:600;border-radius:99px;">
                Subscribe in one click
              </a>
            </td></tr>
          </table>

          <p style="margin:16px 0 0;font-size:12px;color:${C.faint};text-align:center;line-height:1.5;">
            One email per week. Unsubscribe any time.
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
            You’re receiving this because you have an Investigator Events account.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
