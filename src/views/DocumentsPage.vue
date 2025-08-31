<!-- src/views/DocumentsPage.vue -->
<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>Documents</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Documents</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="content-container">
        <p>Document management will be implemented here.</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue'
</script>

<style scoped>
.content-container {
  padding: 1rem;
}
</style>