import { NextResponse } from 'next/server';
import { createSupabaseSSRServerClient } from '@/lib/supabase/ssr-server';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { assertSameOriginRequest, enforceRateLimit, RateLimitError } from '@/lib/security/server';

export async function POST(request: Request) {
  try {
    assertSameOriginRequest();

    const supabase = await createSupabaseSSRServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    enforceRateLimit('send-message', { maxRequests: 60, windowMs: 60_000 });

    const body = await request.json().catch(() => null);
    const receiverId = typeof body?.receiverId === 'string' ? body.receiverId : null;
    const content = typeof body?.content === 'string' ? body.content.trim() : '';
    const imageUrl = typeof body?.imageUrl === 'string' && body.imageUrl ? body.imageUrl : null;

    if (!receiverId) {
      return NextResponse.json({ error: 'Receiver required' }, { status: 400 });
    }
    if (receiverId === user.id) {
      return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 });
    }
    if (!content && !imageUrl) {
      return NextResponse.json({ error: 'Message content or image required' }, { status: 400 });
    }
    if (content.length > 4000) {
      return NextResponse.json({ error: 'Message too long' }, { status: 400 });
    }

    const admin = createSupabaseAdminServerClient();
    const payload: any = {
      sender_id: user.id,
      receiver_id: receiverId,
      content,
    };
    if (imageUrl) payload.image_url = imageUrl;

    const { data, error } = await (admin.from('messages') as any).insert(payload).select('*').single();
    if (error) {
      console.error('Message insert failed:', error.message);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    // Push must complete before the response returns. Vercel freezes the
    // function instance the moment we return, so fire-and-forget async work
    // gets paused until the NEXT request unfreezes the lambda — which made
    // every push arrive one message behind the message that triggered it.
    // Adds ~1-2s to message send latency in exchange for reliable delivery.
    try {
      const { data: senderProfile } = await (admin
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle() as any);
      const senderName = (senderProfile?.full_name as string | undefined) ?? 'Someone';
      const preview = imageUrl && !content ? '📷 Photo' : (content.length > 140 ? content.slice(0, 137) + '…' : content);
      const { sendPushToUser } = await import('@/lib/notifications');
      await sendPushToUser(admin, receiverId, senderName, preview, `/messages?user=${user.id}`);
    } catch (err) {
      console.error('message push failed:', err);
    }

    return NextResponse.json({ message: data });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json({ error: 'Too many messages. Slow down.' }, { status: 429 });
    }
    console.error('send-message error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
