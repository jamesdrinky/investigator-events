import type { Metadata } from 'next';
import { CinematicNewsletterPage } from '@/components/weekly/cinematic-newsletter';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Newsletter | Investigator Events',
  description: 'Subscribe to get weekly updates on new investigator events, upcoming dates, and the PI industry.'
};

export default function WeeklyPage() {
  return <CinematicNewsletterPage />;
}
