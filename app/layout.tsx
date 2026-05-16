import type { Metadata } from 'next';
import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import { CookieBanner } from '@/components/CookieBanner';
import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';
import { NewsletterBanner } from '@/components/NewsletterBanner';
import { BackToTop } from '@/components/BackToTop';
import { BottomTabBar } from '@/components/BottomTabBar';
import { OfflineNotice } from '@/components/OfflineNotice';
import { PageTransition } from '@/components/PageTransition';
import { TopLoadingBar } from '@/components/TopLoadingBar';
import { GlobalHaptics } from '@/components/GlobalHaptics';
import { NativeInit } from '@/components/NativeInit';
import { MobileBackButton } from '@/components/MobileBackButton';
import { PasswordRecoveryHandler } from '@/components/PasswordRecoveryHandler';
import './globals.css';

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans'
});

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['500', '600', '700']
});

export const metadata: Metadata = {
  title: {
    default: 'Investigator Events',
    template: '%s | Investigator Events'
  },
  description: 'Confirmed conferences, AGMs, training events, and association meetings across the private investigations sector.',
  openGraph: {
    title: 'Investigator Events',
    description: 'Confirmed conferences, AGMs, training events, and association meetings across the private investigations sector.',
    siteName: 'Investigator Events',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Investigator Events',
    description: 'Confirmed conferences, AGMs, training events, and association meetings across the private investigations sector.',
  },
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* Preconnect to Supabase (auth + DB + storage all live here) — saves
            ~200ms per page load by pre-warming DNS + TLS handshake before the
            first query fires. crossOrigin set so storage image fetches reuse
            the same connection. */}
        <link rel="preconnect" href="https://dbeyznsxcetpwfcicimz.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://dbeyznsxcetpwfcicimz.supabase.co" />
        {/* Resend (used for transactional emails — though those happen
            server-side, the preconnect is harmless and helps any client-side
            ping). */}
        <link rel="dns-prefetch" href="https://api.resend.com" />
      </head>
      <body className="font-[var(--font-sans)]">
        <div data-app-shell className="relative flex min-h-screen flex-col">
          <TopLoadingBar />
          <Navbar />
          <main
            data-app-content
            className="flex-1"
            style={{ paddingBottom: 'calc(var(--app-bottom-nav-height, 0px) + 96px)' }}
          ><PageTransition>{children}</PageTransition></main>
          <Footer className="hidden lg:block" />
        </div>
        <MobileBackButton />
        <BottomTabBar />
        <PasswordRecoveryHandler />
        <OfflineNotice />
        <NewsletterBanner />
        <CookieBanner />
        <BackToTop />
        <GlobalHaptics />
        <NativeInit />
      </body>
    </html>
  );
}
