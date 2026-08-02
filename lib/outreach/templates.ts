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
