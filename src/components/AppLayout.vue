<!-- src/components/AppLayout.vue -->
<template>
  <ion-split-pane content-id="main-content">
    <ion-menu content-id="main-content" type="overlay">
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>Innomate</ion-title>
        </ion-toolbar>
      </ion-header>
      
      <ion-content>
        <!-- User Info Section -->
        <div class="user-info" v-if="user">
          <ion-avatar class="user-avatar">
            <img :src="getUserAvatar()" alt="User Avatar" />
          </ion-avatar>
          <div class="user-details">
            <h3>{{ user.full_name || user.username }}</h3>
            <p>{{ siteDomain.replace(/^https?:\/\//, '') }}</p>
          </div>
        </div>

        <!-- Main Navigation -->
        <ion-list id="inbox-list">
          <ion-list-header>Main</ion-list-header>

          <ion-menu-toggle 
            :auto-hide="false" 
            v-for="(page, i) in mainPages" 
            :key="i"
          >
            <ion-item 
              @click="selectedIndex = i" 
              router-direction="root" 
              :router-link="page.url" 
              lines="none" 
              :detail="false" 
              class="hydrated" 
              :class="{ selected: selectedIndex === i }"
            >
              <ion-icon 
                aria-hidden="true" 
                slot="start" 
                :ios="page.iosIcon" 
                :md="page.mdIcon"
              ></ion-icon>
              <ion-label>{{ page.title }}</ion-label>
            </ion-item>
          </ion-menu-toggle>
        </ion-list>

        <!-- ERPNext Modules -->
        <ion-list id="modules-list">
          <ion-list-header>Modules</ion-list-header>

          <ion-menu-toggle 
            :auto-hide="false" 
            v-for="(module, index) in erpModules" 
            :key="index"
          >
            <ion-item 
              @click="selectedIndex = mainPages.length + index" 
              router-direction="root" 
              :router-link="module.url" 
              lines="none" 
              :detail="false"
              :class="{ selected: selectedIndex === mainPages.length + index }"
            >
              <ion-icon 
                aria-hidden="true" 
                slot="start" 
                :icon="module.icon"
              ></ion-icon>
              <ion-label>{{ module.title }}</ion-label>
            </ion-item>
          </ion-menu-toggle>
        </ion-list>

        <!-- Settings & Logout -->
        <ion-list id="settings-list">
          <ion-list-header>Settings</ion-list-header>

          <ion-item button @click="openSettings" lines="none">
            <ion-icon aria-hidden="true" slot="start" :icon="settings"></ion-icon>
            <ion-label>Settings</ion-label>
          </ion-item>

          <ion-item button @click="handleLogout" lines="none">
            <ion-icon aria-hidden="true" slot="start" :icon="logOut"></ion-icon>
            <ion-label>Logout</ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-menu>
    
    <ion-router-outlet id="main-content"></ion-router-outlet>
  </ion-split-pane>
</template>

<script setup lang="ts">
import {
  IonAvatar,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonRouterOutlet,
  IonSplitPane,
  IonTitle,
  IonToolbar,
  alertController
} from '@ionic/vue'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  homeOutline,
  homeSharp,
  documentsOutline,
  documentsSharp,
  peopleOutline,
  peopleSharp,
  cartOutline,
  cartSharp,
  briefcaseOutline,
  briefcaseSharp,
  cardOutline,
  cardSharp,
  barChartOutline,
  barChartSharp,
  constructOutline,
  constructSharp,
  settings,
  logOut
} from 'ionicons/icons'

const router = useRouter()
const authStore = useAuthStore()
const selectedIndex = ref(0)

const user = computed(() => authStore.user)
const siteDomain = computed(() => authStore.siteDomain)

const mainPages = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    iosIcon: homeOutline,
    mdIcon: homeSharp,
  },
  {
    title: 'Documents',
    url: '/documents',
    iosIcon: documentsOutline,
    mdIcon: documentsSharp,
  }
]

const erpModules = [
  {
    title: 'Accounts',
    url: '/modules/accounts',
    icon: cardOutline,
  },
  {
    title: 'Selling',
    url: '/modules/selling',
    icon: cartOutline,
  },
  {
    title: 'Buying',
    url: '/modules/buying',
    icon: briefcaseOutline,
  },
  {
    title: 'Stock',
    url: '/modules/stock',
    icon: constructOutline,
  },
  {
    title: 'HR',
    url: '/modules/hr',
    icon: peopleOutline,
  },
  {
    title: 'Reports',
    url: '/modules/reports',
    icon: barChartOutline,
  }
]

const getUserAvatar = () => {
  if (user.value?.email) {
    // Use Gravatar as default avatar
    const email = user.value.email.toLowerCase().trim()
    const hash = btoa(email) // Simple hash, you might want to use MD5
    return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=80`
  }
  return '/assets/default-avatar.png'
}

const openSettings = () => {
  router.push('/settings')
}

const handleLogout = async () => {
  const alert = await alertController.create({
    header: 'Confirm Logout',
    message: 'Are you sure you want to logout?',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Logout',
        role: 'destructive',
        handler: async () => {
          await authStore.logout()
          router.replace('/login')
        }
      }
    ]
  })
  await alert.present()
}

// Set selected index based on current route
const path = window.location.pathname
if (path.includes('/modules/')) {
  const moduleName = path.split('/modules/')[1]
  const moduleIndex = erpModules.findIndex(m => m.url.includes(moduleName))
  if (moduleIndex !== -1) {
    selectedIndex.value = mainPages.length + moduleIndex
  }
} else {
  const pageIndex = mainPages.findIndex(page => 
    path.includes(page.url) || (page.url === '/dashboard' && path === '/')
  )
  if (pageIndex !== -1) {
    selectedIndex.value = pageIndex
  }
}
</script>

<style scoped>
.user-info {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--ion-color-light);
  margin-bottom: 1rem;
}

.user-avatar {
  width: 50px;
  height: 50px;
  margin-right: 1rem;
}

.user-details h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.user-details p {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  color: var(--ion-color-medium);
}

ion-menu ion-content {
  --background: var(--ion-item-background, var(--ion-background-color, #fff));
}

ion-menu.md ion-content {
  --padding-start: 8px;
  --padding-end: 8px;
  --padding-top: 20px;
  --padding-bottom: 20px;
}

ion-menu.md ion-list {
  padding: 20px 0;
}

ion-menu.md ion-list-header {
  padding-left: 10px;
  font-size: 16px;
  font-weight: 600;
  color: var(--ion-color-primary);
  margin-bottom: 18px;
  min-height: 26px;
}

ion-menu.md #inbox-list {
  border-bottom: 1px solid var(--ion-background-color-step-150, #d7d8da);
}

ion-menu.md #modules-list {
  border-bottom: 1px solid var(--ion-background-color-step-150, #d7d8da);
}

ion-menu.md ion-item {
  --padding-start: 10px;
  --padding-end: 10px;
  border-radius: 4px;
}

ion-menu.md ion-item.selected {
  --background: rgba(var(--ion-color-primary-rgb), 0.14);
}

ion-menu.md ion-item.selected ion-icon {
  color: var(--ion-color-primary);
}

ion-menu.md ion-item ion-icon {
  color: #616e7e;
}

ion-menu.md ion-item ion-label {
  font-weight: 500;
}

ion-menu.ios ion-content {
  --padding-bottom: 20px;
}

ion-menu.ios ion-list {
  padding: 20px 0 0 0;
}

ion-menu.ios ion-item {
  --padding-start: 16px;
  --padding-end: 16px;
  --min-height: 50px;
}

ion-menu.ios ion-item.selected ion-icon {
  color: var(--ion-color-primary);
}

ion-menu.ios ion-item ion-icon {
  font-size: 24px;
  color: #73849a;
}

ion-menu.ios ion-list-header {
  padding-left: 16px;
  padding-right: 16px;
  margin-bottom: 8px;
}

ion-item.selected {
  --color: var(--ion-color-primary);
}
</style>