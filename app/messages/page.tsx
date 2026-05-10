import type { Metadata } from 'next';
import { MessageInbox } from '@/components/MessageInbox';

export const metadata: Metadata = { title: 'Messages' };

export default function MessagesPage({ searchParams }: { searchParams: { to?: string } }) {
  return (
    <div className="flex min-h-full flex-col bg-slate-950 lg:-mb-0" style={{ height: '100%' }}>
      <MessageInbox initialUserId={searchParams.to} />
    </div>
  );
}
