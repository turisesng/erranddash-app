import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.99389b7faef14ca7a882628eb78444fa',
  appName: 'door-dash-app',
  webDir: 'dist',
  server: {
    url: 'https://99389b7f-aef1-4ca7-a882-628eb78444fa.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;