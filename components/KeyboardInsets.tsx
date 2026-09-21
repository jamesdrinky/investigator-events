'use client';

import { useEffect } from 'react';

/**
 * Keeps the focused field above the on-screen keyboard.
 *
 * On iOS the keyboard overlays the page rather than resizing it, so a field
 * near the bottom — the newsletter box, the submit form, search — ends up
 * underneath it and you cannot see what you are typing.
 *
 * Two things happen here:
 *   1. --keyboard-height is published on <html> from visualViewport, so any
 *      component can reserve space for the keyboard in CSS.
 *   2. On focus, if the field would sit under the keyboard, it is scrolled
 *      into view once the keyboard has finished animating.
 *
 * Deliberately global: the same bug existed on every form, and MessageInbox
 * had already grown its own local copy of the viewport half of this.
 */
export function KeyboardInsets() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const vv = window.visualViewport;
    if (!vv) return;

    const publishHeight = () => {
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      document.documentElement.style.setProperty('--keyboard-height', `${offset}px`);
    };

    const FIELD = 'input:not([type=hidden]):not([type=checkbox]):not([type=radio]), textarea, select, [contenteditable="true"]';

    const revealFocused = (event: FocusEvent) => {
      const el = event.target;
      if (!(el instanceof HTMLElement) || !el.matches(FIELD)) return;

      // The keyboard animates in over roughly a quarter of a second; measuring
      // before it settles reads the pre-keyboard viewport and does nothing.
      window.setTimeout(() => {
        const rect = el.getBoundingClientRect();
        const visibleBottom = vv.height + vv.offsetTop;
        // 24px so the field is clear of the keyboard edge, not flush against it.
        if (rect.bottom > visibleBottom - 24 || rect.top < 0) {
          el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      }, 300);
    };

    vv.addEventListener('resize', publishHeight);
    vv.addEventListener('scroll', publishHeight);
    document.addEventListener('focusin', revealFocused);
    publishHeight();

    return () => {
      vv.removeEventListener('resize', publishHeight);
      vv.removeEventListener('scroll', publishHeight);
      document.removeEventListener('focusin', revealFocused);
      document.documentElement.style.removeProperty('--keyboard-height');
    };
  }, []);

  return null;
}
