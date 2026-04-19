import type { EventItem } from '@/lib/data/events';

function formatDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

function eventRow(event: EventItem): string {
  const date = formatDate(event.date);
  const endDate = event.endDate ? ` - ${formatDate(event.endDate)}` : '';
  const host = event.association ?? event.organiser;
  const url = `https://investigatorevents.com/events/${event.slug}`;

  return `
    <tr>
      <td style="padding:16px 0;border-bottom:1px solid #e2e8f0;">
        <a href="${url}" style="text-decoration:none;color:inherit;">
          <p style="margin:0;font-size:16px;font-weight:700;color:#0f172a;">${event.title}</p>
          <p style="margin:4px 0 0;font-size:13px;color:#64748b;">${date}${endDate} &middot; ${event.city}, ${event.country}</p>
          <p style="margin:2px 0 0;font-size:12px;color:#94a3b8;">${host} &middot; ${event.category}</p>
        </a>
      </td>
    </tr>`;
}

function eventSection(title: string, events: EventItem[]): string {
  if (events.length === 0) return '';

  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:32px;">
      <tr>
        <td>
          <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#3b82f6;">${title}</p>
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:12px;">
            ${events.map(eventRow).join('')}
          </table>
        </td>
      </tr>
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

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Investigator Events Weekly</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px -8px rgba(15,23,42,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:32px 28px;">
              <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.24em;color:rgba(255,255,255,0.6);">Investigator Events</p>
              <p style="margin:8px 0 0;font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">Weekly Briefing</p>
              <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.5);">Week of ${weekOf}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:8px 28px 32px;">
              ${eventSection('Upcoming events', upcoming)}
              ${eventSection('Newly added', newlyAdded)}
              ${eventSection('Featured', featured)}

              ${upcoming.length === 0 && newlyAdded.length === 0 ? `
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:32px;">
                <tr>
                  <td style="text-align:center;padding:24px;">
                    <p style="margin:0;font-size:14px;color:#64748b;">No new events this week. Check back soon.</p>
                  </td>
                </tr>
              </table>` : ''}

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:32px;">
                <tr>
                  <td align="center">
                    <a href="https://investigatorevents.com/calendar" style="display:inline-block;padding:12px 28px;background-color:#0f172a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;border-radius:999px;">Browse full calendar</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 28px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">
                Investigator Events &middot; Every investigator event, one global calendar.
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:#94a3b8;text-align:center;">
                <a href="https://investigatorevents.com" style="color:#3b82f6;text-decoration:none;">Visit site</a>
                &nbsp;&middot;&nbsp;
                <a href="https://investigatorevents.com/associations" style="color:#3b82f6;text-decoration:none;">Associations</a>
                &nbsp;&middot;&nbsp;
                <a href="https://investigatorevents.com/submit-event" style="color:#3b82f6;text-decoration:none;">Submit event</a>
              </p>
              <p style="margin:12px 0 0;font-size:10px;color:#cbd5e1;text-align:center;">
                You received this because you subscribed at investigatorevents.com.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
