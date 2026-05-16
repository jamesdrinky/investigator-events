'use client';

import { type ReactNode } from 'react';

// Previously this component did a 300ms opacity+translateY fade on every
// page load — added a noticeable lag before content appeared and caused
// micro-jank from the layout shift. Removed entirely. Pages now render
// instantly when their data is ready.
export function PageTransition({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
