/**
 * Dedicated app-launch announcement email.
 *
 * Audience: every account holder + every verified newsletter subscriber.
 * Sent once, manually, from /api/admin/send-app-launch.
 *
 * As of 2026-05-29 the EU App Store rollout is complete — the app is
 * live in every country with iOS distribution. Android is still on the
 * way. The visual treatment is intentionally heavy: this is a one-shot
 * launch moment so the email leans on big typography, the brand gradient
 * triple (blue/purple/pink), and a top-of-fold CTA so recipients can act
 * without scrolling.
 */

const SITE = 'https://investigatorevents.com';
const LOGO = `${SITE}/logo/ielogo1.PNG`;
const HERO = `${SITE}/email/app-launch-hero.jpeg`;
const APP_STORE_URL = 'https://apps.apple.com/app/id6769977101';

const C = {
  // Brand
  blue: '#2563eb',
  blueDeep: '#1d4ed8',
  blueLight: '#dbeafe',
  blueBg: '#eff6ff',
  purple: '#7c3aed',
  purpleBg: '#f5f3ff',
  pink: '#ec4899',
  pinkBg: '#fdf2f8',
  amber: '#f59e0b',
  amberBg: '#fef3c7',
  emerald: '#10b981',
  emeraldBg: '#ecfdf5',
  // Neutrals
  ink: '#0b1220',
  dark: '#0f172a',
  body: '#334155',
  muted: '#64748b',
  faint: '#94a3b8',
  hairline: '#e2e8f0',
  bgSoft: '#f8fafc',
  bgCanvas: '#eef2f7',
  white: '#ffffff',
};

// Kept for back-compat with /api/email-preview which still passes a region.
export type AppLaunchRegion = 'available' | 'eu-pending';

function gradientPill(text: string) {
  return `
    <span style="display:inline-block;padding:7px 16px;background-color:${C.blue};background-image:linear-gradient(135deg,${C.blue} 0%,${C.purple} 55%,${C.pink} 100%);color:${C.white};font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;border-radius:99px;line-height:1.1;">
      ${text}
    </span>`;
}

function statCard(big: string, small: string, accent: string) {
  return `
    <td width="33.33%" valign="top" style="padding:0 5px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:${C.white};border:1px solid ${C.hairline};border-radius:16px;">
        <tr><td style="padding:18px 8px 16px;text-align:center;">
          <p style="margin:0;font-size:24px;font-weight:800;color:${C.dark};letter-spacing:-0.02em;line-height:1;">${big}</p>
          <p style="margin:8px 0 10px;font-size:11px;font-weight:600;color:${C.muted};line-height:1.3;text-transform:uppercase;letter-spacing:0.08em;">${small}</p>
          <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto;"><tr>
            <td style="width:28px;height:3px;background-color:${accent};border-radius:99px;font-size:0;line-height:0;">&nbsp;</td>
          </tr></table>
        </td></tr>
      </table>
    </td>`;
}

function featureCard(emoji: string, iconBg: string, iconColor: string, title: string, desc: string) {
  return `
  <tr><td style="padding:10px 0;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:${C.white};border:1px solid ${C.hairline};border-radius:14px;">
      <tr><td style="padding:18px 18px 18px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr>
          <td width="52" valign="top" style="padding-right:14px;">
            <table cellpadding="0" cellspacing="0" role="presentation"><tr>
              <td width="44" height="44" align="center" valign="middle" style="background-color:${iconBg};border-radius:12px;font-size:20px;line-height:1;color:${iconColor};">
                ${emoji}
              </td>
            </tr></table>
          </td>
          <td valign="middle">
            <p style="margin:0;font-size:14.5px;font-weight:700;color:${C.dark};line-height:1.25;letter-spacing:-0.005em;">${title}</p>
            <p style="margin:6px 0 0;font-size:12.5px;color:${C.muted};line-height:1.55;">${desc}</p>
          </td>
        </tr></table>
      </td></tr>
    </table>
  </td></tr>`;
}

export function buildAppLaunchAnnounceEmail({
  fullName,
}: {
  fullName: string | null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  region?: AppLaunchRegion;
}): string {
  const firstName = fullName?.split(/\s+/)[0] ?? null;
  const greeting = firstName ? `${firstName},` : 'Hi,';
  const preheader = 'Investigator Events is now live on the App Store across every iOS country — including the full European Union. Download today.';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>The Investigator Events app is live</title>
</head>
<body style="margin:0;padding:0;background-color:${C.bgCanvas};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:${C.body};">

  <!-- Pre-header: shows in inbox preview, hidden in the email body -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;color:${C.bgCanvas};line-height:1px;opacity:0;">
    ${preheader}
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:${C.bgCanvas};padding:28px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;background-color:${C.white};border-radius:24px;overflow:hidden;box-shadow:0 30px 80px -36px rgba(15,23,42,0.22);">

        <!-- HERO: brand gradient backdrop + image + immediate CTA -->
        <tr><td style="background-color:${C.ink};background-image:linear-gradient(135deg,${C.ink} 0%,#10204e 40%,#1a3aa8 100%);padding:0;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr><td style="padding:30px 32px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr>
                <td valign="middle" style="padding-right:12px;">
                  <table cellpadding="0" cellspacing="0" role="presentation"><tr>
                    <td style="padding-right:10px;">
                      <img src="${LOGO}" alt="" width="36" height="36" style="display:block;width:36px;height:36px;border-radius:9px;background-color:${C.white};border:1px solid rgba(255,255,255,0.2);" />
                    </td>
                    <td valign="middle">
                      <p style="margin:0;font-size:13px;font-weight:700;color:${C.white};letter-spacing:-0.01em;line-height:1;">Investigator Events</p>
                      <p style="margin:3px 0 0;font-size:10px;color:#93c5fd;line-height:1;letter-spacing:0.06em;text-transform:uppercase;">App launch &middot; May 2026</p>
                    </td>
                  </tr></table>
                </td>
                <td valign="middle" align="right">
                  <span style="display:inline-block;padding:5px 11px;background-color:rgba(16,185,129,0.16);color:#34d399;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;border-radius:99px;border:1px solid rgba(52,211,153,0.35);">
                    Live now
                  </span>
                </td>
              </tr></table>
            </td></tr>

            <tr><td style="padding:26px 32px 0;">
              ${gradientPill('Worldwide &middot; Europe included')}
            </td></tr>

            <tr><td style="padding:18px 32px 0;">
              <p style="margin:0;font-size:34px;font-weight:800;color:${C.white};line-height:1.08;letter-spacing:-0.03em;">
                ${greeting} the app is here.
              </p>
              <p style="margin:14px 0 0;font-size:15px;color:#cbd5e1;line-height:1.6;max-width:480px;">
                Investigator Events is officially on the App Store in <strong style="color:${C.white};">every iOS country</strong> — including the full European Union. The whole calendar, every verified investigator, every event update — in your pocket.
              </p>
            </td></tr>

            <tr><td style="padding:26px 32px 0;">
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr><td style="background-color:${C.white};border-radius:99px;">
                  <a href="${APP_STORE_URL}" style="display:inline-block;padding:15px 30px;background-color:${C.white};color:${C.ink};text-decoration:none;font-size:14px;font-weight:700;border-radius:99px;letter-spacing:-0.005em;">
                    &#10148;&nbsp;&nbsp;Download on the App Store
                  </a>
                </td></tr>
              </table>
              <p style="margin:12px 0 0;font-size:11px;color:#94a3b8;line-height:1.5;">
                Free &middot; iPhone &amp; iPad &middot; Android coming soon
              </p>
            </td></tr>

            <tr><td style="padding:30px 32px 0;line-height:0;font-size:0;">
              <img src="${HERO}" alt="Investigator Events on iPhone" width="536" style="display:block;width:100%;height:auto;border:0;border-radius:16px 16px 0 0;" />
            </td></tr>
          </table>
        </td></tr>

        <!-- Brand gradient stripe -->
        <tr><td>
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" border="0"><tr>
            <td width="33%" style="height:4px;background-color:${C.blue};font-size:0;line-height:0;">&nbsp;</td>
            <td width="34%" style="height:4px;background-color:${C.purple};font-size:0;line-height:0;">&nbsp;</td>
            <td width="33%" style="height:4px;background-color:${C.pink};font-size:0;line-height:0;">&nbsp;</td>
          </tr></table>
        </td></tr>

        <!-- STATS -->
        <tr><td style="padding:36px 28px 8px;background-color:${C.bgSoft};">
          <p style="margin:0 0 16px;font-size:11px;font-weight:700;letter-spacing:0.18em;color:${C.muted};text-transform:uppercase;text-align:center;">
            By the numbers
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr>
            ${statCard('Global', 'iOS, every region', C.blue)}
            ${statCard('EU', 'Now live', C.purple)}
            ${statCard('Soon', 'Android on Google Play', C.pink)}
          </tr></table>
        </td></tr>

        <!-- FEATURES -->
        <tr><td style="padding:38px 28px 8px;background-color:${C.bgSoft};">
          <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.18em;color:${C.muted};text-transform:uppercase;text-align:center;">
            What you get
          </p>
          <p style="margin:8px 0 22px;font-size:20px;font-weight:800;color:${C.dark};text-align:center;letter-spacing:-0.018em;line-height:1.2;">
            Everything Investigator Events does — on your phone.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            ${featureCard('&#128241;', C.blueBg, C.blue, 'The whole calendar, on your phone', 'Conferences, AGMs, training and trade shows — every confirmed PI event globally, always up to date.')}
            ${featureCard('&#129309;', C.purpleBg, C.purple, 'Verified investigator network', 'Find PIs by country and specialisation. Message, follow and connect — no LinkedIn detour.')}
            ${featureCard('&#9889;', C.amberBg, C.amber, 'Clash Checker', 'Compare any two events side by side. Dates, location, organisers, attendees — in one screen.')}
            ${featureCard('&#128276;', C.pinkBg, C.pink, 'Real-time push notifications', 'Get told the moment something in your country or specialisation is added.')}
          </table>
        </td></tr>

        <!-- MID CTA -->
        <tr><td style="padding:34px 28px 0;background-color:${C.bgSoft};">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:${C.ink};background-image:linear-gradient(135deg,${C.ink} 0%,${C.blueDeep} 60%,${C.purple} 100%);border-radius:18px;">
            <tr><td style="padding:30px 28px;text-align:center;">
              <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.18em;color:#bfdbfe;text-transform:uppercase;">
                Get started
              </p>
              <p style="margin:10px 0 0;font-size:22px;font-weight:800;color:${C.white};line-height:1.2;letter-spacing:-0.02em;">
                Download the app and bring the whole PI community with you.
              </p>
              <table cellpadding="0" cellspacing="0" role="presentation" style="margin:22px auto 0;">
                <tr><td style="background-color:${C.white};border-radius:99px;">
                  <a href="${APP_STORE_URL}" style="display:inline-block;padding:14px 32px;background-color:${C.white};color:${C.ink};text-decoration:none;font-size:14px;font-weight:700;border-radius:99px;">
                    &#10148;&nbsp;&nbsp;Download on the App Store
                  </a>
                </td></tr>
              </table>
              <p style="margin:14px 0 0;font-size:11px;color:#cbd5e1;line-height:1.55;">
                Free &middot; iPhone &amp; iPad &middot; Available in every iOS country
              </p>
            </td></tr>
          </table>
        </td></tr>

        <!-- TEAM NOTE -->
        <tr><td style="padding:34px 28px 0;background-color:${C.bgSoft};">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:${C.white};border:1px solid ${C.hairline};border-radius:16px;">
            <tr>
              <td width="6" style="background-color:${C.blue};background-image:linear-gradient(180deg,${C.blue} 0%,${C.purple} 50%,${C.pink} 100%);font-size:0;line-height:0;border-radius:16px 0 0 16px;">&nbsp;</td>
              <td style="padding:22px 22px 24px;">
                <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.16em;color:${C.purple};text-transform:uppercase;">
                  A note from the team
                </p>
                <p style="margin:10px 0 0;font-size:14px;color:${C.body};line-height:1.7;">
                  We built Investigator Events to give the PI community one place to find each other, share what’s happening and grow. Thanks for being part of it from the start &mdash; please tell a colleague, and if the app earns it, leave us a review.
                </p>
                <p style="margin:14px 0 0;font-size:12px;color:${C.muted};line-height:1.5;font-style:italic;">
                  &mdash; The Investigator Events team
                </p>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Bottom spacer to flush the soft bg into the footer -->
        <tr><td style="background-color:${C.bgSoft};height:36px;line-height:0;font-size:0;">&nbsp;</td></tr>

        <!-- Brand gradient strip (bottom) -->
        <tr><td>
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" border="0"><tr>
            <td width="33%" style="height:4px;background-color:${C.blue};font-size:0;line-height:0;">&nbsp;</td>
            <td width="34%" style="height:4px;background-color:${C.purple};font-size:0;line-height:0;">&nbsp;</td>
            <td width="33%" style="height:4px;background-color:${C.pink};font-size:0;line-height:0;">&nbsp;</td>
          </tr></table>
        </td></tr>

        <!-- FOOTER -->
        <tr><td style="padding:26px 28px 28px;background-color:${C.white};text-align:center;">
          <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto 12px;"><tr>
            <td style="padding-right:8px;">
              <img src="${LOGO}" alt="" width="28" height="28" style="display:block;width:28px;height:28px;border-radius:7px;" />
            </td>
            <td valign="middle">
              <p style="margin:0;font-size:13px;font-weight:700;color:${C.dark};letter-spacing:-0.005em;">Investigator Events</p>
            </td>
          </tr></table>
          <p style="margin:0;font-size:11px;color:${C.faint};line-height:1.6;">
            <a href="${SITE}" style="color:${C.muted};text-decoration:none;">investigatorevents.com</a>
            &nbsp;&middot;&nbsp;
            <a href="mailto:info@investigatorevents.com" style="color:${C.muted};text-decoration:none;">info@investigatorevents.com</a>
            &nbsp;&middot;&nbsp;
            <a href="${APP_STORE_URL}" style="color:${C.muted};text-decoration:none;">App Store</a>
          </p>
          <p style="margin:10px 0 0;font-size:10px;color:${C.faint};line-height:1.6;max-width:440px;display:inline-block;">
            You’re receiving this one-off announcement because you have an Investigator Events account or are subscribed to our newsletter.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
