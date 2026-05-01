import { NextResponse } from 'next/server';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { Webhook } from 'svix';

const RESEND_WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET;

// Resend sends webhooks for email events: delivered, opened, clicked, bounced, complained
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

    // Verify webhook signature using Svix — require in production
    if (!RESEND_WEBHOOK_SECRET && process.env.NODE_ENV === 'production') {
      console.warn('RESEND_WEBHOOK_SECRET not set — rejecting webhook in production');
      return NextResponse.json({ error: 'Webhook verification not configured' }, { status: 500 });
    }

    if (RESEND_WEBHOOK_SECRET) {
      const svixId = request.headers.get('svix-id');
      const svixTimestamp = request.headers.get('svix-timestamp');
      const svixSignature = request.headers.get('svix-signature');

      if (!svixId || !svixTimestamp || !svixSignature) {
        return NextResponse.json({ error: 'Missing svix headers' }, { status: 401 });
      }

      try {
        const wh = new Webhook(RESEND_WEBHOOK_SECRET);
        wh.verify(rawBody, {
          'svix-id': svixId,
          'svix-timestamp': svixTimestamp,
          'svix-signature': svixSignature,
        });
      } catch {
        console.warn('Webhook signature verification failed');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const body = JSON.parse(rawBody);
    const type = body?.type as string;
    const email = body?.data?.to?.[0] ?? body?.data?.email ?? null;

    if (!type || !email) {
      return NextResponse.json({ received: true });
    }

    const supabase = createSupabaseAdminServerClient();

    // Auto-unsubscribe on bounce or complaint
    if (type === 'email.bounced' || type === 'email.complained') {
      await supabase
        .from('newsletter_subscribers' as never)
        .update({ status: type === 'email.bounced' ? 'bounced' : 'complained', unsubscribed_at: new Date().toISOString() } as never)
        .eq('email', email.toLowerCase());
    }

    // Track opens and clicks on the most recent send
    if (type === 'email.opened' || type === 'email.clicked') {
      const { data: latestSend } = await supabase
        .from('newsletter_sends' as never)
        .select('id, open_count, click_count')
        .order('sent_at', { ascending: false })
        .limit(1)
        .single() as any;

      if (latestSend) {
        const update = type === 'email.opened'
          ? { open_count: (latestSend.open_count ?? 0) + 1 }
          : { click_count: (latestSend.click_count ?? 0) + 1 };

        await supabase
          .from('newsletter_sends' as never)
          .update(update as never)
          .eq('id', latestSend.id);
      }
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ received: true });
  }
}
