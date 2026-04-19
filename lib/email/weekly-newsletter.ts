import type { EventItem } from '@/lib/data/events';
import { findAssociationBranding } from '@/lib/utils/association-branding';
import { getEventImage, getCityHeroImageUrl } from '@/lib/utils/city-media';
import { slugifyEventTitle } from '@/lib/utils/event-slugs';

const SITE = 'https://investigatorevents.com';

function formatDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

function formatDateFull(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(`${dateStr}T00:00:00Z`).getTime() - Date.now()) / 86400000);
}

function assocLogoUrl(event: EventItem): string | null {
  const label = event.association ?? event.organiser;
  const branding = findAssociationBranding(label);
  if (!branding?.logoFileName) return null;
  return `${SITE}/associations/${branding.logoFileName}`;
}

function eventCoverUrl(event: EventItem): string | null {
  if (event.image_path && event.image_path.startsWith('/')) return `${SITE}${event.image_path}`;
  if (event.image_path && event.image_path.startsWith('http')) return event.image_path;
  const slug = event.slug ?? slugifyEventTitle(event.title);
  const slugImage = getEventImage(slug);
  if (slugImage) return `${SITE}${slugImage}`;
  const cityImage = getCityHeroImageUrl(event.city);
  if (cityImage) return `${SITE}${cityImage}`;
  return null;
}

function heroCard(event: EventItem): string {
  const url = `${SITE}/events/${event.slug}`;
  const cover = eventCoverUrl(event);
  const host = event.association ?? event.organiser;
  const logo = assocLogoUrl(event);
  const days = daysUntil(event.date);
  const badge = days <= 0 ? 'Happening now' : days <= 7 ? `In ${days} days` : '';

  return `
    <a href="${url}" style="text-decoration:none;color:inherit;display:block;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:20px;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
        ${cover ? `<tr><td style="background-color:#1e293b;">
          <img src="${cover}" alt="" width="512" style="display:block;width:100%;height:auto;max-height:200px;object-fit:cover;" />
        </td></tr>` : ''}
        <tr><td style="padding:16px 18px 18px;background-color:#ffffff;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              ${logo ? `<td width="38" style="vertical-align:top;padding-right:12px;">
                <img src="${logo}" alt="" width="38" height="38" style="display:block;width:38px;height:38px;border-radius:10px;object-fit:contain;border:1px solid #e2e8f0;background-color:#ffffff;" />
              </td>` : ''}
              <td style="vertical-align:top;">
                ${badge ? `<p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#2563eb;">${badge}</p>` : ''}
                <p style="margin:0;font-size:17px;font-weight:700;color:#0f172a;line-height:1.25;">${event.title}</p>
                <p style="margin:5px 0 0;font-size:13px;color:#64748b;">${formatDateFull(event.date)}${event.endDate ? ` – ${formatDate(event.endDate)}` : ''} · ${event.city}, ${event.country}</p>
                <p style="margin:3px 0 0;font-size:12px;color:#94a3b8;">${host} · ${event.category}</p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </a>`;
}

function eventRow(event: EventItem): string {
  const url = `${SITE}/events/${event.slug}`;
  const host = event.association ?? event.organiser;
  const cover = eventCoverUrl(event);
  const logo = assocLogoUrl(event);
  const days = daysUntil(event.date);
  const badge = days <= 0 ? 'Now' : days <= 7 ? `${days}d` : '';

  // Always show a visual on the left — cover photo if available, otherwise association logo on grey
  const leftCell = cover
    ? `<td width="68" style="vertical-align:top;padding-right:12px;">
        <img src="${cover}" alt="" width="68" height="48" style="display:block;width:68px;height:48px;object-fit:cover;border-radius:8px;" />
      </td>`
    : logo
    ? `<td width="68" style="vertical-align:top;padding-right:12px;">
        <div style="width:68px;height:48px;border-radius:8px;background-color:#f1f5f9;text-align:center;line-height:48px;">
          <img src="${logo}" alt="" width="28" height="28" style="display:inline-block;width:28px;height:28px;object-fit:contain;vertical-align:middle;" />
        </div>
      </td>`
    : '';

  return `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f1f5f9;">
        <a href="${url}" style="text-decoration:none;color:inherit;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              ${leftCell}
              <td style="vertical-align:top;">
                <p style="margin:0;font-size:14px;font-weight:600;color:#0f172a;line-height:1.3;">${event.title}${badge ? ` <span style="display:inline-block;padding:1px 6px;border-radius:99px;font-size:9px;font-weight:700;background-color:#dbeafe;color:#2563eb;vertical-align:middle;margin-left:3px;">${badge}</span>` : ''}</p>
                <p style="margin:3px 0 0;font-size:12px;color:#64748b;">${formatDateFull(event.date)} · ${event.city}, ${event.country}</p>
                ${logo && cover ? `<table cellpadding="0" cellspacing="0" role="presentation" style="margin-top:4px;"><tr>
                  <td style="padding-right:5px;vertical-align:middle;"><img src="${logo}" alt="" width="14" height="14" style="display:block;width:14px;height:14px;border-radius:3px;object-fit:contain;" /></td>
                  <td style="vertical-align:middle;"><p style="margin:0;font-size:11px;color:#94a3b8;">${host}</p></td>
                </tr></table>` : `<p style="margin:2px 0 0;font-size:11px;color:#94a3b8;">${host}</p>`}
              </td>
            </tr>
          </table>
        </a>
      </td>
    </tr>`;
}

function section(title: string, events: EventItem[]): string {
  if (events.length === 0) return '';
  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:28px;">
      <tr><td style="padding-bottom:8px;">
        <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#94a3b8;">${title}</p>
      </td></tr>
      ${events.map(eventRow).join('')}
    </table>`;
}

export function buildWeeklyNewsletterHtml({
  upcoming,
  newlyAdded,
  featured,
  unsubscribeToken,
}: {
  upcoming: EventItem[];
  newlyAdded: EventItem[];
  featured: EventItem[];
  unsubscribeToken?: string;
}): string {
  const weekOf = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const countries = new Set([...upcoming, ...newlyAdded].map(e => e.country)).size;
  const hero = featured[0] ?? upcoming[0];

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>Investigator Events Weekly</title>
  <!--[if mso]><style>body,table,td{font-family:Arial,sans-serif!important;}</style><![endif]-->
  <style>
    :root { color-scheme: light only !important; }
    * { color-scheme: light only !important; }
    body { background-color: #f0f4f8 !important; }
    u + .body { background-color: #f0f4f8 !important; }
    [data-ogsc] body { background-color: #f0f4f8 !important; }
    @media (prefers-color-scheme: dark) {
      body { background-color: #f0f4f8 !important; }
      .card { background-color: #ffffff !important; }
      .gradient-header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important; }
      div, td, p, span, a, h1, h2, h3 { color: inherit !important; }
      .dark-override-white { background-color: #ffffff !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;color:#0f172a;">
  <!--[if mso]><table width="580" align="center" cellpadding="0" cellspacing="0" style="border-collapse:collapse;"><tr><td><![endif]-->
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f0f4f8;padding:20px 12px;">
    <tr>
      <td align="center">
        <!-- Preheader -->
        <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#f0f4f8;">${upcoming.length} upcoming event${upcoming.length !== 1 ? 's' : ''} across ${countries} countr${countries !== 1 ? 'ies' : 'y'} · investigatorevents.com &#847; &#847; &#847;</div>

        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;">

          <!-- Logo -->
          <tr><td style="padding:8px 0 16px;text-align:center;">
            <img src="${SITE}/logo/ielogo1.PNG" alt="Investigator Events" width="36" height="36" style="display:inline-block;width:36px;height:36px;border-radius:50%;border:2px solid #ffffff;box-shadow:0 2px 8px rgba(15,23,42,0.08);" />
          </td></tr>

          <!-- Main card -->
          <tr><td>
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="card" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,0.04),0 12px 32px -12px rgba(15,23,42,0.08);">

              <!-- Gradient header -->
              <tr><td class="gradient-header" style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:28px 24px 24px;">
                <p style="margin:0;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.03em;line-height:1.1;">Weekly Briefing</p>
                <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.45);">${weekOf}</p>
                <table cellpadding="0" cellspacing="0" role="presentation" style="margin-top:14px;">
                  <tr>
                    <td style="padding-right:6px;"><span style="display:inline-block;padding:4px 10px;border-radius:99px;font-size:11px;font-weight:600;background-color:rgba(59,130,246,0.2);color:#93c5fd;">${upcoming.length} upcoming</span></td>
                    <td style="padding-right:6px;"><span style="display:inline-block;padding:4px 10px;border-radius:99px;font-size:11px;font-weight:600;background-color:rgba(16,185,129,0.2);color:#6ee7b7;">${newlyAdded.length} new</span></td>
                    <td><span style="display:inline-block;padding:4px 10px;border-radius:99px;font-size:11px;font-weight:600;background-color:rgba(255,255,255,0.1);color:rgba(255,255,255,0.5);">${countries} countr${countries !== 1 ? 'ies' : 'y'}</span></td>
                  </tr>
                </table>
              </td></tr>

              <!-- Content -->
              <tr><td class="dark-override-white" style="padding:4px 24px 32px;background-color:#ffffff;">

                ${hero ? heroCard(hero) : ''}

                ${section('Upcoming', upcoming.filter(e => e.id !== hero?.id))}

                ${section('Just added', newlyAdded.filter(e => e.id !== hero?.id))}

                ${upcoming.length === 0 && newlyAdded.length === 0 ? `
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:28px;">
                  <tr><td style="text-align:center;padding:28px;background-color:#f8fafc;border-radius:10px;">
                    <p style="margin:0;font-size:14px;color:#64748b;">Quiet week — back soon.</p>
                  </td></tr>
                </table>` : ''}

                <!-- CTA -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:32px;">
                  <tr><td align="center">
                    <a href="${SITE}/calendar" style="display:inline-block;padding:13px 34px;background-color:#0f172a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;border-radius:99px;">Browse full calendar</a>
                  </td></tr>
                  <tr><td align="center" style="padding-top:10px;">
                    <a href="${SITE}/submit-event" style="font-size:12px;color:#3b82f6;text-decoration:none;font-weight:500;">Submit an event for free &rarr;</a>
                  </td></tr>
                </table>

              </td></tr>
            </table>
          </td></tr>

          <!-- Footer -->
          <tr><td style="padding:20px 4px 0;text-align:center;">
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
            <p style="margin:3px 0 0;font-size:9px;color:#e2e8f0;">You subscribed at investigatorevents.com${unsubscribeToken ? ` · <a href="${SITE}/api/newsletter/unsubscribe?token=${unsubscribeToken}" style="color:#cbd5e1;text-decoration:underline;">Unsubscribe</a>` : ''}</p>
          </td></tr>

        </table>
      </td>
    </tr>
  </table>
  <!--[if mso]></td></tr></table><![endif]-->
</body>
</html>`;
}
