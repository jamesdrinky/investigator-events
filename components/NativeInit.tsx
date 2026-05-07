'use client';

import { useEffect } from 'react';
import { initNativePlatform } from '@/lib/capacitor';

/** Runs once on app start — initializes status bar, keyboard handling, etc. */
export function NativeInit() {
  useEffect(() => {
    initNativePlatform();
  }, []);
  return null;
}
