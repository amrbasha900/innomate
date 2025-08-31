<!-- src/views/LoginPage.vue -->
<template>
  <ion-page>
    <ion-content :fullscreen="true" class="login-content">
      <div class="login-container">
        <!-- Logo/Header -->
        <div class="login-header">
          <ion-icon :icon="business" class="logo-icon"></ion-icon>
          <h1>Innomate</h1>
          <p>Connect to your ERPNext instance</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="login-form">
          <ion-item fill="outline" class="form-item">
            <ion-label position="stacked">Site Domain</ion-label>
            <ion-input
              v-model="credentials.siteDomain"
              type="url"
              placeholder="https://your-site.erpnext.com"
              required
              :disabled="isLoading"
            ></ion-input>
          </ion-item>

          <ion-item fill="outline" class="form-item">
            <ion-label position="stacked">Username</ion-label>
            <ion-input
              v-model="credentials.username"
              type="text"
              placeholder="Enter your username"
              required
              :disabled="isLoading"
            ></ion-input>
          </ion-item>

          <ion-item fill="outline" class="form-item">
            <ion-label position="stacked">Password</ion-label>
            <ion-input
              v-model="credentials.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter your password"
              required
              :disabled="isLoading"
            ></ion-input>
            <ion-button
              fill="clear"
              slot="end"
              @click="showPassword = !showPassword"
              :disabled="isLoading"
            >
              <ion-icon :icon="showPassword ? eyeOff : eye"></ion-icon>
            </ion-button>
          </ion-item>

          <ion-item lines="none" class="checkbox-item">
            <ion-checkbox
              v-model="credentials.rememberMe"
              :disabled="isLoading"
            ></ion-checkbox>
            <ion-label class="remember-label">Remember my credentials</ion-label>
          </ion-item>

          <!-- Error Message -->
          <ion-text v-if="errorMessage" color="danger" class="error-text">
            <p>{{ errorMessage }}</p>
          </ion-text>

          <!-- Login Button -->
          <ion-button
            type="submit"
            expand="block"
            class="login-button"
            :disabled="isLoading || !isFormValid"
          >
            <ion-spinner v-if="isLoading" name="crescent"></ion-spinner>
            <span v-else>Sign In</span>
          </ion-button>
        </form>

        <!-- Footer -->
        <div class="login-footer">
          <ion-text color="medium">
            <p>Don't have an ERPNext account? Contact your administrator</p>
          </ion-text>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonCheckbox,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonSpinner,
  IonText,
  alertController
} from '@ionic/vue'
import { statusBarService } from '@/services/statusbar'
import { business, eye, eyeOff } from 'ionicons/icons'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, type LoginCredentials } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const showPassword = ref(false)
const errorMessage = ref('')
const isLoading = computed(() => authStore.isLoading)

const credentials = reactive<LoginCredentials>({
  siteDomain: '',
  username: '',
  password: '',
  rememberMe: false
})

const isFormValid = computed(() => {
  return credentials.siteDomain.trim() && 
         credentials.username.trim() && 
         credentials.password.trim()
})

const handleLogin = async () => {
  errorMessage.value = ''
  
  // Basic validation
  if (!credentials.siteDomain.startsWith('http')) {
    errorMessage.value = 'Please enter a valid URL (starting with http:// or https://)'
    return
  }

  const result = await authStore.login(credentials)
  
  if (result.success) {
    router.replace('/folder/Inbox')
  } else {
    errorMessage.value = result.error || 'Login failed. Please check your credentials.'
    
    // Show alert for better UX
    const alert = await alertController.create({
      header: 'Login Failed',
      message: result.error || 'Please check your credentials and try again.',
      buttons: ['OK']
    })
    await alert.present()
  }
}

// Load saved credentials on component mount
onMounted(async () => {
    await statusBarService.setStatusBarForPage('login')

  const saved = authStore.loadSavedCredentials()
  if (saved) {
    credentials.siteDomain = saved.siteDomain
    credentials.username = saved.username
    credentials.rememberMe = saved.rememberMe
  }
})

</script>

<style scoped>
.login-content {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --color: white;
}

.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  max-width: 400px;
  margin: 0 auto;
}

.login-header {
  text-align: center;
  margin-bottom: 3rem;
}

.logo-icon {
  font-size: 4rem;
  color: white;
  margin-bottom: 1rem;
}

.login-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0.5rem 0;
  color: white;
}

.login-header p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  margin: 0;
}

.login-form {
  width: 100%;
  margin-bottom: 2rem;
}

.form-item {
  margin-bottom: 1rem;
  --background: rgba(255, 255, 255, 0.1);
  --border-color: rgba(255, 255, 255, 0.3);
  --color: white;
  border-radius: 8px;
}

.form-item ion-label {
  --color: white;
}

.form-item ion-input {
  --color: white;
  --placeholder-color: rgba(255, 255, 255, 0.7);
}

.checkbox-item {
  --background: transparent;
  margin: 1.5rem 0;
}

.remember-label {
  margin-left: 0.5rem;
  --color: white;
}

.error-text {
  margin: 1rem 0;
  text-align: center;
}

.login-button {
  margin-top: 1.5rem;
  height: 50px;
  --background: rgba(255, 255, 255, 0.2);
  --background-activated: rgba(255, 255, 255, 0.3);
  --border-radius: 25px;
  --color: white;
  font-weight: 600;
}

.login-button:disabled {
  opacity: 0.6;
}

.login-footer {
  text-align: center;
  margin-top: auto;
}

.login-footer p {
  font-size: 0.875rem;
  margin: 0;
}

@media (max-width: 480px) {
  .login-container {
    padding: 1rem;
  }
  
  .login-header h1 {
    font-size: 2rem;
  }
  
  .logo-icon {
    font-size: 3rem;
  }
}
</style>