import type { EventItem } from '@/lib/data/events';
import { findAssociationBranding } from '@/lib/utils/association-branding';
import { getEventImage, getCityHeroImageUrl } from '@/lib/utils/city-media';
import { slugifyEventTitle } from '@/lib/utils/event-slugs';

const SITE = 'https://investigatorevents.com';
const LOGO = `${SITE}/logo/ielogo1.PNG`;
const WAVE = `${SITE}/email/wave-banner.png`;

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

/* ── Hero featured card ── */
function heroCard(ev: EventItem) {
  const url = `${SITE}/events/${ev.slug}`;
  const img = eventCover(ev);
  const lg = assocLogo(ev);
  const host = ev.association ?? ev.organiser;
  const days = daysUntil(ev.date);
  const badge = days <= 0 ? 'Happening now' : days <= 7 ? `In ${days} days` : days <= 14 ? `In ${days} days` : '';

  return `
  <a href="${url}" style="text-decoration:none;display:block;">
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;border-radius:12px;overflow:hidden;border-collapse:collapse;">
      ${img ? `<tr><td><img src="${img}" alt="" width="520" style="display:block;width:100%;height:auto;max-height:200px;object-fit:cover;border-radius:12px 12px 0 0;" /></td></tr>` : ''}
      <tr><td style="padding:16px 18px 18px;background-color:#ffffff;border:1px solid #e2e8f0;${img ? 'border-top:0;border-radius:0 0 12px 12px;' : 'border-radius:12px;'}">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          ${lg ? `<td width="40" style="vertical-align:top;padding-right:12px;"><img src="${lg}" alt="" width="40" height="40" style="display:block;width:40px;height:40px;border-radius:10px;object-fit:contain;border:1px solid #e2e8f0;" /></td>` : ''}
          <td style="vertical-align:top;">
            ${badge ? `<p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#2563eb;">${badge}</p>` : ''}
            <p style="margin:0;font-size:17px;font-weight:700;color:#0f172a;line-height:1.25;">${ev.title}</p>
            <p style="margin:5px 0 0;font-size:13px;color:#64748b;">${fmtDate(ev.date)}${ev.endDate ? ` – ${fmtShort(ev.endDate)}` : ''} · ${ev.city}, ${ev.country}</p>
            <p style="margin:3px 0 0;font-size:12px;color:#94a3b8;">${host} · ${ev.category}</p>
          </td>
        </tr></table>
      </td></tr>
    </table>
  </a>`;
}

/* ── Event row with thumbnail ── */
function eventRow(ev: EventItem) {
  const url = `${SITE}/events/${ev.slug}`;
  const host = ev.association ?? ev.organiser;
  const img = eventCover(ev);
  const lg = assocLogo(ev);
  const days = daysUntil(ev.date);
  const badge = days <= 0 ? 'Now' : days <= 7 ? `${days}d` : '';

  const visual = img
    ? `<td width="68" style="vertical-align:top;padding-right:12px;"><img src="${img}" alt="" width="68" height="48" style="display:block;width:68px;height:48px;object-fit:cover;border-radius:8px;" /></td>`
    : lg
    ? `<td width="68" style="vertical-align:top;padding-right:12px;"><table width="68" height="48" cellpadding="0" cellspacing="0" style="width:68px;height:48px;border-radius:8px;background-color:#f1f5f9;"><tr><td align="center" valign="middle"><img src="${lg}" alt="" width="28" height="28" style="display:block;width:28px;height:28px;object-fit:contain;" /></td></tr></table></td>`
    : '';

  return `
  <tr><td style="padding:12px 0;border-bottom:1px solid #f1f5f9;">
    <a href="${url}" style="text-decoration:none;color:inherit;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        ${visual}
        <td style="vertical-align:top;">
          <p style="margin:0;font-size:14px;font-weight:600;color:#0f172a;line-height:1.3;">${ev.title}${badge ? ` <span style="display:inline-block;padding:1px 6px;border-radius:99px;font-size:9px;font-weight:700;background-color:#dbeafe;color:#2563eb;vertical-align:middle;margin-left:3px;">${badge}</span>` : ''}</p>
          <p style="margin:3px 0 0;font-size:12px;color:#64748b;">${fmtDate(ev.date)} · ${ev.city}, ${ev.country}</p>
          ${lg && img ? `<table cellpadding="0" cellspacing="0" style="margin-top:4px;"><tr><td style="padding-right:5px;vertical-align:middle;"><img src="${lg}" alt="" width="14" height="14" style="display:block;width:14px;height:14px;border-radius:3px;object-fit:contain;" /></td><td style="vertical-align:middle;"><span style="font-size:11px;color:#94a3b8;">${host}</span></td></tr></table>` : `<p style="margin:2px 0 0;font-size:11px;color:#94a3b8;">${host}</p>`}
        </td>
      </tr></table>
    </a>
  </td></tr>`;
}

function section(title: string, events: EventItem[]) {
  if (!events.length) return '';
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
    <tr><td style="padding-bottom:8px;"><p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#94a3b8;">${title}</p></td></tr>
    ${events.map(eventRow).join('')}
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
    <td style="padding:0 4px;vertical-align:top;width:${Math.floor(100 / events.length)}%;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:10px;background-color:#ffffff;">
        <tr><td style="padding:14px 10px;text-align:center;">
          ${lg ? `<img src="${lg}" alt="" width="32" height="32" style="display:inline-block;width:32px;height:32px;border-radius:8px;object-fit:contain;border:1px solid #e2e8f0;" />` : ''}
          <p style="margin:8px 0 0;font-size:11px;font-weight:600;color:#0f172a;line-height:1.3;">${ev.title}</p>
          <p style="margin:3px 0 0;font-size:10px;color:#94a3b8;">${host}</p>
          <a href="${url}" style="display:inline-block;margin-top:10px;padding:5px 12px;border-radius:99px;font-size:10px;font-weight:600;color:#ffffff;background-color:#2563eb;text-decoration:none;">Review</a>
        </td></tr>
      </table>
    </td>`;
  }).join('');

  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
    <tr><td>
      <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#94a3b8;">Recently happened</p>
      <p style="margin:4px 0 0;font-size:18px;font-weight:800;color:#0f172a;">Were you there? <span style="color:#2563eb;">Review it.</span></p>
      <p style="margin:4px 0 12px;font-size:12px;color:#64748b;">Takes 60 seconds. Helps the whole industry.</p>
    </td></tr>
    <tr><td><table width="100%" cellpadding="0" cellspacing="0"><tr>${cards}</tr></table></td></tr>
  </table>`;
}

/* ── How-to section ── */
function howToSection() {
  const items = [
    { title: 'Update your profile', desc: 'Add your specialisation and associations.', link: `${SITE}/profile/edit`, cta: 'Edit profile' },
    { title: 'Connect with others', desc: 'Follow investigators. Grow your network.', link: `${SITE}/people`, cta: 'Browse' },
    { title: 'Review past events', desc: 'Help others decide where to go next.', link: `${SITE}/calendar`, cta: 'Find events' },
  ];
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;background-color:#f8fafc;border-radius:12px;">
    <tr><td style="padding:16px 16px 4px;">
      <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#94a3b8;">Get more from IE</p>
    </td></tr>
    ${items.map(i => `
    <tr><td style="padding:8px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="vertical-align:top;">
          <p style="margin:0;font-size:13px;font-weight:600;color:#0f172a;">${i.title}</p>
          <p style="margin:1px 0 0;font-size:11px;color:#64748b;">${i.desc}</p>
        </td>
        <td width="80" style="vertical-align:middle;text-align:right;">
          <a href="${i.link}" style="font-size:11px;font-weight:600;color:#2563eb;text-decoration:none;">${i.cta} &rarr;</a>
        </td>
      </tr></table>
    </td></tr>`).join('')}
    <tr><td style="padding:4px 16px 12px;"></td></tr>
  </table>`;
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
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light only" />
<meta name="supported-color-schemes" content="light only" />
<title>Investigator Events Weekly</title>
<style>
  :root { color-scheme: light only !important; }
  * { color-scheme: light only !important; }
  body { background-color: #ffffff !important; margin: 0; padding: 0; }
  u + .body { background-color: #ffffff !important; }

  /* Force light mode everywhere */
  [data-ogsc] body, [data-ogsc] .outer, [data-ogsc] .inner { background-color: #ffffff !important; }
  @media (prefers-color-scheme: dark) {
    body, .outer, .inner, .card, .review-card, .howto { background-color: #ffffff !important; }
    h1, h2, h3, p, td, span, a, div { color: inherit !important; }
    .force-white { background-color: #ffffff !important; }
    .force-text { color: #0f172a !important; }
  }
</style>
</head>
<body class="outer" style="margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;color:#0f172a;">

<table width="100%" cellpadding="0" cellspacing="0" class="outer" style="background-color:#ffffff;">
<tr><td align="center" style="padding:0;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

<!-- Preheader -->
<tr><td><div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#ffffff;">${upcoming.length} upcoming event${upcoming.length !== 1 ? 's' : ''} across ${countries} countr${countries !== 1 ? 'ies' : 'y'} · investigatorevents.com &#847; &#847; &#847; &#847; &#847; &#847;</div></td></tr>

<!-- Wave banner top -->
<tr><td style="background-color:#ffffff;"><img src="${WAVE}" alt="" width="580" style="display:block;width:100%;height:auto;" /></td></tr>

<!-- Main content card -->
<tr><td class="inner card" style="background-color:#ffffff;padding:0 28px;">

  <!-- Logo + date row -->
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="vertical-align:middle;padding:4px 0 16px;">
        <img src="${LOGO}" alt="IE" width="36" height="36" style="display:inline-block;width:36px;height:36px;border-radius:50%;vertical-align:middle;" />
        <span style="display:inline-block;vertical-align:middle;margin-left:10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.18em;color:#94a3b8;">Investigator Events</span>
      </td>
      <td style="text-align:right;vertical-align:middle;padding:4px 0 16px;">
        <span style="font-size:11px;color:#94a3b8;">${weekOf}</span>
      </td>
    </tr>
  </table>

  <!-- Title -->
  <p class="force-text" style="margin:0;font-size:30px;font-weight:800;color:#0f172a;letter-spacing:-0.03em;line-height:1.1;">Weekly Briefing</p>
  <p style="margin:6px 0 0;font-size:14px;color:#64748b;">${upcoming.length} upcoming · ${newlyAdded.length} new · ${countries} countr${countries !== 1 ? 'ies' : 'y'}</p>

  <!-- Gradient divider -->
  <div style="margin:16px 0 0;height:3px;border-radius:2px;background:linear-gradient(90deg,#2563eb,#7c3aed,#ec4899);"></div>

  <!-- Featured hero -->
  ${hero ? heroCard(hero) : ''}

  <!-- Upcoming -->
  ${section('Upcoming', upcoming.filter(e => e.id !== hero?.id))}

  <!-- Just added -->
  ${section('Just added', newlyAdded.filter(e => e.id !== hero?.id))}

  <!-- Review section -->
  ${reviewSection(recentlyPast)}

  <!-- How-to -->
  ${howToSection()}

  <!-- CTA -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
    <tr><td align="center">
      <a href="${SITE}/calendar" style="display:inline-block;padding:13px 34px;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;border-radius:99px;">Browse full calendar</a>
    </td></tr>
    <tr><td align="center" style="padding-top:10px;">
      <a href="${SITE}/submit-event" style="font-size:12px;color:#2563eb;text-decoration:none;font-weight:500;">Submit an event for free &rarr;</a>
    </td></tr>
  </table>

  <div style="height:28px;"></div>
</td></tr>

<!-- Wave banner bottom (flipped) -->
<tr><td style="background-color:#ffffff;"><img src="${WAVE}" alt="" width="580" style="display:block;width:100%;height:auto;-webkit-transform:rotate(180deg);transform:rotate(180deg);" /></td></tr>

<!-- Footer -->
<tr><td style="padding:16px 4px 24px;text-align:center;background-color:#ffffff;">
  <p style="margin:0;font-size:11px;color:#94a3b8;">
    <a href="${SITE}" style="color:#64748b;text-decoration:none;font-weight:500;">Site</a>
    &nbsp;·&nbsp;
    <a href="${SITE}/associations" style="color:#64748b;text-decoration:none;font-weight:500;">Associations</a>
    &nbsp;·&nbsp;
    <a href="${SITE}/submit-event" style="color:#64748b;text-decoration:none;font-weight:500;">Submit event</a>
    &nbsp;·&nbsp;
    <a href="${SITE}/directory" style="color:#64748b;text-decoration:none;font-weight:500;">Find a PI</a>
  </p>
  <p style="margin:8px 0 0;font-size:10px;color:#cbd5e1;">Investigator Events · info@investigatorevents.com</p>
  <p style="margin:3px 0 0;font-size:9px;color:#e2e8f0;">You subscribed at investigatorevents.com${unsubscribeToken ? ` · <a href="${SITE}/api/newsletter/unsubscribe?token=${unsubscribeToken}" style="color:#94a3b8;text-decoration:underline;">Unsubscribe</a>` : ''}</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
