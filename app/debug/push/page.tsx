'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

interface State {
  loading: boolean;
  isNativeApp?: boolean;
  platform?: string;
  permission?: string;
  userId?: string;
  userEmail?: string;
  deviceTokens?: { token: string; platform: string; updated_at: string }[];
  tokenError?: string;
  registrationLog: string[];
}

export default function DebugPushPage() {
  const [state, setState] = useState<State>({ loading: true, registrationLog: [] });

  function log(msg: string) {
    setState((s) => ({ ...s, registrationLog: [...s.registrationLog, `${new Date().toISOString().slice(11, 19)}  ${msg}`] }));
  }

  useEffect(() => {
    (async () => {
      const supabase = createSupabaseBrowserClient();

      // 1. Get current user
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      const userEmail = user?.email;

      // 2. Check if we're in the native app
      let isNativeApp = false;
      let platform = 'web';
      try {
        const { Capacitor } = await import('@capacitor/core');
        isNativeApp = Capacitor.isNativePlatform();
        platform = Capacitor.getPlatform();
      } catch (err) {
        log(`failed to import @capacitor/core: ${(err as Error).message}`);
      }

      // 3. Check permission state
      let permission = 'n/a';
      if (isNativeApp) {
        try {
          const { PushNotifications } = await import('@capacitor/push-notifications');
          const perm = await PushNotifications.checkPermissions();
          permission = perm.receive;
        } catch (err) {
          permission = `error: ${(err as Error).message}`;
        }
      }

      // 4. Fetch device tokens for this user from Supabase
      let deviceTokens: { token: string; platform: string; updated_at: string }[] = [];
      let tokenError: string | undefined;
      if (userId) {
        const { data, error } = await (supabase as any).from('device_tokens')
          .select('token, platform, updated_at')
          .eq('user_id', userId);
        if (error) tokenError = error.message;
        else deviceTokens = (data ?? []).map((t: any) => ({
          ...t,
          token: t.token.slice(0, 12) + '…' + t.token.slice(-6),
        }));
      }

      setState({
        loading: false,
        isNativeApp,
        platform,
        permission,
        userId,
        userEmail,
        deviceTokens,
        tokenError,
        registrationLog: [],
      });

      // Auto-run registration on load if we're in the native app and signed in
      if (isNativeApp && userId) {
        setTimeout(() => runRegistration(), 500);
      } else if (!isNativeApp) {
        log('⚠️ NOT running in native app — open this URL inside the IE iOS app, not Safari');
      } else if (!userId) {
        log('⚠️ not signed in — sign in first, then revisit this page');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runRegistration() {
    log('starting registerPushNotifications…');
    try {
      const { Capacitor } = await import('@capacitor/core');
      log(`isNative=${Capacitor.isNativePlatform()} platform=${Capacitor.getPlatform()}`);
      if (!Capacitor.isNativePlatform()) {
        log('not native — bailing');
        return;
      }

      const { PushNotifications } = await import('@capacitor/push-notifications');

      log('attaching registration listener…');
      const supabase = createSupabaseBrowserClient();

      const reg = await PushNotifications.addListener('registration', async (token) => {
        log(`✅ registration event fired, token: ${token.value.slice(0, 12)}…${token.value.slice(-6)}`);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { log('❌ no user signed in when token arrived'); return; }
        log(`upserting token for user ${user.id}…`);
        const { error } = await (supabase as any).from('device_tokens').upsert(
          { user_id: user.id, token: token.value, platform: Capacitor.getPlatform(), updated_at: new Date().toISOString() },
          { onConflict: 'user_id,token' },
        );
        if (error) log(`❌ upsert failed: ${error.message}`);
        else log(`✅ token stored in Supabase`);
      });

      await PushNotifications.addListener('registrationError', (e) => {
        log(`❌ registration error: ${JSON.stringify(e)}`);
      });

      const perm = await PushNotifications.checkPermissions();
      log(`current permission: ${perm.receive}`);
      if (perm.receive !== 'granted') {
        log('requesting permission…');
        const req = await PushNotifications.requestPermissions();
        log(`after request: ${req.receive}`);
        if (req.receive !== 'granted') { log('not granted — bailing'); return; }
      }

      log('calling PushNotifications.register()…');
      await PushNotifications.register();
      log('register() returned — waiting for registration event…');
    } catch (err) {
      log(`❌ exception: ${(err as Error).message}`);
    }
  }

  if (state.loading) return <div style={{ padding: 24, fontFamily: 'monospace' }}>loading…</div>;

  return (
    <div style={{ padding: 16, fontFamily: 'monospace', fontSize: 13, lineHeight: 1.5, color: '#0f172a' }}>
      <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Push debug</h1>

      <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 16, border: '1px solid #e2e8f0' }}>
        <div><b>isNativeApp:</b> {String(state.isNativeApp)}</div>
        <div><b>platform:</b> {state.platform}</div>
        <div><b>permission:</b> {state.permission}</div>
        <div><b>userId:</b> {state.userId ?? '(not signed in)'}</div>
        <div><b>userEmail:</b> {state.userEmail ?? '(not signed in)'}</div>
        <div style={{ marginTop: 6 }}><b>device_tokens rows for this user:</b></div>
        {state.tokenError && <div style={{ color: '#b91c1c' }}>error: {state.tokenError}</div>}
        {!state.tokenError && (state.deviceTokens?.length === 0
          ? <div style={{ color: '#dc2626' }}>none — ❌ this is why /api/admin/test-push returns "no tokens"</div>
          : <ul style={{ marginLeft: 16 }}>{state.deviceTokens!.map((t, i) => (
              <li key={i}>{t.platform} · {t.token} · {t.updated_at.slice(0, 19)}</li>
            ))}</ul>
        )}
      </div>

      <button
        onClick={runRegistration}
        style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600, marginBottom: 16 }}
      >
        Run registration now
      </button>

      <div style={{ background: '#0f172a', color: '#cbd5e1', padding: 12, borderRadius: 8, whiteSpace: 'pre-wrap', minHeight: 100 }}>
        {state.registrationLog.length === 0 ? '(no log output yet — tap "Run registration now")' : state.registrationLog.join('\n')}
      </div>
    </div>
  );
}
