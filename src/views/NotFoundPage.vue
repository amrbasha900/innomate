<!-- src/views/NotFoundPage.vue -->
<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Page Not Found</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="not-found-container">
        <ion-icon :icon="alertCircle" class="not-found-icon"></ion-icon>
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist.</p>
        
        <ion-button 
          expand="block" 
          fill="solid" 
          @click="goHome"
          class="back-button"
        >
          <ion-icon :icon="home" slot="start"></ion-icon>
          Go to Dashboard
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue'
import { alertCircle, home } from 'ionicons/icons'
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.replace('/dashboard')
}
</script>

<style scoped>
.not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  text-align: center;
}

.not-found-icon {
  font-size: 6rem;
  color: var(--ion-color-medium);
  margin-bottom: 1rem;
}

.not-found-container h1 {
  font-size: 4rem;
  margin: 0;
  color: var(--ion-color-primary);
}

.not-found-container h2 {
  font-size: 1.5rem;
  margin: 0.5rem 0;
  color: var(--ion-color-dark);
}

.not-found-container p {
  color: var(--ion-color-medium);
  margin-bottom: 2rem;
}

.back-button {
  max-width: 250px;
  margin-top: 1rem;
}
</style>