import type { Metadata } from 'next';
import { MessageInbox } from '@/components/MessageInbox';

export const metadata: Metadata = { title: 'Messages' };

export default function MessagesPage({ searchParams }: { searchParams: { to?: string } }) {
  return (
    <div
      className="fixed inset-x-0 z-[55] flex flex-col bg-slate-950 lg:relative lg:inset-auto lg:z-auto lg:min-h-screen"
      style={{
        top: 'calc(3.25rem + env(safe-area-inset-top, 0px))',
        bottom: 0,
      }}
    >
      <MessageInbox initialUserId={searchParams.to} />
    </div>
  );
}
