import type { Metadata } from 'next';
import { AdviceContent } from '@/components/advice/advice-content';
import { SpiralIntro } from '@/components/advice/spiral-intro';

export const metadata: Metadata = {
  title: "Do's & Don'ts | Investigator Events",
  description:
    "Dos and don'ts for investigators attending forensic and investigative conferences. How to make the most of every room you walk into.",
};

export default function AdvicePage() {
  return (
    <SpiralIntro>
      <AdviceContent />
    </SpiralIntro>
  );
}
