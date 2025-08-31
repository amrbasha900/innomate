<!-- src/views/ModulePage.vue -->
<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>{{ moduleTitle }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">{{ moduleTitle }}</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="module-container">
        <ion-card>
          <ion-card-header>
            <ion-card-title>{{ moduleTitle }} Module</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p>This {{ moduleTitle.toLowerCase() }} module will integrate with your ERPNext {{ moduleTitle.toLowerCase() }} features.</p>
            <p>Module-specific functionality will be implemented here.</p>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const moduleTitle = computed(() => {
  const module = route.params.module as string
  return module.charAt(0).toUpperCase() + module.slice(1)
})
</script>

<style scoped>
.module-container {
  padding: 1rem;
}
</style>