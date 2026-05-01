import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.investigatorevents.app',
  appName: 'Investigator Events',
  webDir: 'out',
  server: {
    // Load from your live site — keeps all server-side features working
    url: 'https://investigatorevents.com',
    cleartext: false,
    // Keep all navigation inside the app webview
    allowNavigation: ['investigatorevents.com', '*.investigatorevents.com'],
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'Investigator Events',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: '#FFFFFF',
      showSpinner: false,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#0f172a',
    },
    Keyboard: {
      resizeOnFullScreen: true,
    },
  },
};

export default config;
