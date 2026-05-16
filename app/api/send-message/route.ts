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

    return NextResponse.json({ message: data });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json({ error: 'Too many messages. Slow down.' }, { status: 429 });
    }
    console.error('send-message error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
