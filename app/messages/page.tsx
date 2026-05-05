import type { Metadata } from 'next';
import { MessageInbox } from '@/components/MessageInbox';

export const metadata: Metadata = { title: 'Messages' };

export default function MessagesPage({ searchParams }: { searchParams: { to?: string } }) {
  return (
    <main className="flex flex-col bg-slate-950 overflow-hidden" style={{ height: 'calc(100dvh - 3.25rem - 4.5rem - env(safe-area-inset-top, 0px))' }}>
      <div className="container-shell flex min-h-0 flex-1 py-4">
        <MessageInbox initialUserId={searchParams.to} />
      </div>
    </main>
  );
}
