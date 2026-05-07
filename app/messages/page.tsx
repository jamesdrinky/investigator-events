import type { Metadata } from 'next';
import { MessageInbox } from '@/components/MessageInbox';

export const metadata: Metadata = { title: 'Messages' };

export default function MessagesPage({ searchParams }: { searchParams: { to?: string } }) {
  return (
    <main className="fixed inset-0 flex flex-col bg-slate-950" style={{ paddingTop: 'calc(3.25rem + env(safe-area-inset-top, 0px))', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <MessageInbox initialUserId={searchParams.to} />
    </main>
  );
}
