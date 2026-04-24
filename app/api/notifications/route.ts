import { NextResponse } from 'next/server';
import { createSupabaseSSRServerClient } from '@/lib/supabase/ssr-server';
import { createNotification } from '@/lib/notifications';

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseSSRServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body?.userId || !body?.type || !body?.title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the actor is the authenticated user
    if (body.actorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fix #3: Verify target user exists
    const { data: targetProfile } = await supabase.from('profiles').select('id').eq('id', body.userId).maybeSingle();
    if (!targetProfile) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    await createNotification({
      userId: body.userId,
      actorId: user.id,
      type: body.type,
      title: body.title,
      body: body.body,
      link: body.link,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseSSRServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';

    let query = supabase.from('notifications' as any)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const notifications = data ?? [];

    // Enrich with actor profiles (names + avatars)
    const actorIds = [...new Set(notifications.map((n: any) => n.actor_id).filter(Boolean))];
    let actorMap: Record<string, { full_name: string | null; avatar_url: string | null; username: string | null }> = {};

    if (actorIds.length > 0) {
      const { data: actors } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, username')
        .in('id', actorIds);

      if (actors) {
        for (const a of actors) {
          actorMap[a.id] = { full_name: a.full_name, avatar_url: a.avatar_url, username: a.username };
        }
      }
    }

    const enriched = notifications.map((n: any) => ({
      ...n,
      actor: actorMap[n.actor_id] ?? null,
    }));

    return NextResponse.json({ notifications: enriched });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createSupabaseSSRServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mark all as read
    await supabase.from('notifications' as any)
      .update({ is_read: true } as any)
      .eq('user_id', user.id)
      .eq('is_read', false);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
