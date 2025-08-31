<!-- src/views/SettingsPage.vue -->
<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>Settings</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Settings</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="settings-container">
        <ion-list>
          <ion-item>
            <ion-label>
              <h2>Site Domain</h2>
              <p>{{ siteDomain }}</p>
            </ion-label>
          </ion-item>
          
          <ion-item>
            <ion-label>
              <h2>Username</h2>
              <p>{{ user?.username }}</p>
            </ion-label>
          </ion-item>

          <ion-item button @click="clearSavedCredentials">
            <ion-icon :icon="trash" slot="start" color="danger"></ion-icon>
            <ion-label color="danger">Clear Saved Credentials</ion-label>
          </ion-item>
        </ion-list>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
  toastController
} from '@ionic/vue'
import { trash } from 'ionicons/icons'
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const user = computed(() => authStore.user)
const siteDomain = computed(() => authStore.siteDomain)

const clearSavedCredentials = async () => {
  localStorage.removeItem('innomate_credentials')
  
  const toast = await toastController.create({
    message: 'Saved credentials cleared successfully',
    duration: 2000,
    position: 'top',
    color: 'success'
  })
  await toast.present()
}
</script>

<style scoped>
.settings-container {
  padding: 1rem;
}
</style>