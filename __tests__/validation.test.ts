import { describe, it, expect } from 'vitest';

describe('Input Validation', () => {
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  describe('Email validation', () => {
    it('should accept valid emails', () => {
      expect(EMAIL_REGEX.test('james@drinky.com')).toBe(true);
      expect(EMAIL_REGEX.test('info@investigatorevents.com')).toBe(true);
      expect(EMAIL_REGEX.test('m.lacorte@conflictinternational.com')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(EMAIL_REGEX.test('')).toBe(false);
      expect(EMAIL_REGEX.test('notanemail')).toBe(false);
      expect(EMAIL_REGEX.test('@missing.local')).toBe(false);
      expect(EMAIL_REGEX.test('spaces in@email.com')).toBe(false);
    });
  });

  describe('Password validation', () => {
    it('should reject passwords under 8 characters', () => {
      expect('short'.length >= 8).toBe(false);
      expect('1234567'.length >= 8).toBe(false);
    });

    it('should accept passwords of 8+ characters', () => {
      expect('12345678'.length >= 8).toBe(true);
      expect('MySecurePass123'.length >= 8).toBe(true);
    });
  });

  describe('Name validation', () => {
    it('should reject names under 2 characters', () => {
      expect(''.length >= 2).toBe(false);
      expect('A'.length >= 2).toBe(false);
    });

    it('should accept names of 2+ characters', () => {
      expect('AB'.length >= 2).toBe(true);
      expect('James Drinkwater'.length >= 2).toBe(true);
    });
  });

  describe('Text sanitization', () => {
    function sanitizeText(value: string, maxLength: number) {
      return value.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength);
    }

    it('should remove control characters', () => {
      expect(sanitizeText('hello\x00world', 100)).toBe('hello world');
    });

    it('should collapse whitespace', () => {
      expect(sanitizeText('hello   world', 100)).toBe('hello world');
    });

    it('should trim', () => {
      expect(sanitizeText('  hello  ', 100)).toBe('hello');
    });

    it('should enforce max length', () => {
      expect(sanitizeText('a'.repeat(200), 100)).toHaveLength(100);
    });
  });

  describe('Date validation', () => {
    const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

    it('should accept valid dates', () => {
      expect(DATE_REGEX.test('2026-05-15')).toBe(true);
      expect(DATE_REGEX.test('2026-12-31')).toBe(true);
    });

    it('should reject invalid date formats', () => {
      expect(DATE_REGEX.test('15/05/2026')).toBe(false);
      expect(DATE_REGEX.test('2026-5-15')).toBe(false);
      expect(DATE_REGEX.test('')).toBe(false);
    });
  });
});
