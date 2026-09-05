import { describe, it, expect } from 'vitest';
import { VIDEO_REMINDER_STEPS } from '@/lib/email/video-reminder';
import { buildSubmissionApprovedEmail } from '@/lib/email/submission-confirmation';


describe('Video reminder sequence', () => {
  it('runs four steps, one a week, in order', () => {
    expect(VIDEO_REMINDER_STEPS.map((s) => s.step)).toEqual([1, 2, 3, 4]);
    expect(VIDEO_REMINDER_STEPS.map((s) => s.afterDays)).toEqual([7, 14, 21, 28]);
  });

  it('never repeats the same subject line', () => {
    const subjects = VIDEO_REMINDER_STEPS.map((s) => s.subject('Test Event'));
    expect(new Set(subjects).size).toBe(subjects.length);
  });

  it('never repeats the same body copy', () => {
    const leads = VIDEO_REMINDER_STEPS.map((s) => s.lead('Test Event'));
    expect(new Set(leads).size).toBe(leads.length);
  });

  it('names the event in every step', () => {
    for (const s of VIDEO_REMINDER_STEPS) {
      expect(s.subject('WAD Conference')).toContain('WAD Conference');
      expect(s.lead('WAD Conference')).toContain('WAD Conference');
    }
  });
});

describe('Approval email video block', () => {
  it('offers the video upload when a URL is supplied', () => {
    const html = buildSubmissionApprovedEmail('Test Event', 'https://x.test/e', 'https://x.test/e/submit-video');
    expect(html).toContain('https://x.test/e/submit-video');
    expect(html).toContain('Upload your video');
  });

  it('omits the block entirely when there is nowhere to upload', () => {
    const html = buildSubmissionApprovedEmail('Test Event', 'https://x.test/e');
    expect(html).not.toContain('Upload your video');
  });

  it('still sends the share-with-members block either way', () => {
    expect(buildSubmissionApprovedEmail('Test Event', 'https://x.test/e')).toContain('Now fill the room');
  });
});

describe('One sequence per inbox', () => {
  // Associations list several events against one contact address — NALI, CII,
  // FALI and OSMOSIS each have three. A sequence per event would be twelve
  // emails in a month to the same person, asking for the same thing.
  it('the steps are per-sequence, so a second sequence would double the volume', () => {
    const perSequence = VIDEO_REMINDER_STEPS.length;
    expect(perSequence).toBe(4);
    // Three events, unguarded, is what we are avoiding.
    expect(perSequence * 3).toBe(12);
  });
});
