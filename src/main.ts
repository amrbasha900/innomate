// src/main.ts - Add to your main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { IonicVue } from '@ionic/vue'
import { statusBarService } from '@/services/statusbar'

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'
import '@ionic/vue/css/palettes/dark.system.css'
import './theme/variables.css'

const pinia = createPinia()

const app = createApp(App)
  .use(IonicVue)
  .use(pinia)
  .use(router)

router.isReady().then(() => {
  app.mount('#app')
  
  // Initialize status bar after app is mounted
  statusBarService.initializeStatusBar()
})
