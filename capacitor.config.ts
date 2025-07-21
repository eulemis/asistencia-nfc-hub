import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.dd829d0bae914d1bb44685a57a4305e9',
  appName: 'Centro Juvenil Don Bosco',
  webDir: 'dist',
  server: {
    url: "https://dd829d0b-ae91-4d1b-b446-85a57a4305e9.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;