import type { Metadata } from 'next';
import { MessageInbox } from '@/components/MessageInbox';

export const metadata: Metadata = { title: 'Messages' };

export default function MessagesPage({ searchParams }: { searchParams: { to?: string } }) {
  return (
    <div className="flex flex-col bg-slate-950 -mb-[4.5rem]" style={{ minHeight: 'calc(100dvh - 3.25rem)' }}>
      <MessageInbox initialUserId={searchParams.to} />
    </div>
  );
}
