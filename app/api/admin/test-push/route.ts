import { NextResponse } from 'next/server';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { hasValidAdminSessionCookie } from '@/lib/admin/session';
import { sendPushToUser } from '@/lib/notifications';

// Allow up to 30s so ?type=all has time to fire all 9 pushes.
export const maxDuration = 30;

// Fire a test push to a specific user. Admin-only.
// Usage: GET /api/admin/test-push?email=james@drinky.com
export async function GET(request: Request) {
  if (!(await hasValidAdminSessionCookie())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email')?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: 'email query param required' }, { status: 400 });
  }

  const admin = createSupabaseAdminServerClient();

  // Look up the user_id from the email
  const { data: authUsers } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const target = authUsers?.users?.find((u) => u.email?.toLowerCase() === email);
  if (!target) {
    return NextResponse.json({ error: `No user with email ${email}` }, { status: 404 });
  }

  const { data: tokens } = await ((admin as any)
    .from('device_tokens')
    .select('token, platform')
    .eq('user_id', target.id));

  const tokenCount = (tokens ?? []).length;
  const iosCount = ((tokens ?? []) as { platform: string }[]).filter((t) => t.platform === 'ios').length;

  if (iosCount === 0) {
    return NextResponse.json({
      error: 'No iOS device tokens registered for this user',
      hint: 'Open the TestFlight app on the phone, sign in, and accept the notifications permission prompt — that registers the device token.',
      total_tokens: tokenCount,
    }, { status: 400 });
  }

  const type = searchParams.get('type');

  // Catalogue of every push the app sends in production, so we can preview each
  // one by hitting ?type=<key>. Hitting ?type=all fires them sequentially with
  // a small gap so iOS shows them all in the notification centre.
  const samples: Record<string, { title: string; body: string; url: string }> = {
    message: {
      title: 'Mike LaCorte',
      body: 'Just sent you a message about the WAD conference',
      url: '/messages',
    },
    follow: {
      title: 'New follower',
      body: 'Mike LaCorte started following you',
      url: '/profile/mike-lacorte',
    },
    connection_request: {
      title: 'New connection request',
      body: 'Mike LaCorte wants to connect',
      url: '/my-connections',
    },
    connection_accepted: {
      title: 'Connection accepted',
      body: 'Mike LaCorte accepted your connection request',
      url: '/profile/mike-lacorte',
    },
    post_like: {
      title: 'Post liked',
      body: 'Mike LaCorte liked your post',
      url: '/forum',
    },
    post_comment: {
      title: 'New comment',
      body: 'Mike LaCorte commented on your post',
      url: '/forum',
    },
    event_approved: {
      title: 'Your event has been approved!',
      body: '"ABI Annual Conference 2026" is now live on Investigator Events',
      url: '/calendar',
    },
    association_event: {
      title: 'New ABI event',
      body: 'ABI Annual Conference 2026 — London, United Kingdom',
      url: '/calendar',
    },
    country_event: {
      title: 'New event in United Kingdom',
      body: 'PI World London Summit 2026 — London',
      url: '/calendar',
    },
    event_review_prompt: {
      title: 'How was the WAD Annual Conference?',
      body: 'Tap to leave a quick review — helps your network plan ahead.',
      url: '/calendar',
    },
  };

  if (type === 'all') {
    const keys = Object.keys(samples);
    // Fire all in parallel — APNs handles concurrent requests fine, and this
    // finishes in ~2s instead of ~12s (which was hitting Vercel's function
    // timeout and only delivering the first push).
    await Promise.all(
      keys.map((key) => {
        const s = samples[key];
        return sendPushToUser(admin, target.id, s.title, s.body, s.url);
      }),
    );
    return NextResponse.json({
      success: true,
      user: target.id,
      email: target.email,
      pushed: keys.length,
      types: keys,
    });
  }

  if (type && samples[type]) {
    const s = samples[type];
    await sendPushToUser(admin, target.id, s.title, s.body, s.url);
    return NextResponse.json({
      success: true,
      user: target.id,
      email: target.email,
      type,
      title: s.title,
      body: s.body,
    });
  }

  // No type → default smoke test
  await sendPushToUser(
    admin,
    target.id,
    'Test push from Investigator Events',
    'If you see this, push notifications are working 🎉',
    '/',
  );

  return NextResponse.json({
    success: true,
    user: target.id,
    email: target.email,
    ios_tokens_targeted: iosCount,
    available_types: ['all', ...Object.keys(samples)],
    hint: 'Add &type=all to fire one of each, or &type=<key> for a specific one',
  });
}
