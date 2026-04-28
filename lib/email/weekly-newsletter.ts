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
  white: '#ffffff',
  red: '#dc2626',
  redLight: '#fee2e2',
};

function fmtDate(d: string) { return new Date(`${d}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }); }
function fmtShort(d: string) { return new Date(`${d}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }); }
function daysUntil(d: string) { return Math.ceil((new Date(`${d}T00:00:00Z`).getTime() - Date.now()) / 86400000); }

function assocLogo(ev: EventItem) {
  const b = findAssociationBranding(ev.association ?? ev.organiser);
  return b?.logoFileName ? `${SITE}/associations/${b.logoFileName}` : null;
}

function coAssocLogo(ev: EventItem) {
  if (!ev.coAssociation) return null;
  const b = findAssociationBranding(ev.coAssociation);
  return b?.logoFileName ? `${SITE}/associations/${b.logoFileName}` : null;
}

function hostName(ev: EventItem) {
  const primary = ev.association ?? ev.organiser;
  return ev.coAssociation ? `${primary} & ${ev.coAssociation}` : primary;
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
  return `<span style="display:inline-block;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:700;background-color:${bg};color:${fg};letter-spacing:0.03em;line-height:1.4;">${text}</span>`;
}

/* ── Hero featured card ── */
function heroCard(ev: EventItem) {
  const url = `${SITE}/events/${ev.slug}`;
  const img = eventCover(ev);
  const lg = assocLogo(ev);
  const host = hostName(ev);
  const days = daysUntil(ev.date);
  const badge = days <= 0 ? 'HAPPENING NOW' : days <= 7 ? `IN ${days} DAYS` : days <= 14 ? `IN ${days} DAYS` : 'FEATURED';
  const urgent = days <= 7;

  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
    <tr><td>
      <a href="${url}" style="text-decoration:none;display:block;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${C.border};border-radius:16px;overflow:hidden;">
          ${img ? `<tr><td style="background-color:${C.bgSoft};line-height:0;font-size:0;">
            <!--[if mso]>
            <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:504px;height:220px;">
            <v:fill type="frame" src="${img}" />
            <v:textbox inset="0,0,0,0"><div style="font-size:0;line-height:0;"></div></v:textbox>
            </v:rect>
            <![endif]-->
            <!--[if !mso]><!-->
            <img src="${img}" alt="${ev.title}" width="504" height="220" class="hero-img" style="display:block;width:100%;height:220px;object-fit:cover;" />
            <!--<![endif]-->
          </td></tr>` : ''}
          <tr><td style="padding:20px 22px 22px;background-color:${C.white};">
            <div style="margin-bottom:12px;">${pill(badge, urgent ? C.redLight : C.blueLight, urgent ? C.red : C.blue)}</div>
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              ${lg ? `<td width="46" style="vertical-align:top;padding-right:14px;"><img src="${lg}" alt="${host}" width="46" height="46" style="display:block;width:46px;height:46px;border-radius:12px;border:1px solid ${C.border};background-color:${C.bgSoft};" /></td>` : ''}
              <td style="vertical-align:top;">
                <p style="margin:0;font-size:19px;font-weight:700;color:${C.dark};line-height:1.25;">${ev.title}</p>
                <p style="margin:8px 0 0;font-size:13px;color:${C.muted};">${fmtDate(ev.date)}${ev.endDate ? ` – ${fmtShort(ev.endDate)}` : ''} &middot; ${ev.city}, ${ev.country}</p>
                <p style="margin:4px 0 0;font-size:12px;color:${C.faint};">${host} &middot; ${ev.category}</p>
              </td>
            </tr></table>
          </td></tr>
        </table>
      </a>
    </td></tr>
  </table>`;
}

/* ── Event card (with image) ── */
function eventCardWithImage(ev: EventItem, img: string, lg: string | null, idx: number) {
  const url = `${SITE}/events/${ev.slug}`;
  const host = hostName(ev);
  const days = daysUntil(ev.date);
  const badge = days <= 0 ? 'Now' : days <= 7 ? `${days}d` : '';

  return `
  <tr><td style="padding:${idx === 0 ? '0' : '8px'} 0 8px;">
    <a href="${url}" style="text-decoration:none;color:inherit;display:block;">
      <table width="100%" cellpadding="0" cellspacing="0" class="ev-card" style="border:1px solid ${C.border};border-radius:12px;overflow:hidden;background-color:${C.white};">
        <tr>
          <td width="96" class="bg-soft" style="vertical-align:top;background-color:${C.bgSoft};line-height:0;font-size:0;">
            <!--[if mso]>
            <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:96px;height:82px;">
            <v:fill type="frame" src="${img}" /><v:textbox inset="0,0,0,0"><div style="font-size:0;line-height:0;"></div></v:textbox>
            </v:rect>
            <![endif]-->
            <!--[if !mso]><!-->
            <img src="${img}" alt="${ev.title}" width="96" height="82" style="display:block;width:96px;height:82px;object-fit:cover;" />
            <!--<![endif]-->
          </td>
          <td style="vertical-align:middle;padding:10px 14px;">
            <p style="margin:0;font-size:14px;font-weight:600;color:${C.dark};line-height:1.3;">${ev.title}${badge ? ` ${pill(badge, days <= 0 ? C.redLight : C.blueLight, days <= 0 ? C.red : C.blue)}` : ''}</p>
            <p style="margin:5px 0 0;font-size:12px;color:${C.muted};">${fmtDate(ev.date)} &middot; ${ev.city}, ${ev.country}</p>
            ${lg ? `<table cellpadding="0" cellspacing="0" style="margin-top:4px;"><tr><td style="padding-right:5px;vertical-align:middle;"><img src="${lg}" alt="" width="14" height="14" style="display:block;width:14px;height:14px;border-radius:4px;" /></td><td style="vertical-align:middle;"><span style="font-size:11px;color:${C.faint};">${host}</span></td></tr></table>` : `<p style="margin:3px 0 0;font-size:11px;color:${C.faint};">${host}</p>`}
          </td>
        </tr>
      </table>
    </a>
  </td></tr>`;
}

/* ── Event card (text only — no image) ── */
function eventCardTextOnly(ev: EventItem, lg: string | null, idx: number) {
  const url = `${SITE}/events/${ev.slug}`;
  const host = hostName(ev);
  const days = daysUntil(ev.date);
  const badge = days <= 0 ? 'Now' : days <= 7 ? `${days}d` : '';

  return `
  <tr><td style="padding:${idx === 0 ? '0' : '8px'} 0 8px;">
    <a href="${url}" style="text-decoration:none;color:inherit;display:block;">
      <table width="100%" cellpadding="0" cellspacing="0" class="ev-card" style="border:1px solid ${C.border};border-radius:12px;overflow:hidden;background-color:${C.white};">
        <tr>
          <td width="4" class="accent-bar" style="background-color:${C.blue};font-size:0;line-height:0;">&nbsp;</td>
          <td style="padding:14px 16px;">
            <p style="margin:0;font-size:14px;font-weight:600;color:${C.dark};line-height:1.3;">${ev.title}${badge ? ` ${pill(badge, days <= 0 ? C.redLight : C.blueLight, days <= 0 ? C.red : C.blue)}` : ''}</p>
            <p style="margin:5px 0 0;font-size:12px;color:${C.muted};">${fmtDate(ev.date)} &middot; ${ev.city}, ${ev.country}</p>
            ${lg ? `<table cellpadding="0" cellspacing="0" style="margin-top:4px;"><tr><td style="padding-right:5px;vertical-align:middle;"><img src="${lg}" alt="" width="14" height="14" style="display:block;width:14px;height:14px;border-radius:4px;" /></td><td style="vertical-align:middle;"><span style="font-size:11px;color:${C.faint};">${host}</span></td></tr></table>` : `<p style="margin:3px 0 0;font-size:11px;color:${C.faint};">${host}</p>`}
          </td>
        </tr>
      </table>
    </a>
  </td></tr>`;
}

/* ── Event row (picks card style based on image availability) ── */
function eventRow(ev: EventItem, idx: number) {
  const img = eventCover(ev);
  const lg = assocLogo(ev);
  if (img) return eventCardWithImage(ev, img, lg, idx);
  return eventCardTextOnly(ev, lg, idx);
}

/* ── Section header ── */
function sectionHeader(title: string) {
  return `
  <tr><td style="padding-bottom:14px;">
    <table cellpadding="0" cellspacing="0"><tr>
      <td width="3" style="background-color:${C.blue};border-radius:2px;font-size:0;line-height:0;">&nbsp;</td>
      <td style="padding-left:10px;vertical-align:middle;"><p style="margin:0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${C.muted};">${title}</p></td>
    </tr></table>
  </td></tr>`;
}

/* ── Section ── */
function section(title: string, events: EventItem[]) {
  if (!events.length) return '';
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:40px;">
    ${sectionHeader(title)}
    ${events.map((ev, i) => eventRow(ev, i)).join('')}
  </table>`;
}

/* ── Review card ── */
function reviewCard(ev: EventItem) {
  const lg = assocLogo(ev);
  const host = hostName(ev);
  const img = eventCover(ev);
  const url = `${SITE}/events/${ev.slug}`;

  return `
  <tr><td style="padding-bottom:10px;">
    <a href="${url}" style="text-decoration:none;display:block;">
      <table width="100%" cellpadding="0" cellspacing="0" class="ev-card" style="border:1px solid ${C.border};border-radius:12px;overflow:hidden;background-color:${C.white};">
        <tr>
          ${img ? `<td width="110" class="bg-soft" style="vertical-align:top;background-color:${C.bgSoft};line-height:0;font-size:0;">
            <!--[if mso]>
            <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:110px;height:90px;">
            <v:fill type="frame" src="${img}" /><v:textbox inset="0,0,0,0"><div style="font-size:0;line-height:0;"></div></v:textbox>
            </v:rect>
            <![endif]-->
            <!--[if !mso]><!-->
            <img src="${img}" alt="${ev.title}" width="110" height="90" style="display:block;width:110px;height:90px;object-fit:cover;" />
            <!--<![endif]-->
          </td>` : ''}
          <td style="vertical-align:middle;padding:14px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td>
                ${lg ? `<img src="${lg}" alt="" width="18" height="18" style="display:inline-block;width:18px;height:18px;border-radius:5px;vertical-align:middle;border:1px solid ${C.border};margin-right:6px;background-color:${C.bgSoft};" />` : ''}<span style="font-size:10px;color:${C.faint};vertical-align:middle;">${host}</span>
              </td></tr>
              <tr><td style="padding-top:5px;">
                <p style="margin:0;font-size:13px;font-weight:600;color:${C.dark};line-height:1.3;">${ev.title}</p>
              </td></tr>
              <tr><td style="padding-top:8px;">
                <span style="display:inline-block;padding:5px 14px;border-radius:99px;font-size:10px;font-weight:700;color:${C.white};background-color:${C.blue};letter-spacing:0.02em;">Leave a review &rarr;</span>
              </td></tr>
            </table>
          </td>
        </tr>
      </table>
    </a>
  </td></tr>`;
}

/* ── Review section ── */
function reviewSection(events: EventItem[]) {
  if (!events.length) return '';

  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:40px;">
    <tr><td class="review-bg" style="padding:24px 20px;background-color:#f0f4ff;border-radius:16px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding-bottom:16px;">
          <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:${C.blue};">Recently happened</p>
          <p style="margin:8px 0 0;font-size:20px;font-weight:800;color:${C.dark};line-height:1.2;">Were you there?</p>
          <p style="margin:4px 0 0;font-size:13px;color:${C.muted};line-height:1.45;">Share your experience — takes 60 seconds, helps the whole industry.</p>
        </td></tr>
        ${events.map(ev => reviewCard(ev)).join('')}
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
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:40px;">
    <tr><td style="padding-bottom:14px;">
      <table cellpadding="0" cellspacing="0"><tr>
        <td width="3" style="background-color:${C.purple};border-radius:2px;font-size:0;line-height:0;">&nbsp;</td>
        <td style="padding-left:10px;vertical-align:middle;"><p style="margin:0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${C.muted};">Get more from IE</p></td>
      </tr></table>
    </td></tr>
    ${items.map((it, i) => `
    <tr><td style="padding:${i === 0 ? '0' : '10px'} 0 ${i === items.length - 1 ? '0' : '10px'};${i > 0 ? `border-top:1px solid ${C.border};` : ''}">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td width="36" style="vertical-align:top;padding-right:12px;font-size:22px;line-height:1;">${it.emoji}</td>
        <td style="vertical-align:top;">
          <p style="margin:0;font-size:14px;font-weight:600;color:${C.dark};">${it.title}</p>
          <p style="margin:3px 0 0;font-size:12px;color:${C.muted};line-height:1.4;">${it.desc}</p>
        </td>
        <td width="94" style="vertical-align:middle;text-align:right;">
          <a href="${it.link}" style="display:inline-block;padding:7px 14px;border-radius:99px;font-size:11px;font-weight:600;color:${C.blue};background-color:${C.blueBg};text-decoration:none;border:1px solid ${C.blueLight};">${it.cta} &rarr;</a>
        </td>
      </tr></table>
    </td></tr>`).join('')}
  </table>`;
}

/* ── Stat pill for hero ── */
function statPill(value: string | number, label: string) {
  return `
  <td style="text-align:center;padding:6px 12px;">
    <p style="margin:0;font-size:22px;font-weight:800;color:${C.dark};line-height:1;">${value}</p>
    <p style="margin:3px 0 0;font-size:10px;font-weight:600;color:${C.faint};text-transform:uppercase;letter-spacing:0.06em;">${label}</p>
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
  /* ── Force light mode everywhere ── */
  :root, * { color-scheme: light only !important; }
  body, table, td, div, p, span, a, tr, th { color-scheme: light only !important; }
  body { background-color: #ffffff !important; margin: 0; padding: 0; }
  u + .body, u + #body { background-color: #ffffff !important; }

  /* ── Outlook.com / Outlook Apps dark mode ── */
  [data-ogsc] body, [data-ogsc] .outer, [data-ogsc] #wrapper,
  [data-ogsc] table, [data-ogsc] td, [data-ogsc] tr, [data-ogsc] div { background-color: #ffffff !important; color: #0f172a !important; border-color: #e2e8f0 !important; }
  [data-ogsc] .inner, [data-ogsc] .card, [data-ogsc] .ev-card { background-color: #ffffff !important; }
  [data-ogsc] p, [data-ogsc] span, [data-ogsc] h1, [data-ogsc] h2, [data-ogsc] h3 { color: #0f172a !important; }
  [data-ogsc] .txt-muted { color: #64748b !important; }
  [data-ogsc] .txt-faint { color: #94a3b8 !important; }
  [data-ogsc] a { color: #2563eb !important; }
  [data-ogsc] a.btn-primary { color: #ffffff !important; background-color: #2563eb !important; }
  [data-ogsc] a.btn-outline { color: #2563eb !important; background-color: #eff6ff !important; }
  [data-ogsc] .review-bg { background-color: #f0f4ff !important; }
  [data-ogsc] .bg-soft { background-color: #f8fafc !important; }
  [data-ogsc] .accent-bar { background-color: #2563eb !important; }
  [data-ogsc] img { opacity: 1 !important; }
  [data-ogsb] body, [data-ogsb] #wrapper, [data-ogsb] table, [data-ogsb] td { background-color: #ffffff !important; }

  /* ── ProtonMail dark mode ── */
  .protonmail-dark body, .protonmail-dark table, .protonmail-dark td { background-color: #ffffff !important; color: #0f172a !important; }

  /* ── Generic dark mode override ── */
  @media (prefers-color-scheme: dark) {
    body, #wrapper, .outer, table, td, tr, div { background-color: #ffffff !important; border-color: #e2e8f0 !important; }
    .inner, .card, .ev-card { background-color: #ffffff !important; }
    h1, h2, h3, p, td, span, div { color: #0f172a !important; }
    .txt-muted { color: #64748b !important; }
    .txt-faint { color: #94a3b8 !important; }
    a { color: #2563eb !important; }
    a.btn-primary { color: #ffffff !important; background-color: #2563eb !important; }
    a.btn-outline { color: #2563eb !important; background-color: #eff6ff !important; }
    .review-bg { background-color: #f0f4ff !important; }
    .bg-soft { background-color: #f8fafc !important; }
    img { opacity: 1 !important; }
  }

  /* ── Mobile ── */
  @media only screen and (max-width: 599px) {
    .outer-wrap { padding: 4px !important; }
    .inner { padding: 0 16px !important; }
    .hero-img { height: 170px !important; }
    .stat-row td { padding: 4px 8px !important; }
    .community-col { display: block !important; width: 100% !important; padding: 0 0 8px !important; }
  }
</style>
</head>
<body id="body" class="outer body" style="margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;color:${C.dark};">
<div id="wrapper" style="background-color:#ffffff;">

<!-- Preheader -->
<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#ffffff;">${upcoming.length} upcoming event${upcoming.length !== 1 ? 's' : ''} across ${countries} countr${countries !== 1 ? 'ies' : 'y'} &middot; investigatorevents.com &#847; &#847; &#847; &#847; &#847;</div>

<table width="100%" cellpadding="0" cellspacing="0" class="outer" style="background-color:#ffffff;">
<tr><td align="center" class="outer-wrap" style="padding:16px;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

<!-- Wave banner top -->
<tr><td style="border-radius:20px 20px 0 0;overflow:hidden;background:linear-gradient(135deg,${C.blue},${C.purple});background-color:${C.blue};"><img src="${WAVE}" alt="" width="560" style="display:block;width:100%;height:auto;border-radius:20px 20px 0 0;" /></td></tr>

<!-- White content card -->
<tr><td class="inner card" style="background-color:${C.white};padding:0 28px;">

  <!-- Logo + date -->
  <table width="100%" cellpadding="0" cellspacing="0" style="padding-top:24px;">
    <tr>
      <td style="vertical-align:middle;">
        <img src="${LOGO}" alt="Investigator Events" width="32" height="32" style="display:inline-block;width:32px;height:32px;border-radius:50%;vertical-align:middle;border:2px solid ${C.border};background-color:${C.bgSoft};" />
        <span style="display:inline-block;vertical-align:middle;margin-left:10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${C.faint};">Investigator Events</span>
      </td>
      <td style="text-align:right;vertical-align:middle;">
        <span style="font-size:11px;color:${C.faint};">${weekOf}</span>
      </td>
    </tr>
  </table>

  <!-- Title -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:22px;">
    <tr><td>
      <p style="margin:0;font-size:28px;font-weight:800;color:${C.dark};letter-spacing:-0.03em;line-height:1.15;">Weekly Briefing</p>
      <p style="margin:6px 0 0;font-size:13px;color:${C.muted};line-height:1.4;">Your weekly roundup of PI conferences, meetings, and networking events worldwide.</p>
    </td></tr>
  </table>

  <!-- Stat pills -->
  <table cellpadding="0" cellspacing="0" class="stat-row bg-soft" style="margin-top:18px;background-color:${C.bgSoft};border:1px solid ${C.border};border-radius:12px;">
    <tr>
      ${statPill(upcoming.length, 'Upcoming')}
      <td style="width:1px;padding:8px 0;"><div style="width:1px;height:28px;background-color:${C.border};"></div></td>
      ${statPill(newlyAdded.length, 'New')}
      <td style="width:1px;padding:8px 0;"><div style="width:1px;height:28px;background-color:${C.border};"></div></td>
      ${statPill(countries, countries !== 1 ? 'Countries' : 'Country')}
    </tr>
  </table>

  <!-- Brand accent line -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 0;"><tr>
    <td width="33%" style="height:3px;background-color:${C.blue};font-size:0;line-height:0;">&nbsp;</td>
    <td width="34%" style="height:3px;background-color:${C.purple};font-size:0;line-height:0;">&nbsp;</td>
    <td width="33%" style="height:3px;background-color:${C.pink};font-size:0;line-height:0;">&nbsp;</td>
  </tr></table>

  <!-- Featured hero -->
  ${hero ? heroCard(hero) : ''}

  <!-- Upcoming -->
  ${section('Upcoming Events', upcoming.filter(e => e.id !== hero?.id))}

  <!-- Just added -->
  ${section('Just Added', newlyAdded.filter(e => e.id !== hero?.id))}

  <!-- Review section -->
  ${reviewSection(recentlyPast)}

  <!-- How-to -->
  ${howToSection()}

  <!-- Community section -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:40px;">
    <tr><td style="padding-bottom:14px;">
      <table cellpadding="0" cellspacing="0"><tr>
        <td width="3" style="background-color:${C.pink};border-radius:2px;font-size:0;line-height:0;">&nbsp;</td>
        <td style="padding-left:10px;vertical-align:middle;"><p style="margin:0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${C.muted};">Beyond the calendar</p></td>
      </tr></table>
    </td></tr>
    <tr><td>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="50%" class="community-col" style="padding-right:6px;vertical-align:top;">
            <a href="${SITE}/people?tab=discover" style="text-decoration:none;display:block;padding:16px;background-color:${C.blueBg};border-radius:12px;border:1px solid ${C.blueLight};">
              <p style="margin:0;font-size:13px;font-weight:700;color:${C.dark};">Find investigators</p>
              <p style="margin:5px 0 0;font-size:11px;color:${C.muted};line-height:1.4;">Connect with PIs worldwide</p>
            </a>
          </td>
          <td width="50%" class="community-col" style="padding-left:6px;vertical-align:top;">
            <a href="${SITE}/associations" style="text-decoration:none;display:block;padding:16px;background-color:#f0fdf4;border-radius:12px;border:1px solid #d1fae5;">
              <p style="margin:0;font-size:13px;font-weight:700;color:${C.dark};">Associations</p>
              <p style="margin:5px 0 0;font-size:11px;color:${C.muted};line-height:1.4;">Browse 40+ PI bodies</p>
            </a>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>

  <!-- Primary CTA -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
    <tr><td align="center">
      <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${SITE}/calendar" style="height:48px;v-text-anchor:middle;width:260px;" arcsize="50%" fillcolor="#2563eb">
        <w:anchorlock/><center style="color:#ffffff;font-family:sans-serif;font-size:14px;font-weight:bold;">Browse full calendar &rarr;</center>
      </v:roundrect>
      <![endif]-->
      <!--[if !mso]><!-->
      <a href="${SITE}/calendar" class="btn-primary" style="display:inline-block;padding:14px 44px;background-color:${C.blue};color:${C.white};text-decoration:none;font-size:14px;font-weight:700;border-radius:99px;letter-spacing:0.01em;">Browse full calendar &rarr;</a>
      <!--<![endif]-->
    </td></tr>
    <tr><td align="center" style="padding-top:12px;">
      <a href="${SITE}/submit-event" style="font-size:12px;color:${C.blue};text-decoration:none;font-weight:600;">Submit an event for free &rarr;</a>
    </td></tr>
  </table>

  <div style="height:36px;"></div>
</td></tr>

<!-- Brand divider bottom -->
<tr><td>
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td width="33%" style="height:3px;background-color:${C.blue};font-size:0;line-height:0;">&nbsp;</td>
    <td width="34%" style="height:3px;background-color:${C.purple};font-size:0;line-height:0;">&nbsp;</td>
    <td width="33%" style="height:3px;background-color:${C.pink};font-size:0;line-height:0;">&nbsp;</td>
  </tr></table>
</td></tr>

<!-- Footer -->
<tr><td style="padding:24px 8px 12px;text-align:center;">
  <p style="margin:0;font-size:12px;color:${C.muted};font-weight:500;">
    <a href="${SITE}" style="color:${C.muted};text-decoration:none;">Site</a>
    &nbsp;&middot;&nbsp;
    <a href="${SITE}/associations" style="color:${C.muted};text-decoration:none;">Associations</a>
    &nbsp;&middot;&nbsp;
    <a href="${SITE}/submit-event" style="color:${C.muted};text-decoration:none;">Submit event</a>
    &nbsp;&middot;&nbsp;
    <a href="${SITE}/directory" style="color:${C.muted};text-decoration:none;">Find a PI</a>
  </p>
  <p style="margin:12px 0 0;font-size:11px;color:${C.faint};">Investigator Events &middot; <a href="mailto:info@investigatorevents.com" style="color:${C.faint};text-decoration:none;">info@investigatorevents.com</a></p>
  <p style="margin:4px 0 0;font-size:10px;color:${C.faint};">You subscribed at <a href="${SITE}" style="color:${C.faint};text-decoration:none;">investigatorevents.com</a>${unsubscribeToken ? ` &middot; <a href="${SITE}/api/newsletter/unsubscribe?token=${unsubscribeToken}" style="color:${C.faint};text-decoration:underline;">Unsubscribe</a>` : ''}</p>
</td></tr>

</table>
</td></tr>
</table>
</div>
</body>
</html>`;
}
