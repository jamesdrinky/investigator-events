import type { Metadata } from 'next';
import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import { CookieBanner } from '@/components/CookieBanner';
import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';
import { NewsletterBanner } from '@/components/NewsletterBanner';
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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className="font-[var(--font-sans)]">
        <div className="relative flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <NewsletterBanner />
        <CookieBanner />
      </body>
    </html>
  );
}
