import { describe, it, expect } from 'vitest';
import { buildIcsFeed } from '@/lib/utils/ics';

describe('Calendar export', () => {
  const event: any = {
    id: 'abc-123',
    slug: 'wad-conference-2026',
    title: 'WAD Conference 2026',
    description: 'Six days in Cannes.',
    date: '2026-09-01',
    endDate: '2026-09-06',
    city: 'Cannes',
    country: 'France',
    organiser: 'WAD',
    category: 'Conference',
    website: 'https://wad.example',
  };

  it('spans the right days, with the exclusive end iCalendar requires', () => {
    const ics = buildIcsFeed([event], { name: event.title, subscribable: false });
    expect(ics).toContain('DTSTART;VALUE=DATE:20260901');
    // 1-6 Sept inclusive means DTEND is the 7th.
    expect(ics).toContain('DTEND;VALUE=DATE:20260907');
  });

  // The Cannes bug: these headers made Apple Calendar create a new calendar
  // named after the event and file it there, instead of adding the event.
  it('omits calendar-level headers on a single-event export', () => {
    const ics = buildIcsFeed([event], { name: event.title, description: 'x', subscribable: false });
    expect(ics).not.toContain('X-WR-CALNAME');
    expect(ics).not.toContain('X-WR-CALDESC');
    expect(ics).not.toContain('REFRESH-INTERVAL');
    expect(ics).not.toContain('X-PUBLISHED-TTL');
  });

  it('keeps those headers on a subscribable feed', () => {
    const ics = buildIcsFeed([event], { name: 'All PI events', description: 'x' });
    expect(ics).toContain('X-WR-CALNAME:All PI events');
    expect(ics).toContain('REFRESH-INTERVAL;VALUE=DURATION:PT12H');
  });

  it('marks a deliberately-saved event busy, and feed entries free', () => {
    expect(buildIcsFeed([event], { name: 'x', subscribable: false })).toContain('TRANSP:OPAQUE');
    expect(buildIcsFeed([event], { name: 'x' })).toContain('TRANSP:TRANSPARENT');
  });

  it('still produces a well-formed calendar either way', () => {
    for (const subscribable of [true, false]) {
      const ics = buildIcsFeed([event], { name: 'x', subscribable });
      expect(ics).toContain('BEGIN:VCALENDAR');
      expect(ics).toContain('BEGIN:VEVENT');
      expect(ics).toContain('END:VEVENT');
      expect(ics).toContain('END:VCALENDAR');
      expect(ics).toContain('UID:abc-123@investigatorevents.com');
    }
  });
});
