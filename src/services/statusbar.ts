
// src/services/statusbar.ts
// Service to handle status bar dynamically

import { StatusBar, Style } from '@capacitor/status-bar'
import { Capacitor } from '@capacitor/core'

export class StatusBarService {
  private isNative = Capacitor.isNativePlatform()

  async initializeStatusBar() {
    if (!this.isNative) return

    try {
      // Set initial status bar configuration
      await StatusBar.setStyle({ style: Style.Dark })
      await StatusBar.setBackgroundColor({ color: '#667eea' })
      await StatusBar.setOverlaysWebView({ overlay: false })
      
      console.log('✅ Status bar initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize status bar:', error)
    }
  }

  async setStatusBarForPage(page: 'login' | 'dashboard' | 'dark' | 'light') {
    if (!this.isNative) return

    try {
      switch (page) {
        case 'login':
          await StatusBar.setStyle({ style: Style.Light })
          await StatusBar.setBackgroundColor({ color: '#667eea' })
          break

        case 'dashboard':
          await StatusBar.setStyle({ style: Style.Dark })
          await StatusBar.setBackgroundColor({ color: '#ffffff' })
          break

        case 'dark':
          await StatusBar.setStyle({ style: Style.Light })
          await StatusBar.setBackgroundColor({ color: '#121212' })
          break

        case 'light':
          await StatusBar.setStyle({ style: Style.Dark })
          await StatusBar.setBackgroundColor({ color: '#ffffff' })
          break
      }
    } catch (error) {
      console.error('Failed to set status bar for page:', page, error)
    }
  }

  async hideStatusBar() {
    if (!this.isNative) return

    try {
      await StatusBar.hide()
    } catch (error) {
      console.error('Failed to hide status bar:', error)
    }
  }

  async showStatusBar() {
    if (!this.isNative) return

    try {
      await StatusBar.show()
    } catch (error) {
      console.error('Failed to show status bar:', error)
    }
  }

  async getStatusBarInfo() {
    if (!this.isNative) return null

    try {
      const info = await StatusBar.getInfo()
      console.log('Status bar info:', info)
      return info
    } catch (error) {
      console.error('Failed to get status bar info:', error)
      return null
    }
  }
}

export const statusBarService = new StatusBarService()