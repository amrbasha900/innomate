// SOLUTION 1: Update Capacitor Configuration
// capacitor.config.ts

import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.innomate.erpnext',
  appName: 'Innomate',
  webDir: 'dist',
  plugins: {
    StatusBar: {
      style: 'dark', // 'dark' for light backgrounds, 'light' for dark backgrounds
      backgroundColor: '#667eea', // Match your app theme
      overlaysWebView: false, // Prevents content from going under status bar
      androidStatusBarColor: '#667eea' // Android-specific status bar color
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#667eea',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: false, // Don't hide status bar during splash
    },
    Keyboard: {
      resize: 'ionic', // Better keyboard handling
      resizeOnFullScreen: true
    }
  },
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: true,
    // Handle display cutouts (notches)
    appendUserAgent: 'InnoMate/1.0',
    loggingBehavior: 'debug'
  }
}

export default config