'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

// Main tab routes — these don't get a back button
const TAB_ROUTES = ['/', '/calendar', '/people', '/associations', '/profile', '/messages', '/signin', '/signup'];

export function MobileBackButton() {
  const pathname = usePathname();
  const router = useRouter();

  // Don't show on main tab pages or auth pages
  const isTabRoute = TAB_ROUTES.some((r) => pathname === r);
  if (isTabRoute) return null;

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="fixed left-3 z-[51] flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white/95 shadow-md backdrop-blur-sm transition active:scale-90 lg:hidden"
      style={{ top: 'calc(3.75rem + env(safe-area-inset-top, 0px))' }}
      aria-label="Go back"
    >
      <ChevronLeft className="h-5 w-5 text-slate-700" />
    </button>
  );
}
