import type { Metadata } from 'next';
import { AdviceContent } from '@/components/advice/advice-content';

export const metadata: Metadata = {
  title: "Your First PI Conference",
  description:
    "The practical dos and don'ts for investigators attending an industry conference for the first time — from preparation and networking to follow-up.",
};

export default function AdvicePage() {
  return <AdviceContent />;
}
