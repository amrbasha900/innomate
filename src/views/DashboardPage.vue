<!-- src/views/DashboardPage.vue -->
<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>Dashboard</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" @click="refreshData">
            <ion-icon :icon="refresh"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Dashboard</ion-title>
        </ion-toolbar>
      </ion-header>

      <!-- Welcome Section -->
      <div class="welcome-section">
        <h2>Welcome back, {{ user?.full_name || user?.username }}!</h2>
        <p>Here's your ERPNext overview</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-section">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Loading dashboard data...</p>
      </div>

      <!-- Quick Stats -->
      <div v-else class="stats-grid">
        <ion-card v-for="stat in quickStats" :key="stat.title" class="stat-card">
          <ion-card-content>
            <div class="stat-header">
              <ion-icon :icon="stat.icon" :color="stat.color"></ion-icon>
              <span class="stat-value">{{ stat.value }}</span>
            </div>
            <h3>{{ stat.title }}</h3>
            <p class="stat-description">{{ stat.description }}</p>
          </ion-card-content>
        </ion-card>
      </div>

      <!-- Quick Actions -->
      <ion-card class="quick-actions-card">
        <ion-card-header>
          <ion-card-title>Quick Actions</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div class="actions-grid">
            <ion-button 
              v-for="action in quickActions" 
              :key="action.title"
              fill="outline" 
              @click="handleQuickAction(action.route)"
              class="action-button"
            >
              <ion-icon :icon="action.icon" slot="start"></ion-icon>
              {{ action.title }}
            </ion-button>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Recent Activity -->
      <ion-card class="activity-card">
        <ion-card-header>
          <ion-card-title>Recent Activity</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list v-if="recentActivity.length > 0">
            <ion-item v-for="activity in recentActivity" :key="activity.id" lines="inset">
              <ion-icon :icon="activity.icon" slot="start" :color="activity.color"></ion-icon>
              <ion-label>
                <h3>{{ activity.title }}</h3>
                <p>{{ activity.description }}</p>
                <p class="activity-time">{{ formatTime(activity.timestamp) }}</p>
              </ion-label>
            </ion-item>
          </ion-list>
          <div v-else class="no-activity">
            <ion-icon :icon="documentText"></ion-icon>
            <p>No recent activity</p>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- System Status -->
      <ion-card class="status-card">
        <ion-card-header>
          <ion-card-title>System Status</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div class="status-item">
            <ion-icon :icon="server" :color="serverStatus.color"></ion-icon>
            <ion-label>
              <h3>ERPNext Server</h3>
              <p>{{ serverStatus.description }}</p>
            </ion-label>
            <ion-chip :color="serverStatus.color">{{ serverStatus.status }}</ion-chip>
          </div>
          
          <div class="status-item">
            <ion-icon :icon="wifi" :color="networkStatus.color"></ion-icon>
            <ion-label>
              <h3>Network</h3>
              <p>{{ networkStatus.description }}</p>
            </ion-label>
            <ion-chip :color="networkStatus.color">{{ networkStatus.status }}</ion-chip>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Error State -->
      <ion-card v-if="hasErrors" class="error-card">
        <ion-card-header>
          <ion-card-title color="danger">Connection Issues</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <p>Unable to connect to ERPNext server. Please check:</p>
          <ul>
            <li>Server URL is correct</li>
            <li>Internet connection is stable</li>
            <li>ERPNext server is running</li>
          </ul>
          <ion-button fill="outline" @click="refreshData" class="retry-button">
            <ion-icon :icon="refresh" slot="start"></ion-icon>
            Retry Connection
          </ion-button>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenuButton,
  IonPage,
  IonSpinner,
  IonTitle,
  IonToolbar,
  toastController
} from '@ionic/vue'
import { 
  refresh,
  documentText,
  add,
  person,
  cart,
  card,
  people,
  analytics,
  checkmarkCircle,
  timeOutline,
  warningOutline,
  server,
  wifi
} from 'ionicons/icons'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { statusBarService } from '@/services/statusbar'
const router = useRouter()
const authStore = useAuthStore()
const isLoading = ref(true)
const hasErrors = ref(false)

const user = computed(() => authStore.user)
const siteDomain = computed(() => authStore.siteDomain)

// Server status
const serverStatus = ref({
  status: 'Unknown',
  color: 'medium',
  description: 'Checking server status...'
})

// Network status
const networkStatus = ref({
  status: 'Unknown',
  color: 'medium',
  description: 'Checking network status...'
})

// Quick stats data
const quickStats = ref([
  {
    title: 'Total Customers',
    value: '0',
    description: 'Active customers',
    icon: people,
    color: 'primary'
  },
  {
    title: 'Pending Orders',
    value: '0',
    description: 'Orders to process',
    icon: cart,
    color: 'warning'
  },
  {
    title: 'Total Sales',
    value: '₹0',
    description: 'This month',
    icon: analytics,
    color: 'success'
  },
  {
    title: 'Outstanding',
    value: '₹0',
    description: 'Pending payments',
    icon: card,
    color: 'danger'
  }
])

// Quick actions
const quickActions = [
  {
    title: 'New Customer',
    icon: person,
    route: '/modules/selling'
  },
  {
    title: 'New Order',
    icon: add,
    route: '/modules/selling'
  },
  {
    title: 'New Invoice',
    icon: documentText,
    route: '/modules/accounts'
  },
  {
    title: 'New Item',
    icon: add,
    route: '/modules/stock'
  }
]

// Recent activity data (mock data for now)
const recentActivity = ref([
  {
    id: 1,
    title: 'Welcome to Innomate!',
    description: 'Your ERPNext mobile app is ready',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    icon: checkmarkCircle,
    color: 'success'
  },
  {
    id: 2,
    title: 'System initialized',
    description: 'Dashboard components loaded successfully',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    icon: server,
    color: 'primary'
  }
])

// Fetch dashboard data from ERPNext using proxy
const fetchDashboardData = async () => {
  if (!siteDomain.value) {
    console.warn('No site domain configured')
    isLoading.value = false
    return
  }

  try {
    isLoading.value = true
    hasErrors.value = false
    
    console.log('Fetching dashboard data...')
    
    // Test server connection first
    await checkServerStatus()
    
    // Fetch dashboard data with error handling
    const promises = [
      fetchCustomerCount(),
      fetchSalesOrders(),
      fetchSalesInvoices(),
      // fetchRecentActivity() // Disabled for now due to CORS
    ]
    
    await Promise.allSettled(promises)
    
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
    hasErrors.value = true
    showErrorToast('Failed to load dashboard data')
  } finally {
    isLoading.value = false
  }
}

// Check server connectivity using auth store helper
const checkServerStatus = async () => {
  try {
    console.log('Testing server connection...')
    
    // Use GET instead of HEAD for better compatibility
    const result = await authStore.makeAuthenticatedRequest('/method/ping')
    
    if (result.success) {
      serverStatus.value = { 
        status: 'Online', 
        color: 'success', 
        description: `Connected to ${siteDomain.value.replace(/^https?:\/\//, '')}`
      }
      
      networkStatus.value = { 
        status: 'Connected', 
        color: 'success', 
        description: 'API accessible' 
      }
      
      hasErrors.value = false
    } else if (result.needsAuth) {
      // Authentication issue
      serverStatus.value = { 
        status: 'Auth Required', 
        color: 'warning', 
        description: 'Please login again' 
      }
      
      networkStatus.value = { 
        status: 'Unauthorized', 
        color: 'warning', 
        description: result.error || 'Authentication expired' 
      }
      
      hasErrors.value = true
      
      // Optionally redirect to login
      // router.replace('/login')
    } else {
      throw new Error(result.error || 'Connection failed')
    }
  } catch (error) {
    console.error('Server connection failed:', error)
    serverStatus.value = { 
      status: 'Offline', 
      color: 'danger', 
      description: 'Cannot connect to ERPNext server' 
    }
    networkStatus.value = { 
      status: 'Error', 
      color: 'danger', 
      description: 'Connection failed' 
    }
    hasErrors.value = true
  }
}

// Fetch customer count using enhanced auth
const fetchCustomerCount = async () => {
  try {
    console.log('Fetching customer count...')
    
    const result = await authStore.makeAuthenticatedRequest('/resource/Customer?fields=["name"]&limit_page_length=1')
    
    if (result.success) {
      const count = result.data?.data?.length || 0
      quickStats.value[0].value = count.toString()
      quickStats.value[0].color = 'success'
      console.log('Customer count:', count)
    } else if (result.needsAuth) {
      quickStats.value[0].value = 'Auth Required'
      quickStats.value[0].color = 'warning'
    } else {
      quickStats.value[0].value = 'Error'
      quickStats.value[0].color = 'danger'
      console.warn('Failed to fetch customers:', result.error)
    }
  } catch (error) {
    console.error('Failed to fetch customer count:', error)
    quickStats.value[0].value = 'Error'
    quickStats.value[0].color = 'danger'
  }
}

// Fetch sales orders using enhanced auth
const fetchSalesOrders = async () => {
  try {
    console.log('Fetching sales orders...')
    
    const result = await authStore.makeAuthenticatedRequest('/resource/Sales Order?fields=["name","grand_total"]&filters=[["status","=","Draft"]]')
    
    if (result.success) {
      const count = result.data?.data?.length || 0
      quickStats.value[1].value = count.toString()
      quickStats.value[1].color = 'warning'
      console.log('Sales orders count:', count)
    } else if (result.needsAuth) {
      quickStats.value[1].value = 'Auth Required'
      quickStats.value[1].color = 'warning'
    } else {
      quickStats.value[1].value = 'Error'
      quickStats.value[1].color = 'danger'
      console.warn('Failed to fetch sales orders:', result.error)
    }
  } catch (error) {
    console.error('Failed to fetch sales orders:', error)
    quickStats.value[1].value = 'Error'
    quickStats.value[1].color = 'danger'
  }
}

// Fetch sales invoices using enhanced auth
const fetchSalesInvoices = async () => {
  try {
    console.log('Fetching sales invoices...')
    
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    const endpoint = `/resource/Sales Invoice?fields=["grand_total","outstanding_amount"]&filters=[["posting_date","between",["${firstDay.toISOString().split('T')[0]}","${lastDay.toISOString().split('T')[0]}"]]]`
    
    const result = await authStore.makeAuthenticatedRequest(endpoint)
    
    if (result.success) {
      const invoices = result.data?.data || []
      const totalSales = invoices.reduce((sum: number, invoice: any) => sum + (invoice.grand_total || 0), 0)
      const outstanding = invoices.reduce((sum: number, invoice: any) => sum + (invoice.outstanding_amount || 0), 0)
      
      quickStats.value[2].value = formatCurrency(totalSales)
      quickStats.value[2].color = 'success'
      quickStats.value[3].value = formatCurrency(outstanding)
      quickStats.value[3].color = outstanding > 0 ? 'danger' : 'success'
      
      console.log('Sales data:', { totalSales, outstanding, invoiceCount: invoices.length })
    } else if (result.needsAuth) {
      quickStats.value[2].value = 'Auth Required'
      quickStats.value[2].color = 'warning'
      quickStats.value[3].value = 'Auth Required'
      quickStats.value[3].color = 'warning'
    } else {
      quickStats.value[2].value = 'Error'
      quickStats.value[2].color = 'danger'
      quickStats.value[3].value = 'Error'
      quickStats.value[3].color = 'danger'
      console.warn('Failed to fetch sales invoices:', result.error)
    }
  } catch (error) {
    console.error('Failed to fetch sales invoices:', error)
    quickStats.value[2].value = 'Error'
    quickStats.value[2].color = 'danger'
    quickStats.value[3].value = 'Error'
    quickStats.value[3].color = 'danger'
  }
}

// Utility functions
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const formatTime = (timestamp: Date): string => {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 60) {
    return `${minutes} minutes ago`
  } else if (hours < 24) {
    return `${hours} hours ago`
  } else {
    return `${days} days ago`
  }
}

const showErrorToast = async (message: string) => {
  const toast = await toastController.create({
    message,
    duration: 3000,
    position: 'top',
    color: 'danger'
  })
  await toast.present()
}

const showSuccessToast = async (message: string) => {
  const toast = await toastController.create({
    message,
    duration: 2000,
    position: 'top',
    color: 'success'
  })
  await toast.present()
}

// Enhanced refresh data function
const refreshData = async () => {
  console.log('Refreshing dashboard data...')
  isLoading.value = true
  
  try {
    // First test basic connectivity
    await checkServerStatus()
    
    // If server is accessible, try to fetch data
    if (!hasErrors.value) {
      const dataPromises = [
        fetchCustomerCount(),
        fetchSalesOrders(),
        fetchSalesInvoices()
      ]
      
      await Promise.allSettled(dataPromises)
      
      if (!hasErrors.value) {
        await showSuccessToast('Dashboard refreshed successfully')
      }
    }
  } catch (error) {
    console.error('Refresh failed:', error)
    await showErrorToast('Failed to refresh dashboard')
  } finally {
    isLoading.value = false
  }
}
const testConnection = async () => {
  console.log('Testing ERPNext API connection...')
  
  const endpoints = [
    { name: 'Server Ping', endpoint: '/method/ping' },
    { name: 'User Info', endpoint: '/method/frappe.auth.get_logged_user' },
    { name: 'DocTypes', endpoint: '/resource/DocType?limit_page_length=1' }
  ]

  const results = []
  
  for (const test of endpoints) {
    console.log(`Testing ${test.name}...`)
    const result = await authStore.makeAuthenticatedRequest(test.endpoint)
    
    results.push({
      name: test.name,
      success: result.success,
      error: result.error,
      needsAuth: result.needsAuth
    })
    
    console.log(`${test.name} result:`, result.success ? 'SUCCESS' : `FAILED: ${result.error}`)
  }
  
  // Show results in console
  console.table(results)
  
  // Update UI based on results
  const successCount = results.filter(r => r.success).length
  const authIssues = results.filter(r => r.needsAuth).length
  
  if (authIssues > 0) {
    const toast = await toastController.create({
      message: 'Authentication expired. Please login again.',
      duration: 5000,
      position: 'top',
      color: 'warning',
      buttons: [
        {
          text: 'Login',
          handler: () => {
            router.replace('/login')
          }
        }
      ]
    })
    await toast.present()
  } else if (successCount === results.length) {
    const toast = await toastController.create({
      message: 'All API tests passed!',
      duration: 2000,
      position: 'top',
      color: 'success'
    })
    await toast.present()
  } else {
    const toast = await toastController.create({
      message: `API test results: ${successCount}/${results.length} passed`,
      duration: 3000,
      position: 'top',
      color: 'warning'
    })
    await toast.present()
  }
  
  return results
}
const handleQuickAction = (route: string) => {
  router.push(route)
}

// Initialize dashboard
onMounted(async () => {
  await statusBarService.setStatusBarForPage('dashboard')
  console.log('Dashboard mounted, site domain:', siteDomain.value)
  fetchDashboardData()
})
</script>

<style scoped>
.welcome-section {
  padding: 1.5rem 1rem;
  text-align: center;
  background: linear-gradient(135deg, var(--ion-color-primary) 0%, var(--ion-color-primary-shade) 100%);
  color: white;
}

.welcome-section h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.welcome-section p {
  margin: 0;
  opacity: 0.9;
}

.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.loading-section ion-spinner {
  margin-bottom: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.stat-card {
  margin: 0;
}

.stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.stat-header ion-icon {
  font-size: 2rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--ion-color-dark);
}

.stat-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.stat-description {
  margin: 0;
  font-size: 0.875rem;
  color: var(--ion-color-medium);
}

.quick-actions-card,
.activity-card,
.status-card,
.error-card {
  margin: 1rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.5rem;
}

.action-button {
  margin: 0;
  height: 40px;
}

.activity-time {
  font-size: 0.75rem !important;
  color: var(--ion-color-medium) !important;
  margin-top: 0.25rem !important;
}

.no-activity {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--ion-color-medium);
}

.no-activity ion-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.status-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--ion-color-light);
}

.status-item:last-child {
  border-bottom: none;
}

.status-item ion-icon {
  font-size: 1.5rem;
  margin-right: 1rem;
}

.status-item ion-label {
  flex: 1;
}

.status-item ion-label h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.status-item ion-label p {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  color: var(--ion-color-medium);
}

.error-card {
  border-left: 4px solid var(--ion-color-danger);
}

.error-card ul {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.error-card li {
  margin-bottom: 0.5rem;
  color: var(--ion-color-medium);
}

.retry-button {
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>