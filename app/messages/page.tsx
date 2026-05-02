import type { Metadata } from 'next';
import { MessageInbox } from '@/components/MessageInbox';

export const metadata: Metadata = { title: 'Messages' };

export default function MessagesPage({ searchParams }: { searchParams: { to?: string } }) {
  return (
    <main className="flex h-[calc(100dvh-3.25rem-4.5rem)] flex-col bg-slate-950 sm:h-[calc(100dvh-4rem-4.5rem)] lg:h-[calc(100dvh-4.75rem)]">
      <div className="container-shell flex min-h-0 flex-1 py-4">
        <MessageInbox initialUserId={searchParams.to} />
      </div>
    </main>
  );
}
