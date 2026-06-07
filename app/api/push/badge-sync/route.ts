import { NextResponse } from 'next/server';
import { createSupabaseSSRServerClient } from '@/lib/supabase/ssr-server';
import { assertSameOriginRequest } from '@/lib/security/server';
import { updateUserBadge } from '@/lib/notifications';

// Re-sync the caller's app-icon badge to their live unread count. The client
// pings this after marking messages read (message reads happen client-side, so
// there's no server hook like there is for notifications).
export async function POST() {
  try {
    assertSameOriginRequest();
    const supabase = await createSupabaseSSRServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await updateUserBadge(user.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
