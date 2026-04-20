import type { EventItem } from '@/lib/data/events';
import { findAssociationBranding } from '@/lib/utils/association-branding';
import { getEventImage, getCityHeroImageUrl } from '@/lib/utils/city-media';
import { slugifyEventTitle } from '@/lib/utils/event-slugs';

const SITE = 'https://investigatorevents.com';
const LOGO = `${SITE}/logo/ielogo1.PNG`;
const WAVE = `${SITE}/email/wave-banner.png`;

/* ── Colours ── */
const C = {
  blue: '#2563eb',
  purple: '#7c3aed',
  pink: '#ec4899',
  dark: '#0f172a',
  body: '#334155',
  muted: '#64748b',
  faint: '#94a3b8',
  border: '#e2e8f0',
  bgSoft: '#f8fafc',
  white: '#ffffff',
};

function fmtDate(d: string) { return new Date(`${d}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }); }
function fmtShort(d: string) { return new Date(`${d}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }); }
function daysUntil(d: string) { return Math.ceil((new Date(`${d}T00:00:00Z`).getTime() - Date.now()) / 86400000); }

function assocLogo(ev: EventItem) {
  const b = findAssociationBranding(ev.association ?? ev.organiser);
  return b?.logoFileName ? `${SITE}/associations/${b.logoFileName}` : null;
}

function eventCover(ev: EventItem) {
  if (ev.image_path?.startsWith('/')) return `${SITE}${ev.image_path}`;
  if (ev.image_path?.startsWith('http')) return ev.image_path;
  const s = ev.slug ?? slugifyEventTitle(ev.title);
  const si = getEventImage(s); if (si) return `${SITE}${si}`;
  const ci = getCityHeroImageUrl(ev.city); if (ci) return `${SITE}${ci}`;
  return null;
}

/* ── Pill badge ── */
function pill(text: string, bg: string, fg: string) {
  return `<span style="display:inline-block;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:700;background-color:${bg};color:${fg};letter-spacing:0.02em;">${text}</span>`;
}

/* ── Hero featured card ── */
function heroCard(ev: EventItem) {
  const url = `${SITE}/events/${ev.slug}`;
  const img = eventCover(ev);
  const lg = assocLogo(ev);
  const host = ev.association ?? ev.organiser;
  const days = daysUntil(ev.date);
  const badge = days <= 0 ? 'HAPPENING NOW' : days <= 7 ? `IN ${days} DAYS` : days <= 14 ? `IN ${days} DAYS` : 'FEATURED';

  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
    <tr><td>
      <a href="${url}" style="text-decoration:none;display:block;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          ${img ? `<tr><td style="position:relative;">
            <img src="${img}" alt="" width="524" style="display:block;width:100%;height:auto;max-height:210px;object-fit:cover;" />
            <div style="position:absolute;top:12px;left:12px;">${pill(badge, days <= 7 ? '#fee2e2' : '#dbeafe', days <= 7 ? '#dc2626' : C.blue)}</div>
          </td></tr>` : ''}
          <tr><td style="padding:18px 20px 20px;background-color:${C.white};border:1px solid ${C.border};${img ? 'border-top:none;' : ''}border-radius:${img ? '0 0 16px 16px' : '16px'};">
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              ${lg ? `<td width="44" style="vertical-align:top;padding-right:14px;"><img src="${lg}" alt="" width="44" height="44" style="display:block;width:44px;height:44px;border-radius:12px;object-fit:contain;border:1px solid ${C.border};" /></td>` : ''}
              <td style="vertical-align:top;">
                ${!img ? `<div style="margin-bottom:6px;">${pill(badge, days <= 7 ? '#fee2e2' : '#dbeafe', days <= 7 ? '#dc2626' : C.blue)}</div>` : ''}
                <p style="margin:0;font-size:18px;font-weight:700;color:${C.dark};line-height:1.25;">${ev.title}</p>
                <p style="margin:6px 0 0;font-size:13px;color:${C.muted};">${fmtDate(ev.date)}${ev.endDate ? ` – ${fmtShort(ev.endDate)}` : ''} &middot; ${ev.city}, ${ev.country}</p>
                <p style="margin:4px 0 0;font-size:12px;color:${C.faint};">${host} &middot; ${ev.category}</p>
              </td>
            </tr></table>
          </td></tr>
        </table>
      </a>
    </td></tr>
  </table>`;
}

/* ── Event row ── */
function eventRow(ev: EventItem, idx: number) {
  const url = `${SITE}/events/${ev.slug}`;
  const host = ev.association ?? ev.organiser;
  const img = eventCover(ev);
  const lg = assocLogo(ev);
  const days = daysUntil(ev.date);
  const badge = days <= 0 ? 'Now' : days <= 7 ? `${days}d` : '';

  const visual = img
    ? `<td width="72" style="vertical-align:top;padding-right:14px;"><img src="${img}" alt="" width="72" height="50" style="display:block;width:72px;height:50px;object-fit:cover;border-radius:10px;" /></td>`
    : lg
    ? `<td width="72" style="vertical-align:top;padding-right:14px;"><table width="72" height="50" cellpadding="0" cellspacing="0" style="width:72px;height:50px;border-radius:10px;background-color:${C.bgSoft};"><tr><td align="center" valign="middle"><img src="${lg}" alt="" width="28" height="28" style="display:block;width:28px;height:28px;object-fit:contain;" /></td></tr></table></td>`
    : '';

  return `
  <tr><td style="padding:${idx === 0 ? '0' : '14px'} 0 14px;${idx > 0 ? `border-top:1px solid ${C.border};` : ''}">
    <a href="${url}" style="text-decoration:none;color:inherit;display:block;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        ${visual}
        <td style="vertical-align:top;">
          <p style="margin:0;font-size:14px;font-weight:600;color:${C.dark};line-height:1.35;">${ev.title}${badge ? ` ${pill(badge, days <= 0 ? '#fee2e2' : '#dbeafe', days <= 0 ? '#dc2626' : C.blue)}` : ''}</p>
          <p style="margin:4px 0 0;font-size:12px;color:${C.muted};">${fmtDate(ev.date)} &middot; ${ev.city}, ${ev.country}</p>
          ${lg && img ? `<table cellpadding="0" cellspacing="0" style="margin-top:4px;"><tr><td style="padding-right:5px;vertical-align:middle;"><img src="${lg}" alt="" width="14" height="14" style="display:block;width:14px;height:14px;border-radius:4px;object-fit:contain;" /></td><td style="vertical-align:middle;"><span style="font-size:11px;color:${C.faint};">${host}</span></td></tr></table>` : `<p style="margin:3px 0 0;font-size:11px;color:${C.faint};">${host}</p>`}
        </td>
      </tr></table>
    </a>
  </td></tr>`;
}

/* ── Section ── */
function section(title: string, emoji: string, events: EventItem[]) {
  if (!events.length) return '';
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
    <tr><td style="padding-bottom:12px;">
      <table cellpadding="0" cellspacing="0"><tr>
        <td style="font-size:18px;padding-right:8px;vertical-align:middle;">${emoji}</td>
        <td style="vertical-align:middle;"><p style="margin:0;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${C.faint};">${title}</p></td>
      </tr></table>
    </td></tr>
    ${events.map((ev, i) => eventRow(ev, i)).join('')}
  </table>`;
}

/* ── Review section ── */
function reviewSection(events: EventItem[]) {
  if (!events.length) return '';
  const cards = events.map(ev => {
    const lg = assocLogo(ev);
    const host = ev.association ?? ev.organiser;
    const url = `${SITE}/events/${ev.slug}`;
    return `
    <td style="padding:0 6px;vertical-align:top;width:${Math.floor(100 / events.length)}%;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${C.border};border-radius:14px;background-color:${C.white};">
        <tr><td style="padding:16px 12px;text-align:center;">
          ${lg ? `<img src="${lg}" alt="" width="36" height="36" style="display:inline-block;width:36px;height:36px;border-radius:10px;object-fit:contain;border:1px solid ${C.border};" />` : ''}
          <p style="margin:8px 0 0;font-size:12px;font-weight:600;color:${C.dark};line-height:1.3;">${ev.title}</p>
          <p style="margin:4px 0 0;font-size:10px;color:${C.faint};">${host}</p>
          <a href="${url}" style="display:inline-block;margin-top:12px;padding:6px 16px;border-radius:99px;font-size:11px;font-weight:600;color:${C.white};background-color:${C.blue};text-decoration:none;">Review &rarr;</a>
        </td></tr>
      </table>
    </td>`;
  }).join('');

  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:36px;">
    <tr><td style="padding:24px 20px;background:linear-gradient(135deg,#eff6ff,#f5f3ff,#fdf2f8);border-radius:16px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td>
          <p style="margin:0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${C.faint};">Recently happened</p>
          <p style="margin:6px 0 0;font-size:20px;font-weight:800;color:${C.dark};line-height:1.2;">Were you there?</p>
          <p style="margin:4px 0 16px;font-size:13px;color:${C.muted};">Share your experience — takes 60 seconds, helps the whole industry.</p>
        </td></tr>
        <tr><td><table width="100%" cellpadding="0" cellspacing="0"><tr>${cards}</tr></table></td></tr>
      </table>
    </td></tr>
  </table>`;
}

/* ── How-to section ── */
function howToSection() {
  const items = [
    { emoji: '&#128100;', title: 'Update your profile', desc: 'Add your specialisation and associations.', link: `${SITE}/profile/edit`, cta: 'Edit profile' },
    { emoji: '&#129309;', title: 'Connect with others', desc: 'Follow investigators. Grow your network.', link: `${SITE}/people`, cta: 'Browse' },
    { emoji: '&#11088;', title: 'Review past events', desc: 'Help others decide where to go next.', link: `${SITE}/calendar`, cta: 'Find events' },
  ];
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:36px;">
    <tr><td style="padding-bottom:12px;">
      <p style="margin:0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${C.faint};">Get more from IE</p>
    </td></tr>
    ${items.map((it, i) => `
    <tr><td style="padding:${i === 0 ? '0' : '12px'} 0 ${i === items.length - 1 ? '0' : '12px'};${i > 0 ? `border-top:1px solid ${C.border};` : ''}">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td width="36" style="vertical-align:top;padding-right:12px;font-size:20px;">${it.emoji}</td>
        <td style="vertical-align:top;">
          <p style="margin:0;font-size:14px;font-weight:600;color:${C.dark};">${it.title}</p>
          <p style="margin:2px 0 0;font-size:12px;color:${C.muted};line-height:1.4;">${it.desc}</p>
        </td>
        <td width="90" style="vertical-align:middle;text-align:right;">
          <a href="${it.link}" style="display:inline-block;padding:6px 14px;border-radius:99px;font-size:11px;font-weight:600;color:${C.blue};background-color:#eff6ff;text-decoration:none;">${it.cta} &rarr;</a>
        </td>
      </tr></table>
    </td></tr>`).join('')}
  </table>`;
}

/* ── Stat pill for hero ── */
function statPill(value: string | number, label: string) {
  return `
  <td style="text-align:center;padding:0 4px;">
    <p style="margin:0;font-size:22px;font-weight:800;color:${C.dark};line-height:1;">${value}</p>
    <p style="margin:2px 0 0;font-size:10px;font-weight:500;color:${C.faint};text-transform:uppercase;letter-spacing:0.06em;">${label}</p>
  </td>`;
}

export function buildWeeklyNewsletterHtml({
  upcoming, newlyAdded, featured, recentlyPast = [], unsubscribeToken,
}: {
  upcoming: EventItem[];
  newlyAdded: EventItem[];
  featured: EventItem[];
  recentlyPast?: EventItem[];
  unsubscribeToken?: string;
}): string {
  const weekOf = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const countries = new Set([...upcoming, ...newlyAdded].map(e => e.country)).size;
  const hero = featured[0] ?? upcoming[0];

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light only" />
<meta name="supported-color-schemes" content="light only" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<title>Investigator Events Weekly</title>
<!--[if mso]>
<noscript>
<xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
</noscript>
<![endif]-->
<style>
  :root { color-scheme: light only !important; }
  * { color-scheme: light only !important; }
  body, table, td, div, p, span, a { color-scheme: light only !important; }
  body { background-color: #ffffff !important; margin: 0; padding: 0; }
  u + .body { background-color: #ffffff !important; }

  [data-ogsc] body, [data-ogsc] .outer, [data-ogsc] td, [data-ogsc] div { background-color: #ffffff !important; color: #0f172a !important; }
  [data-ogsc] .inner, [data-ogsc] .card { background-color: #ffffff !important; }
  [data-ogsc] a { color: #2563eb !important; }
  @media (prefers-color-scheme: dark) {
    body, .outer, td, div, table { background-color: #ffffff !important; }
    .inner, .card, .review-wrap, .howto { background-color: #ffffff !important; }
    h1, h2, h3, p, td, span, div { color: #0f172a !important; }
    a { color: #2563eb !important; }
    img { opacity: 1 !important; }
  }
  @media only screen and (max-width: 599px) {
    .outer-wrap { padding: 8px !important; }
    .inner { padding: 0 20px !important; }
    .hero-img { max-height: 180px !important; }
    .stat-row td { padding: 0 2px !important; }
  }
</style>
</head>
<body class="outer body" style="margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;color:${C.dark};">

<!-- Preheader -->
<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#ffffff;">${upcoming.length} upcoming event${upcoming.length !== 1 ? 's' : ''} across ${countries} countr${countries !== 1 ? 'ies' : 'y'} &middot; investigatorevents.com &#847; &#847; &#847; &#847; &#847;</div>

<table width="100%" cellpadding="0" cellspacing="0" class="outer" style="background-color:#ffffff;">
<tr><td align="center" class="outer-wrap" style="padding:16px;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

<!-- Wave banner top -->
<tr><td style="border-radius:20px 20px 0 0;overflow:hidden;"><img src="${WAVE}" alt="" width="560" style="display:block;width:100%;height:auto;border-radius:20px 20px 0 0;" /></td></tr>

<!-- White content card -->
<tr><td class="inner card" style="background-color:${C.white};padding:0 28px;">

  <!-- Logo + date -->
  <table width="100%" cellpadding="0" cellspacing="0" style="padding-top:20px;">
    <tr>
      <td style="vertical-align:middle;">
        <img src="${LOGO}" alt="IE" width="32" height="32" style="display:inline-block;width:32px;height:32px;border-radius:50%;vertical-align:middle;border:2px solid ${C.border};" />
        <span style="display:inline-block;vertical-align:middle;margin-left:10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${C.faint};">Investigator Events</span>
      </td>
      <td style="text-align:right;vertical-align:middle;">
        <span style="font-size:11px;color:${C.faint};">${weekOf}</span>
      </td>
    </tr>
  </table>

  <!-- Title + stats -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
    <tr><td>
      <p style="margin:0;font-size:28px;font-weight:800;color:${C.dark};letter-spacing:-0.03em;line-height:1.15;">Weekly Briefing</p>
    </td></tr>
  </table>

  <!-- Stat pills -->
  <table cellpadding="0" cellspacing="0" class="stat-row" style="margin-top:16px;border:1px solid ${C.border};border-radius:12px;overflow:hidden;">
    <tr>
      ${statPill(upcoming.length, 'Upcoming')}
      <td style="width:1px;padding:8px 0;"><div style="width:1px;height:28px;background-color:${C.border};"></div></td>
      ${statPill(newlyAdded.length, 'New')}
      <td style="width:1px;padding:8px 0;"><div style="width:1px;height:28px;background-color:${C.border};"></div></td>
      ${statPill(countries, countries !== 1 ? 'Countries' : 'Country')}
    </tr>
  </table>

  <!-- Gradient accent line -->
  <div style="margin:24px 0 0;height:3px;border-radius:2px;background:linear-gradient(90deg,${C.blue},${C.purple},${C.pink});"></div>

  <!-- Featured hero -->
  ${hero ? heroCard(hero) : ''}

  <!-- Upcoming -->
  ${section('Upcoming Events', '&#128197;', upcoming.filter(e => e.id !== hero?.id))}

  <!-- Just added -->
  ${section('Just Added', '&#10024;', newlyAdded.filter(e => e.id !== hero?.id))}

  <!-- Review section -->
  ${reviewSection(recentlyPast)}

  <!-- How-to -->
  ${howToSection()}

  <!-- Primary CTA -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:36px;">
    <tr><td align="center">
      <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${SITE}/calendar" style="height:46px;v-text-anchor:middle;width:240px;" arcsize="50%" fillcolor="#2563eb">
        <w:anchorlock/><center style="color:#ffffff;font-family:sans-serif;font-size:14px;font-weight:bold;">Browse full calendar</center>
      </v:roundrect>
      <![endif]-->
      <!--[if !mso]><!-->
      <a href="${SITE}/calendar" style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,${C.blue},${C.purple});color:${C.white};text-decoration:none;font-size:14px;font-weight:700;border-radius:99px;letter-spacing:0.01em;">Browse full calendar</a>
      <!--<![endif]-->
    </td></tr>
    <tr><td align="center" style="padding-top:12px;">
      <a href="${SITE}/submit-event" style="font-size:12px;color:${C.blue};text-decoration:none;font-weight:600;">Submit an event for free &rarr;</a>
    </td></tr>
  </table>

  <div style="height:32px;"></div>
</td></tr>

<!-- Wave banner bottom (flipped) -->
<tr><td style="border-radius:0 0 20px 20px;overflow:hidden;"><img src="${WAVE}" alt="" width="560" style="display:block;width:100%;height:auto;-webkit-transform:rotate(180deg);transform:rotate(180deg);border-radius:0 0 20px 20px;" /></td></tr>

<!-- Footer -->
<tr><td style="padding:20px 8px 8px;text-align:center;">
  <p style="margin:0;font-size:12px;color:${C.muted};font-weight:500;">
    <a href="${SITE}" style="color:${C.muted};text-decoration:none;">Site</a>
    &nbsp;&middot;&nbsp;
    <a href="${SITE}/associations" style="color:${C.muted};text-decoration:none;">Associations</a>
    &nbsp;&middot;&nbsp;
    <a href="${SITE}/submit-event" style="color:${C.muted};text-decoration:none;">Submit event</a>
    &nbsp;&middot;&nbsp;
    <a href="${SITE}/directory" style="color:${C.muted};text-decoration:none;">Find a PI</a>
  </p>
  <p style="margin:10px 0 0;font-size:11px;color:${C.faint};">Investigator Events &middot; <a href="mailto:info@investigatorevents.com" style="color:${C.faint};text-decoration:none;">info@investigatorevents.com</a></p>
  <p style="margin:4px 0 0;font-size:10px;color:${C.faint};">You subscribed at <a href="${SITE}" style="color:${C.faint};text-decoration:none;">investigatorevents.com</a>${unsubscribeToken ? ` &middot; <a href="${SITE}/api/newsletter/unsubscribe?token=${unsubscribeToken}" style="color:${C.faint};text-decoration:underline;">Unsubscribe</a>` : ''}</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
