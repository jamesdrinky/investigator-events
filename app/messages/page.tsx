import type { Metadata } from 'next';
import { MessageInbox } from '@/components/MessageInbox';

export const metadata: Metadata = { title: 'Messages' };

export default function MessagesPage({ searchParams }: { searchParams: { to?: string } }) {
  return (
    <main className="min-h-screen bg-slate-950 pt-6 sm:pt-10">
      <div className="container-shell py-4">
        <MessageInbox initialUserId={searchParams.to} />
      </div>
    </main>
  );
}
