import type { Metadata } from 'next';
import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';
import './globals.css';

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans'
});

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-[var(--font-serif)]',
  weight: ['500', '600', '700']
});

export const metadata: Metadata = {
  title: 'Investigator Events',
  description: 'The global calendar for private investigator events.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="font-[var(--font-sans)]">
        <div className="relative flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
