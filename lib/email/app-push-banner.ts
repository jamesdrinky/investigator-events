/**
 * Reusable HTML partial that promotes the iOS app inside the weekly
 * newsletter. Two sizes:
 *
 *   size: 'hero'    — Monday launch-week edition. Full-width dark card,
 *                     mockup-style headline, big CTA. Goes at the very
 *                     top of the newsletter, above the upcoming events.
 *
 *   size: 'compact' — Subsequent weeks. Slim mid-email mention. Drop
 *                     in between sections (e.g. after "Just Added").
 *
 * EU segmentation: pass region 'eu-pending' to swap the download CTA for a
 * "coming soon to your country" note. The default weekly hero stays globally
 * accurate by noting that EU App Store rollout is still pending.
 */

const SITE = 'https://investigatorevents.com';
const APP_STORE_URL = 'https://apps.apple.com/us/app/investigator-events/id6769977101';
const LOGO = `${SITE}/logo/ielogo1.PNG`;
const APP_LAUNCH_GRAPHIC = `${SITE}/email/app-launch-hero.jpeg`;

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
  white: '#ffffff',
  amber: '#f59e0b',
  amberBg: '#fef3c7',
};

export type AppPushSize = 'hero' | 'compact';
export type AppPushRegion = 'available' | 'eu-pending';

export function buildGlobalLaunchBanner(): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
    <tr><td style="border-radius:18px;overflow:hidden;background-color:#06081a;background-image:linear-gradient(145deg,#06081a 0%,#0e1e6e 52%,#190d46 100%);">

      <!-- App hero image -->
      <a href="${APP_STORE_URL}" style="display:block;text-decoration:none;line-height:0;font-size:0;">
        <img src="${APP_LAUNCH_GRAPHIC}" alt="Investigator Events on iPhone" width="504" style="display:block;width:100%;height:auto;border:0;" />
      </a>

      <!-- Content -->
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:22px 22px 26px;">

          <!-- App listing row -->
          <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
            <tr>
              <td style="padding-right:14px;vertical-align:middle;">
                <img src="${LOGO}" alt="Investigator Events" width="58" height="58" style="display:block;width:58px;height:58px;border-radius:14px;border:1px solid rgba(255,255,255,0.2);background-color:#0f172a;" />
              </td>
              <td style="vertical-align:middle;">
                <p style="margin:0;font-size:15px;font-weight:800;color:#ffffff;line-height:1.2;letter-spacing:-0.01em;">Investigator Events</p>
                <p style="margin:3px 0 0;font-size:11px;color:#93c5fd;line-height:1.3;">Free &middot; iPhone &middot; App Store</p>
                <table cellpadding="0" cellspacing="0" style="margin-top:6px;"><tr>
                  <td style="padding-right:5px;"><span style="display:inline-block;padding:3px 9px;border-radius:99px;font-size:9px;font-weight:700;background-color:rgba(74,222,128,0.18);border:1px solid rgba(74,222,128,0.35);color:#4ade80;letter-spacing:0.06em;text-transform:uppercase;">&#9679; iOS Live</span></td>
                  <td><span style="display:inline-block;padding:3px 9px;border-radius:99px;font-size:9px;font-weight:700;background-color:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.15);color:#94a3b8;letter-spacing:0.06em;text-transform:uppercase;">Android Soon</span></td>
                </tr></table>
              </td>
            </tr>
          </table>

          <!-- Separator -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;"><tr><td style="height:1px;background-color:rgba(255,255,255,0.08);font-size:0;line-height:0;">&nbsp;</td></tr></table>

          <!-- Headline -->
          <p style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.025em;text-align:center;line-height:1.2;">Now live in the US,<br/>Europe &amp; 175 countries.</p>
          <p style="margin:10px 0 0;font-size:13px;color:#94a3b8;line-height:1.6;text-align:center;">Browse events, connect with investigators, and grow your network &mdash; right from your iPhone.</p>

          <!-- Region stats -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;background-color:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;">
            <tr>
              <td style="text-align:center;padding:13px 6px;vertical-align:middle;">
                <p style="margin:0;font-size:19px;line-height:1.1;">&#127482;&#127480;</p>
                <p style="margin:5px 0 0;font-size:10px;font-weight:700;color:#e2e8f0;text-transform:uppercase;letter-spacing:0.06em;">USA</p>
              </td>
              <td width="1" style="padding:10px 0;vertical-align:middle;"><div style="width:1px;height:28px;background-color:rgba(255,255,255,0.12);"></div></td>
              <td style="text-align:center;padding:13px 6px;vertical-align:middle;">
                <p style="margin:0;font-size:19px;line-height:1.1;">&#127466;&#127482;</p>
                <p style="margin:5px 0 0;font-size:10px;font-weight:700;color:#e2e8f0;text-transform:uppercase;letter-spacing:0.06em;">Europe</p>
              </td>
              <td width="1" style="padding:10px 0;vertical-align:middle;"><div style="width:1px;height:28px;background-color:rgba(255,255,255,0.12);"></div></td>
              <td style="text-align:center;padding:13px 6px;vertical-align:middle;">
                <p style="margin:0;font-size:17px;font-weight:800;color:#ffffff;line-height:1;">175</p>
                <p style="margin:5px 0 0;font-size:10px;font-weight:700;color:#e2e8f0;text-transform:uppercase;letter-spacing:0.06em;">Countries</p>
              </td>
            </tr>
          </table>

          <!-- App Store CTA -->
          <table cellpadding="0" cellspacing="0" style="margin:20px auto 0;">
            <tr><td>
              <!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${APP_STORE_URL}" style="height:46px;v-text-anchor:middle;width:256px;" arcsize="50%" fillcolor="#ffffff">
                <w:anchorlock/><center style="color:#06081a;font-family:sans-serif;font-size:13px;font-weight:bold;">&#128241; Download on the App Store</center>
              </v:roundrect>
              <![endif]-->
              <!--[if !mso]><!-->
              <a href="${APP_STORE_URL}" style="display:inline-block;padding:13px 30px;background-color:#ffffff;color:#06081a;text-decoration:none;font-size:13px;font-weight:700;border-radius:99px;letter-spacing:0.01em;">&#128241; Download on the App Store</a>
              <!--<![endif]-->
            </td></tr>
          </table>

        </td></tr>
      </table>
    </td></tr>
  </table>`;
}

export function buildAppPushBanner({
  size,
  region,
}: {
  size: AppPushSize;
  region: AppPushRegion;
}): string {
  if (size === 'hero') return heroBanner(region);
  return compactBanner(region);
}

function heroBanner(region: AppPushRegion): string {
  const ctaBlock = region === 'eu-pending'
    ? `
    <p style="margin:18px 0 0;font-size:12px;font-weight:600;color:#fcd34d;text-align:center;line-height:1.5;">
      EU App Store rollout is expected next week — we'll email you when it's live in your country.
    </p>`
    : `
    <table cellpadding="0" cellspacing="0" role="presentation" style="margin:22px auto 0;">
      <tr><td align="center" style="background-color:${C.white};border-radius:99px;">
        <a href="${APP_STORE_URL}" style="display:inline-block;padding:14px 36px;background-color:${C.white};color:${C.dark};text-decoration:none;font-size:14px;font-weight:700;border-radius:99px;">
          Download on the App Store
        </a>
      </td></tr>
    </table>
    <p style="margin:12px 0 0;font-size:11px;color:#94a3b8;text-align:center;line-height:1.55;">
      Live in 175 countries on iOS &middot; Android coming soon.<br/>
      EU App Store rollout is expected next week — if it is not in your store yet, it will be soon.
    </p>`;

  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
    <tr><td style="border-radius:18px 18px 0 0;background-color:${C.white};overflow:hidden;">
      <a href="${APP_STORE_URL}" style="display:block;text-decoration:none;line-height:0;font-size:0;">
        <img src="${APP_LAUNCH_GRAPHIC}" alt="Investigator Events is live on the App Store" width="504" style="display:block;width:100%;height:auto;border:0;" />
      </a>
    </td></tr>
    <tr><td style="padding:22px 24px 26px;border-radius:0 0 18px 18px;background-color:${C.dark};background-image:linear-gradient(135deg,${C.dark} 0%,#0b2f88 52%,#123fbd 100%);">
      <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto 18px;">
        <tr>
          <td style="vertical-align:middle;padding-right:12px;">
            <img src="${LOGO}" alt="Investigator Events" width="52" height="52" style="display:block;width:52px;height:52px;border-radius:14px;background-color:${C.white};border:1px solid rgba(255,255,255,0.25);" />
          </td>
          <td style="vertical-align:middle;text-align:left;">
            <p style="margin:0;font-size:15px;font-weight:800;color:${C.white};line-height:1.15;">Investigator Events</p>
            <p style="margin:3px 0 0;font-size:11px;color:#93c5fd;line-height:1.3;">Now on the App Store</p>
          </td>
        </tr>
      </table>
      <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.18em;color:#93c5fd;text-align:center;">
        App launch
      </p>
      <p style="margin:10px 0 0;font-size:26px;font-weight:800;color:${C.white};letter-spacing:-0.025em;text-align:center;line-height:1.15;">
        Investigator Events is live in your pocket.
      </p>
      <p style="margin:10px 0 0;font-size:14px;color:#cbd5e1;line-height:1.55;text-align:center;">
        The all-in-one platform for investigators to connect, learn and grow is now live on iPhone in 175 countries.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:20px 0 0;">
        <tr>
          <td width="33.33%" style="padding:0 4px;text-align:center;">
            <p style="margin:0;padding:12px 6px;border:1px solid rgba(255,255,255,0.16);border-radius:12px;color:${C.white};font-size:11px;line-height:1.4;background-color:rgba(255,255,255,0.06);"><strong style="font-size:16px;">175</strong><br/>countries</p>
          </td>
          <td width="33.33%" style="padding:0 4px;text-align:center;">
            <p style="margin:0;padding:12px 6px;border:1px solid rgba(255,255,255,0.16);border-radius:12px;color:${C.white};font-size:11px;line-height:1.4;background-color:rgba(255,255,255,0.06);"><strong style="font-size:16px;">iOS</strong><br/>live now</p>
          </td>
          <td width="33.33%" style="padding:0 4px;text-align:center;">
            <p style="margin:0;padding:12px 6px;border:1px solid rgba(255,255,255,0.16);border-radius:12px;color:${C.white};font-size:11px;line-height:1.4;background-color:rgba(255,255,255,0.06);"><strong style="font-size:16px;">EU</strong><br/>next week</p>
          </td>
        </tr>
      </table>
      ${ctaBlock}
    </td></tr>
  </table>`;
}

function compactBanner(region: AppPushRegion): string {
  const right = region === 'eu-pending'
    ? `<span style="display:inline-block;padding:8px 16px;background-color:${C.amberBg};color:#92400e;font-size:11px;font-weight:700;border-radius:99px;">EU: coming soon</span>`
    : `<a href="${APP_STORE_URL}" style="display:inline-block;padding:10px 22px;background-color:${C.dark};color:${C.white};text-decoration:none;font-size:12px;font-weight:700;border-radius:99px;">Get the iOS app</a>`;

  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
    <tr><td style="padding:16px 18px;border:1px solid ${C.border};border-radius:12px;background-color:${C.blueBg};">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="vertical-align:middle;">
          <p style="margin:0;font-size:13px;font-weight:700;color:${C.dark};">Investigator Events for iOS</p>
          <p style="margin:3px 0 0;font-size:11px;color:${C.muted};line-height:1.4;">The whole calendar + network in your pocket.</p>
        </td>
        <td style="vertical-align:middle;text-align:right;white-space:nowrap;">
          ${right}
        </td>
      </tr></table>
    </td></tr>
  </table>`;
}
