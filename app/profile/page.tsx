import { redirect } from 'next/navigation';
import { createSupabaseSSRServerClient } from '@/lib/supabase/ssr-server';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const supabase = await createSupabaseSSRServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/signin');

  const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single();

  if (profile?.username) {
    redirect(`/profile/${profile.username}`);
  } else {
    // No profile set up yet — send to setup
    redirect('/profile/setup');
  }
}
