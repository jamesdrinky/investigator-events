import { NextResponse } from 'next/server';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { createSupabaseSSRServerClient } from '@/lib/supabase/ssr-server';
import { enforceRateLimit, assertSameOriginRequest, RateLimitError } from '@/lib/security/server';

// Tables that hold rows keyed by the user's id. Order doesn't matter — we
// delete each independently and swallow per-table errors so a single FK
// failure doesn't abort the whole flow. The final auth.admin.deleteUser is
// the only hard requirement (Apple Guideline 5.1.1(v): account deletion
// must actually remove the user).
const USER_ID_TABLES = [
  'post_likes', 'post_comments', 'posts',
  'event_attendees', 'saved_events', 'event_reviews', 'event_photos',
  'work_experience', 'user_associations', 'profile_sections',
  'member_verifications', 'association_admins',
  'lfg_responses', 'lfg_posts',
  'notifications', 'reports',
  'clash_checks',
  'followers',
  'profiles', // last — most FKs point at this
] as const;

export async function POST() {
  try {
    enforceRateLimit('delete-account', { maxRequests: 3, windowMs: 60_000 });
    assertSameOriginRequest();

    const supabase = await createSupabaseSSRServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const adminClient = createSupabaseAdminServerClient();
    const uid = user.id;

    // Preferred path: a single atomic RPC defined in Supabase. If it doesn't
    // exist (error 42883 = undefined_function), fall through to the per-table
    // best-effort sweep below.
    const { error: rpcError } = await (adminClient.rpc as any)('delete_user_data', { target_user_id: uid });
    if (rpcError && rpcError.code !== '42883') {
      console.error('[delete-account] rpc error', { code: rpcError.code, message: rpcError.message });
    }

    if (!rpcError || rpcError.code === '42883') {
      // RPC missing OR succeeded. Either way do the per-table sweep too — it's
      // a no-op if the RPC already cleaned things up, and a safety net if not.
      for (const table of USER_ID_TABLES) {
        try {
          if (table === 'profiles') {
            await adminClient.from('profiles').delete().eq('id', uid);
          } else if (table === 'followers') {
            await adminClient.from('followers' as any).delete().or(`follower_id.eq.${uid},followed_id.eq.${uid}`);
          } else if (table === 'reports') {
            await adminClient.from('reports' as any).delete().or(`reporter_id.eq.${uid},reported_user_id.eq.${uid}`);
          } else {
            await adminClient.from(table as any).delete().eq('user_id', uid);
          }
        } catch (e) {
          console.warn(`[delete-account] sweep error on ${table}`, e);
        }
      }
      // Tables keyed differently
      try {
        await adminClient.from('connections').delete().or(`requester_id.eq.${uid},addressee_id.eq.${uid}`);
      } catch (e) { console.warn('[delete-account] connections sweep error', e); }
      try {
        await adminClient.from('messages' as any).delete().or(`sender_id.eq.${uid},receiver_id.eq.${uid}`);
      } catch (e) { console.warn('[delete-account] messages sweep error', e); }
    }

    // Hard requirement: actually remove the auth user. If this fails the
    // user still has an account and Apple would reject.
    const { error: authError } = await adminClient.auth.admin.deleteUser(uid);
    if (authError) {
      console.error('[delete-account] auth.admin.deleteUser failed', { message: authError.message });
      return NextResponse.json({
        error: 'Failed to delete account',
        detail: authError.message,
      }, { status: 500 });
    }

    return NextResponse.json({ message: 'Account deleted' });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[delete-account] caught', message);
    return NextResponse.json({ error: 'Failed to delete account', detail: message }, { status: 500 });
  }
}
