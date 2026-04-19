import type { EventItem } from '@/lib/data/events';
import { findAssociationBranding } from '@/lib/utils/association-branding';

const SITE = 'https://investigatorevents.com';

function formatDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

function formatDateFull(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  const event = new Date(`${dateStr}T00:00:00Z`);
  return Math.ceil((event.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function countdownBadge(dateStr: string): string {
  const days = daysUntil(dateStr);
  if (days <= 0) return '<span style="display:inline-block;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:700;background-color:#fee2e2;color:#dc2626;">Now</span>';
  if (days <= 7) return `<span style="display:inline-block;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:700;background-color:#fef3c7;color:#d97706;">${days}d</span>`;
  if (days <= 14) return `<span style="display:inline-block;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:700;background-color:#dbeafe;color:#2563eb;">${days}d</span>`;
  return '';
}

function categoryColour(category: string): { bg: string; fg: string } {
  switch (category.toLowerCase()) {
    case 'conference': return { bg: '#dbeafe', fg: '#1d4ed8' };
    case 'training': return { bg: '#fce7f3', fg: '#be185d' };
    case 'association meeting': return { bg: '#d1fae5', fg: '#047857' };
    case 'seminar': return { bg: '#ede9fe', fg: '#6d28d9' };
    case 'expo': return { bg: '#fef3c7', fg: '#b45309' };
    case 'summit': return { bg: '#e0e7ff', fg: '#3730a3' };
    default: return { bg: '#f1f5f9', fg: '#475569' };
  }
}

function logoUrl(event: EventItem): string | null {
  const label = event.association ?? event.organiser;
  const branding = findAssociationBranding(label);
  if (!branding?.logoFileName) return null;
  return `${SITE}/associations/${branding.logoFileName}`;
}

function coverImageUrl(event: EventItem): string | null {
  if (event.coverImage && event.coverImage.startsWith('/')) return `${SITE}${event.coverImage}`;
  if (event.coverImage && event.coverImage.startsWith('http')) return event.coverImage;
  return null;
}

function countryFlag(country: string): string {
  const flags: Record<string, string> = {
    'United States': '\u{1F1FA}\u{1F1F8}', 'United Kingdom': '\u{1F1EC}\u{1F1E7}', 'Germany': '\u{1F1E9}\u{1F1EA}',
    'France': '\u{1F1EB}\u{1F1F7}', 'Italy': '\u{1F1EE}\u{1F1F9}', 'Spain': '\u{1F1EA}\u{1F1F8}',
    'Netherlands': '\u{1F1F3}\u{1F1F1}', 'Morocco': '\u{1F1F2}\u{1F1E6}', 'Czech Republic': '\u{1F1E8}\u{1F1FF}',
    'Austria': '\u{1F1E6}\u{1F1F9}', 'Romania': '\u{1F1F7}\u{1F1F4}', 'Portugal': '\u{1F1F5}\u{1F1F9}',
    'India': '\u{1F1EE}\u{1F1F3}', 'Australia': '\u{1F1E6}\u{1F1FA}', 'Canada': '\u{1F1E8}\u{1F1E6}',
    'Ireland': '\u{1F1EE}\u{1F1EA}', 'Switzerland': '\u{1F1E8}\u{1F1ED}', 'Belgium': '\u{1F1E7}\u{1F1EA}',
    'Poland': '\u{1F1F5}\u{1F1F1}', 'Hungary': '\u{1F1ED}\u{1F1FA}', 'Serbia': '\u{1F1F7}\u{1F1F8}',
    'Slovenia': '\u{1F1F8}\u{1F1EE}', 'Israel': '\u{1F1EE}\u{1F1F1}', 'Finland': '\u{1F1EB}\u{1F1EE}',
    'Denmark': '\u{1F1E9}\u{1F1F0}', 'Norway': '\u{1F1F3}\u{1F1F4}', 'Sweden': '\u{1F1F8}\u{1F1EA}',
    'Latvia': '\u{1F1F1}\u{1F1FB}', 'Colombia': '\u{1F1E8}\u{1F1F4}', 'Costa Rica': '\u{1F1E8}\u{1F1F7}',
  };
  return flags[country] ?? '\u{1F310}';
}

// ── Featured hero card with cover image ──
function featuredHeroCard(event: EventItem): string {
  const url = `${SITE}/events/${event.slug}`;
  const cover = coverImageUrl(event);
  const host = event.association ?? event.organiser;
  const logo = logoUrl(event);
  const cat = categoryColour(event.category);

  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:24px;">
      <tr>
        <td>
          <a href="${url}" style="text-decoration:none;color:inherit;display:block;">
            <!-- Cover image -->
            ${cover ? `
            <div style="border-radius:12px;overflow:hidden;height:180px;background-color:#1e293b;">
              <img src="${cover}" alt="${event.title}" width="100%" style="display:block;width:100%;height:180px;object-fit:cover;border-radius:12px;" />
            </div>` : `
            <div style="border-radius:12px;overflow:hidden;height:120px;background:linear-gradient(135deg,#0f172a,#1e293b);display:flex;align-items:center;justify-content:center;">
              ${logo ? `<img src="${logo}" alt="${host}" width="64" height="64" style="display:block;margin:28px auto;max-height:64px;filter:brightness(0) invert(1);opacity:0.5;" />` : ''}
            </div>`}

            <!-- Event info -->
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:14px;">
              <tr>
                <td>
                  <table cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      ${logo ? `<td style="padding-right:12px;vertical-align:top;">
                        <img src="${logo}" alt="${host}" width="36" height="36" style="display:block;width:36px;height:36px;border-radius:8px;object-fit:contain;border:1px solid #e2e8f0;" />
                      </td>` : ''}
                      <td style="vertical-align:top;">
                        <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:#3b82f6;">Featured</p>
                        <p style="margin:3px 0 0;font-size:18px;font-weight:800;color:#0f172a;line-height:1.2;">${event.title}</p>
                        <p style="margin:6px 0 0;font-size:13px;color:#64748b;">${countryFlag(event.country)} ${event.city}, ${event.country} &middot; ${formatDateFull(event.date)}${event.endDate ? ` - ${formatDateFull(event.endDate)}` : ''}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </a>
        </td>
      </tr>
    </table>`;
}

// ── Event card with logo, badge, countdown ──
function eventCard(event: EventItem): string {
  const url = `${SITE}/events/${event.slug}`;
  const host = event.association ?? event.organiser;
  const logo = logoUrl(event);
  const cat = categoryColour(event.category);
  const countdown = countdownBadge(event.date);

  return `
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid #f1f5f9;">
        <a href="${url}" style="text-decoration:none;color:inherit;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              ${logo ? `<td width="40" style="vertical-align:top;padding-right:12px;">
                <img src="${logo}" alt="${host}" width="40" height="40" style="display:block;width:40px;height:40px;border-radius:10px;object-fit:contain;border:1px solid #e2e8f0;background:#fff;" />
              </td>` : ''}
              <td style="vertical-align:top;">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td>
                      <p style="margin:0;font-size:15px;font-weight:700;color:#0f172a;line-height:1.3;">${event.title}</p>
                    </td>
                    <td width="40" style="text-align:right;vertical-align:top;">
                      ${countdown}
                    </td>
                  </tr>
                </table>
                <p style="margin:4px 0 0;font-size:12px;color:#64748b;">
                  ${countryFlag(event.country)} ${event.city}, ${event.country} &middot; ${formatDateFull(event.date)}${event.endDate ? ` - ${formatDate(event.endDate)}` : ''}
                </p>
                <table cellpadding="0" cellspacing="0" role="presentation" style="margin-top:6px;">
                  <tr>
                    <td style="padding-right:6px;">
                      <span style="display:inline-block;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:600;background-color:${cat.bg};color:${cat.fg};">${event.category}</span>
                    </td>
                    <td>
                      <span style="font-size:11px;color:#94a3b8;">${host}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </a>
      </td>
    </tr>`;
}

function eventSection(title: string, subtitle: string, events: EventItem[]): string {
  if (events.length === 0) return '';

  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:32px;">
      <tr>
        <td style="padding-bottom:4px;border-bottom:2px solid #0f172a;">
          <p style="margin:0;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#0f172a;">${title}</p>
          <p style="margin:2px 0 0;font-size:11px;color:#94a3b8;">${subtitle}</p>
        </td>
      </tr>
      ${events.map(eventCard).join('')}
    </table>`;
}

export function buildWeeklyNewsletterHtml({
  upcoming,
  newlyAdded,
  featured,
}: {
  upcoming: EventItem[];
  newlyAdded: EventItem[];
  featured: EventItem[];
}): string {
  const now = new Date();
  const weekOf = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  // Stats for the intro
  const totalEvents = new Set([...upcoming, ...newlyAdded, ...featured].map(e => e.id)).size;
  const countries = new Set([...upcoming, ...newlyAdded].map(e => e.country)).size;
  const associations = new Set([...upcoming, ...newlyAdded].map(e => e.association ?? e.organiser)).size;

  // Pick top featured event for hero
  const heroEvent = featured[0] ?? upcoming[0];
  const remainingFeatured = featured.slice(heroEvent === featured[0] ? 1 : 0);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Investigator Events — Weekly Briefing</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f1f5f9;padding:24px 12px;">
    <tr>
      <td align="center">
        <!-- Preheader text (hidden, shows in inbox preview) -->
        <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#f1f5f9;">
          ${upcoming.length} upcoming event${upcoming.length !== 1 ? 's' : ''} across ${countries} countr${countries !== 1 ? 'ies' : 'y'} this week.
        </div>

        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:580px;">

          <!-- Top bar with logo -->
          <tr>
            <td style="padding:0 0 16px;text-align:center;">
              <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto;">
                <tr>
                  <td style="padding-right:10px;vertical-align:middle;">
                    <img src="${SITE}/logo/ielogo1.PNG" alt="IE" width="32" height="32" style="display:block;width:32px;height:32px;border-radius:50%;" />
                  </td>
                  <td style="vertical-align:middle;">
                    <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;color:#64748b;">Investigator Events</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main card -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,0.06),0 8px 28px -12px rgba(15,23,42,0.1);">

                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#0f172a 100%);padding:36px 28px 32px;">
                    <p style="margin:0;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.03em;line-height:1.1;">Weekly Briefing</p>
                    <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.45);font-weight:500;">${weekOf}</p>

                    <!-- Stats pills -->
                    <table cellpadding="0" cellspacing="0" role="presentation" style="margin-top:18px;">
                      <tr>
                        <td style="padding-right:6px;">
                          <span style="display:inline-block;padding:5px 12px;border-radius:99px;font-size:11px;font-weight:700;background-color:rgba(59,130,246,0.15);color:#93c5fd;">${upcoming.length} upcoming</span>
                        </td>
                        <td style="padding-right:6px;">
                          <span style="display:inline-block;padding:5px 12px;border-radius:99px;font-size:11px;font-weight:700;background-color:rgba(16,185,129,0.15);color:#6ee7b7;">${newlyAdded.length} new</span>
                        </td>
                        <td>
                          <span style="display:inline-block;padding:5px 12px;border-radius:99px;font-size:11px;font-weight:700;background-color:rgba(255,255,255,0.08);color:rgba(255,255,255,0.5);">${countries} countr${countries !== 1 ? 'ies' : 'y'}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:4px 28px 36px;">

                    <!-- Hero featured event -->
                    ${heroEvent ? featuredHeroCard(heroEvent) : ''}

                    <!-- Upcoming events -->
                    ${eventSection('Upcoming', `Next 30 days \u00b7 ${upcoming.length} event${upcoming.length !== 1 ? 's' : ''}`, upcoming)}

                    <!-- Newly added -->
                    ${eventSection('Just Added', 'Listed this week', newlyAdded)}

                    <!-- More featured -->
                    ${remainingFeatured.length > 0 ? eventSection('Also Featured', 'Don\u2019t miss these', remainingFeatured) : ''}

                    ${upcoming.length === 0 && newlyAdded.length === 0 ? `
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:32px;">
                      <tr>
                        <td style="text-align:center;padding:32px 16px;background-color:#f8fafc;border-radius:12px;">
                          <p style="margin:0;font-size:14px;color:#64748b;">Quiet week. We\u2019ll be back with more soon.</p>
                        </td>
                      </tr>
                    </table>` : ''}

                    <!-- CTA -->
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:36px;">
                      <tr>
                        <td align="center">
                          <a href="${SITE}/calendar" style="display:inline-block;padding:14px 36px;background-color:#0f172a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;border-radius:999px;letter-spacing:0.01em;">Browse full calendar</a>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding-top:12px;">
                          <a href="${SITE}/submit-event" style="font-size:12px;color:#3b82f6;text-decoration:none;font-weight:600;">Submit an event for free &rarr;</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding:24px 28px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="vertical-align:middle;">
                          <p style="margin:0;font-size:11px;font-weight:600;color:#64748b;">Investigator Events</p>
                          <p style="margin:2px 0 0;font-size:10px;color:#94a3b8;">Every investigator event. One global calendar.</p>
                        </td>
                        <td style="text-align:right;vertical-align:middle;">
                          <a href="${SITE}" style="display:inline-block;padding:6px 14px;border-radius:99px;font-size:11px;font-weight:600;color:#3b82f6;background-color:#eff6ff;text-decoration:none;">Visit site</a>
                        </td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:16px;border-top:1px solid #e2e8f0;padding-top:14px;">
                      <tr>
                        <td style="text-align:center;">
                          <p style="margin:0;font-size:10px;color:#cbd5e1;">
                            <a href="${SITE}/associations" style="color:#94a3b8;text-decoration:none;">Associations</a>
                            &nbsp;\u00b7&nbsp;
                            <a href="${SITE}/calendar" style="color:#94a3b8;text-decoration:none;">Calendar</a>
                            &nbsp;\u00b7&nbsp;
                            <a href="${SITE}/directory" style="color:#94a3b8;text-decoration:none;">Find a PI</a>
                            &nbsp;\u00b7&nbsp;
                            <a href="${SITE}/submit-event" style="color:#94a3b8;text-decoration:none;">Submit event</a>
                          </p>
                          <p style="margin:10px 0 0;font-size:9px;color:#cbd5e1;">
                            You received this because you subscribed at investigatorevents.com.
                            <br />info@investigatorevents.com
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Outer footer -->
          <tr>
            <td style="padding:16px 0 0;text-align:center;">
              <p style="margin:0;font-size:9px;color:#94a3b8;">&copy; ${new Date().getFullYear()} Investigator Events</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
