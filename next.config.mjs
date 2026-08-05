/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self' https://accounts.google.com https://www.linkedin.com",
  "object-src 'none'",
  // 'self' so /widget can preview our own /embed iframe.
  "frame-src 'self' https://accounts.google.com https://www.linkedin.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  `script-src 'self' 'unsafe-inline' https://accounts.google.com${isProd ? '' : " 'unsafe-eval'"}`,
  `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.resend.com${isProd ? '' : ' http://127.0.0.1:* http://localhost:* ws://127.0.0.1:* ws://localhost:*'}`,
  "worker-src 'self' blob:",
  'upgrade-insecure-requests'
].join('; ');

const nextConfig = {
  poweredByHeader: false,
  // Bake the deployed commit into the client bundle so the running app can
  // tell whether it's stale (see components/AppUpdater.tsx).
  env: {
    NEXT_PUBLIC_BUILD_SHA:
      process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? 'dev',
  },
  experimental: {
    typedRoutes: true,
    // Keep ffmpeg-static out of the webpack bundle so its binary path resolves
    // correctly at runtime, and trace the binary into the transcode functions.
    serverComponentsExternalPackages: ['ffmpeg-static', 'sharp'],
    outputFileTracingIncludes: {
      '/api/cron/transcode-videos': ['./node_modules/ffmpeg-static/ffmpeg'],
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'cdn1.iconfinder.com' },
      { protocol: 'https', hostname: 'dbeyznsxcetpwfcicimz.supabase.co' },
    ],
    // Default cache TTL is 60s — far too aggressive re-optimisation. Bump to
    // 24h so association logos, city images, avatars, and event covers don't
    // get re-processed by Next on every render.
    minimumCacheTTL: 60 * 60 * 24,
    // AVIF first (smaller), WebP fallback. Cuts image payload 30-50%.
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        // Everything except /embed — the embeddable widget must be frameable
        // by partner sites, and multiple CSP headers intersect (a second
        // permissive header can't undo frame-ancestors 'none').
        source: '/((?!embed).*)',
        headers: [
          { key: 'Content-Security-Policy', value: contentSecurityPolicy },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          ...(isProd ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' }] : [])
        ]
      },
      {
        // The widget: frameable anywhere, but keep the rest of the policy tight.
        source: '/embed/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: [
            "default-src 'self'",
            "frame-ancestors *",
            "img-src 'self' data: https:",
            "style-src 'unsafe-inline'",
            "script-src 'none'",
          ].join('; ') },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ]
      },
      // Cache static assets aggressively — faster repeat page loads
      {
        source: '/cities/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }]
      },
      {
        source: '/logo/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }]
      },
      {
        source: '/associations/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }]
      },
      {
        source: '/hero/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }]
      },
    ];
  }
};

export default nextConfig;
