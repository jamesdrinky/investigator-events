import { Capacitor } from '@capacitor/core';

/** True when running inside the native iOS/Android shell */
export const isNativeApp = Capacitor.isNativePlatform();

/** Get the current platform */
export const currentPlatform = Capacitor.getPlatform(); // 'ios' | 'android' | 'web'

/**
 * Register for push notifications and store the device token in Supabase.
 * Call this after the user signs in.
 */
export async function registerPushNotifications(supabase: any) {
  if (!isNativeApp) return;

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');

    // Request permission
    const permResult = await PushNotifications.requestPermissions();
    if (permResult.receive !== 'granted') return;

    // Register with APNs/FCM
    await PushNotifications.register();

    // Listen for the token
    PushNotifications.addListener('registration', async (token) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const platform = Capacitor.getPlatform(); // 'ios' or 'android'

      // Upsert the token
      await supabase.from('device_tokens').upsert(
        { user_id: user.id, token: token.value, platform, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,token' }
      );
    });

    // Handle registration errors
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration failed:', error);
    });

    // Handle incoming notifications when app is in foreground
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      // Could show an in-app toast here
      // Push received in foreground — could show in-app toast
    });

    // Handle notification tap — deep link to the relevant page
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      const url = action.notification.data?.url;
      if (url) {
        window.location.href = url;
      }
    });
  } catch (err) {
    console.error('Push notification setup failed:', err);
  }
}

/**
 * Remove the device token when the user signs out.
 */
export async function unregisterPushToken(supabase: any) {
  if (!isNativeApp) return;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('device_tokens').delete().eq('user_id', user.id);
  } catch {}
}

/**
 * Initialize native platform features (status bar, keyboard, haptics).
 * Safe to call in the browser — no-ops if not running in native shell.
 */
export async function initNativePlatform() {
  if (!isNativeApp) return;

  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setOverlaysWebView({ overlay: true });
    await StatusBar.setStyle({ style: Style.Light });
  } catch {}

  try {
    const { Keyboard } = await import('@capacitor/keyboard');
    // Smooth keyboard handling — scroll input into view
    Keyboard.addListener('keyboardWillShow', () => {
      document.body.classList.add('keyboard-open');
    });
    Keyboard.addListener('keyboardWillHide', () => {
      document.body.classList.remove('keyboard-open');
    });
  } catch {}
}

/**
 * Trigger a light haptic tap — use for button presses, toggles, etc.
 * No-ops in the browser.
 */
export async function hapticTap() {
  if (!isNativeApp) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {}
}

/**
 * Trigger a medium haptic — use for important actions (submit, delete, etc.)
 */
export async function hapticMedium() {
  if (!isNativeApp) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch {}
}

/**
 * Trigger a success notification haptic — use for confirmations.
 */
export async function hapticSuccess() {
  if (!isNativeApp) return;
  try {
    const { Haptics, NotificationType } = await import('@capacitor/haptics');
    await Haptics.notification({ type: NotificationType.Success });
  } catch {}
}

/**
 * Open a URL in the in-app browser (SFSafariViewController on iOS).
 * Used for OAuth flows so the redirect comes back to the app.
 * On web, falls back to normal window.location redirect.
 */
export async function openInAppBrowser(url: string): Promise<void> {
  if (!isNativeApp) {
    window.location.href = url;
    return;
  }

  try {
    const { Browser } = await import('@capacitor/browser');
    await Browser.open({ url, presentationStyle: 'popover' });
  } catch {
    window.location.href = url;
  }
}

/**
 * Close the in-app browser (call after OAuth callback).
 */
export async function closeInAppBrowser(): Promise<void> {
  if (!isNativeApp) return;
  try {
    const { Browser } = await import('@capacitor/browser');
    await Browser.close();
  } catch {}
}

/**
 * Open the native share sheet. Falls back to clipboard copy on web.
 */
export async function nativeShare(options: { title: string; text?: string; url: string }) {
  if (!isNativeApp) {
    // Web fallback — copy link
    try {
      await navigator.clipboard.writeText(options.url);
    } catch {}
    return;
  }

  try {
    const { Share } = await import('@capacitor/share');
    await Share.share(options);
  } catch {}
}
