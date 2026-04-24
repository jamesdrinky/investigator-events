import { describe, it, expect } from 'vitest';
import { buildSubmissionConfirmationEmail } from '@/lib/email/submission-confirmation';
import { buildWelcomeEmail } from '@/lib/email/welcome-email';
import { buildDailyDigestEmail } from '@/lib/email/daily-digest';

describe('Email Templates', () => {
  describe('Submission Confirmation', () => {
    it('should include the event name', () => {
      const html = buildSubmissionConfirmationEmail('WAD Annual Conference 2026');
      expect(html).toContain('WAD Annual Conference 2026');
    });

    it('should include the wave banner', () => {
      const html = buildSubmissionConfirmationEmail('Test Event');
      expect(html).toContain('wave-banner.png');
    });

    it('should include the IE logo', () => {
      const html = buildSubmissionConfirmationEmail('Test Event');
      expect(html).toContain('ielogo1.PNG');
    });

    it('should be valid HTML', () => {
      const html = buildSubmissionConfirmationEmail('Test Event');
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('</html>');
    });

    it('should include Outlook VML button', () => {
      const html = buildSubmissionConfirmationEmail('Test Event');
      expect(html).toContain('v:roundrect');
    });
  });

  describe('Welcome Email', () => {
    it('should greet by name when provided', () => {
      const html = buildWelcomeEmail('James');
      expect(html).toContain('Hi James');
    });

    it('should use generic greeting when no name', () => {
      const html = buildWelcomeEmail(null);
      expect(html).toContain('Welcome');
      expect(html).not.toContain('Hi null');
    });

    it('should include profile completion steps', () => {
      const html = buildWelcomeEmail('James');
      expect(html).toContain('Add your photo');
      expect(html).toContain('Set your country');
      expect(html).toContain('Follow the associations');
    });

    it('should link to profile setup', () => {
      const html = buildWelcomeEmail('James');
      expect(html).toContain('/profile/setup');
    });
  });

  describe('Daily Digest', () => {
    const notifications = [
      { type: 'follow', actorName: 'Mike LaCorte', actorAvatar: 'https://example.com/mike.jpg', actorUsername: 'mike', createdAt: new Date().toISOString() },
      { type: 'post_like', actorName: 'Charlotte Notley', actorAvatar: null, actorUsername: 'charlotte', createdAt: new Date().toISOString() },
    ];

    it('should include actor names', () => {
      const html = buildDailyDigestEmail('James', notifications);
      expect(html).toContain('Mike LaCorte');
      expect(html).toContain('Charlotte Notley');
    });

    it('should include profile pictures when available', () => {
      const html = buildDailyDigestEmail('James', notifications);
      expect(html).toContain('https://example.com/mike.jpg');
    });

    it('should show initial when no avatar', () => {
      const html = buildDailyDigestEmail('James', notifications);
      expect(html).toContain('>C</div>');
    });

    it('should include type badges', () => {
      const html = buildDailyDigestEmail('James', notifications);
      expect(html).toContain('Followed you');
      expect(html).toContain('Liked your post');
    });

    it('should include wave banner', () => {
      const html = buildDailyDigestEmail('James', notifications);
      expect(html).toContain('wave-banner.png');
    });

    it('should include summary line', () => {
      const html = buildDailyDigestEmail('James', notifications);
      expect(html).toContain('1 new follower');
      expect(html).toContain('1 like');
    });

    it('should handle empty notifications', () => {
      const html = buildDailyDigestEmail('James', []);
      expect(html).toContain('<!DOCTYPE html>');
    });

    it('should link actor names to profiles', () => {
      const html = buildDailyDigestEmail('James', notifications);
      expect(html).toContain('/profile/mike');
      expect(html).toContain('/profile/charlotte');
    });
  });
});
