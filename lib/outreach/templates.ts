/**
 * Outreach copy shared by the event-page share kit and the admin outreach
 * queue. Pure string builders — safe to import from client components.
 */

export interface OutreachEventInfo {
  slug: string;
  title: string;
  dateLine: string;
  city: string;
  country: string;
}

export function eventUrl(slug: string) {
  return `https://www.investigatorevents.com/events/${slug}`;
}

export interface OutreachTemplate {
  key: string;
  label: string;
  hint: string;
  text: string;
}

export function buildShareTemplates(e: OutreachEventInfo): OutreachTemplate[] {
  const url = eventUrl(e.slug);
  const where = [e.city, e.country].filter(Boolean).join(', ');

  return [
    {
      key: 'organizer-announce',
      label: 'Organizer post — announcement',
      hint: 'For the organizer to share with their audience',
      text: `We're delighted that ${e.title} is featured on Investigator Events — the global calendar for the investigations profession.\n\nFull event details, and who else is attending, here:\n${url}\n\nSee you in ${e.city || where} — ${e.dateLine}.\n\n#privateinvestigator #investigations #networking`,
    },
    {
      key: 'organizer-countdown',
      label: 'Organizer post — countdown',
      hint: 'Closer to the event date',
      text: `${e.title} is coming to ${e.city || where} — ${e.dateLine}.\n\nSee the programme, connect with fellow attendees before the day, and let colleagues know you're going:\n${url}\n\n#investigations #${(e.country || 'events').replace(/\s+/g, '')}`,
    },
    {
      key: 'organizer-community',
      label: 'Organizer post — who else is going?',
      hint: 'Social-proof angle',
      text: `Who else is going? ${e.title} has a live page on Investigator Events — the industry's shared events calendar.\n\nSee who's attending and say hello before ${e.city || 'the event'}:\n${url}`,
    },
    {
      key: 'ie-voice',
      label: 'IE post — for Mike / IE channels',
      hint: 'Our own voice',
      text: `Spotlight: ${e.title} — ${where}, ${e.dateLine}.\n\nOne of the events we're tracking on Investigator Events, the global calendar for the investigations profession. Details, attendees, and discussion:\n${url}`,
    },
  ];
}

export function buildAssociationPitchSubject(associationName: string) {
  return `We built ${associationName} a live events calendar — it's ready`;
}

/**
 * The magic-link association pitch: the email leads with a URL where the
 * association sees their OWN calendar already built. Demo first, ask second.
 */
export function buildAssociationPitchEmail(
  associationName: string,
  partnerUrl: string,
  upcomingCount: number,
  contactName?: string
) {
  const greeting = contactName?.trim() ? `Hi ${contactName.trim()},` : 'Hi [name],';
  const eventsLine =
    upcomingCount > 0
      ? `We already track ${upcomingCount} of your upcoming ${upcomingCount === 1 ? 'event' : 'events'} (plus the wider industry calendar), so it's populated from day one.`
      : `It shows the industry calendar for your region today, and your own events the moment they're listed — listing them is free.`;

  return `${greeting}

I'm Mike LaCorte, one of the founders of Investigator Events — the global events calendar for the investigations profession.

We've built ${associationName} a live events calendar for your website. It already exists — this link shows it running on a page styled like yours:

${partnerUrl}

${eventsLine}

What it gives your members: an always-current events page that updates itself — dates, venues, who's attending — with zero maintenance for your team, free, forever.

Getting it live takes one line of code. You don't need to touch it: reply with your web person's email address and we'll sort everything with them directly. Or if you'd rather see it in your colours first, the link above lets you customise it live.

Warm regards,
Mike LaCorte
Investigator Events · investigatorevents.com`;
}

// ---------------------------------------------------------------------------
// Console-era association pitches (drafted Aug 2026 — James/Mike to approve
// wording before use). Two variants: a fresh pitch leading with the Event
// Console, and a follow-up for associations we already emailed.
// ---------------------------------------------------------------------------

export function buildConsolePitchSubject(associationName: string) {
  return `${associationName}'s events — add them once, they go everywhere`;
}

export function buildConsolePitchEmail(
  associationName: string,
  partnerUrl: string,
  consoleUrl: string,
  upcomingCount: number,
  contactName?: string
) {
  const greeting = contactName?.trim() ? `Hi ${contactName.trim()},` : 'Hi [name],';
  const eventsLine =
    upcomingCount > 0
      ? `We already list ${upcomingCount} of your upcoming ${upcomingCount === 1 ? 'event' : 'events'}, so everything below works today.`
      : `Your calendar is ready to take its first event today.`;

  return `${greeting}

I'm Mike LaCorte, one of the founders of Investigator Events — the global events calendar for the investigations profession.

We've built ${associationName} something I think your events secretary will actually enjoy using: a free console where you manage your own events, once, in one place:

${consoleUrl}

Add an event there and — after our team verifies it — it appears simultaneously on:
• your own website (a live events section we host for you — one line of code, zero maintenance),
• the global industry calendar thousands of investigators check,
• and the personal calendars of every member who subscribes (one click, Google/Apple/Outlook).

${eventsLine} You can see the website piece already running in your colours here: ${partnerUrl}

All of it is free — our platform simply gets stronger the more complete the calendar is. If you'd like it switched on, reply with the name and email of whoever runs your events and we'll set them up the same day.

Warm regards,
Mike LaCorte
Investigator Events · investigatorevents.com`;
}

export function buildConsoleFollowUpSubject(associationName: string) {
  return `Since I last wrote — ${associationName} can now run its events through us`;
}

export function buildConsoleFollowUpEmail(
  associationName: string,
  partnerUrl: string,
  consoleUrl: string,
  contactName?: string
) {
  const greeting = contactName?.trim() ? `Hi ${contactName.trim()},` : 'Hi [name],';

  return `${greeting}

Mike LaCorte again from Investigator Events — I wrote a while back about the live events calendar we built for ${associationName} (${partnerUrl}).

Quick note because we've since launched the piece that makes it genuinely useful day-to-day: an Event Console for associations.

${consoleUrl}

Your events secretary adds an event once — we verify it — and it's instantly on your website, the global industry calendar, and the personal calendars of every member who's subscribed. No more updating three places, and the website section maintains itself.

Still free, still one line of code for your site. If you'd like it switched on, just reply with the email of whoever runs your events and we'll sort them out the same day.

Warm regards,
Mike LaCorte
Investigator Events · investigatorevents.com`;
}

export function buildOutreachEmailSubject(e: OutreachEventInfo) {
  return `${e.title} is featured on Investigator Events`;
}

export function buildOutreachEmail(e: OutreachEventInfo, contactName?: string) {
  const url = eventUrl(e.slug);
  const greeting = contactName?.trim() ? `Hi ${contactName.trim()},` : 'Hi [name],';

  return `${greeting}

I'm Mike LaCorte, one of the founders of Investigator Events — the global events calendar for the investigations profession, used by investigators across 18+ countries.

${e.title} is now featured on the platform:
${url}

Three quick things, all free:

1. Claim your page — reply to this email and we'll make sure the details, programme and imagery are exactly as you want them.

2. Share it with your attendees — when the link is posted on LinkedIn it renders a full event card automatically. There's a ready-made post below you're welcome to copy.

3. Partner with us — if you'd like to offer our members a discount code, we'll feature ${e.title} in our weekly newsletter and on the homepage in return.

Ready-made post:
---
We're delighted that ${e.title} is featured on Investigator Events — the global calendar for the investigations profession. Full event details, and who else is attending: ${url}
---

Warm regards,
Mike LaCorte
Investigator Events · investigatorevents.com`;
}
