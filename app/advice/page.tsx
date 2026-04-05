import type { Metadata } from 'next';
import { AdviceContent } from '@/components/advice/advice-content';

export const metadata: Metadata = {
  title: 'Conference Advice | Investigator Events',
  description:
    "Dos and don'ts for investigators attending forensic and investigative conferences. How to make the most of every room you walk into.",
};

export default function AdvicePage() {
  return <AdviceContent />;
}
