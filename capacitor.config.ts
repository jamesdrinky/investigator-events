import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.investigatorevents.app',
  appName: 'Investigator Events',
  webDir: 'out',
  server: {
    url: 'https://investigatorevents.com',
    cleartext: false,
    allowNavigation: [
      'investigatorevents.com',
      '*.investigatorevents.com',
      '*.supabase.co',
      'accounts.google.com',
      '*.google.com',
      '*.linkedin.com',
      'www.linkedin.com',
      'appleid.apple.com',
    ],
  },
  ios: {
    contentInset: 'always',
    preferredContentMode: 'mobile',
    scheme: 'Investigator Events',
    scrollEnabled: true,
    allowsLinkPreview: false,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 1500,
      backgroundColor: '#FFFFFF',
      showSpinner: false,
    },
    StatusBar: {
      overlaysWebView: true,
      style: 'LIGHT',
      backgroundColor: '#00000000',
    },
    Keyboard: {
      resizeOnFullScreen: true,
    },
  },
};

export default config;
