import { redirect } from 'next/navigation';
import { hasValidAdminSessionCookie } from '@/lib/admin/session';

export const dynamic = 'force-dynamic';

// Redirect to the main admin with submissions tab
export default async function AdminEventsPage() {
  if (!await hasValidAdminSessionCookie()) {
    redirect('/admin?error=auth');
  }
  redirect('/admin?tab=submissions');
}
