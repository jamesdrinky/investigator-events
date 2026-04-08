import type { Metadata } from 'next';
import { MessageInbox } from '@/components/MessageInbox';

export const metadata: Metadata = { title: 'Messages | Investigator Events' };

export default function MessagesPage({ searchParams }: { searchParams: { to?: string } }) {
  return (
    <main className="min-h-screen bg-slate-50 pt-20">
      <div className="container-shell py-4">
        <MessageInbox initialUserId={searchParams.to} />
      </div>
    </main>
  );
}
