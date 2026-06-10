/**
 * DRAFT — not yet wired to any bulk send route or cron.
 *
 * Audience: people who are on the newsletter (newsletter_subscribers, confirmed)
 * but do NOT have an Investigator Events account (their email matches no profile
 * / auth user).
 *
 * Goal: convert engaged newsletter readers into full members, with a short
 * how-to so creating a profile feels effortless.
 *
 * CTA points at the real /signup page (LinkedIn / Google / Apple / email).
 */

const SITE = 'https://investigatorevents.com';
const LOGO = `${SITE}/logo/ielogo1.PNG`;
const WAVE = `${SITE}/email/wave-banner.png`;
const SIGNUP_URL = `${SITE}/signup`;

const C = {
  blue: '#2563eb',
  blueSoft: '#dbeafe',
  blueBg: '#eff6ff',
  purple: '#7c3aed',
  green: '#059669',
  greenSoft: '#d1fae5',
  dark: '#0f172a',
  body: '#334155',
  muted: '#64748b',
  faint: '#94a3b8',
  border: '#e2e8f0',
  white: '#ffffff',
};

function benefit(emoji: string, title: string, desc: string) {
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

function step(n: number, title: string, desc: string) {
  return `
  <tr><td style="padding:8px 0;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td width="40" valign="top" style="padding-right:14px;">
        <div style="width:30px;height:30px;line-height:30px;text-align:center;border-radius:50%;background-color:${C.blue};color:${C.white};font-size:14px;font-weight:800;">${n}</div>
      </td>
      <td valign="top">
        <p style="margin:0;font-size:14px;font-weight:700;color:${C.dark};line-height:1.4;">${title}</p>
        <p style="margin:2px 0 0;font-size:13px;color:${C.muted};line-height:1.5;">${desc}</p>
      </td>
    </tr></table>
  </td></tr>`;
}

export function buildCreateAccountPitchEmail(fullName: string | null): string {
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
            ${greeting} — claim your free profile
          </p>
          <p style="margin:16px 0 0;font-size:15px;color:${C.body};line-height:1.6;">
            You already get our weekly briefing — but you're missing the rest of
            <strong>Investigator Events</strong>. Creating a free profile takes under a minute and
            puts you on the map with investigators worldwide.
          </p>
        </td></tr>

        <tr><td style="background-color:${C.white};padding:18px 32px 0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${benefit('&#128100;', 'Get listed in the PI directory', 'Be found by peers, clients and event organisers searching for investigators.')}
            ${benefit('&#9989;', 'Earn a verified badge', 'Sign up with LinkedIn and get a green verified check that pushes you up the directory.')}
            ${benefit('&#128197;', 'RSVP and show up on attendance lists', 'See who else is going to events and connect before you arrive.')}
            ${benefit('&#128172;', 'Message and connect with other investigators', 'Build your network across 40+ associations.')}
          </table>
        </td></tr>

        <tr><td style="background-color:${C.white};padding:22px 32px 4px;">
          <p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:${C.muted};text-align:left;">
            How to join — 3 quick steps
          </p>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${step(1, 'Tap “Create my free profile” below', 'It opens the sign-up page — no payment, no catch.')}
            ${step(2, 'Sign up in seconds', 'Use LinkedIn (recommended — instant verified badge), or Google, Apple, or your email.')}
            ${step(3, 'Add your details', 'Your name, photo, specialism and association memberships — then you’re live in the directory.')}
          </table>
        </td></tr>

        <tr><td style="background-color:${C.white};padding:24px 32px 6px;text-align:center;">
          <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto;">
            <tr><td align="center" style="background-color:${C.dark};border-radius:99px;">
              <!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${SIGNUP_URL}" style="height:48px;v-text-anchor:middle;width:240px;" arcsize="50%" fillcolor="${C.dark}" stroke="false">
                <v:textbox inset="0,0,0,0"><center style="color:#ffffff;font-family:sans-serif;font-size:15px;font-weight:600;">Create my free profile</center></v:textbox>
              </v:roundrect>
              <![endif]-->
              <!--[if !mso]><!-->
              <a href="${SIGNUP_URL}" style="display:inline-block;padding:15px 40px;background-color:${C.dark};color:${C.white};text-decoration:none;font-size:15px;font-weight:600;border-radius:99px;">
                Create my free profile
              </a>
              <!--<![endif]-->
            </td></tr>
          </table>
          <p style="margin:12px 0 0;font-size:12px;color:${C.faint};line-height:1.5;">
            Free forever. You'll keep getting the weekly briefing either way.
          </p>
        </td></tr>

        <tr><td style="padding:24px 8px 8px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td width="33%" style="height:3px;background-color:${C.blue};font-size:0;line-height:0;">&nbsp;</td>
            <td width="34%" style="height:3px;background-color:${C.purple};font-size:0;line-height:0;">&nbsp;</td>
            <td width="33%" style="height:3px;background-color:#06b6d4;font-size:0;line-height:0;">&nbsp;</td>
          </tr></table>
        </td></tr>

        <tr><td style="padding:16px 8px 8px;text-align:center;">
          <p style="margin:0;font-size:11px;color:${C.faint};">
            Investigator Events &middot;
            <a href="mailto:info@investigatorevents.com" style="color:${C.faint};text-decoration:none;">info@investigatorevents.com</a>
          </p>
          <p style="margin:4px 0 0;font-size:10px;color:${C.faint};line-height:1.5;">
            You received this because you subscribe to the Investigator Events weekly briefing.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
