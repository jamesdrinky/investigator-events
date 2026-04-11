import { NextResponse } from 'next/server';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { createSupabaseSSRServerClient } from '@/lib/supabase/ssr-server';
import { enforceRateLimit, assertSameOriginRequest } from '@/lib/security/server';

export async function POST() {
  try {
    enforceRateLimit('delete-account', { maxRequests: 3, windowMs: 60_000 });
    assertSameOriginRequest();

    const supabase = await createSupabaseSSRServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const adminClient = createSupabaseAdminServerClient();

    // Delete user data (cascading FKs handle most related data)
    await adminClient.from('posts').delete().eq('user_id', user.id);
    await adminClient.from('connections').delete().or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);
    await adminClient.from('event_attendees').delete().eq('user_id', user.id);
    await adminClient.from('work_experience').delete().eq('user_id', user.id);
    await adminClient.from('user_associations').delete().eq('user_id', user.id);
    await adminClient.from('profile_sections').delete().eq('user_id', user.id);
    await adminClient.from('saved_events').delete().eq('user_id', user.id);
    await adminClient.from('member_verifications').delete().eq('user_id', user.id);
    await adminClient.from('profiles').delete().eq('id', user.id);

    // Delete the actual auth user
    const { error } = await adminClient.auth.admin.deleteUser(user.id);
    if (error) {
      console.error('Failed to delete auth user:', error.message);
      return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Account deleted' });
  } catch (error) {
    console.error('delete-account error:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
