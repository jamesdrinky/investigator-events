import { NextResponse } from 'next/server';
import { createSupabaseSSRServerClient } from '@/lib/supabase/ssr-server';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const ACTIONS = new Set(['offered', 'accepted', 'declined']);

/**
 * Record what someone said when asked about the newsletter.
 *
 * Declining previously left no trace — the sign-up flows only did anything
 * when the box was ticked — so there was no way to tell someone who said no
 * from someone who never saw the question. This is the audit trail.
 *
 * Never fails the caller: it hangs off sign-up, and a logging problem must
 * not be able to break an account being created.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = String(body?.action ?? '');
    const source = String(body?.source ?? 'unknown').slice(0, 60);
    if (!ACTIONS.has(action)) {
      return NextResponse.json({ ok: false, error: 'bad action' }, { status: 400 });
    }

    const ssr = await createSupabaseSSRServerClient();
    const { data: { user } } = await ssr.auth.getUser();

    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : user?.email ?? null;
    if (!user && !email) return NextResponse.json({ ok: false }, { status: 400 });

    const admin = createSupabaseAdminServerClient();
    await (admin.from('newsletter_consent_log' as never) as any).insert({
      user_id: user?.id ?? null,
      email,
      action,
      source,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
