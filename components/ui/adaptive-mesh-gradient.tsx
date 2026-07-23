'use client';

import { useEffect, useState } from 'react';
import { MeshGradient } from '@paper-design/shaders-react';
import { isNativeApp } from '@/lib/capacitor';

interface AdaptiveMeshGradientProps {
  /** Shader stop colors, e.g. ['#000000', '#0a0a1a', '#1668ff', '#ffffff'].
   *  The CSS fallback uses [0] as the base, [1] as the mid, [2] as the glow. */
  colors: string[];
  width?: string;
  height?: string;
  speed?: number;
  distortion?: number;
  swirl?: number;
  grainOverlay?: number;
}

/**
 * Renders the @paper-design WebGL MeshGradient on the web, but a static CSS
 * gradient inside the native (Capacitor) app.
 *
 * Why: the Android System WebView caps how many live WebGL contexts can exist
 * ("Too many active WebGL contexts. Oldest context will be lost."). Each
 * MeshGradient holds a context, and on low-end devices exhausting that budget
 * crashes the WebView's renderer process — which takes the whole app down.
 * That was the Google Play "tapping buttons crashes the app" rejection.
 *
 * The CSS fallback is rendered during SSR and on the first client paint so
 * hydration matches; only the web then upgrades to the real shader. The native
 * app keeps the fallback and never creates a WebGL context at all. On the
 * sign-in/sign-up screens the shader is desktop-only (`hidden lg:block`), so on
 * phones this is a zero-visual-change swap; elsewhere it's a near-identical
 * dark gradient.
 */
export function AdaptiveMeshGradient({ colors, ...shaderProps }: AdaptiveMeshGradientProps) {
  const [useShader, setUseShader] = useState(false);

  useEffect(() => {
    if (!isNativeApp) setUseShader(true);
  }, []);

  if (useShader) {
    return <MeshGradient width="100%" height="100%" colors={colors} {...shaderProps} />;
  }

  const [base = '#000000', mid = '#0a0a1a', accent = '#1668ff'] = colors;
  return (
    <div
      aria-hidden
      className="h-full w-full"
      style={{
        background: `radial-gradient(130% 115% at 25% 18%, ${accent}66 0%, ${mid} 44%, ${base} 100%)`,
      }}
    />
  );
}
