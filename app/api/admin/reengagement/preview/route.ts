import { NextResponse } from 'next/server';
import { hasValidAdminSessionCookie } from '@/lib/admin/session';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { buildReengagementSnapshot } from '@/lib/email/reengagement-data';
import { buildReengagementEmail, pickVariant, pickSubject } from '@/lib/email/reengagement';

export async function GET(request: Request) {
  if (!await hasValidAdminSessionCookie()) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  const format = url.searchParams.get('format') ?? 'html';

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  const admin = createSupabaseAdminServerClient();
  const snap = await buildReengagementSnapshot({ admin, userId });
  if (!snap) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  if (format === 'json') {
    return NextResponse.json({
      userId: snap.userId,
      email: snap.email,
      variant: pickVariant(snap.input),
      subject: pickSubject(snap.input),
      input: snap.input,
    });
  }

  const html = buildReengagementEmail(snap.input);
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
