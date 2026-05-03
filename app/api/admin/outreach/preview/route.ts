import { NextResponse } from 'next/server';
import { hasValidAdminSessionCookie } from '@/lib/admin/session';
import { buildIntroductionOutreachEmail, buildColdOutreachEmail } from '@/lib/email/association-outreach';

export async function GET(request: Request) {
  if (!await hasValidAdminSessionCookie()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const template = searchParams.get('template') ?? 'introduction';
  const contactName = searchParams.get('contactName') ?? 'The Team';
  const association = searchParams.get('association') ?? 'Association';
  const eventNames = (searchParams.get('events') ?? '').split('|||').filter(Boolean);

  let html: string;

  if (template === 'cold') {
    html = buildColdOutreachEmail({ contactName, association });
  } else {
    html = buildIntroductionOutreachEmail({ contactName, association, eventNames });
  }

  return NextResponse.json({ html });
}
