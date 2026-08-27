import { NextResponse } from 'next/server';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { enforceRateLimitAsync, RateLimitError } from '@/lib/security/server';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// The rate limiter reads headers, so this can never be prerendered.
export const dynamic = 'force-dynamic';

/**
 * Per-event opt-out for the video reminder sequence. Deliberately narrow: it
 * stops the nudges for one event and touches nothing else — an organiser who
 * doesn't want a video should not fall off the newsletter as a side effect.
 */
export async function GET(request: Request) {
  try {
    await enforceRateLimitAsync('video-reminder-stop', { maxRequests: 10, windowMs: 60_000 });

    const token = new URL(request.url).searchParams.get('token');
    if (!token || !UUID_REGEX.test(token)) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    const supabase = createSupabaseAdminServerClient();
    const { data: reminder } = await (supabase
      .from('video_reminders' as never)
      .select('recipient_email, event_name')
      .eq('opt_out_token', token)
      .maybeSingle() as unknown as Promise<{ data: { recipient_email: string; event_name: string } | null }>);

    // Unknown token still reports success — a stale link from an old email
    // shouldn't show someone an error for doing what we asked.
    if (reminder) {
      await (supabase
        .from('video_reminders' as never)
        .update({ status: 'cancelled', cancelled_reason: 'opted_out' } as never)
        .eq('recipient_email', reminder.recipient_email)
        .eq('event_name', reminder.event_name)
        .eq('status', 'pending') as unknown as Promise<unknown>);
    }

    return NextResponse.redirect(new URL('/unsubscribe?success=true&scope=video', request.url));
  } catch (err) {
    if (err instanceof RateLimitError) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    console.error('Video reminder opt-out failed:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
