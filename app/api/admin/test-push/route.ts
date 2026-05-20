import { NextResponse } from 'next/server';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { hasValidAdminSessionCookie } from '@/lib/admin/session';
import { sendPushToUser } from '@/lib/notifications';

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
  });
}
