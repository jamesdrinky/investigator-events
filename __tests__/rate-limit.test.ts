import { describe, it, expect, beforeEach } from 'vitest';

// Test the in-memory rate limiter logic directly
describe('Rate Limiting', () => {
  let store: Map<string, number[]>;

  beforeEach(() => {
    store = new Map();
  });

  function checkLimit(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const recent = (store.get(key) ?? []).filter((ts) => now - ts < windowMs);
    if (recent.length >= maxRequests) return false;
    recent.push(now);
    store.set(key, recent);
    return true;
  }

  it('should allow requests under the limit', () => {
    expect(checkLimit('test:ip1', 5, 60000)).toBe(true);
    expect(checkLimit('test:ip1', 5, 60000)).toBe(true);
    expect(checkLimit('test:ip1', 5, 60000)).toBe(true);
  });

  it('should block requests over the limit', () => {
    for (let i = 0; i < 5; i++) {
      expect(checkLimit('test:ip2', 5, 60000)).toBe(true);
    }
    expect(checkLimit('test:ip2', 5, 60000)).toBe(false);
    expect(checkLimit('test:ip2', 5, 60000)).toBe(false);
  });

  it('should track different keys independently', () => {
    for (let i = 0; i < 5; i++) {
      checkLimit('test:ip3', 5, 60000);
    }
    expect(checkLimit('test:ip3', 5, 60000)).toBe(false);
    expect(checkLimit('test:ip4', 5, 60000)).toBe(true);
  });

  it('should allow requests after window expires', () => {
    const now = Date.now();
    store.set('test:ip5', [now - 70000, now - 65000, now - 62000, now - 61000, now - 60001]);
    // All timestamps are > 60s old, so should be filtered out
    expect(checkLimit('test:ip5', 5, 60000)).toBe(true);
  });
});
