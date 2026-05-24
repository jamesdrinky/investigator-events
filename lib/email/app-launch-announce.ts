/**
 * DRAFT — not yet wired to any send route or cron.
 *
 * Audience: every user with an Investigator Events account.
 *
 * EU SEGMENTATION (TBD):
 *   The iOS app is currently NOT available in the 27 EU countries
 *   because the App Store trader registration is still pending.
 *   Expected resolution: within ~1 week of 2026-05-24.
 *
 *   Pass `region: 'eu-pending'` to send the "coming to your country
 *   within a week" variant. Pass `region: 'available'` to send the
 *   normal download CTA.
 *
 *   How we identify EU users: open question — see project notes.
 */

const SITE = 'https://investigatorevents.com';
const LOGO = `${SITE}/logo/ielogo1.PNG`;
const WAVE = `${SITE}/email/wave-banner.png`;
const APP_STORE_URL = 'https://apps.apple.com/app/id6769977101';

const C = {
  blue: '#2563eb',
  blueLight: '#dbeafe',
  blueBg: '#eff6ff',
  purple: '#7c3aed',
  pink: '#ec4899',
  dark: '#0f172a',
  body: '#334155',
  muted: '#64748b',
  faint: '#94a3b8',
  border: '#e2e8f0',
  bgSoft: '#f8fafc',
  amber: '#f59e0b',
  amberBg: '#fef3c7',
  white: '#ffffff',
};

export type AppLaunchRegion = 'available' | 'eu-pending';

function featureRow(emoji: string, title: string, desc: string) {
  return `
  <tr><td style="padding:12px 0;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td width="42" style="vertical-align:top;padding-right:14px;font-size:22px;line-height:1;">${emoji}</td>
      <td style="vertical-align:top;">
        <p style="margin:0;font-size:14px;font-weight:700;color:${C.dark};">${title}</p>
        <p style="margin:4px 0 0;font-size:12px;color:${C.muted};line-height:1.45;">${desc}</p>
      </td>
    </tr></table>
  </td></tr>`;
}

function availableCta() {
  return `
  <table cellpadding="0" cellspacing="0" role="presentation" style="margin:28px auto 0;">
    <tr><td align="center" style="background-color:${C.dark};border-radius:99px;">
      <a href="${APP_STORE_URL}" style="display:inline-block;padding:16px 40px;background-color:${C.dark};color:${C.white};text-decoration:none;font-size:15px;font-weight:700;border-radius:99px;letter-spacing:0.01em;">
        Download on the App Store
      </a>
    </td></tr>
  </table>
  <p style="margin:14px 0 0;font-size:12px;color:${C.faint};text-align:center;">
    iOS only for now &middot; Android coming soon.
  </p>`;
}

function euPendingCta() {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0;background-color:${C.amberBg};border-radius:14px;">
    <tr><td style="padding:18px 20px;text-align:center;">
      <p style="margin:0;font-size:13px;font-weight:700;color:${C.dark};">Heads up — not in your App Store yet</p>
      <p style="margin:6px 0 0;font-size:12px;color:${C.body};line-height:1.5;">
        We're finalising EU trader registration. The app will be available across the EU within roughly a week. We'll email you the moment it goes live in your country.
      </p>
    </td></tr>
  </table>
  <p style="margin:14px 0 0;font-size:11px;color:${C.faint};text-align:center;">
    No action needed &middot; we'll let you know.
  </p>`;
}

export function buildAppLaunchAnnounceEmail({
  fullName,
  region,
}: {
  fullName: string | null;
  region: AppLaunchRegion;
}): string {
  const greeting = fullName ? `Hi ${fullName}` : 'Hi';
  const subtitle = region === 'eu-pending'
    ? "It's live on iOS — coming to your country within the week."
    : "The Investigator Events iOS app is live. Take the calendar everywhere.";

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

          <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${C.blue};text-align:center;">
            New &middot; Investigator Events for iOS
          </p>
          <p style="margin:10px 0 0;font-size:26px;font-weight:800;color:${C.dark};letter-spacing:-0.025em;text-align:center;line-height:1.15;">
            ${greeting} — the app is here.
          </p>
          <p style="margin:14px 0 0;font-size:15px;color:${C.body};line-height:1.55;text-align:center;">
            ${subtitle}
          </p>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0;border:1px solid ${C.border};border-radius:14px;background-color:${C.bgSoft};">
            <tr><td style="padding:6px 22px;">
              ${featureRow('&#128197;', 'Every confirmed event in your pocket', 'Conferences, AGMs, training — globally, always up to date.')}
              ${featureRow('&#129309;', 'Verified PI network', 'Find investigators by country and specialisation. Message, follow, connect.')}
              ${featureRow('&#9889;', 'Clash Checker', 'Compare any two events side by side — dates, location, organisers.')}
              ${featureRow('&#128276;', 'Push notifications', 'Get notified the moment something in your area is added.')}
            </td></tr>
          </table>

          ${region === 'eu-pending' ? euPendingCta() : availableCta()}

        </td></tr>

        <tr><td>
          <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td width="33%" style="height:3px;background-color:${C.blue};font-size:0;line-height:0;">&nbsp;</td>
            <td width="34%" style="height:3px;background-color:${C.purple};font-size:0;line-height:0;">&nbsp;</td>
            <td width="33%" style="height:3px;background-color:${C.pink};font-size:0;line-height:0;">&nbsp;</td>
          </tr></table>
        </td></tr>

        <tr><td style="padding:20px 8px 8px;text-align:center;">
          <p style="margin:0;font-size:11px;color:${C.faint};">
            Investigator Events &middot;
            <a href="mailto:info@investigatorevents.com" style="color:${C.faint};text-decoration:none;">info@investigatorevents.com</a>
          </p>
          <p style="margin:4px 0 0;font-size:10px;color:${C.faint};">
            You're receiving this because you have an Investigator Events account.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
